"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { formatNumber } from "@/app/utils/formatNumber";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  weighingSchema,
  WeighingSchema,
} from "@/lib/formValidationSchemas";
import { Button } from "@/registry/new-york-v4/ui/button";
import {
  ClipboardList,
  Package,
  Save,
  Truck,
} from "lucide-react";
import { createWeighing } from "@/lib/actions/weighingActions";
import FileUpload from "./WeighingForm/FileUpload";
import Modal from "@/components/modal/Weighing/Modal";
import { X } from "lucide-react";

type FormState = {
  success: boolean;
  message: string | null;
  errors?: any;
};

const initialState: FormState = {
  success: false,
  message: null,
  errors: undefined,
};

function WeighingForm({ relatedData }: { relatedData: any; }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createWeighing, initialState);
  const [selectedItem, setSelectedItem] = useState<any>(relatedData.arrivalItems[0]);
  const [netWeight, setNetWeight] = useState(0);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = useForm<WeighingSchema>({
    mode: "onChange",
    defaultValues: {
      arrivalId: relatedData.arrival.id,
      arrivalItemId: relatedData.arrivalItems[0]?.id,
      weight: 0,
      note: "",
      weighingProof: [],
    },
  });

  const weight = watch("weight");
  const arrivalItemId = watch("arrivalItemId");
  const onSubmit = async (data: WeighingSchema) => {
    console.log("Submitting data:", data);
    const formData = new FormData();
    formData.append("arrivalItemId", data.arrivalItemId.toString ());
    formData.append("note", data.note || "");
    formData.append("weight", data.weight.toString());
    formData.append("arrivalId", data.arrivalId.toString());
    if (data.weighingProof) {
      data.weighingProof.forEach((photo, photoIndex) => {
        formData.append(
          `weighingProof.${photoIndex}`,
          photo.file
        );
      });
    }

    startTransition(() => {
      formAction(formData);
    })
  };

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || `Arrival updated successfully!`);
      router.refresh(); // Refresh data on the page
      formRef.current?.reset(); // Reset form fields
      router.push("/weighing"); // Redirect to the list page
    } else if (state.message && !state.success) {
      // Show server-side errors (e.g., non-field specific errors)
      toast.error(state.message);
    }
  }, [state, router]);
  useEffect(() => {
    if (weight) {
      setNetWeight(
        parseFloat(weight?.toString() ?? "0")
      );
    } else {
      setNetWeight(0);
    }
  }, [weight]);

  useEffect(() => {
    console.log("Arrival Item :", relatedData.arrivalItems);
    const selectedItem = relatedData.arrivalItems.find(
      (item: any) => item.id == arrivalItemId
    );

    console.log("Selected Item ID:", arrivalItemId);
    console.log("Selected Item:", selectedItem);
    setSelectedItem(selectedItem);

    setValue("weight", selectedItem?.Weighings[0]?.weight || 0);
    setValue("note", selectedItem?.Weighings[0]?.note || "");
  }, [arrivalItemId]);

  console.log('selectedItem for edit', selectedItem);

  const onFailed = (errors: any) => {
    console.log("Form errors:", errors);
  };
  return (
    <form className="flex flex-col gap-2 w-full" ref={formRef} onSubmit={handleSubmit(onSubmit, onFailed)}>
      <h2 className="text-xl md:text-3xl font-bold">Input Data Penimbangan</h2>
      <div className="dark:shadow-slate-700 p-8 rounded-xl shadow-lg flex flex-col gap-3">
        <div className="mb-6 flex flex-col md:flex-row gap-2 justify-between items-center">
          <div className="flex flex-col text-md md:text-xl font-semibold w-full items-start gap-2">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex flex-row gap-2">
                <ClipboardList size={24} /> ID Kedatangan:{" "}
              </div>
              <div className="flex flex-row gap-2">
                <span className="text-blue-600 font-bold md:text-2xl">{relatedData.arrival.idKedatangan}</span>
                <InputField label="ID Kedatangan" type="text" name="arrivalId" register={register} defaultValue={relatedData.arrival.id} hidden />
                <InputField label="ID Kedatangan" type="text" name="idKedatangan" register={register} defaultValue={relatedData.arrival.idKedatangan} hidden />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
              <div className="flex items-center gap-2">
                <Truck size={24} /> Supplier:{" "}
              </div>
              <div>{relatedData.arrival.supplier.name}</div>
            </div>
          </div>
          <div className="md:text-md flex flex-col md:flex-col w-full items-center gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
              <div className="flex items-center gap-2">
                <Package size={24} /> Bahan:{" "}
              </div>
              <select
                className="w-full p-2 border dark:bg-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("arrivalItemId")} // Set default value to the first item
              >
                {relatedData.arrivalItems.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.material.name} - {item.note}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-row justify-end gap-2 w-full">
              <Modal type={"Tambah Bahan"} relatedData={relatedData} />
              <Modal type={"Edit Bahan"} relatedData={relatedData} selectedItem={selectedItem} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <InputField label="Berat bahan" name="weight" type="number" inputProps={{ step: "0.01" }} register={register} required={true} />
        </div>
        <div className="mb-6 p-4 bg-blue-50 dark:bg-black border border-blue-200 rounded-lg text-center">
          <p className="text-blue-700 text-sm font-semibold mb-2">Berat Bahan Baku</p>
          <p className="text-blue-800 text-4xl font-bold">
            {formatNumber(weight)} <span className="text-2xl">Kg</span>
          </p>
          <FileUpload control={control} />
        </div>
        <InputField label="Catatan Tambahan (Opsional)" name="note" type="text" register={register} />

        {state.message && !state.success && !state.error && <span className="text-red-500 text-sm">{state.message}</span>}
        <div className="flex flex-row justify-between gap-4">
          <Button type="submit" disabled={isPending} className="bg-blue-600 text-white p-2 rounded-md">
            {isPending && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            <Save /> {isPending ? "Menyimpan..." : "Simpan Hasil QC"}
          </Button>
          <Button type="button" disabled={isPending} onClick={() => router.push("/weighing")} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer">
            <X size={16} /> Kembali
          </Button>
        </div>
      </div>
    </form>
  );
}

export default WeighingForm;

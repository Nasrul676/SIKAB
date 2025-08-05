"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import InputField from "../InputField";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArivalSchema, arivalSchema, ArrivalItemSchema } from "@/lib/formValidationSchemas";
import { createMaterial } from "@/lib/actions/materialActions";
import SelectField from "../SelectField";
import { Button } from "@/registry/new-york-v4/ui/button";
import FormModal from "../FormModal";
import { Calendar, ClipboardList, Clock, Cross, Plus, X } from "lucide-react";
import moment from "moment";
import { createArrival } from "@/lib/actions/arrivalActions";
import prisma from "@/lib/prisma";
import FileUpload from "./SecurityForm/FileUpload";

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

function SecurityForm({ relatedData, data }: { relatedData: any; data?: any }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createArrival, initialState);
  const [arrivalId, setArrivalId] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ArivalSchema>({
    resolver: zodResolver(arivalSchema),
    defaultValues: {
      arrivalId: `${moment().format("YYYYMMDD")}-${String(relatedData?.arrivalNo + 1).padStart(3, "0")}`,
      supplierId: data?.supplierId || "",
      nopol: data?.nopol || "",
      suratJalan: data?.suratJalan || "",
      arrivalTime: data?.arrivalTime || "",
      securityProof: data?.securityProof || [],
      materials: [{ materialId: "", quantity: "", conditionCategory: "Basah", conditionId: "", itemName: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "materials",
  });

  const onSubmit = async (data: any) => {
    console.log("Form data submitted:", data);
    const formData = new FormData();

    formData.append("arrivalTime", data.arrivalTime);
    formData.append("supplierId", data.supplierId);
    formData.append("nopol", data.nopol.toUpperCase());
    formData.append("suratJalan", data.suratJalan);
    formData.append("arrivalId", data.arrivalId);
    data.securityProof.forEach((item: { file: File }, index: number) => {
      formData.append("securityProof", item.file);
    });
    formData.append("materials", JSON.stringify(data.materials));
    setArrivalId(data.arrivalId);
    startTransition(() => {
      formAction(formData);
    })

    const supplierName = relatedData?.supplier.find((s: any) => s.id === data.supplierId)?.name || "";
    data.supplierName = supplierName;
    data.nopol = data.nopol.toUpperCase();
    localStorage.setItem("arrivalData", JSON.stringify(data));
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("VALIDATION ERRORS:", errors);
    }
  }, [errors]);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || `Arrival updated successfully!`);
      router.refresh();
      formRef.current?.reset();
      router.push("/security/print/" + arrivalId);
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit(onSubmit)} ref={formRef}>
      <h2 className="text-xl md:text-3xl font-bold">Input Kedatangan Bahan Baku</h2>
      <div className="dark:shadow-slate-700 p-8 rounded-xl shadow-lg flex flex-col gap-3">
        <div className="mb-6 flex flex-col md:flex-row gap-2 justify-between items-center">
          <div className="text-md md:text-xl font-semibold w-full flex items-center gap-2">
            <ClipboardList size={24} /> ID Kedatangan:{" "}
            <span className="text-blue-600 font-bold md:text-2xl">
              {moment().format("YYYYMMDD")}-{String(relatedData?.arrivalNo + 1).padStart(3, "0")}
            </span>
            <InputField label="ID Kedatangan" hidden name="arrivalId" control={control} defaultValue={`${moment().format("YYYYMMDD")}-${String(relatedData?.arrivalNo + 1).padStart(3, "0")}`} />
          </div>
          <div className="text-md flex items-center w-full gap-2">
            <Calendar size={24} /> {moment().format("YYYY-MM-DD")}{" "}
            <span className="ml-2 flex gap-2">
              <Clock size={24} /> {moment().format("HH:mm")}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex items-end gap-2 ">
            <SelectField
              label="Supplier"
              name="supplierId"
              data={relatedData?.supplier || []}
              defaultValue={data?.supplierId}
              control={control}
              // error={errors?.supplierId}
              required={true}
            />
            <div className="mb-1">
              <FormModal table="supplier" type="create" />
            </div>
          </div>
          <InputField
            label="Jam Kedatangan"
            name="arrivalTime"
            type="time"
            defaultValue={data?.arrivalTime}
            control={control}
            // error={errors?.arrivalTime}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <InputField
            label="Nomor Polisi"
            name="nopol"
            type="text"
            style={{ textTransform: "uppercase" }}
            defaultValue={data?.nopol}
            control={control}
            // error={errors?.nopol}
          />
          <InputField
            label="Surat Jalan"
            name="suratJalan"
            type="text"
            defaultValue={data?.suratJalan}
            control={control}
            // error={errors?.suratJalan}
          />
        </div>
        <FileUpload control={control} />
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Detail Bahan Baku</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col md:flex-row gap-4 mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="md:basis-64">
              <SelectField label="Jenis Bahan" name={`materials[${index}].materialId`} data={relatedData?.materials || []} control={control} required={true} />
            </div>
            <div className="md:basis-64">
              <InputField label="Jumlah Qty (kg)" name={`materials[${index}].quantity`} type="number" control={control} required={true} />
            </div>
            <div className="md:basis-64">
              <SelectField
                label="Kondisi Bahan"
                name={`materials[${index}].conditionCategory`}
                data={[
                  { id: "Basah", name: "Basah" },
                  { id: "Kering", name: "Kering" },
                ]}
                control={control}
                required={true}
              />
            </div>
            <div className="md:basis-64">
              <SelectField label="Tingkat Kebersihan Bahan" name={`materials[${index}].conditionId`} data={relatedData?.conditions || []} control={control} required={true} />
            </div>
            <div className="w-full">
              <InputField label="Nama Bahan Baku" name={`materials[${index}].itemName`} type="text" control={control} />
            </div>
            <div className="flex items-start justify-end">
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={fields.length <= 1}
                aria-label={`Remove Item ${index + 1}`}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}

        {state.message && !state.success && !state.errors && <span className="text-red-500 text-sm">{state.message}</span>}
        <div className="flex gap-4">
          <Button type="button" onClick={() => append({ materialId: "", quantity: "", conditionCategory: "Basah", conditionId: "", itemName: "" })} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
            <Plus size={16} /> Tambah Bahan Baku
          </Button>
          <Button type="submit" disabled={isPending} className="bg-blue-700 text-white p-2 rounded-md">
            {isPending && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default SecurityForm;

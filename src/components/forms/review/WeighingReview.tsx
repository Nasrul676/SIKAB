"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { weighingSchema, WeighingSchema } from "@/lib/formValidationSchemas";
import { Button } from "@/registry/new-york-v4/ui/button";
import { ClipboardList, Package, Truck } from "lucide-react";
import { createWeighing } from "@/lib/actions/weighingActions";
import InputField from "@/components/InputField";
import ImageThumbnail from "@/components/ImagaTumbnails";
import { formatNumber } from "@/app/utils/formatNumber";

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

function WeighingReview({
  relatedData,
  data,
}: {
  relatedData: any;
  data?: any;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createWeighing, initialState);

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
    resolver: zodResolver(weighingSchema),
    mode: "onChange",
    defaultValues: {
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
    formData.append("arrivalItemId", data.arrivalItemId);
    formData.append("note", data.note || "");
    formData.append("weight", data.weight.toString());
    if (data.weighingProof) {
      data.weighingProof.forEach((photo, photoIndex) => {
        // Beri nama yang unik untuk setiap file
        formData.append(`weighingProof.${photoIndex}`, photo.file);
      });
    }

    startTransition(() => {
      formAction(formData);
    });
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
      setNetWeight(parseFloat(weight?.toString() ?? "0"));
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
    console.log("Weighings:", selectedItem?.WeighingsPhotos);

    setValue("weight", selectedItem?.Weighings[0]?.weight || 0);
    setValue("note", selectedItem?.Weighings[0]?.note || "");
    setValue("weighingProof", selectedItem?.WeighingsPhotos);
  }, [arrivalItemId]);
  return (
    <form
      className="flex flex-col gap-2 w-full"
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-xl md:text-3xl font-bold">Preview Penimbangan</h2>
      <div className="dark:shadow-slate-700 p-8 rounded-xl shadow-lg flex flex-col gap-3">
        <div className="mb-6 flex flex-col md:flex-row gap-2 justify-between items-center">
          <div className="text-md md:text-xl font-semibold w-full flex items-center gap-2">
            <ClipboardList size={24} /> ID Kedatangan:{" "}
            <span className="text-blue-600 font-bold md:text-2xl">
              {relatedData.arrival.idKedatangan}
            </span>
            <InputField
              label="ID Kedatangan"
              type="hidden"
              name="arrivalId"
              register={register}
              defaultValue={relatedData.arrival.id}
              hidden
            />
            <InputField
              label="ID Kedatangan"
              type="hidden"
              name="idKedatangan"
              register={register}
              defaultValue={relatedData.arrival.idKedatangan}
              hidden
            />
          </div>
          <div className="md:text-md flex flex-col md:flex-row w-full items-center gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
              <div className="flex items-center gap-2">
                <Truck size={24} /> Supplier:{" "}
              </div>
              <div>{relatedData.arrival.supplier.name}</div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
              <div className="flex items-center gap-2">
                <Package size={24} /> Bahan:{" "}
              </div>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("arrivalItemId")} // Set default value to the first item
              >
                {relatedData.arrivalItems.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.material.name}-{item.note}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <InputField
            label="Berat bahan"
            name="weight"
            type="number"
            inputProps={{"step": "0.01"}}
            register={register}
            required={true}
          />
         
        </div> */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-blue-700 text-sm font-semibold mb-2">
            Berat Bahan Baku
          </p>
          <p className="text-blue-800 text-4xl font-bold">
            {formatNumber(netWeight)} <span className="text-2xl">kg</span>
          </p>
          <div className="flex flex-row justify-center mt-2 gap-2">
            {getValues("weighingProof")?.map((photo: any, index: number) => (
              <div key={index} >
                <ImageThumbnail
                  fileId={photo.photo}
                  alt={`Foto timbangan untuk ${photo.id}`}
                  className="w-32 h-32" // Anda bisa mengatur ukuran thumbnail di sini
                />
              </div>
            ))}
          </div>
        </div>
        <InputField
          label="Catatan Tambahan (Opsional)"
          name="note"
          type="text"
          register={register}
          inputProps={{ readOnly: true }}
        />

        {state.message && !state.success && !state.error && (
          <span className="text-red-500 text-sm">{state.message}</span>
        )}
        {relatedData.role=="manager" && (
        <div className="flex gap-4">
          <Button className="bg-blue-400 text-white p-2 rounded-md">
            Approve
          </Button>
        </div>
        )}
      </div>
    </form>
  );
}

export default WeighingReview;

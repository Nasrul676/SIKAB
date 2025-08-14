"use client"

import { useEffect, useActionState, useState, startTransition, useRef } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/registry/new-york-v4/ui/dialog";
import { Button } from "@/registry/new-york-v4/ui/button";
import SelectField from "@/components/SelectField";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { createOrUpdateArrivalItem } from "@/lib/actions/arrivalActions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type FormValues = {
  id: string;
  arrivalId: string;
  materialId: string;
  quantity: number;
  conditionCategory: string;
  conditionId: string;
  itemName: string;
};
const initialState = {
  message: null,
  errors: null,
  isSuccess: false,
  success: false,
};
export function Modal({ type, relatedData, selectedItem }: { type: string; relatedData: any; selectedItem?: any }) {
  
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const wasPending = useRef(false);
  const [state, formAction, isPending] = useActionState(createOrUpdateArrivalItem, initialState);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      id: selectedItem?.id || "",
      arrivalId: relatedData.arrival?.id.toString(),
      materialId: selectedItem?.materialId?.toString() || "",
      quantity: selectedItem?.quantity || 0,
      conditionCategory: selectedItem?.conditionCategory || "",
      conditionId: selectedItem?.conditionId?.toString() || "",
      itemName: selectedItem?.itemName || ""
    },
  });
  console.log("relatedData", relatedData);
  const onSubmit = async (data: any) => {
    console.log("Form submitted:", data);
    const formData = new FormData();
    formData.append("id", data.id);
    formData.append("arrivalId", data.arrivalId);
    formData.append("materialId", data.materialId);
    formData.append("quantity", data.quantity.toString());
    formData.append("conditionCategory", data.conditionCategory);
    formData.append("conditionId", data.conditionId);
    formData.append("itemName", data.itemName);
    formData.append("description", selectedItem?.description || "");

    startTransition(() => {
      formAction(formData);
    })

  };

  useEffect(() => {
    if (isPending) {
      return;
    }
    if (state.success) {
      setIsOpen(false);

      toast.success(state.message || "Data berhasil disimpan!", {
        onClose: () => {
          router.refresh();
        },
        autoClose: 2000
      });
    }
    if (!state.success && state.message) {
      toast.error(state.message);
    }
  }, [state, isPending, router]);

  useEffect(() => {
    if (isOpen && selectedItem) {
      reset({
        id: selectedItem.id || "",
        arrivalId: relatedData.arrival.id || "",
        materialId: selectedItem.materialId?.toString() || "",
        quantity: selectedItem.quantity || 0,
        conditionCategory: selectedItem.conditionCategory || "",
        conditionId: selectedItem.conditionId?.toString() || "",
        itemName: selectedItem.itemName || "",
      });
    } else if (!isOpen) {
      reset();
    }
  }, [isOpen, selectedItem, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer" type="button">
          {type}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type} Baku</DialogTitle>
          <DialogDescription>
            Silakan masukkan informasi yang diperlukan untuk {type} baku. Pastikan semua data yang dimasukkan sudah benar sebelum menyimpan.
          </DialogDescription>
        </DialogHeader>
        <form>
          <InputField
            label={'arrivalId'}
            type="text"
            hidden={true}
            control={control}
            name={"arrivalId"} defaultValue={relatedData.arrival?.id.toString()} />
          <InputField
            label={'ID'}
            type="text"
            hidden={true}
            control={control}
            name={"id"} defaultValue={selectedItem?.id || ""} />
          <div className="flex flex-col gap-3 mb-4">
            <div className="">
              <SelectField
                label="Jenis Bahan"
                name="materialId"
                data={relatedData.materials || []}
                control={control}
                required={true}
                defaultValue={selectedItem?.materialId.toString() || ""}
                onChange={(value: string) => {
                  // Handle any additional logic when material changes
                  console.log("Selected Material ID:", value);
                }}
              />
            </div>
            <div className="">
              <InputField
                label="Jumlah Qty (kg)"
                name={`quantity`}
                type="number"
                control={control}
                required={true}
                defaultValue={selectedItem?.quantity || 0}
              />
            </div>
            <div className="">
              <SelectField
                label="Kondisi Bahan"
                name={`conditionCategory`}
                data={
                  [
                    { id: "Basah", name: "Basah" },
                    { id: "Kering", name: "Kering" }
                  ]
                }
                control={control}
                required={true}
                defaultValue={selectedItem?.conditionCategory || ""}
              />
            </div>
            <div className="">
              <SelectField
                label="Tingkat Kebersihan Bahan"
                name={`conditionId`}
                data={relatedData?.conditions || []}
                control={control}
                required={true}
                defaultValue={selectedItem?.conditionId.toString() || ""}
              />
            </div>
            <div className="w-full">
              <InputField
                label="Nama Bahan Baku"
                name={`itemName`}
                type="text"
                control={control}
                required={true}
                defaultValue={selectedItem?.conditionId || ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" disabled={isPending} className={"bg-blue-600"} onClick={handleSubmit(onSubmit)}>
              {isPending && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
            <DialogClose asChild>
              <Button disabled={isPending} variant="outline" type="button">
                Batal
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default Modal;
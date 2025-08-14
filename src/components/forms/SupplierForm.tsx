"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect, useRef } from "react";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { supplierSchema, SupplierSchema } from "@/lib/formValidationSchemas";
import { createSupplier, updateSupplier } from "@/lib/actions/supplierActions";

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

function SupplierForm({ type, data, setOpen, relatedData }: { type: "create" | "update"; data?: SupplierSchema & { id?: number }; setOpen: Dispatch<SetStateAction<boolean>>; relatedData?: any }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const actionToUse = type === "create" ? createSupplier : updateSupplier;
  const [state, formAction] = useActionState(actionToUse, initialState);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SupplierSchema>({
    defaultValues: {
      name: data?.name || "",
      address: data?.address || "",
      phone: data?.phone || "",
      email: data?.email || "",
    },
  });

  const formValues = watch();

  const onSubmit = (formData: SupplierSchema) => {
    localStorage.setItem("supplierFormBackup", JSON.stringify(formValues));

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("address", formData.address || "");
    submitData.append("phone", formData.phone || "");
    submitData.append("email", formData.email || "");

    if (data?.id) {
      submitData.append("id", (data.id as number | string).toString());
    }

    startTransition(() => {
      formAction(submitData);
    });
  };

  useEffect(() => {
    if (state.success) {
      localStorage.removeItem("supplierFormBackup");
      setOpen(false);
      toast.success(state.message || `Pemasok berhasil ${type === "create" ? "ditambahkan" : "diperbarui"}!`);
      router.refresh();
      formRef.current?.reset();
    } else if (state.message && !state.success) {
      const backup = localStorage.getItem("supplierFormBackup");
      if (backup) {
        try {
          const backupData = JSON.parse(backup);
          setValue("name", backupData.name || "");
          setValue("address", backupData.address || "");
          setValue("phone", backupData.phone || "");
          setValue("email", backupData.email || "");
        } catch (e) {
          console.error("Error restoring form backup:", e);
        }
      }

      if (state.errors) {
        Object.keys(state.errors).forEach((field) => {
          const fieldErrors = state.errors[field];
          if (fieldErrors && fieldErrors.length > 0) {
            fieldErrors.forEach((error: string) => {
              toast.error(`${error}`);
            });
          }
        });
      }
    }
  }, [state, router, type, setOpen, setValue]);

  return (
    <form className="flex flex-col gap-8 w-full" ref={formRef}>
      <h1 className="text-xl font-semibold">{type === "create" ? "Tambah pemasok baru" : "Update pemasok"}</h1>

      <InputField label="Name" name="name" register={register}/>

      <InputField label="Address" name="address" register={register}/>

      <InputField label="Phone" name="phone" register={register}/>

      <InputField label="Email" name="email" register={register}/>

      {data?.id && <input type="hidden" {...register("id" as any)} value={data.id} />}

      {state.message && !state.success && !state.errors && <span className="text-red-500 text-sm">{state.message}</span>}

      <button type="submit" onClick={handleSubmit(onSubmit)} className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors">
        {type === "create" ? "Simpan" : "Update"}
      </button>
    </form>
  );
}

export default SupplierForm;
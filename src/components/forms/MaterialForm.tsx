"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect, useRef, useCallback, useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { materialSchema, MaterialSchema } from "@/lib/formValidationSchemas";
import { createMaterial, updateMaterial } from "@/lib/actions/materialActions";

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

function MaterialForm({ type, data, setOpen, relatedData }: { type: "create" | "update"; data?: MaterialSchema & { id?: number }; setOpen: Dispatch<SetStateAction<boolean>>; relatedData?: any }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const actionToUse = type === "create" ? createMaterial : updateMaterial;
  const [state, formAction, isPending] = useActionState(actionToUse, initialState);

  const [isClosing, setIsClosing] = useState(false);
  const [hasProcessedSuccess, setHasProcessedSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MaterialSchema>({
    defaultValues: {
      name: data?.name || "",
      description: data?.description || "",
    },
  });

  const formValues = watch();

  const onSubmit = useCallback(
    (formData: MaterialSchema) => {
      setIsClosing(false);
      setHasProcessedSuccess(false);

      localStorage.setItem("materialFormBackup", JSON.stringify(formValues));

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description || "");

      if (data?.id) {
        submitData.append("id", (data.id as number).toString());
      }

      startTransition(() => {
        formAction(submitData);
      });
    },
    [formValues, data?.id, formAction]
  );

  const handleCloseModal = useCallback(() => {
    if (isClosing) return;

    setIsClosing(true);
    localStorage.removeItem("materialFormBackup");
    setOpen(false);
  }, [setOpen, isClosing]);

  useEffect(() => {
    if (isPending || hasProcessedSuccess) {
      return;
    }

    if (state.success) {
      console.log("Processing success state...");
      setHasProcessedSuccess(true);

      toast.success(state.message || `Bahan berhasil ${type === "create" ? "ditambahkan" : "diperbarui"}!`);

      setTimeout(() => {
        handleCloseModal();

        setTimeout(() => {
          router.refresh();
        }, 200);
      }, 500);

      return;
    }

    if (state.message && !state.success) {
      const backup = localStorage.getItem("materialFormBackup");
      if (backup) {
        try {
          const parsedBackup = JSON.parse(backup);
          setValue("name", parsedBackup.name);
          setValue("description", parsedBackup.description);
        } catch (error) {
          console.error("Failed to parse backup:", error);
        }
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
  }, [state.success, state.message, state.errors, isPending, hasProcessedSuccess, type, setValue, router, handleCloseModal]);

  return (
    <form className="flex flex-col gap-8 w-full">
      <h1 className="text-xl font-semibold">{type === "create" ? "Tambah bahan baru" : "Update bahan"}</h1>

      <InputField label="Nama Bahan" name="name" register={register} />

      <InputField label="Deskripsi" name="description" register={register} />

      {data?.id && <input type="hidden" {...register("id" as any)} value={data.id} />}
      {state.message && !state.success && !state.errors && <span className="text-red-500 text-sm">{state.message}</span>}

      <button disabled={isPending || isClosing} onClick={handleSubmit(onSubmit)} className={`p-2 rounded-md transition-colors text-white ${isPending || isClosing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
        {isPending ? (type === "create" ? "Menyimpan..." : "Memperbarui...") : isClosing ? "Menutup..." : type === "create" ? "Simpan" : "Simpan"}
      </button>
    </form>
  );
}

export default MaterialForm;
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect, useRef, useCallback, useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { conditionSchema, ConditionSchema } from "@/lib/formValidationSchemas";
import { createCondition, updateCondition } from "@/lib/actions/conditionActions";

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

function ConditionForm({ type, data, setOpen, relatedData }: { type: "create" | "update"; data?: ConditionSchema & { id?: number }; setOpen: Dispatch<SetStateAction<boolean>>; relatedData?: any }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const actionToUse = type === "create" ? createCondition : updateCondition;
  const [state, formAction, isPending] = useActionState(actionToUse, initialState);

  // State untuk mencegah multiple close calls
  const [isClosing, setIsClosing] = useState(false);
  const [hasProcessedSuccess, setHasProcessedSuccess] = useState(false);
  const [isError, setIsError] = useState({
    name: false,
    description: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ConditionSchema>({
    defaultValues: {
      name: data?.name || "",
      description: data?.description || "",
    },
  });

  const formValues = watch();

  const onSubmit = useCallback(
    (formData: ConditionSchema) => {
      // Reset states saat submit
      setIsClosing(false);
      setHasProcessedSuccess(false);

      localStorage.setItem("conditionFormBackup", JSON.stringify(formValues));

      const formDataToSubmit = new FormData();
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("description", formData.description || "");

      if (data?.id) {
        formDataToSubmit.append("id", (data.id as number).toString());
      }

      startTransition(() => {
        formAction(formDataToSubmit);
      });
    },
    [formValues, data?.id, formAction]
  );

  const handleCloseModal = useCallback(() => {
    if (isClosing) return;

    setIsClosing(true);
    localStorage.removeItem("conditionFormBackup");
    setOpen(false);
  }, [setOpen, isClosing]);

  useEffect(() => {
    if (isPending || hasProcessedSuccess) return;

    if (state.success) {
      console.log("Processing success state...");
      setHasProcessedSuccess(true);

      toast.success(state.message || `Condition has been ${type === "create" ? "created" : "updated"}!`);

      setTimeout(() => {
        handleCloseModal();
        setTimeout(() => {
          router.refresh();
        }, 200);
      }, 500);

      return;
    }

    if (state.message && !state.success) {
      const backup = localStorage.getItem("conditionFormBackup");
      if (backup) {
        try {
          const parsedBackup = JSON.parse(backup);
          setValue("name", parsedBackup.name || "");
          setValue("description", parsedBackup.description || "");
        } catch (error) {
          console.error("Failed to parse backup:", error);
        }
      }
    }

    if (state.errors) {
      Object.keys(state.errors).forEach((field) => {
        const fieldErrors = state.errors[field];
        if (field === "name") setIsError((prev) => ({ ...prev, name: true }));

        if (field === "description") setIsError((prev) => ({ ...prev, description: true }));

        if (fieldErrors && Array.isArray(fieldErrors)) fieldErrors.forEach((error: string) => {
            toast.error(error);
          });
      });
    }
  }, [state.success, state.message, state.errors, isPending, hasProcessedSuccess, type, setValue, router, handleCloseModal]);

  return (
    <form className="flex flex-col gap-8 w-full" onSubmit={handleSubmit(onSubmit)} ref={formRef}>
      <h1 className="text-xl font-semibold">{type === "create" ? "Tambah kondisi barang baru" : "Update kondisi barang"}</h1>

      <InputField label="Name" name="name" register={register} isError={isError.name} onChange={() => setIsError((prev) => ({ ...prev, name: false }))}/>

      <InputField label="Description" name="description" register={register} isError={isError.description} onChange={() => setIsError((prev) => ({ ...prev, description: false }))}/>

      {data?.id && <input type="hidden" {...register("id" as any)} value={data.id} />}

      {state.message && !state.success && !state.errors && <span className="text-red-500 text-sm">{state.message}</span>}

      <button disabled={isPending || isClosing} type="submit" className={`p-2 rounded-md transition-colors text-white ${isPending || isClosing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
        {isPending ? (type === "create" ? "Menyimpan..." : "Menyimpan...") : isClosing ? "Closing..." : "Simpan"}
      </button>
    </form>
  );
}

export default ConditionForm;
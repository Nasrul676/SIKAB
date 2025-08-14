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
    if (isClosing) return; // Prevent multiple calls

    setIsClosing(true);
    localStorage.removeItem("conditionFormBackup");
    setOpen(false);
  }, [setOpen, isClosing]);

  useEffect(() => {
    // Skip jika sedang pending atau sudah diproses
    if (isPending || hasProcessedSuccess) {
      return;
    }

    if (state.success) {
      console.log("Processing success state...");
      setHasProcessedSuccess(true);

      toast.success(state.message || `Condition has been ${type === "create" ? "created" : "updated"}!`);

      // Tutup modal dulu, baru refresh
      setTimeout(() => {
        handleCloseModal();

        // Refresh setelah modal tertutup
        setTimeout(() => {
          router.refresh();
        }, 200);
      }, 500);

      return;
    }

    // Handle errors
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
        if (fieldErrors && Array.isArray(fieldErrors)) {
          fieldErrors.forEach((error: string) => {
            toast.error(error);
          });
        }
      });
    }
  }, [state.success, state.message, state.errors, isPending, hasProcessedSuccess, type, setValue, router, handleCloseModal]);

  return (
    <form className="flex flex-col gap-8 w-full" onSubmit={handleSubmit(onSubmit)} ref={formRef}>
      <h1 className="text-xl font-semibold">{type === "create" ? "Create a new condition" : "Update the condition"}</h1>

      <InputField label="Name" name="name" register={register}/>

      <InputField label="Description" name="description" register={register}/>

      {data?.id && <input type="hidden" {...register("id" as any)} value={data.id} />}

      {state.message && !state.success && !state.errors && <span className="text-red-500 text-sm">{state.message}</span>}

      <button disabled={isPending || isClosing} type="submit" className={`p-2 rounded-md transition-colors text-white ${isPending || isClosing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
        {isPending ? (type === "create" ? "Creating..." : "Updating...") : isClosing ? "Closing..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
}

export default ConditionForm;
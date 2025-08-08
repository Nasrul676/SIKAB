"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField";
import {
  Dispatch,
  SetStateAction,
  useActionState,
  useEffect,
  useRef,
} from "react";

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

function ConditionForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: ConditionSchema & { id?: number }; // Add id for updates
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const actionToUse = type === "create" ? createCondition : updateCondition;
  const [state, formAction] = useActionState(actionToUse, initialState);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConditionSchema>({
    resolver: zodResolver(conditionSchema),
  });


  useEffect(() => {
    if (state.success) {
      setOpen(false); // Close modal/drawer
      toast.success(
        state.message ||
          `Condition has been ${type === "create" ? "created" : "updated"}!`
      );
      router.refresh(); // Refresh data on the page
      formRef.current?.reset(); // Reset form fields
    } else if (state.message && !state.success) {
      // Show server-side errors (e.g., non-field specific errors)
      toast.error(state.message);
    }
  }, [state, router, type, setOpen]);


  return (
    <form className="flex flex-col gap-8 w-full" ref={formRef} action={formAction}>
      <h1 className="text-xl font-semibold">{type === "create" ? "Create a new condition" : "Update the condition"}</h1>
      <InputField label="Name" name="name" defaultValue={data?.name} register={register} error={errors?.name} />
      <InputField label="Description" name="description" defaultValue={data?.description} register={register} error={errors?.description} />

      {data && <InputField label="Id" name="id" defaultValue={data?.id} register={register} error={errors?.id} hidden />}
      {state.message && !state.success && !state.errors && <span className="text-red-500 text-sm">{state.message}</span>}
      <button className="bg-blue-400 text-white p-2 rounded-md">{type === "create" ? "Create" : "Update"}</button>
    </form>
  );
}

export default ConditionForm;

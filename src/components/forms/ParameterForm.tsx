"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  Dispatch,
  SetStateAction,
  useActionState,
  useEffect,
  useRef,
} from "react";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { parameterSchema, ParameterSchema } from "@/lib/formValidationSchemas";
import { createParameter, updateParameter } from "@/lib/actions/parameterActions";
import SelectField from "../SelectField";

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

function ParameterForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: ParameterSchema & { id?: number }; // Add id for updates
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const actionToUse = type === "create" ? createParameter : updateParameter;
  const [state, formAction] = useActionState(actionToUse, initialState);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParameterSchema>({
    resolver: zodResolver(parameterSchema),
  });


  useEffect(() => {
    if (state.success) {
      setOpen(false); // Close modal/drawer
      toast.success(
        state.message ||
          `Parameter has been ${type === "create" ? "created" : "updated"}!`
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
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new parameter" : "Update the parameter"}
      </h1>
        <InputField
        label="Name"
        name="name"
        defaultValue={data?.name}
        register={register}
        error={errors?.name}
      />
      <InputField
        label="Unit"
        name="unit"
        defaultValue={data?.unit}
        register={register}
        error={errors?.unit}
      />
      <SelectField
        label="Type (Menambah/Mengurangi Sampel)"
        name="type"
        data={[
          { id: "+", name: "Menambah" },
          { id: "-", name: "Mengurangi" },
        ]}
        defaultValue={data?.type}
        register={register}
        error={errors?.type}
      />
     
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
      {state.message && !state.success && !state.errors && (
        <span className="text-red-500 text-sm">{state.message}</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
}

export default ParameterForm;

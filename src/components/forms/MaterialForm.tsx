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

function MaterialForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: MaterialSchema & { id?: number }; // Add id for updates
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const actionToUse = type === "create" ? createMaterial : updateMaterial;
  const [state, formAction] = useActionState(actionToUse, initialState);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaterialSchema>({
    resolver: zodResolver(materialSchema),
  });


  useEffect(() => {
    if (state.success) {
      setOpen(false); // Close modal/drawer
      toast.success(
        state.message ||
          `Material has been ${type === "create" ? "created" : "updated"}!`
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
        {type === "create" ? "Create a new material" : "Update the material"}
      </h1>
        <InputField
        label="Name"
        name="name"
        defaultValue={data?.name}
        register={register}
        error={errors?.name}
      />
      <InputField
        label="Description"
        name="description"
        defaultValue={data?.description}
        register={register}
        error={errors?.description}
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

export default MaterialForm;

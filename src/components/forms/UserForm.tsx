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
import { userSchema, UserSchema } from "@/lib/formValidationSchemas";
import { createUser, updateUser } from "@/lib/actions";

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

function UserForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: UserSchema & { id?: number }; // Add id for updates
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const actionToUse = type === "create" ? createUser : updateUser;
  const [state, formAction] = useActionState(actionToUse, initialState);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
  });


  useEffect(() => {
    if (state.success) {
      setOpen(false); // Close modal/drawer
      toast.success(
        state.message ||
          `Employee has been ${type === "create" ? "created" : "updated"}!`
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
      {/* <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new employee" : "Update the employee"}
      </h1> */}
      <span className="text-md  font-medium">Authentication Information</span>

      <InputField
        label="Email"
        name="email"
        defaultValue={data?.email}
        register={register}
        error={errors?.email}
      />
      <div className="flex justify-between flex-wrap gap-2">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />

        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        />
      </div>     
     
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

export default UserForm;

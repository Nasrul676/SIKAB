"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { userSchema, UserSchema } from "@/lib/formValidationSchemas";
import { createUser, updateUser } from "@/lib/actions";
import SelectField from "../SelectField";
import { Button } from "@/registry/new-york-v4/ui/button";

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
  const [state, formAction, isPending] = useActionState(actionToUse, initialState);

  const [isError, setIsError] = useState({
    email: false,
    username: false,
    password: false,
    role: false,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
  });

  const onSubmit = async (data: UserSchema) => {
    console.log("Form submitted:", data);
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("role", data.role);
    formData.append("id", data.id?.toString() || "");

    startTransition(() => {
      formAction(formData);
    });
  };

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
      console.log("Error state:", state);
      if(state.errors.password){
        toast.error(state.errors.password[0]);
      setIsError((prev) => ({ ...prev, password: true }));
      }
      if(state.errors.username){
        toast.error(state.errors.username[0]);
      setIsError((prev) => ({ ...prev, username: true }));
      }
      if(state.errors.email){
        toast.error(state.errors.email[0]);
      setIsError((prev) => ({ ...prev, email: true }));
      }
      if(state.errors.role){
        toast.error(state.errors.role[0]);
      setIsError((prev) => ({ ...prev, role: true }));
      }
    }
  }, [state, router, type, setOpen]);


  return (
    <form className="flex flex-col gap-8 w-full" ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      {/* <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new employee" : "Update the employee"}
      </h1> */}
      <span className="text-md  font-medium">Authentication Information</span>

      <InputField
        label="Email"
        name="email"
        defaultValue={data?.email}
        isError={isError.email}
        register={register}
        onChange={
          (e) => {
            setIsError((prev) => ({ ...prev, email: false }));
          }
        }
      />
      <div className="flex flex-row gap-2 w-full">
        <div className="w-full">
          <InputField
            label="Username"
            name="username"
            defaultValue={data?.username}
            isError={isError.username}
            register={register}
            onChange={
              (e) => {
                setIsError((prev) => ({ ...prev, username: false }));
              }
            }
          />
        </div>
        <div className="w-full">
          <InputField
            label="Password"
            name="password"
            type="password"
            defaultValue={data?.password}
            isError={isError.password}
            register={register}
            onChange={
              (e) => {
                setIsError((prev) => ({ ...prev, password: false }));
              }
            }
          />
        </div>
      </div>     
      <SelectField
        label="Role"
        name="role"
        defaultValue={data?.role}
        isError={isError.role}
        control={control}
        onChange={
          (e) => {
            setIsError((prev) => ({ ...prev, role: false }));
          }
        }
        data={[
          { id: "superadmin", name: "Super Admin" },
          { id: "admin", name: "Admin" },
          { id: "manager", name: "Manager" },
          { id: "security", name: "Security" },
          { id: "weighing", name: "Weighing" },
          { id: "qc", name: "Quality Control" },
        ]}
      />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            hidden
          />
        )}
      {state.message && !state.success && !state.errors && (
        <span className="text-red-500 text-sm">{state.message}</span>
      )}
      <Button type="submit" className="bg-blue-600 text-white p-2 rounded-md">
        {
          isPending ? "Loading..." : (type === "create" ? "Create" : "Update")
        }
      </Button>
    </form>
  );
}

export default UserForm;

"use client";

import {
  
  deleteUser,
} from "@/lib/actions";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  JSX,
  SetStateAction,
  useActionState,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";
import { Pencil, Plus, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/new-york-v4/ui/dialog";
import { deleteSupplier } from "@/lib/actions/supplierActions";
import { deleteMaterial } from "@/lib/actions/materialActions";
import { deleteCondition } from "@/lib/actions/conditionActions";
import { deleteParameter } from "@/lib/actions/parameterActions";

const deleteActionMap = {
  user: deleteUser, 
  supplier: deleteSupplier, 
  material: deleteMaterial,
  condition: deleteCondition,
  parameter: deleteParameter,

};

// USE LAZY LOADING

// import EmployeeForm from "./forms/EmployeeForm";
// import shiftForm from "./forms/shiftForm";

const UserForm = dynamic(() => import("./forms/UserForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SupplierForm = dynamic(() => import("./forms/SupplierForm"), {
  loading: () => <h1>Loading...</h1>,
});
const MaterialForm = dynamic(() => import("./forms/MaterialForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ConditionForm = dynamic(() => import("./forms/ConditionForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ParameterForm = dynamic(() => import("./forms/ParameterForm"), {
  loading: () => <h1>Loading...</h1>,
});


// TODO: OTHER FORMS

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  user: (setOpen, type, data, relatedData) => (
    <UserForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  supplier: (setOpen, type, data, relatedData) => (
    <SupplierForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),

  condition: (setOpen, type, data, relatedData) => (
    <ConditionForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),

  material: (setOpen, type, data, relatedData) => (
    <MaterialForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  
  parameter: (setOpen, type, data, relatedData) => (
    <ParameterForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-amber-300"
      : type === "update"
      ? "bg-green-300"
      : "bg-red-300";

  const bgColorHover =
    type === "create"
      ? "bg-amber-500"
      : type === "update"
      ? "bg-green-500"
      : "bg-red-500";

  const [open, setOpen] = useState(false);

  const Form = () => {
    const [state, formAction] = useActionState(deleteActionMap[table], {
      success: false,
      error: false,
    });

    const router = useRouter();

    useEffect(() => {
      if (state.success) {
        toast(`${table} has been deleted!`);
        setOpen(false);
        router.refresh();
      }
    }, [state, router]);
    return type === "delete" && id ? (
      <form action={formAction} className="p-4 flex flex-col gap-4 bg-gree">
        <input type="text | number" name="id" value={id} hidden />
        <span className="text-center font-medium">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
          Delete
        </button>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table](setOpen, type, data, relatedData)
    ) : (
      "Form not found!"
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <span
          className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:${bgColorHover}`}
        >
          {type == "create" ? (
            <Plus size={16} />
          ) : type == "update" ? (
            <Pencil size={16} />
          ) : (
            <Trash size={16} />
          )}
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="capitalize">
          {type} {table}
        </DialogTitle>
      </DialogHeader>
      <div className="max-h-[80vh] overflow-y-auto">
        <Form />
        </div>
      </DialogContent>
     
    </Dialog>
  );
};

export default FormModal;

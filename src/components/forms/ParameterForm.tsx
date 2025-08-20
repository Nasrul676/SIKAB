"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect, useRef, useCallback, useState } from "react";
import { Button } from "@/registry/new-york-v4/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { parameterSchema, ParameterSchema } from "@/lib/formValidationSchemas";
import { createParameter, updateParameter } from "@/lib/actions/parameterActions";
import SelectField from "../SelectField";
import { Plus, X } from "lucide-react";

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

function ParameterForm({ type, data, setOpen, relatedData }: { type: "create" | "update"; data?: ParameterSchema & { id?: number }; setOpen: Dispatch<SetStateAction<boolean>>; relatedData?: any }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const actionToUse = type === "create" ? createParameter : updateParameter;
  const [state, formAction, isPending] = useActionState(actionToUse, initialState);
  const [isError, setIsError] = useState({
    name: false,
    unit: false,
    type: false,
  });
  const [isClosing, setIsClosing] = useState(false);
  const [hasProcessedSuccess, setHasProcessedSuccess] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ParameterSchema>({
    defaultValues: {
      name: data?.name || "",
      unit: data?.unit || "",
      type: data?.type || "",
      settings: data?.settings && data.settings.length > 0 ? data.settings : [],
    },
  });

  const formValues = watch();

  const onSubmit = useCallback(
    (formData: ParameterSchema) => {
      setIsClosing(false);
      setHasProcessedSuccess(false);
      localStorage.setItem("parameterFormBackup", JSON.stringify(formValues));

      const formDataToSubmit = new FormData();
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("unit", formData.unit);
      formDataToSubmit.append("type", formData.type);

      if (formData.settings && formData.settings.length > 0) {
        const validSettings = formData.settings.filter((setting) => setting.key && setting.value);
        if (validSettings.length > 0) {
          formDataToSubmit.append("settings", JSON.stringify(validSettings));
        }
      }

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
    localStorage.removeItem("parameterFormBackup");
    setOpen(false);
  }, [setOpen, isClosing]);

  useEffect(() => {
    if (isPending || hasProcessedSuccess) {
      return;
    }

    if (state.success) {
      setHasProcessedSuccess(true);

      toast.success(state.message || `Parameter has been ${type === "create" ? "created" : "updated"}!`);

      setTimeout(() => {
        handleCloseModal();

        setTimeout(() => {
          router.refresh();
        }, 200);
      }, 500);

      return;
    }

    if (state.message && !state.success) {
      const backup = localStorage.getItem("parameterFormBackup");
      if (backup) {
        try {
          const parsedBackup = JSON.parse(backup);
          setValue("name", parsedBackup.name || "");
          setValue("unit", parsedBackup.unit || "");
          setValue("type", parsedBackup.type || "");
          if (parsedBackup.settings) {
            setValue("settings", parsedBackup.settings);
          }
        } catch (error) {
          console.error("Failed to parse backup:", error);
        }
      }
    }

    if (state.errors) {
      Object.keys(state.errors).forEach((field) => {
        const fieldError = state.errors[field];
        if (field === "name") {
          setIsError((prev) => ({ ...prev, name: true }));
        }

        if (field === "unit") {
          setIsError((prev) => ({ ...prev, unit: true }));
        }

        if (field === "type") {
          setIsError((prev) => ({ ...prev, type: true }));
        }

        if (fieldError && Array.isArray(fieldError)) {
          fieldError.forEach((error: string) => {
            toast.error(error);
          });
        }
      });
    }
  }, [state.success, state.message, state.errors, isPending, hasProcessedSuccess, type, setValue, router, handleCloseModal]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "settings",
  });

  const addCustomSetting = () => {
    append({ key: "", value: ""});
  };

  const removeCustomSetting = (index: number) => {
    remove(index);
  };

  return (
    <form className="flex flex-col gap-8 w-full" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">{type === "create" ? "Tambah parameter baru" : "Perbarui parameter"}</h1>

      <InputField label="Name" name="name" control={control} isError={isError.name} onChange={() => {
        setIsError((prev) => { return { ...prev, name: false }; })
      }} />

      <InputField label="Unit" name="unit" control={control} isError={isError.unit} onChange={() => {
        setIsError((prev) => { return { ...prev, unit: false }; })
      }} />

      <SelectField
        label="Type (Menambah/Mengurangi Sampel)"
        name="type"
        data={[
          { id: "+", name: "Menambah" },
          { id: "-", name: "Mengurangi" },
        ]}
        control={control}
        isError={isError.type}
        onChange={() => setIsError((prev) => { return { ...prev, type: false }; })}
      />

      {data?.id && <input type="hidden" {...register("id" as any)} value={data.id} />}

      {state.message && !state.success && !state.errors && <span className="text-red-500 text-sm">{state.message}</span>}

      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-3 items-end p-3 border border-gray-200 rounded-lg">
          <div className="flex-1">
            <InputField label="Nama" name={`settings.${index}.key`} control={control} placeholder="cth, note" />
          </div>

          <div className="flex-1">
            <InputField label="Label" name={`settings.${index}.value`} control={control} placeholder="cth, Catatan" />
          </div>
          <Button type="button" onClick={() => removeCustomSetting(index)} variant="outline" size="sm" className="mb-1 text-red-600 hover:text-red-700 hover:bg-red-50">
            <X size={16} />
          </Button>
        </div>
      ))}

      <div className="text-center text-gray-500">
        <Button type="button" onClick={addCustomSetting} variant="outline">
          <Plus size={16} className="mr-2" />
          Tambah inputan baru
        </Button>
      </div>

      <button disabled={isPending || isClosing} type="submit" className={`p-2 rounded-md transition-colors text-white ${isPending || isClosing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
        {isPending ? "Menyimpan..." : isClosing ? "Menutup..." : "Simpan"}
      </button>
    </form>
  );
}

export default ParameterForm
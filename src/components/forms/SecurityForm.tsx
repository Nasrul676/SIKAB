"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import InputField from "../InputField";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArivalSchema, arivalSchema, arrivalMaterialSchema } from "@/lib/formValidationSchemas";
import { createMaterial } from "@/lib/actions/materialActions";
import SelectField from "../SelectField";
import { Button } from "@/registry/new-york-v4/ui/button";
import FormModal from "../FormModal";
import { Calendar, ClipboardList, Clock, Cross, Plus, Save, X } from "lucide-react";
import moment from "moment";
import { createArrival } from "@/lib/actions/arrivalActions";
import prisma from "@/lib/prisma";
import FileUpload from "./SecurityForm/FileUpload";
import { showConfirmationAlert } from "@/app/utils/alert";
import { set, ZodIssue } from "zod";

type FormState = {
  success: boolean;
  message: string | null;
  errors?: any;
};

type ItemError = {
  materialId: boolean;
  itemName: boolean;
  quantity: boolean;
  conditionCategory: boolean;
  conditionId: boolean;
};

type IsErrorState = {
  supplierId: boolean;
  arrivalTime: boolean;
  nopol: boolean;
  suratJalan: boolean;
  securityProof: boolean;
  materials: ItemError[];
};

const initialState: FormState = {
  success: false,
  message: null,
  errors: undefined,
};

const defaultItemError = (): ItemError => ({
  materialId: false,
  itemName: false,
  quantity: false,
  conditionCategory: false,
  conditionId: false,
});

function SecurityForm({ relatedData, data }: { relatedData: any; data?: any }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createArrival, initialState);
  const [arrivalId, setArrivalId] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<ArivalSchema>({
    defaultValues: {
      arrivalId: `${moment().format("YYYYMMDD")}-${String(relatedData?.arrivalNo + 1).padStart(3, "0")}`,
      supplierId: data?.supplierId || "",
      nopol: data?.nopol || "",
      suratJalan: data?.suratJalan || "",
      arrivalTime: data?.arrivalTime || "",
      securityProof: data?.securityProof || [],
      materials: [{ materialId: "", quantity: "", conditionCategory: "Basah", conditionId: "", itemName: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "materials",
  });

  const [isError, setIsError] = useState<IsErrorState>({
    supplierId: false,
    arrivalTime: false,
    nopol: false,
    suratJalan: false,
    securityProof: false,
    materials: [defaultItemError()],
  });

  const [materialItemData, setMaterialItemData] = useState([{
    conditionId: "",
    conditionCategory: "Basah",
    itemName: "",
    materialId: "",
    quantity: "",
  }]);

  const onSubmit = async (data: any) => {
    console.log("Form data submitted:", data);
    const formData = new FormData();

    formData.append("arrivalTime", data.arrivalTime);
    formData.append("supplierId", data.supplierId);
    formData.append("nopol", data.nopol.toUpperCase());
    formData.append("suratJalan", data.suratJalan);
    formData.append("arrivalId", data.arrivalId);
    data.securityProof.forEach((item: { file: File }, index: number) => {
      formData.append("securityProof", item.file);
    });
    formData.append("materials", JSON.stringify(data.materials));
    setArrivalId(data.arrivalId);
    startTransition(() => {
      formAction(formData);
    })

    const supplierName = relatedData?.supplier.find((s: any) => s.id === data.supplierId)?.name || "";
    data.supplierName = supplierName;
    data.nopol = data.nopol.toUpperCase();
    localStorage.setItem("arrivalData", JSON.stringify(data));
  };

  const handleCancel = () => {
    showConfirmationAlert("Apakah Anda yakin ingin membatalkan penginputan kedatangan ini? Perubahan yang belum disimpan akan hilang.", () => {
      localStorage.removeItem("arrivalData");
      router.push("/security");
    });
  }

  useEffect(() => {
    setIsError((prev) => {
      const materials = [...prev.materials];
      while (materials.length < fields.length) materials.push(defaultItemError());
      while (materials.length > fields.length) materials.pop();
      return { ...prev, materials };
    });
  }, [fields.length]);

  const handleAddFields = () => {
    const allMaterials = getValues("materials") as Array<{
      materialId: string | number;
      itemName?: string;
      quantity: string | number;
      conditionCategory: string;
      conditionId: string | number;
    }>;

    let hasError = false;
    const nextErrors: ItemError[] = Array.from({ length: fields.length }, defaultItemError);

    allMaterials.forEach((row, idx) => {
      const res = arrivalMaterialSchema.safeParse({
        materialId: row.materialId,
        quantity: row.quantity,
        conditionCategory: row.conditionCategory,
        conditionId: row.conditionId,
        itemName: row.itemName || "",
      });

      if (!res.success) {
        hasError = true;
        const current = { ...nextErrors[idx] };
        res.error.issues.forEach((issue) => {
          const field = String(issue.path[0]); // path dari object: 'materialId', 'quantity', dll
          if (field === "materialId") current.materialId = true;
          if (field === "itemName") current.itemName = true;
          if (field === "quantity") current.quantity = true;
          if (field === "conditionCategory") current.conditionCategory = true;
          if (field === "conditionId") current.conditionId = true;
          toast.error(issue.message);
        });
        nextErrors[idx] = current;
      }
    });

    if (hasError) {
      setIsError((prev) => ({ ...prev, materials: nextErrors }));
      return;
    }

    append({ materialId: "", quantity: "", conditionCategory: "Basah", conditionId: "", itemName: "" });
    setIsError((prev) => ({ ...prev, materials: [...prev.materials, defaultItemError()] }));
  };

  useEffect(() => {
    setIsError((prev) => {
      const materials = [...prev.materials];
      while (materials.length < fields.length) materials.push(defaultItemError());
      while (materials.length > fields.length) materials.pop();
      return { ...prev, materials };
    });
  }, [fields.length]);

  useEffect(() => {
    if (!errors) return;

    const materialsErr: ItemError[] = Array.from({ length: fields.length }, defaultItemError);
    if (Array.isArray(errors.materials)) {
      errors.materials.forEach((err: any, i: number) => {
        if (err.conditionId) toast.error(err.conditionId.message);
        if (err.materialId) toast.error(err.materialId.message);
        if (err.quantity) toast.error(err.quantity.message);
        if (err.itemName) toast.error(err.itemName.message);
        if (err.conditionCategory) toast.error(err.conditionCategory.message);
        if (!err) return;
        if (err.materialId) materialsErr[i].materialId = true;
        if (err.itemName) materialsErr[i].itemName = true;
        if (err.quantity) materialsErr[i].quantity = true;
        if (err.conditionCategory) materialsErr[i].conditionCategory = true;
        if (err.conditionId) materialsErr[i].conditionId = true;
      });
    }

    setIsError((prev) => ({
      ...prev,
      supplierId: !!errors.supplierId,
      arrivalTime: !!errors.arrivalTime,
      nopol: !!errors.nopol,
      suratJalan: !!errors.suratJalan,
      securityProof: !!errors.securityProof,
      materials: materialsErr,
    }));
  }, [errors, fields.length]);

  const clearMaterialError = (index: number, key: keyof ItemError) => {
    setIsError((prev) => {
      const materials = [...prev.materials];
      const current = materials[index] ?? defaultItemError();
      materials[index] = { ...current, [key]: false };
      return { ...prev, materials };
    });
  };

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || `Arrival updated successfully!`);
      router.refresh();
      formRef.current?.reset();
      router.push("/security/print/" + arrivalId);
    } else if (state.message && !state.success) {
      console.log(state)
    }
  }, [state, router]);

  return (
    <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit(onSubmit)} ref={formRef}>
      <h2 className="text-xl md:text-3xl font-bold">Input Kedatangan Bahan Baku</h2>
      <div className="dark:shadow-slate-700 p-8 rounded-xl shadow-lg flex flex-col gap-3">
        <div className="mb-6 flex flex-col md:flex-row gap-2 justify-between items-center">
          <div className="text-md md:text-xl font-semibold w-full flex items-center gap-2">
            <ClipboardList size={24} /> ID Kedatangan:{" "}
            <span className="text-blue-600 font-bold md:text-2xl">
              {moment().format("YYYYMMDD")}-{String(relatedData?.arrivalNo + 1).padStart(3, "0")}
            </span>
            <InputField
              label="ID Kedatangan"
              hidden
              name="arrivalId"
              control={control}
              onChange={(e) => {
                setIsError((prev: any) => ({ ...prev, arrivalId: false }));
              }}
              defaultValue={`${moment().format("YYYYMMDD")}-${String(relatedData?.arrivalNo + 1).padStart(3, "0")}`}
            />
          </div>
          <div className="text-md flex items-center w-full gap-2">
            <Calendar size={24} /> {moment().format("YYYY-MM-DD")}{" "}
            <span className="ml-2 flex gap-2">
              <Clock size={24} /> {moment().format("HH:mm")}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex items-end gap-2 ">
            <SelectField
              label="Supplier"
              name="supplierId"
              data={relatedData?.supplier || []}
              defaultValue={data?.supplierId}
              control={control}
              isError={isError.supplierId}
              onChange={(e) => {
                setIsError((prev: any) => ({ ...prev, supplierId: false }));
              }}
              required={true}
            />
            <div className="mb-1">
              <FormModal table="supplier" type="create" />
            </div>
          </div>
          <InputField
            label="Jam Kedatangan"
            name="arrivalTime"
            type="time"
            defaultValue={data?.arrivalTime}
            control={control}
            isError={isError.arrivalTime}
            onChange={(e) => {
              setIsError((prev: any) => ({ ...prev, arrivalTime: false }));
            }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <InputField
            label="Nomor Polisi"
            name="nopol"
            type="text"
            style={{ textTransform: "uppercase" }}
            defaultValue={data?.nopol}
            control={control}
            isError={isError.nopol}
            onChange={(e) => {
              setIsError((prev: any) => ({ ...prev, nopol: false }));
            }}
          />
          <InputField
            label="Surat Jalan"
            name="suratJalan"
            type="text"
            defaultValue={data?.suratJalan}
            control={control}
            isError={isError.suratJalan}
            onChange={(e) => {
              setIsError((prev: any) => ({ ...prev, suratJalan: false }));
            }}
          />
        </div>
        <FileUpload control={control} />
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Detail Bahan Baku</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col md:flex-row gap-4 mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex flex-col lg:flex-row gap-3 w-full">
              <div className="w-full flex flex-row gap-2">
                <SelectField
                  label="Jenis Bahan"
                  name={`materials[${index}].materialId`}
                  data={relatedData?.materials || []}
                  control={control}
                  required={true}
                  isError={!!isError.materials[index]?.materialId}
                  onChange={(e) => {
                    clearMaterialError(index, "materialId");
                    setMaterialItemData((prev) => {
                      const updated = [...prev];
                      updated[index] = { ...(updated[index] || {}), materialId: e.valueOf() };
                      return updated;
                    });
                  }}
                />
                <div className="flex justify-center items-end">
                  <FormModal table="material" type="create" />
                </div>
              </div>
              <div className="w-full">
                <InputField
                  label="Nama Bahan Baku"
                  name={`materials[${index}].itemName`}
                  type="text"
                  control={control}
                  isError={!!isError.materials[index]?.itemName}
                  onChange={(e) => {
                    clearMaterialError(index, "itemName");
                    setMaterialItemData((prev) => {
                      const updated = [...prev];
                      updated[index] = { ...(updated[index] || {}), itemName: e.valueOf() };
                      return updated;
                    });
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-3 w-full">
              <div className="w-full">
                <InputField
                  label="Jumlah Qty (kg)"
                  name={`materials[${index}].quantity`}
                  type="number"
                  control={control}
                  required={true}
                  isError={!!isError.materials[index]?.quantity}
                  onChange={(e) => {
                    clearMaterialError(index, "quantity");
                    setMaterialItemData((prev) => {
                      const updated = [...prev];
                      updated[index] = { ...(updated[index] || {}), quantity: e.valueOf() };
                      return updated;
                    });
                  }}
                />
              </div>
              <div className="w-full">
                <SelectField
                  label="Kondisi Bahan"
                  name={`materials[${index}].conditionCategory`}
                  data={[
                    { id: "Basah", name: "Basah" },
                    { id: "Kering", name: "Kering" },
                  ]}
                  control={control}
                  required={true}
                  isError={!!isError.materials[index]?.conditionCategory}
                  onChange={(e) => {
                    clearMaterialError(index, "conditionCategory");
                    setMaterialItemData((prev) => {
                      const updated = [...prev];
                      updated[index] = { ...(updated[index] || {}), conditionCategory: e.valueOf() };
                      return updated;
                    });
                  }}
                />
              </div>
              <div className="w-full">
                <SelectField
                  label="Tingkat Kebersihan Bahan"
                  name={`materials[${index}].conditionId`}
                  data={relatedData?.conditions || []}
                  control={control}
                  required={true}
                  isError={!!isError.materials[index]?.conditionId}
                  onChange={(e) => {
                    clearMaterialError(index, "conditionId");
                    setMaterialItemData((prev) => {
                      const updated = [...prev];
                      updated[index] = { ...(updated[index] || {}), conditionId: e.valueOf() };
                      return updated;
                    });
                  }}
                />
              </div>
            </div>
            <div className="flex items-start justify-end">
              <button
                type="button"
                onClick={() => {
                  remove(index);
                  // sinkronkan error array saat item dihapus
                  setIsError((prev) => ({
                    ...prev,
                    materials: prev.materials.filter((_, i) => i !== index),
                  }));
                }}
                disabled={fields.length <= 1}
                aria-label={`Remove Item ${index + 1}`}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}

        {state.message && !state.success && !state.errors && <span className="text-red-500 text-sm">{state.message}</span>}
        <div className="flex justify-between">
          <div className="flex gap-4">
            <Button disabled={isPending} type="button" onClick={handleAddFields} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 cursor-pointer">
              <Plus size={16} /> Tambah Bahan Baku
            </Button>
            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md cursor-pointer">
              {isPending && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              <Save /> {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
          <div>
            <Button type="button" disabled={isPending} onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer">
              <X size={16} /> Kembali
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default SecurityForm;

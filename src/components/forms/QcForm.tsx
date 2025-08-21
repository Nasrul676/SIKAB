"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { Input } from "@/registry/new-york-v4/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/registry/new-york-v4/ui/button";
import {
  Calendar,
  ClipboardList,
  Package,
  Save,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import moment from "moment";
import SelectField from "../SelectField";
import { callGeminiAPI } from "@/lib/geminiApi";
import { createQc } from "@/lib/actions/qcAction";
import {
  QcSubmissionData,
  qcSubmissionSchema,
} from "@/lib/validation/qcValidationSchema";
import FileUpload from "./QcForm/FileUpload";
import ParametersTable from "./QcForm/ParametersTable";
import { showConfirmationAlert } from "@/app/utils/alert";
const initialState = {
  message: null,
  errors: null,
  isSuccess: false,
  success: false,
};
import flatToObject from "@/lib/flatToObjext";

function QcForm({ relatedData }: { relatedData: any }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createQc, initialState);

  const [analyzingIndex, setAnalyzingIndex] = useState<string>("");
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [filePreviews, setFilePreviews] = useState<any[]>([]); // { materialIndex: [url1, url2] }
  const [isError, setIsError] = useState({
    statusQc: false,
    qcSample: false,
    qcKotoran: false,
    totalBerat: false,
  })
  if (!relatedData) {
    return <p>Memuat data...</p>;
  }
  let listParameters = relatedData.qcParameters.length;
  relatedData.qcParameters.map((data: { settings: any[]; id: any; }, index: any) => {
    if (data.settings.length > 0) {
      listParameters += 1
    }
    return data;
  })
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    setValue,
    reset,
  } = useForm<QcSubmissionData>({
    mode: "onChange",
    defaultValues: {
      arrivalId: relatedData.arrival.id.toString(),
      materials: relatedData.arrivalItems.map((item: any, materialIndex: number) => {
        const latestQcResults = item.QcResults.slice(-listParameters);

        const qcResultsDefault =
          latestQcResults.length > 0
            ?
              latestQcResults.map((result: any) => ({
                parameterId: result.parameterId,
                value: result.value || "",
                persentase: result.persentase || 0,
                settings: result.additional || [],
              }))
            : 
              relatedData.qcParameters.map((param: any) => ({
                parameterId: param.id,
                value: "",
                persentase: 0,
                settings: param.settings.map((s: any) => ({ key: s.key, value: "" })) || [],
              }));

        return {
          arrivalItemId: item.id.toString(),
          qcResults: qcResultsDefault,
          qcSample: item.qcSample || 0, 
          qcKotoran: item.qcKotoran || 0,
          totalBerat: item.totalBerat || 0,
          pengeringan: item.pengeringan,
          statusQc: item.qcStatusId !== null ? item.qcStatusId.toString() : "",
          qcPhotos: [],
          qcNotes: item.notes || "",
          analysis: "",
          city: relatedData.arrival.city || "",
        };
      }),
    },
  });
  const { fields } = useFieldArray({ control, name: "materials" });

  const handleMaterialChange = (materialIndex: number) => {
    let total = Number(getValues(`materials.${materialIndex}.qcSample`));
    const sample = total;
    relatedData.qcParameters.forEach((param: any, idx: number) => {
      const val = Number(
        getValues(`materials.${materialIndex}.qcResults.${idx}.value`) || 0
      );
      total -= val;
      const persen = (val / sample) * 100;
      setValue(
        `materials.${materialIndex}.qcResults.${idx}.persentase`,
        parseFloat(persen.toFixed(2))
      );
    });
    setValue(`materials.${materialIndex}.totalBerat`, sample - total);
    setValue(`materials.${materialIndex}.qcKotoran`, total);
    setValue(
      `materials.${materialIndex}.persentaseKotoran`,
      parseFloat(((total / sample) * 100).toFixed(2))
    );
  };

  const allWatchedValues = watch(); // Panggil watch() tanpa argumen untuk mengamati semua field
  useEffect(() => {
    console.log("All watched values:", allWatchedValues);
  }, [allWatchedValues]);

  const onSubmit = async (data: QcSubmissionData) => {
    const formData = new FormData();

    formData.append("arrivalId", data.arrivalId);

    data.materials.forEach((material, materialIndex) => {
      if(material.arrivalItemId) {
        formData.append(
          `materials.${materialIndex}.arrivalItemId`,
          material.arrivalItemId
        );
      }
      if(material.statusQc) {
        formData.append(`materials.${materialIndex}.statusQc`, material.statusQc);
      }
      if(material.qcSample) {
        formData.append(
          `materials.${materialIndex}.qcSample`,
          material.qcSample.toString()
        );
      }
      if(material.qcKotoran) {
        formData.append(
          `materials.${materialIndex}.qcKotoran`,
          material.qcKotoran.toString()
        );
      }
      if(material.totalBerat) {
        formData.append(
          `materials.${materialIndex}.totalBerat`,
          material.totalBerat.toString()
        );
      }
      if(material.pengeringan) {
        formData.append(
          `materials.${materialIndex}.pengeringan`,
          material.pengeringan?.toString() || ""
        );
      }
      if (material.qcNotes) {
        formData.append(`materials.${materialIndex}.qcNotes`, material.qcNotes);
      }
      if (material.analysis) {
        formData.append(
          `materials.${materialIndex}.analysis`,
          material.analysis
        );
      }
      if (material.city){
        formData.append(
          `materials.${materialIndex}.city`,
          material.city
        )
      }

      material.qcResults.forEach((result: any, resultIndex) => {
        formData.append(
          `materials.${materialIndex}.qcResults.${resultIndex}.parameterId`,
          result.parameterId
        );
        formData.append(
          `materials.${materialIndex}.qcResults.${resultIndex}.key`,
          "main_value"
        );
        formData.append(
          `materials.${materialIndex}.qcResults.${resultIndex}.value`,
          result.value
        );

        if(result.additional){
          const additional = result.additional.map((item: any) => ({
            key: item.key,
            value: item.value
          }));
  
          formData.append(
            `materials.${materialIndex}.qcResults.${resultIndex}.additional`,
            JSON.stringify(additional)
          );
        }

      });

      if (material.qcPhotos) {
        material.qcPhotos.forEach((photo, photoIndex) => {
          formData.append(
            `materials.${materialIndex}.qcPhotos.file.${photoIndex}`,
            photo.file
          );
        });
      }
    });
    console.log("Submitting form data:", flatToObject(formData));
    startTransition(() => {
      formAction(formData);
    });
  };

  const [errorsState, setErrorsState] = useState<any>(null);

  const handleCancelQc = () => {
    showConfirmationAlert("Apakah Anda yakin ingin membatalkan hasil QC ini? Perubahan yang belum disimpan akan hilang.", () => {
      // Redirect to QC list page
      router.push("/qc");
    });
  }

  useEffect(() => {
    if (state.success) {
      toast.success(
        state.message ||
        `Hasil QC untuk ID ${relatedData.arrival.idKedatangan} berhasil disimpan!`
      );
      router.push("/qc");
    } else if (state.message && !state.success) {
      state.errors.map((error: any) => {
        console.info("Error:", error);
        if(error.field === "statusQc") setIsError((prev) => ({ ...prev, statusQc: true }));
        if(error.field === "qcSample") setIsError((prev) => ({ ...prev, qcSample: true }));
        if(error.field === "qcKotoran") setIsError((prev) => ({ ...prev, qcKotoran: true }));
        if(error.field === "totalBerat") setIsError((prev) => ({ ...prev, totalBerat: true }));
        toast.error(error.message);
      });
    }
    
    fields.forEach((_, index) => {
      handleMaterialChange(index);
    });
  }, [state, router]);
  return (
    <>
      <form
        className="flex flex-col gap-2 w-full"
        onSubmit={handleSubmit(onSubmit)}
        ref={formRef}
        // action={formAction}
      >
        <input type="hidden" {...register("arrivalId")} />

        <h2 className="text-xl md:text-3xl font-bold">Input Hasil Quality Control</h2>
        <div className="dark:shadow-slate-700 p-8 rounded-xl shadow-lg flex flex-col gap-3">
          <div className="w-full mb-6 flex flex-row justify-between">
            <div className="text-md md:text-xl font-semibold w-full flex items-center gap-2 flex-col">
              <div className="flex gap-2 w-full flex-col items-start md:flex-row md:items-center">
                <div className="flex items-center gap-2">
                  <ClipboardList size={24} /> ID Kedatangan:{" "}
                </div>
                <span className="text-blue-600 font-bold md:text-2xl">{relatedData.arrival.idKedatangan}</span>
              </div>
              <div className="gap-2 w-full flex-col items-start md:flex-row md:items-center flex">
                <div className="flex items-center gap-2">
                  <Truck size={20} /> Supplier:
                </div>
                <div>{relatedData.arrival.supplier.name}</div>
              </div>
            </div>
            <div className="flex flex-row justify-end items-center gap-2 w-full">
              <Calendar size={20} /> Tanggal: <span>{moment(relatedData.arrival.date).format("DD MMMM YYYY")}</span>
            </div>
          </div>

          {fields.map((field: any, materialIndex: number) => {
            const materialQc = relatedData.arrivalItems.find((item: any) => item.id == field.arrivalItemId);
            return (
              <div key={field.id} className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-900">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold  mb-4 flex items-center gap-2">
                    <Package size={22} /> Bahan Baku #{materialIndex + 1}: {materialQc.material.name} ({materialQc.quantity} kg)
                  </h3>
                </div>

                <div className="mb-4">
                  <div className="overflow-x-auto">
                    <ParametersTable materialIndex={materialIndex} register={register} errors={errorsState?.error} parameters={relatedData.qcParameters} onChange={() => handleMaterialChange(materialIndex)} isError={isError} setIsError={setIsError} />
                  </div>
                </div>
                <div className="mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Status QC</label>
                    <select
                      {...register(`materials.${materialIndex}.statusQc`)}
                      className={`w-full ${isError.statusQc ? "border-red-500" : "border-gray-300"} "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"`}
                    >
                      <option value="">-- Pilih Status --</option>
                      {relatedData.qcStatuses.map((status: any) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <FileUpload control={control} materialIndex={materialIndex} />
                {/* lists of file previews */}
                <div className="flex flex-row gap-4 mb-4">
                  {materialQc.QcPhotos.map((photo: any, index: number) => {
                    return (
                      <button
                        key={index}
                        type="button"
                        className="cursor-pointer w-full relative p-3 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
                        onClick={() => {
                          window.open(`https://drive.google.com/uc?export=view&id=${photo.photo}`, "_blank");
                        }}
                      >
                        <span className="text-md text-blue-500">{`Foto - ${index + 1}`}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mb-4">
                  <label htmlFor={`materials.${materialIndex}.qcNotes`} className="block text-sm font-semibold mb-2">
                    Catatan QC (Opsional)
                  </label>
                  <textarea
                    id={`materials.${materialIndex}.qcNotes`}
                    className="p-3 border border-gray-300 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    {...register(`materials.${materialIndex}.qcNotes`)}
                  ></textarea>
                </div>
                <div className="w-full flex flex-row justify-between gap-4">
                  <Button type="submit" disabled={isPending} className="bg-blue-600 text-white p-2 rounded-md cursor-pointer">
                    {isPending && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin cursor-wait"></div>}
                    <Save /> {isPending ? "Menyimpan..." : "Simpan Hasil QC"}
                  </Button>
                  <Button type="button" disabled={isPending} onClick={handleCancelQc} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer">
                    <X size={16} /> Kembali
                  </Button>
                </div>
              </div>
            );
          })}

          {/* {state.message && !state.success && !state.error && <span className="text-red-500 text-sm">{state.message}</span>} */}
        </div>
      </form>
    </>
  );
}

export default QcForm;

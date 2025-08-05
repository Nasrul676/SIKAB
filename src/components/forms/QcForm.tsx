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

function QcForm({ relatedData }: { relatedData: any }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createQc, initialState);

  const [analyzingIndex, setAnalyzingIndex] = useState<string>("");
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [filePreviews, setFilePreviews] = useState<any[]>([]); // { materialIndex: [url1, url2] }
  if (!relatedData) {
    return <p>Memuat data...</p>;
  }
  const latestQcResults = relatedData.arrivalItems.map((item: any) => {
    return item.QcResults.slice(-relatedData.qcParameters.length).reduce((acc: any, curr: any) => {
      acc.push(curr);
      return acc;
    }, []);
  });
  const listParams = () => {
    if (latestQcResults[0].length === 0) {
      return relatedData.qcParameters.map((param: any) => ({
        id: param.id,
        name: param.name,
        value: "",
        persentase: 0,
      }));
    } else {
      return latestQcResults[0].map((param: any) => ({
        id: param.parameterId,
        name: param.parameter.name,
        value: param.value,
        persentase: param.persentase || 0,
      }));
    }
  }
  const [listParamsData, setListParams] = useState(listParams);
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
    resolver: zodResolver(qcSubmissionSchema),
    mode: "onChange",
    defaultValues: {
      arrivalId: relatedData.arrival.id.toString(),
      materials: relatedData.arrivalItems.map((item: any) => ({
        arrivalItemId: item.id.toString(),
        qcResults: listParamsData.map((param: any) => ({
          parameterId: param.id,
          value: param.value,
          persentase: param.persentase,
        })),
        qcSample: item.qcSample || 0,
        qcKotoran: item.qcKotoran || 0,
        totalBerat: item.totalBerat || 0,
        pengeringan: item.pengeringan || 0,
        statusQc: item.qcStatusId !== null ? item.qcStatusId.toString() : "",
        qcPhotos: [], // Always initialize as an array (never undefined)
        qcNotes: item.notes || "",
        analysis: "",
        city: relatedData.arrival.city || "",
      })),
    },
  });
  const { fields } = useFieldArray({ control, name: "materials" });

  const handleAnalyzeQc = async (materialIndex: number) => {
    const materialQcData =
      relatedData.arrivalItems[materialIndex].material.name;
    const resultsText = relatedData.qcParameters
      .map(
        (param: any, idx: number) =>
          `${param.name}:${getValues(
            `materials.${materialIndex}.qcResults.${idx}.value`
          )}`
      )
      .join(", ");
    setAnalyzingIndex(materialIndex.toFixed(0));
    const newAnalysis = analysis.filter(
      (item) => item.materialIndex !== materialIndex.toFixed(0)
    );

    const prompt = `Saya melakukan pengecekan QC untuk bahan baku ${materialQcData} dengan hasil: ${resultsText}. Berdasarkan hasil ini, apakah bahan ini sebaiknya "Lolos", "Tidak Lolos", atau "Karantina"? Berikan juga alasan singkatnya dan catatan tambahan jika ada.`;
    const analysisAi = await callGeminiAPI(prompt);
    newAnalysis.push({
      materialIndex: materialIndex.toFixed(0),
      analysis: analysisAi,
    });
    console.log("AI Analysis:", newAnalysis);
    setAnalysis(newAnalysis);
    setAnalyzingIndex("");
  };

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

  const removeItem = (idxToRemove: number) => {
    if (fields.length <= 1) {
      alert("You must have at least one break.");
      return;
    }
    const newFields = fields.filter(
      (field: any, idx: number) => field.arrivalItemId !== idxToRemove
    );

    console.log(idxToRemove, newFields);

    setValue(
      `materials`,
      newFields
    );
  };

  const onSubmit = async (data: QcSubmissionData) => {
    console.log("Submitting data:", data);
    const formData = new FormData();

    formData.append("arrivalId", data.arrivalId);

    data.materials.forEach((material, materialIndex) => {
      formData.append(
        `materials.${materialIndex}.arrivalItemId`,
        material.arrivalItemId
      );
      formData.append(`materials.${materialIndex}.statusQc`, material.statusQc);
      formData.append(
        `materials.${materialIndex}.qcSample`,
        material.qcSample.toString()
      );
      formData.append(
        `materials.${materialIndex}.qcKotoran`,
        material.qcKotoran.toString()
      );
      formData.append(
        `materials.${materialIndex}.totalBerat`,
        material.totalBerat.toString()
      );
      formData.append(
        `materials.${materialIndex}.pengeringan`,
        material.pengeringan?.toString() || ""
      );
      console.log("Material:", formData);
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
          `materials.${materialIndex}.qcResults.${resultIndex}.value`,
          result.value
        );
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

    // 5. Jalankan Server Action dengan FormData yang sudah lengkap
    startTransition(() => {
      formAction(formData);
    });
  };

  const handleCancelQc = () => {
    showConfirmationAlert("Apakah Anda yakin ingin membatalkan hasil QC ini? Perubahan yang belum disimpan akan hilang.", () => {
      // Redirect to QC list page
      router.push("/qc");
    });
  }
  
  console.log("relatedData:", relatedData);

  useEffect(() => {
    if (state.success) {
      toast.success(
        state.message ||
        `Hasil QC untuk ID ${relatedData.arrival.idKedatangan} berhasil disimpan!`
      );
      router.push("/qc");
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
    //run handleMaterialChange for each material to update persentase and total berat
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
                  {/* <button type="button" onClick={() => removeItem(field.arrivalItemId)} disabled={fields.length <= 1} aria-label={`Remove Item ${materialIndex + 1}`}>
                    <X size={16} />
                  </button> */}
                </div>

                <div className="mb-4">
                  <div className="overflow-x-auto">
                    <ParametersTable materialIndex={materialIndex} register={register} errors={errors} parameters={relatedData.qcParameters} onChange={() => handleMaterialChange(materialIndex)} />
                  </div>
                  {/* <button
                    onClick={() => handleAnalyzeQc(materialIndex)}
                    disabled={analyzingIndex == materialIndex.toFixed(0)}
                    type="button"
                    className="mt-3 w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md flex items-center justify-center gap-2 text-sm transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {analyzingIndex == materialIndex.toFixed(0) ? (
                      "Menganalisis..."
                    ) : (
                      <>
                        <Sparkles size={16} /> Analisis & Rekomendasi QC ✨
                      </>
                    )}
                  </button>
                  {analysis.find((item) => item.materialIndex === materialIndex.toFixed(0)) && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm ">
                      <p className="font-semibold text-blue-800 mb-1">Analisis AI:</p>
                      <p>{analysis[materialIndex].analysis}</p>
                    </div>
                  )} */}
                </div>
                <div className="mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Kota Asal</label>
                    <Input className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" {...register(`materials.${materialIndex}.city`)} />
                  </div>
                </div>
                <div className="mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Status QC</label>
                    <select {...register(`materials.${materialIndex}.statusQc`)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
                      <option value="">-- Pilih Status --</option>
                      {relatedData.qcStatuses.map((status: any) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                    {errors?.materials?.[materialIndex]?.statusQc && <p className="text-red-500 text-xs mt-1">{errors.materials[materialIndex].statusQc.message}</p>}
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
                    value={materialQc.notes}
                  ></textarea>
                </div>
                <div className="w-full flex flex-row justify-between gap-4">
                  <Button type="submit" disabled={isPending} className="bg-blue-400 text-white p-2 rounded-md">
                    {isPending && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    {isPending ? "Menyimpan..." : "Simpan Hasil QC"}
                  </Button>
                  <Button type="button" className="bg-gray-400 text-white p-2 rounded-md" onClick={handleCancelQc}>
                    <span className="text-md">Batal</span>
                  </Button>
                </div>
              </div>
            );
          })}

          {state.message && !state.success && !state.error && <span className="text-red-500 text-sm">{state.message}</span>}
        </div>
      </form>
    </>
  );
}

export default QcForm;

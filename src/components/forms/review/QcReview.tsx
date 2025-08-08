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
import { callGeminiAPI } from "@/lib/geminiApi";
import { createQc } from "@/lib/actions/qcAction";
import {
  QcSubmissionData,
  qcSubmissionSchema,
} from "@/lib/validation/qcValidationSchema";
import ParametersTable from "../QcForm/ParametersTable";
import FileUpload from "../QcForm/FileUpload";
import ImageThumbnail from "@/components/ImagaTumbnails";

const initialState = {
  message: null,
  errors: null,
  isSuccess: false,
  success: false,
};

function QcReview({ relatedData }: { relatedData: any }) {
    console.log("Related Data:", relatedData);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createQc, initialState);

  const [analyzingIndex, setAnalyzingIndex] = useState<string>("");
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [filePreviews, setFilePreviews] = useState<any>({}); // { materialIndex: [url1, url2] }
  if (!relatedData) {
    return <p>Memuat data...</p>;
  }
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
        qcResults: relatedData.qcParameters.map((param: any) => ({
          parameterId: param.id,
          value: "",
        })),
        statusQc: "",
        qcPhotos: [], // Always initialize as an array (never undefined)
        qcNotes: "",
        analysis: "",
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
  }, [state, router]);

  return (
    <form
      className="flex flex-col gap-2 w-full"
      onSubmit={handleSubmit(onSubmit)}
      ref={formRef}
      // action={formAction}
    >
      <input type="hidden" {...register("arrivalId")} />

      <h2 className="text-xl md:text-3xl font-bold">
        Input Hasil Quality Control
      </h2>
      <div className="dark:shadow-slate-700 p-8 rounded-xl shadow-lg flex flex-col gap-3">
        <div className="mb-6 flex flex-col md:flex-row gap-2 justify-between items-center">
          <div className="text-md md:text-xl font-semibold w-full flex items-center gap-2">
            <ClipboardList size={24} /> ID Kedatangan:{" "}
            <span className="text-blue-600 font-bold md:text-2xl">
              {relatedData.arrival.idKedatangan}
            </span>
          </div>
          <div className="md:text-md flex flex-col md:flex-row w-full items-center gap-4">
            <div className="flex items-center gap-2 w-full">
              <Truck size={20} /> Supplier:{" "}
              <div>{relatedData.arrival.supplier.name}</div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <Calendar size={20} /> Tanggal:{" "}
              <span>
                {moment(relatedData.arrival.date).format("DD MMMM YYYY")}
              </span>
            </div>
          </div>
        </div>

        {fields.map((field: any, materialIndex: number) => {
          const materialQc = relatedData.arrivalItems.find(
            (item: any) => item.id == field.arrivalItemId   
          );

          console.log("Material QC:", materialQc);

          return (
            <div
              key={field.id}
              className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-900"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold  mb-4 flex items-center gap-2">
                  <Package size={22} /> Bahan Baku #{materialIndex + 1}:{" "}
                  {materialQc.material.name} ({materialQc.quantity} kg)
                </h3>
                
              </div>

              <div className="mb-4">
                <div className="overflow-x-auto">
                  <label className="block text-sm font-semibold mb-2">Hasil Pengecekan</label>
                  <table className="min-w-full bg-white dark:bg-black border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                          Refaksi QC
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                          Berat (gr)
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                          Persentase
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr>
                          <td className="px-4 py-3 text-sm">Berat Uji Sampel</td>
                          <td className="px-4 py-3 text-sm">
                            {materialQc.qcSample || 0}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            -
                          </td>
                        </tr>
                        {relatedData.qcParameters.map((param: any, paramIndex: number) => (
                          <tr key={param.id} className="border-t border-gray-200">
                            <td className="px-4 py-3 text-sm">{param.name}</td>
                            <td className="px-4 py-3 text-sm">
                              {materialQc.QcResults[paramIndex]?.value || 0}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {materialQc.qcSample?((materialQc.QcResults[paramIndex]?.value || 0)/(materialQc.qcSample) * 100):0} %
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-gray-200">
                          <td className="px-4 py-3 text-sm">Total Berat</td>
                          <td className="px-4 py-3 text-sm">
                            {materialQc.totalBerat || 0}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            -
                          </td>
                        </tr>
                        <tr className="border-t border-gray-200">
                          <td className="px-4 py-3 text-sm">Air & kotoran</td>
                          <td className="px-4 py-3 text-sm">
                            {materialQc.qcKotoran || 0} 
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {materialQc.qcSample?((materialQc.qcKotoran || 0)/(materialQc.qcSample) * 100):0} %
                          </td>
                        </tr>
                      </tbody>
                  </table>
                </div>
                
               
              </div>

              <div className="mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Status QC :  {relatedData.qcStatuses.find((status: any) => status.id ==  materialQc.qcStatusId)?.name || "Belum Di QC"}
                  </label>
                  
                
                </div>
              </div>

              <div className="flex flex-row justify-center mt-2 gap-2">
                          {materialQc.QcPhotos.map((photo: any, index: number) => (
                            <div key={index} >
                              <ImageThumbnail
                                fileId={photo.photo}
                                alt={`Foto qc untuk ${photo.id}`}
                                className="w-32 h-32" // Anda bisa mengatur ukuran thumbnail di sini
                              />
                            </div>
                          ))}
                        </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-semibold mb-2"
                >
                  Catatan QC 
                </label>
                <p>{materialQc.qcNote}</p>
              </div>
            </div>
          );
        })}

        {state.message && !state.success && !state.error && (
          <span className="text-red-500 text-sm">{state.message}</span>
        )}
         {relatedData.role=="manager" && (
        <div className="flex gap-4">
          <Button className="bg-blue-400 text-white p-2 rounded-md">
            Approve
          </Button>
        </div>
        )}
      </div>
    </form>
  );
}

export default QcReview;

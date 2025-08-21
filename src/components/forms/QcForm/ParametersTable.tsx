import { Input } from "@/registry/new-york-v4/ui/input";
import { Button } from "@/registry/new-york-v4/ui/button";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { Edit } from "lucide-react";

type QcResultError = {
  value?: { message?: string };
};

type ParametersTableProps = {
  materialIndex: number;
  arrivalItems?: any[];
  register: any;
  errors?: any;
  isError?: any;
  parameters: any[];
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setIsError?: React.Dispatch<React.SetStateAction<any>>;
  control?: any;
};

export default function ParametersTable({
  materialIndex,
  register,
  errors,
  isError,
  parameters,
  onChange,
  setIsError
}: ParametersTableProps) {
  const [editValue, seteditValue] = React.useState(false);
  useEffect(() => {
    if (errors) {
      if(errors.qcSample) toast.error(errors.qcSample.message);
      if(errors.qcKotoran) toast.error(errors.qcKotoran.message);
      if(errors.statusQc) toast.error(errors.statusQc.message);
    }
  }, [errors]);
  return (
    <div className="overflow-x-auto mb-4">
      <div className="flex flex-row w-full mb-4 justify-between items-center">
        <label className="block text-sm font-semibold mb-2">Hasil Pengecekan</label>
        <Button type="button" className="bg-amber-500 hover:bg-amber-600 transition-all duration-200 cursor-pointer" onClick={() => seteditValue(!editValue)}>
          <Edit /> Edit data
        </Button>
      </div>
      <table className="min-w-full bg-white dark:bg-black border border-gray-200 rounded-lg">
        <thead className="bg-gray-100 dark:bg-gray-900">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase">Refaksi QC</th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase">Berat (gr)</th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase">Persentase</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-3 text-sm">Berat Uji Sampel</td>
            <td className="px-4 py-3 text-sm">
              <Input
                type="number"
                {...register(`materials.${materialIndex}.qcSample`)}
                step={0.01}
                onBlur={onChange}
                disabled={!editValue}
                className={`w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 ${isError?.qcSample ? "border-red-500" : ""}`}
              />
            </td>
            <td className="px-4 py-3 text-sm">-</td>
          </tr>
          <tr className="border-t border-gray-200">
            <td colSpan={3} className="text-center">
              {" "}
              Hasil Pengujian
            </td>
          </tr>
          {parameters.map((param, paramIndex) => (
            <tr key={param.id} className="border-t border-gray-200">
              <td className="px-4 py-3 text-sm">{param.name}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-center items-center w-full">
                  <Input
                    type="number"
                    name="main_value"
                    step={0.01}
                    disabled={!editValue}
                    {...register(`materials.${materialIndex}.qcResults.${paramIndex}.value`)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    onBlur={onChange}
                  />
                  {errors?.materials?.[materialIndex]?.qcResults?.[paramIndex]?.value && <p className="text-red-500 text-xs mt-1">{errors.materials[materialIndex].qcResults[paramIndex].value.message}</p>}
                  {param.settings.length > 0 && (
                    <div className="w-full">
                      {param.settings.map((setting: any, settingIndex: number) => (
                        <div key={setting.id} className="flex items-center gap-2">
                          <input type="hidden" {...register(`materials.${materialIndex}.qcResults.${paramIndex}.additional.${settingIndex}.key`)} value={setting.key} />
                          <Input
                            type="text"
                            disabled={!editValue}
                            placeholder={setting.value}
                            {...register(`materials.${materialIndex}.qcResults.${paramIndex}.additional.${settingIndex}.value`)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 mt-1"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                <Input
                  type="number"
                  step={0.01}
                  disabled={!editValue}
                  {...register(`materials.${materialIndex}.qcResults.${paramIndex}.persentase`)}
                  readOnly
                  className={`w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 ${isError?.qcSample ? "border-red-500" : ""}`}
                />
              </td>
            </tr>
          ))}
          <tr>
            <td className="px-4 py-3 text-sm">Total Berat Bahan</td>
            <td className="px-4 py-3">
              <Input
                type="text"
                {...register(`materials.${materialIndex}.totalBerat`)}
                disabled
                onChange={() => {
                  if (setIsError) {
                    setIsError((prev: any) => ({
                      ...prev,
                      totalBerat: false,
                    }));
                  }
                }}
                className={`w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 ${isError?.totalBerat ? "border-red-500" : ""}`}
              />
            </td>
            <td className="px-4 py-3 text-sm">-</td>
          </tr>
          <tr className="border-t border-gray-200">
            <td className="px-4 py-3 text-sm">Air & kotoran</td>
            <td className="px-4 py-3">
              <Input
                type="number"
                step={0.01}
                {...register(`materials.${materialIndex}.qcKotoran`)}
                disabled
                className={`w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 ${isError?.qcKotoran ? "border-red-500" : ""}`}
                onChange={() => {
                  if (setIsError) {
                    setIsError((prev: any) => ({
                      ...prev,
                      qcKotoran: false,
                    }));
                  }
                }}
              />
            </td>
            <td className="px-4 py-3 text-sm text-gray-500">
              <Input type="number" step={0.01} {...register(`materials.${materialIndex}.persentaseKotoran`)} readOnly className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" />
            </td>
          </tr>

          <tr>
            <td className="px-4 py-3 text-sm">Lama Pengeringan</td>
            <td className="px-4 py-3">
              <Input type="number" disabled={!editValue} {...register(`materials.${materialIndex}.pengeringan`)} className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" />
              {errors?.materials?.[materialIndex]?.pengeringan && <p className="text-red-500 text-xs mt-1">{errors.materials[materialIndex].pengeringan.message}</p>}
            </td>
            <td className="px-4 py-3 text-sm">menit</td>
          </tr>
        </tbody>
      </table>
    </div>
  );}

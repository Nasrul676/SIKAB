"use client";
import { Upload, XCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { useFieldArray } from "react-hook-form";
import { useDropzone } from "react-dropzone";
``
const MAX_FILE_SIZE_MB = 5;

const FileUpload = ({ control, materialIndex }: { control: any, materialIndex: number}) => {
    const { fields, append, remove } = useFieldArray({ control, name: `materials.${materialIndex}.qcPhotos` });
    const onDrop = useCallback((acceptedFiles: File[]) => {
        acceptedFiles.forEach(file => {
            // Cek duplikat berdasarkan properti file di dalam objek
            if (!fields.some((f: any) => f.file.name === file.name && f.file.size === file.size)) {
                append({ file: file }); // [FIX] Bungkus file dalam objek
            }
        });
    }, [append, fields]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [], 'video/mp4': [], 'video/webm': [] } });

    return (
      <div>
        <label className="block text-sm font-semibold mb-2">Bukti Foto/Video</label>
        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
            <Upload size={32} />
            <p>{isDragActive ? "Lepaskan file di sini..." : "Tarik & lepas file di sini, atau klik untuk memilih file"}</p>
            <p className="text-xs">Maks {MAX_FILE_SIZE_MB}MB per file</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {fields.map((field: any, index) => {
            // [FIX] Akses file melalui field.file
            if (!(field.file instanceof File)) {
              console.error("Item di 'field.file' bukan File:", field.file);
              return null;
            }
            return (
              <div key={field.id} className="relative w-28 h-28">
                <img src={URL.createObjectURL(field.file)} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-lg shadow-sm" />
                <button type="button" onClick={() => remove(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-transform hover:scale-110">
                  <XCircle size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
};

export default FileUpload;
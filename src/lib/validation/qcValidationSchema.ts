
import { z } from "zod";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "video/mp4", "video/webm"];

const QcAdditionalInfoSchema = z.object({
  key: z.string().optional(),
  value: z.string().optional(),
});

const QcResultItemSchema = z.object({
  value: z.coerce.number(),
  persentase: z.coerce.number().optional(),
  parameterId: z.coerce.number(),
  key: z.string().optional(),
  additional: z.any()
});

// [FIX] Skema untuk qcPhotos sekarang mengharapkan array dari objek yang berisi File
export const materialQcSchema = z.object({
  arrivalItemId: z.string(),
  qcResults: z.array(QcResultItemSchema).min(1),
  statusQc: z.string().min(1, { message: "Status QC wajib dipilih." }),
  qcPhotos: z.array(z.object({
      file: z.instanceof(File)
      .refine((file) => file.size <= MAX_FILE_SIZE_BYTES, `Ukuran maksimal per file adalah ${MAX_FILE_SIZE_MB}MB.`)
      .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), "Format file tidak didukung (.jpg, .png, .mp4, .webm).")
    }))
    .optional(),
  qcSample:z.coerce.number().min(1, { message: "Berat uji sampel tidak boleh kosong." }),
  qcNotes: z.string().optional(),
  qcKotoran: z.coerce.number().min(1,{ message: "Air dan kotoran tidak boleh kosong." }),
  persentaseKotoran: z.coerce.number().optional(),
  totalBerat: z.coerce.number(),
  pengeringan: z.coerce.number().optional(),
  analysis: z.string().optional(),
  city: z.string().optional()
});

export type MaterialQcSchema = z.infer<typeof materialQcSchema>;

export const qcSubmissionSchema = z.object({
  arrivalId: z.string().min(1),
  materials: z.array(materialQcSchema).min(1, "Harus ada setidaknya satu bahan baku untuk di-QC."),
});

export type QcSubmissionData = z.infer<typeof qcSubmissionSchema>;
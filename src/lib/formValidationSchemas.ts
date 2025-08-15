import { z } from "zod";
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "video/mp4", "video/webm"];

export const userSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username harus terdiri dari minimal 3 karakter!" })
    .max(20, { message: "Username harus terdiri dari maksimal 20 karakter!" }),
  password: z
    .string()
    .min(6, { message: "Password harus terdiri dari minimal 6 karakter!" }),
  email: z
    .string()
    .email({ message: "Email tidak valid!" })
    .or(z.literal("")),
  role: z.string(),
});

export type UserSchema = z.infer<typeof userSchema>;

export const supplierSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(3, { message: "Nama supplier harus terdiri dari minimal 3 karakter" }),
  address: z
    .string()
    .optional(),
  phone: z
    .string()
    .min(10, { message: "Nomor telepon harus terdiri dari minimal 10 karakter" })
    .optional(),
  email: z
    .string()
    .optional(),
});

export type SupplierSchema = z.infer<typeof supplierSchema>;

export const materialSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(3, {message: "Nama material harus terdiri dari minimal 3 karakter"}),
  description: z
    .string()
    .optional(),
});

export type MaterialSchema = z.infer<typeof materialSchema>;

export const conditionSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(3, { message: "Nama kondisi harus terdiri dari minimal 3 karakter" }),
  description: z
    .string()
    .optional(),
});

export type ConditionSchema = z.infer<typeof conditionSchema>;

export const ParameterSettingsSchema = z.object({
  key: z.string().min(3, { message: "Key harus terdiri dari minimal 3 karakter" }),
  value: z.string().min(1, { message: "Value harus diisi" }),
});

export const parameterSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(3, { message: "Nama parameter harus terdiri dari minimal 3 karakter" }),
  unit: z
    .string()
    .min(1, { message: "Unit harus diisi" }),
  type: z
    .string()
    .min(1, { message: "Tipe harus diisi" }),
  settings: z.array(ParameterSettingsSchema).optional()
});

export type ParameterSchema = z.infer<typeof parameterSchema>;

export const arivalSchema = z.object({
  id: z.string().optional(),
  arrivalId: z.string().optional(),
  supplierId: z.coerce.number().min(1, { message: "Supplier tidak boleh kosong" }),
  arrivalTime: z.string().min(1, { message: "Waktu kedatangan tidak boleh kosong" }),
  nopol: z.string().min(1, { message: "Nomor polisi tidak boleh kosong" }),
  suratJalan: z.string().optional(),
  securityProof: z.array(
      z.object({
      file: z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, `Ukuran maksimal per file adalah 5MB.`)
        .refine((file) => ["image/jpeg", "image/jpg", "image/png", "image/webp", "video/mp4", "video/webm"].includes(file.type), "Format file tidak didukung (.jpg, .png, .mp4, .webm)."),
    }).required()
  ),
  materials: z.array(
    z.object({
      materialId: z.string().min(1, { message: "Jenis bahan tidak boleh kosong" }),
      quantity: z.string().min(1, { message: "Jumlah Qty tidak boleh kosong" }),
      conditionCategory: z.enum(['Basah', 'Kering'], {
        message: "Kondisi bahan harus terdiri dari 'Basah' atau 'Kering'."
      }),
      conditionId: z.string().min(1, { message: "Tingkat kebersihan bahan tidak boleh kosong" }),
      itemName: z.string().optional(),
      description: z.string().optional(),
    })
  ),
});

export type ArivalSchema = z.infer<typeof arivalSchema>;

export const arrivalItemSchema = z.object({
  materialId: z.coerce
    .number()
    .min(1, { message: "Jenis bahan tidak boleh kosong" }),
  conditionId: z.coerce
    .number()
    .min(1, { message: "Tingkat kebersihan bahan tidak boleh kosong" }),
  conditionCategory: z
    .enum(['Basah', 'Kering'], {
      message: "Kondisi bahan harus terdiri dari 'Basah' atau 'Kering'."
    }),
  quantity: z.coerce
    .number()
    .min(1, { message: "Jumlah Qty tidak boleh kosong" }),
  itemName: z.string().optional(),
  description: z.string().optional(),
  arrivalId: z.string().optional(),
});

export type ArrivalItemSchema = z.infer<typeof arrivalItemSchema>;

export const weighingSchema = z.object({
  arrivalId: z.any(),
  arrivalItemId:z.any(),
  weight:z.coerce.number(),
  weighingProof: z.array(z.object({
        file: z.instanceof(File)
          .refine((file) => file.size <= MAX_FILE_SIZE_BYTES, `Ukuran maksimal per file adalah ${MAX_FILE_SIZE_MB}MB.`)
          .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), "Format file tidak didukung (.jpg, .png, .mp4, .webm).")
      }))
      .optional(),
  note: z.string().optional(),
});

export type WeighingSchema = z.infer<typeof weighingSchema>;

export const qcSchema = z.object({
  arrivalId:z.coerce.number(),
  idKedatangan:z.string(),
  qcResults: z.array(
    z.object({
      params:z.array(
        z.object({
      value: z.string().min(1, { message: 'Nilai parameter tidak boleh kosong' }), 
        })
      ),     
    })
  ),
})

export type QcSchema = z.infer<typeof qcSchema>;
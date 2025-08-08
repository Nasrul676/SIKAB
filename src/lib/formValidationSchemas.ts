import { z } from "zod";
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "video/mp4", "video/webm"];

export const userSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .or(z.literal("")),
  role: z.string(),
});

export type UserSchema = z.infer<typeof userSchema>;

export const supplierSchema = z.object({
  id: z.string().optional(),
  name: z
    .string(),
  address: z
    .string()
    .optional(),
  phone: z
    .string()
    .optional(),
  email: z
    .string()
    .optional(),
});

export type SupplierSchema = z.infer<typeof supplierSchema>;

export const materialSchema = z.object({
  id: z.string().optional(),
  name: z
    .string(),
  description: z
    .string()
    .optional(),
 
});

export type MaterialSchema = z.infer<typeof materialSchema>;

export const conditionSchema = z.object({
  id: z.string().optional(),
  category: z.string().refine(
    (value) => ["Basah", "Kering"].includes(value)
    , {
      message: "Invalid category. Must be either 'Basah' or 'Kering'."
    }),
  name: z
    .string(),
  description: z
    .string()
    .optional(),
 
});

export type ConditionSchema = z.infer<typeof conditionSchema>;

export const parameterSchema = z.object({
  id: z.string().optional(),
  name: z
    .string(),
  category: z
    .enum(['Basah', 'Kering']),
  unit: z
    .string(),
  type: z
    .string(),
 
});

export type ParameterSchema = z.infer<typeof parameterSchema>;

export const arivalSchema = z.object({
  id: z.string().optional(),
  arrivalId: z.string().optional(),
  supplierId: z.coerce.number(),
  arrivalTime: z.string(),
  nopol: z.string().optional(),
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
      materialId: z.string().min(1, { message: "Material is required" }),
      quantity: z.string().min(1, { message: "Quantity is required" }),
      conditionCategory: z.enum(['Basah', 'Kering'], {
        message: "Condition Category must be either 'Basah' or 'Kering'."
      }),
      conditionId: z.string().min(1, { message: "Condition is required" }),
      itemName: z.string().optional(),
      description: z.string().optional(),
    })
  ),
});

export type ArivalSchema = z.infer<typeof arivalSchema>;

export const arrivalItemSchema = z.object({
  materialId: z.coerce
    .number()
    .min(1, { message: "Material is required" }),
  conditionId: z.coerce
    .number()
    .min(1, { message: "Condition is required" }),
  conditionCategory: z
    .enum(['Basah', 'Kering'], {
      message: "Condition Category must be either 'Basah' or 'Kering'."}),
  quantity: z.coerce
    .number()
    .min(1, { message: "Quantity is required" }),
  itemName: z.string().optional(),
  description: z.string().optional(),
  arrivalId: z.string().optional(),
});

export type ArrivalItemSchema = z.infer<typeof arrivalItemSchema>;

export const weighingSchema = z.object({
  arrivalId: z.string(),
  arrivalItemId:z.string(),
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
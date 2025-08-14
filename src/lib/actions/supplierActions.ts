"use server";

import { parse } from "path";
import { supplierSchema } from "../formValidationSchemas";
import prisma from "../prisma";
import { getAuthenticatedUserInfo } from "./authActions";


type CurrentState = { success: boolean; error: boolean };
type FormState = {
  success: boolean;
  message: string | null;
  errors?: any;
};


export const createSupplier = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  try {
    const validatedFields = supplierSchema.safeParse({
      name: formData.get("name"),
      address: formData.get("address"),
      phone: formData.get("phone"),  
      email: formData.get("email"),
      
    });

    if (!validatedFields.success) {
      console.log(validatedFields.error);
      return {
        success: false,
        message: "Validasi gagal!.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }
    const { userId } = await getAuthenticatedUserInfo();

    await prisma.$transaction(async (tx) => {
      await tx.suppliers.create({
        data: {
            name: validatedFields.data.name,
            address: validatedFields.data.address,
            phone: validatedFields.data.phone,
          email: validatedFields.data.email,
            createdBy: userId,
            updatedBy: userId,
        },
      });

      
    });

    return {
      success: true,
      message: `Pemasok berhasil disimpan!`,
    };
  } catch (error: any) {
    console.error("Error processing Supplier:", error);
    return {
      success: false,
      message: "Gagal memproses Pemasok karena kesalahan server.",
    };
  }
};

export const updateSupplier = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  if (!formData.get("id")) {
    return { success: false, message: "Updated failed" };
  }
  try {
    const validatedFields = supplierSchema.safeParse({
      id: formData.get("id"),
       name: formData.get("name"),
      address: formData.get("address"),
      phone: formData.get("phone"),  
      email: formData.get("email"),
      
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { userId } = await getAuthenticatedUserInfo();

    await prisma.suppliers.update({
      where: {
        id:parseInt(validatedFields.data.id||""), // Use parsed ID validatedFields.data.id, // Use parsed ID
      },
      data: {
         name: validatedFields.data.name,
            address: validatedFields.data.address,
            phone: validatedFields.data.phone,
          email: validatedFields.data.email,            
        updatedBy: userId, // Use authenticated user's pin
      },
    });
    
    return {
      success: true,
      message: `Pemasok berhasil diperbarui!`,
    };
  } catch (error: any) {
    console.error("Error processing users:", error);
    return {
      success: false,
      message: "Gagal memproses Pemasok karena kesalahan server.",
    };
  }
};

export const deleteSupplier = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.suppliers.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

"use server";

import { parse } from "path";
import { materialSchema } from "../formValidationSchemas";
import prisma from "../prisma";
import { getAuthenticatedUserInfo } from "./authActions";


type CurrentState = { success: boolean; error: boolean };
type FormState = {
  success: boolean;
  message: string | null;
  errors?: any;
};


export const createMaterial = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  try {
    const validatedFields = materialSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      
    });

    if (!validatedFields.success) {
      console.log(validatedFields.error);
      return {
        success: false,
        message: "Validation failed.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }
    const { userId } = await getAuthenticatedUserInfo();

    await prisma.$transaction(async (tx) => {
      await tx.materials.create({
        data: {
            name: validatedFields.data.name,
            description: validatedFields.data.description,            
            createdBy: userId,
            updatedBy: userId,
        },
      });

      
    });

    return {
      success: true,
      message: `Material submitted successfully!`,
    };
  } catch (error: any) {
    console.error("Error processing Material:", error);
    return {
      success: false,
      message: "Failed to process Material due to a server error.",
    };
  }
};

export const updateMaterial = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  if (!formData.get("id")) {
    return { success: false, message: "Updated failed" };
  }
  try {
    const validatedFields = materialSchema.safeParse({
      id: formData.get("id"),
       name: formData.get("name"),
      description: formData.get("description"),
    
      
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { userId } = await getAuthenticatedUserInfo();

    await prisma.materials.update({
      where: {
        id:parseInt(validatedFields.data.id||""), // Use parsed ID validatedFields.data.id, // Use parsed ID
      },
      data: {
         name: validatedFields.data.name,
            description: validatedFields.data.description,                    
        updatedBy: userId, // Use authenticated user's pin
      },
    });
    
    return {
      success: true,
      message: `Material updated successfully!`,
    };
  } catch (error: any) {
    console.error("Error processing users:", error);
    return {
      success: false,
      message: "Failed to process employees due to a server error.",
    };
  }
};

export const deleteMaterial = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.materials.delete({
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

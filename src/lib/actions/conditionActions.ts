"use server";

import { parse } from "path";
import { conditionSchema } from "../formValidationSchemas";
import prisma from "../prisma";
import { getAuthenticatedUserInfo } from "./authActions";


type CurrentState = { success: boolean; error: boolean };
type FormState = {
  success: boolean;
  message: string | null;
  errors?: any;
};


export const createCondition = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  try {
    const validatedFields = conditionSchema.safeParse({
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
      await tx.conditions.create({
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
      message: `Condition submitted successfully!`,
    };
  } catch (error: any) {
    console.error("Error processing Condition:", error);
    return {
      success: false,
      message: "Failed to process Condition due to a server error.",
    };
  }
};

export const updateCondition = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  if (!formData.get("id")) {
    return { success: false, message: "Updated failed" };
  }
  try {
    const validatedFields = conditionSchema.safeParse({
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

    await prisma.conditions.update({
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
      message: `Condition updated successfully!`,
    };
  } catch (error: any) {
    console.error("Error processing users:", error);
    return {
      success: false,
      message: "Failed to process employees due to a server error.",
    };
  }
};

export const deleteCondition = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.conditions.delete({
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

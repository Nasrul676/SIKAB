"use server";

import { parse } from "path";
import { parameterSchema } from "../formValidationSchemas";
import prisma from "../prisma";
import { getAuthenticatedUserInfo } from "./authActions";

type CurrentState = { success: boolean; error: boolean };
type FormState = {
  success: boolean;
  message: string | null;
  errors?: any;
};

export const createParameter = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  try {
    const validatedFields = parameterSchema.safeParse({
      name: formData.get("name"),
      unit: formData.get("unit"),
      type: formData.get("type"),
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
      await tx.parameters.create({
        data: {
          name: validatedFields.data.name,
          unit: validatedFields.data.unit,
          type: validatedFields.data.type,
          createdBy: userId,
          updatedBy: userId,
        },
      });
    });

    return {
      success: true,
      message: `Parameter submitted successfully!`,
    };
  } catch (error: any) {
    console.error("Error processing Parameter:", error);
    return {
      success: false,
      message: "Failed to process Parameter due to a server error.",
    };
  }
};

export const updateParameter = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  if (!formData.get("id")) {
    return { success: false, message: "Updated failed" };
  }

  try {
    const validatedFields = parameterSchema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      unit: formData.get("unit"),
      type: formData.get("type"),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { userId } = await getAuthenticatedUserInfo();

    await prisma.parameters.update({
      where: {
        id: parseInt(validatedFields.data.id || ""), // Use parsed ID validatedFields.data.id, // Use parsed ID
      },
      data: {
        name: validatedFields.data.name,
        unit: validatedFields.data.unit,
        updatedBy: userId, // Use authenticated user's pin
      },
    });

    return {
      success: true,
      message: `Parameter updated successfully!`,
    };
  } catch (error: any) {
    console.error("Error processing users:", error);
    return {
      success: false,
      message: "Failed to process employees due to a server error.",
    };
  }
};

export const deleteParameter = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.parameters.delete({
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

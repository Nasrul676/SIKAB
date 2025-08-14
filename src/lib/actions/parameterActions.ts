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

export const createParameter = async (prevState: FormState, formData: FormData): Promise<FormState> => {
  console.log("Creating parameter with data:", formData);
  try {
    const validatedFields = parameterSchema.safeParse({
      name: formData.get("name"),
      unit: formData.get("unit"),
      type: formData.get("type"),
      settings: formData.get("settings") ? JSON.parse(formData.get("settings") as string) : [],
    });

    if (!validatedFields.success) {
      console.log(validatedFields.error);
      return {
        success: false,
        message: "Validasi gagal.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }
    const { userId } = await getAuthenticatedUserInfo();
    console.log("validasi berhasil ", validatedFields.data);
    await prisma.$transaction(async (tx) => {
      const parameter = await tx.parameters.create({
        data: {
          name: validatedFields.data.name,
          unit: validatedFields.data.unit,
          type: validatedFields.data.type,
          createdBy: userId,
        },
      });

      if (validatedFields.data.settings) {
        const settings = validatedFields.data.settings.map((setting) => ({
          parameterId: parameter.id,
          key: setting.key,
          value: setting.value,
          createdBy: userId,
        }));
        await tx.parameterSettings.createMany({
          data: settings,
        });
      }
    });

    return {
      success: true,
      message: `Parameter berhasil disimpan!`,
    };
  } catch (error: any) {
    console.error("Error processing Parameter:", error);
    return {
      success: false,
      message: "Gagal memproses Parameter karena kesalahan server.",
    };
  }
};

export const updateParameter = async (prevState: FormState, formData: FormData): Promise<FormState> => {
  if (!formData.get("id")) {
    return { success: false, message: "Update gagal" };
  }
  console.log("Updating parameter with data:", formData);
  try {
    const validatedFields = parameterSchema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      unit: formData.get("unit"),
      type: formData.get("type"),
      settings: formData.get("settings") ? JSON.parse(formData.get("settings") as string) : [],
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validasi gagal.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { userId } = await getAuthenticatedUserInfo();

    await prisma.$transaction(async (tx) => {
      const updatedParameter = await tx.parameters.update({
        where: {
          id: parseInt(validatedFields.data.id || ""), // Use parsed ID validatedFields.data.id, // Use parsed ID
        },
        data: {
          name: validatedFields.data.name,
          unit: validatedFields.data.unit,
          updatedBy: userId, // Use authenticated user's pin
        },
      });
      await tx.parameterSettings.deleteMany({
        where: {
          parameterId: updatedParameter.id,
        },
      });
      if (validatedFields.data.settings && validatedFields.data.settings.length > 0) {
        const settings = validatedFields.data.settings.map((setting) => ({
          parameterId: updatedParameter.id,
          key: setting.key,
          value: setting.value,
          createdBy: userId,
        }));
        await tx.parameterSettings.createMany({
          data: settings,
        });
      }
    });

    return {
      success: true,
      message: `Parameter berhasil diperbarui!`,
    };
  } catch (error: any) {
    console.error("Error processing users:", error);
    return {
      success: false,
      message: "Gagal memproses Parameter karena kesalahan server.",
    };
  }
};

export const deleteParameter = async (currentState: CurrentState, data: FormData) => {
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

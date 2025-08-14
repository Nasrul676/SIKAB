"use server";

import { role } from "./data";
import {
  userSchema,
} from "./formValidationSchemas";
import { hashPassword } from "./password";
import prisma from "./prisma";
import { getSession } from "./session";

type CurrentState = { success: boolean; error: boolean };
type FormState = {
  success: boolean;
  message: string | null;
  errors?: any;
};

// Helper to get authenticated user PIN (or ID)
export async function getAuthenticatedUserInfo() {
  const session = await getSession();
  const userId = session.user?.id.toString();
  if (!userId) throw new Error("Unauthorized: Please sign in.");
  // Assuming pin is needed, adjust if only userId is sufficient
  // const userId = sessionData.sub;
  return { userId };
}

export const createUser = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  try {
    const validatedFields = userSchema.safeParse({
      username: formData.get("username"),
      password: formData.get("password"),
      role: "User",     
      email: formData.get("email"),
      
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

    const existingUser = await prisma.users.findUnique({
      where: { email: validatedFields.data.email },
    });

    if (existingUser) {
      console.log(
        `Registrasi: Email ${validatedFields.data.email} sudah terdaftar.`
      );
      return {
        success: false,
        message: "Email sudah terdaftar.",
      };
    }

    // 3. Hash the password
    const hashedPassword = await hashPassword(validatedFields.data.password);
    await prisma.$transaction(async (tx) => {
      await tx.users.create({
        data: {
          email: validatedFields.data.email,
          password: hashedPassword,
          username: validatedFields.data.username,
          role: role,
        },
      });

      
    });

    return {
      success: true,
      message: `Karyawan berhasil disimpan!`,
    };
  } catch (error: any) {
    console.error("Error processing schedules:", error);
    return {
      success: false,
      message: "Gagal memproses jadwal karena kesalahan server.",
    };
  }
};

export const updateUser = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  if (!formData.get("id")) {
    return { success: false, message: "Updated failed" };
  }
  try {
    const validatedFields = userSchema.safeParse({
      id: formData.get("id"),
      username: formData.get("username"),
      password: formData.get("password"),
      role: formData.get("role"),      
      email: formData.get("email"),
      
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validasi gagal.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { userId } = await getAuthenticatedUserInfo();

    
    return {
      success: true,
      message: `User berhasil diperbarui!`,
    };
  } catch (error: any) {
    console.error("Error processing users:", error);
    return {
      success: false,
      message: "Gagal memproses pengguna karena kesalahan server.",
    };
  }
};

export const deleteUser = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.users.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

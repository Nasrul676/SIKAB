// lib/actions/authActions.ts
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma"; // Adjust path if needed
import { getSession, SessionUser } from "@/lib/session";
import { verifyPassword, hashPassword } from "@/lib/password"; // Import hashPassword
import { role } from "../data";

// --- Login Schema and State (Keep existing) ---
const loginSchema = z.object({
  email: z.string().email("Email tidak valid."),
  password: z.string().min(1, "Password tidak boleh kosong."),
});
export type LoginFormState = {
  message: string | null;
  success: boolean;
  errors?: {
    email?: string[];
    password?: string[];
    general?: string;
  };
};
const initialLoginState: LoginFormState = { success: false, message: null };

// --- Registration Schema and State ---
const registerSchema = z.object({
    username: z.string().min(1, "Username tidak boleh kosong."), // Optional name field
    email: z.string().email("Email tidak valid."),
    // Add password complexity rules if desired
    password: z.string().min(8, "Password harus memiliki setidaknya 8 karakter."),
    role: z.string().min(1, "Role tidak boleh kosong."),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Password tidak cocok.",
    path: ["confirmPassword"], // Assign error to confirmPassword field
});

export type RegisterFormState = {
  message: string | null;
  success: boolean;
  errors?: {
    username?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
    confirmPassword?: string[];
    general?: string; // For errors like user already exists
  };
};
const initialRegisterState: RegisterFormState = { success: false, message: null };


// --- Login Action (Keep existing) ---
export async function loginAction(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  console.log("Login action triggered...");

  // 1. Validate form data
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    console.log("Login validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Detail login tidak valid.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    // 2. Find user in the database
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`Login attempt failed: User not found for email ${email}`);
      return { success: false, message: "Email atau password tidak valid.", errors: { general: "Email atau password tidak valid."} };
    }

    // 3. Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      console.log(`Login attempt failed: Invalid password for email ${email}`);
      return { success: false, message: "Email atau password tidak valid.", errors: { general: "Email atau password tidak valid."} };
    }

    // 4. Password is valid - Create session
    console.log(`Login successful for user: ${user.id}`);
    const session = await getSession();

    // Store relevant, non-sensitive user data in the session
    session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
      // Add other fields like role if needed
    };

    await session.save(); // Save the session data to the cookie

    // 5. Redirect handled by component based on success state
    return { success: true, message: user.role };

  } catch (error) {
    console.error("Login action error:", error);
    return { success: false, message: "An unexpected error occurred during login.", errors: { general: "Server error."} };
  }
}

// --- Logout Action (Keep existing) ---
export async function logoutAction() {
    "use server";

    try {
        const session = await getSession();
        await session.destroy();
        console.log("Keluar berhasil.");
        return { success: true, message: "Logout berhasil." };
    } catch (error) {
        console.error("Gagal keluar:", error);
        return { success: false, message: "Gagal keluar.", errors: { general: "Server error."} };
    }
}


// --- NEW: Registration Action ---
export async function registerAction(
    prevState: RegisterFormState,
    formData: FormData
): Promise<RegisterFormState> {
    console.log("Register action triggered...");

    // 1. Validate form data
    const validatedFields = registerSchema.safeParse({
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
        confirmPassword: formData.get("confirmPassword"),
    });

    if (!validatedFields.success) {
        console.log("Registration validation failed:", validatedFields.error.flatten().fieldErrors);
        return {
            success: false,
            message: "Mohon lengkapi data berikut!.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { email, password, username } = validatedFields.data;

    try {
        // 2. Check if user already exists
        const existingUser = await prisma.users.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log(`Registrasi gagal: Email ${email} sudah terdaftar.`);
            return {
                success: false,
                message: "Registrasi gagal.",
                errors: { email: ["Email sudah terdaftar."] }
            };
        }

        // 3. Hash the password
        const hashedPassword = await hashPassword(password);

        // 4. Create the new user in the database
        const newUser = await prisma.users.create({
            data: {
                email: email,
                password: hashedPassword,
                username: username, 
                role: role
            },
        });

        console.log(`User created successfully: ${newUser.id}`);

        // 5. Optionally: Log the user in immediately after registration
        // const session = await getSession();
        // session.user = { id: newUser.id, email: newUser.email, name: newUser.name };
        // await session.save();
        // console.log(`User ${newUser.id} automatically logged in after registration.`);

        // 6. Return success state (redirect will be handled by the component)
        return { success: true, message: "Registrasi berhasil! Anda sekarang dapat masuk." };

    } catch (error) {
        console.error("Registration action error:", error);
        return { success: false, message: "Terjadi kesalahan yang tidak terduga selama registrasi.", errors: { general: "Server error."} };
    }
}

export async function getAuthenticatedUserInfo() {
  const session = await getSession();
  const userId = session.user?.id.toString();
  const role = session.user?.role; 
  if (!userId) throw new Error("Unauthorized: Please sign in.");
  // Assuming pin is needed, adjust if only userId is sufficient
  // const userId = sessionData.sub;
  return { userId,role };
}


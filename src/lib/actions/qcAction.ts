// src/lib/actions.ts
"use server";

import { getAuthenticatedUserInfo } from "../actions";
import {
  MaterialQcSchema,
  qcSubmissionSchema,
} from "../validation/qcValidationSchema";
import flatToObject from "../flatToObjext";
import { google } from "googleapis";
import { Readable } from "stream";
import prisma from "../prisma";
// Define the state returned by the action
export type UploadFormState = {
  message: string | null;
  success: boolean;
  isSuccess?: boolean; // Optional, can be used to indicate success state
  fileId?: string | null;
  fileName?: string | null;
  error?: string | null; // Specific error details
};

const initialState: UploadFormState = { success: false, message: null };

export async function createQc(
  prevState: UploadFormState,
  formData: FormData
): Promise<UploadFormState> {
  const result: any = flatToObject(formData);
  console.log("Received form data:", result);
  const newData = {
    ...result, // Salin semua properti level atas (seperti arrivalId)
    materials: result.materials.map((material: any) => {
      // Untuk setiap material, ambil `qcPhotos`, dan simpan sisa propertinya di `rest`
      const { qcPhotos, ...rest } = material;
      // Kembalikan objek `rest` yang tidak lagi memiliki `qcPhotos`
      return rest;
    }),
  };
  const validationResult = qcSubmissionSchema.safeParse({
    arrivalId: formData.get("arrivalId"),
    materials: newData.materials,
  });
  if (!validationResult.success) {
    console.log(
      "Server-side validation failed:",
      validationResult.error.flatten().fieldErrors
    );
    return {
      success: false,
      message: `Validation error: ${validationResult.error.errors
        .map((e) => e.message)
        .join(", ")}`,
    };
  }
  const { userId } = await getAuthenticatedUserInfo();
  const { materials, arrivalId } = validationResult.data;
  console.log("Validasi Berhasil:", materials);

  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!serviceAccountJson) {
    console.error(
      "Google Service Account JSON not found in environment variables."
    );
    return { success: false, message: "Server configuration error." };
  }
  if (!folderId) {
    console.error("Google Drive Folder ID not found in environment variables.");
    return { success: false, message: "Server configuration error (folder)." };
  }

  let credentials;
  try {
    credentials = JSON.parse(serviceAccountJson);
  } catch (error) {
    console.error("Failed to parse Google Service Account JSON:", error);
    return {
      success: false,
      message: "Server configuration error (JSON parse).",
    };
  }

  try {
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined, // keyFile path (not needed if private_key is in JSON)
      credentials.private_key,
      ["https://www.googleapis.com/auth/drive.file"] // Scope for uploading files
      // Use 'https://www.googleapis.com/auth/drive' for full access if needed
    );
    const drive = google.drive({ version: "v3", auth });

      materials.forEach(async (material: MaterialQcSchema, idx: number) => {
        // 1. Create or update Arrival with QC status
        await prisma.arrivalItems.update({
          where: {
            id: Number(material.arrivalItemId),
          },
          data: {
            qcStatusId: Number(material.statusQc),
            qcNote: material.qcNotes,
            qcSample: material.qcSample,
            qcKotoran: material.qcKotoran,
            totalBerat: material.totalBerat,
            pengeringan: material.pengeringan,
            statusQc: true,
            updatedBy: userId,
          },
        });
        const createdHistory = await prisma.qcHistories.create({
          data: {
            userId: userId,
            statusId: Number(material.statusQc),
            arrivalId: Number(arrivalId),
            arrivalItemId: Number(material.arrivalItemId),
            qcSample: material.qcSample,
            qcKotoran: material.qcKotoran,
            totalBerat: material.totalBerat,
            pengeringan: material.pengeringan,
            qcNote: material.qcNotes,
          },
        });
        await prisma.qcResults.createMany({
          data: material.qcResults.map((result: any) => ({
            arrivalItemId: Number(material.arrivalItemId),
            parameterId: Number(result.parameterId),
            historyId: Number(createdHistory.id),
            value: result.value.toString(),
            createdBy: userId,
            updatedBy: userId,
          })),
        });
        if (result.materials[idx].qcPhotos !== undefined) {
          const photos = result.materials[idx].qcPhotos.file;
          photos.forEach(async (photo: any) => {
            const fileMetadata = {
              name: photo.name, // Use original filename, // Use original filename
              parents: [folderId], // Specify the target folder
            };

            const media = {
              mimeType: photo.type,
              body: Readable.fromWeb(photo.stream() as any),
            };

            const response = await drive.files.create({
              requestBody: fileMetadata,
              media: media,
              fields: "id, name", // Fields to return in the response
            });

            if (response.data.id) {
              await drive.permissions.create({
                fileId: response.data.id as string,
                requestBody: {
                  role: "reader", // Set permission to reader
                  type: "anyone", // Allow anyone with the link to view
                },
              });

              console.log("file permission successfully updated")
            } else {
              throw new Error("File ID is missing from Google Drive upload response.");
            }
            console.log(`File uploaded successfully: ID: ${response.data.id}, Name: ${response.data.name}`);

            await prisma.qcPhotos.create({
              data: {
                arrivalItemId: Number(material.arrivalItemId),
                photo: response.data.id ?? "",
              },
            });
          });
        } else {
          console.log("No QC photos provided for this material.");
        }

      });

      await prisma.arrivals.update({
        where: { id: Number(arrivalId) },
        data: {
          city: materials[0].city, // Assuming city is the same for all materials
          statusQc: "QC Selesai", // Update status to completed
          updatedBy: userId, // Set the user who updated the arrival
        },
      });

      await prisma.notifications.create({
        data: {
          table: "arrivals",
          description:"Updated arrival status to Selesai",
        },
      });
    
    return {
      success: true,
      message: `Hasil Quality Control berhasil disimpan!`,
    };
  } catch (error: any) {
    console.error("Google Drive API Error:", error);
    return {
      success: false,
      message: `Failed to upload file: ${error.message || "Unknown error"}`,
      error: error.message, // Include error details if helpful
    };
  }
}

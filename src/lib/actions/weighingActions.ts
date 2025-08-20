// src/lib/actions.ts
"use server";

import { google } from 'googleapis';
import { Readable } from 'stream';
import { getAuthenticatedUserInfo } from '../actions';
import prisma from '../prisma';
import { weighingSchema } from '../formValidationSchemas';
import flatToObject from '../flatToObjext';
import { ArrivalStatus } from '@/app/utils/enum';

// Define the state returned by the action
export type UploadFormState = {
  message: string | null;
  success: boolean;
  fileId?: string | null;
  fileName?: string | null;
  error?: string | null; // Specific error details
};


const initialState: UploadFormState = { success: false, message: null };

export async function createWeighing(
  prevState: UploadFormState,
  formData: FormData
): Promise<UploadFormState> {
  const result: any = flatToObject(formData);

  console.log("Received form data:", result);
  const validationResult = weighingSchema.safeParse({
    arrivalId: result.arrivalId.toString(),
    arrivalItemId: result.arrivalItemId.toString(),
    weight: result.weight,
    note: result.note,
  });

  if (!validationResult.success) {
    console.error("Validasi gagal:", validationResult.error);
    return { success: false, message: `${validationResult.error.errors.map(e => e.message).join(', ')}` };
  }
  const { userId } = await getAuthenticatedUserInfo();
  const { arrivalItemId, weight, note } = validationResult.data;

  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!serviceAccountJson) {
    console.error("Google Service Account JSON not found in environment variables.");
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
    return { success: false, message: "Server configuration error (JSON parse)." };
  }


  try {
    // 3. Authenticate with Google
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined, // keyFile path (not needed if private_key is in JSON)
      credentials.private_key,
      ['https://www.googleapis.com/auth/drive.file'] // Scope for uploading files
      // Use 'https://www.googleapis.com/auth/drive' for full access if needed
    );

    // 4. Initialize Drive API Client
    const drive = google.drive({ version: 'v3', auth });

    await prisma.weighings.create({
      data: {
        arrivalItemId: Number(arrivalItemId),
        weight,
        note,
        createdBy: userId,
        updatedBy: userId,
      },
    })

    const photos = result.weighingProof;
    if (photos) {
      console.error("No photos provided for upload.");
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
        console.log(
          `File uploaded successfully: ID: ${response.data.id}, Name: ${response.data.name}`
        );
  
        await prisma.weighingsPhotos.create({
          data: {
            arrivalItemId: Number(arrivalItemId),
            photo: response.data.id ?? "",
          },
        });
      });
    }
    await prisma.notifications.create({
      data: {
        table: "arrivals",
        description: "Hasil Timbang berhasil disimpan",
      },
    });
    const arrivalStatus = await prisma.arrivalStatuses.findFirst({
      where: {
        arrivalId: Number(result.arrivalId),
      },
      select: {
        id: true,
      }
    });

    console.log("Arrival Status ID:", arrivalStatus);

    if (arrivalStatus) {
      await prisma.arrivalStatuses.update({
        where: { id: arrivalStatus.id },
        data: {
          statusWeighing: ArrivalStatus.WEIGHING_COMPLETED,
          updatedBy: userId,
        },
      });
    }

    return {
      success: true,
      message: `Hasil Timbang berhasil disimpan!`,
    };

  } catch (error: any) {
    console.error("Google Drive API Error:", error);
    return {
      success: false,
      message: `Gagal melakukan upload file karena kesalahan di server`,
      error: error.message // Include error details if helpful
    };
  }
}

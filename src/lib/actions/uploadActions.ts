// src/lib/actions.ts
"use server";

import { google } from 'googleapis';
import { Readable } from 'stream';
import { z } from 'zod';

// Define the state returned by the action
export type UploadFormState = {
  message: string | null;
  success: boolean;
  fileId?: string | null;
  fileName?: string | null;
  error?: string | null; // Specific error details
};

const fileSchema = z.instanceof(File).refine(file => file.size > 0, { message: "File cannot be empty." })
                     .refine(file => file.size < 10 * 1024 * 1024, { message: "File size limit is 10MB."}); // Example size limit

const initialState: UploadFormState = { success: false, message: null };

export async function uploadToDriveAction(
  prevState: UploadFormState,
  formData: FormData
): Promise<UploadFormState> {

  const file = formData.get('fileUpload');

  // 1. Validate File Input
  const validationResult = fileSchema.safeParse(file);
  if (!validationResult.success) {
     return { success: false, message: `Invalid file: ${validationResult.error.errors.map(e => e.message).join(', ')}`};
  }
  const validFile = validationResult.data;

  // 2. Load Credentials and Folder ID securely
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

    // 5. Prepare File Metadata and Media
    const fileMetadata = {
      name: validFile.name, // Use original filename
      parents: [folderId], // Specify the target folder
    };

    const media = {
      mimeType: validFile.type,
      // Convert Web Stream to Node Readable stream
      body: Readable.fromWeb(validFile.stream() as any),
    };

    // 6. Upload the file
    console.log(`Uploading file "${validFile.name}" to Drive folder ${folderId}...`);
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name', // Fields to return in the response
    });

    console.log(`File uploaded successfully: ID: ${response.data.id}, Name: ${response.data.name}`);

    // 7. Return Success State
    return {
        success: true,
        message: `File "${response.data.name}" uploaded successfully!`,
        fileId: response.data.id,
        fileName: response.data.name
    };

  } catch (error: any) {
    console.error("Google Drive API Error:", error);
    return {
        success: false,
        message: `Failed to upload file: ${error.message || 'Unknown error'}`,
        error: error.message // Include error details if helpful
    };
  }
}
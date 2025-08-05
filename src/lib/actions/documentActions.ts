// src/lib/actions.ts
"use server";

import { google } from 'googleapis';
import { Readable } from 'stream';
import { z } from 'zod';
import { documentSchema } from '../formValidationSchemas';
import { getAuthenticatedUserInfo } from '../actions';
import prisma from '../prisma';

// Define the state returned by the action
export type UploadFormState = {
  message: string | null;
  success: boolean;
  fileId?: string | null;
  fileName?: string | null;
  error?: string | null; // Specific error details
};


const initialState: UploadFormState = { success: false, message: null };

export async function createDocument(
  prevState: UploadFormState,
  formData: FormData
): Promise<UploadFormState> {


  // 1. Validate File Input
  const validationResult = documentSchema.safeParse({
    name: formData.get('name'),
    doc: formData.get('fileUpload'),});

  if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error);
     return { success: false, message: `Invalid file: ${validationResult.error.errors.map(e => e.message).join(', ')}`};
  }
   const { userId } = await getAuthenticatedUserInfo();
  const validFile = validationResult.data.doc;

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
    await prisma.$transaction(async (tx) => {
      await tx.document.create({
        data: {
          name: validationResult.data.name,
          driveId: response.data.id ?? ""
        },
      });

      
    });
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


export async function updateDocument(
  prevState: UploadFormState,
  formData: FormData
): Promise<UploadFormState> {


  // 1. Validate File Input
  const validationResult = documentSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    doc: formData.get('fileUpload'),});
console.log("Validation Result:", validationResult);
  if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error);
     return { success: false, message: `Invalid file: ${validationResult.error.errors.map(e => e.message).join(', ')}`};
  }
   const { userId } = await getAuthenticatedUserInfo();
  const validFile = validationResult.data.doc;

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
    await prisma.$transaction(async (tx) => {
      await tx.document.create({
        data: {
          name: validationResult.data.name,
          driveId: response.data.id ?? ""
        },
      });

      
    });
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
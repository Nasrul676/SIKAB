// app/api/download-drive/[fileId]/route.ts

import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Readable } from 'stream'; // Import Readable from stream

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const fileId = params.fileId;

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
  }

  console.log(`Attempting to download Google Drive file: ${fileId}`);

  // 1. Load Credentials Securely
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    console.error("Google Service Account JSON not found in environment variables.");
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  let credentials;
  try {
      credentials = JSON.parse(serviceAccountJson);
  } catch (error) {
      console.error("Failed to parse Google Service Account JSON:", error);
      return NextResponse.json({ error: "Server configuration error (JSON parse)." }, { status: 500 });
  }

  try {
    // 2. Authenticate with Google
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      // Scope for reading files (drive.readonly is safer if only downloading)
      ['https://www.googleapis.com/auth/drive.readonly']
    );

    // 3. Initialize Drive API Client
    const drive = google.drive({ version: 'v3', auth });

    // 4. Get File Metadata (Optional but Recommended for Headers)
    let fileName = 'downloaded-file'; // Default filename
    let mimeType = 'application/octet-stream'; // Default MIME type
    let fileSize: string | null = null;

    try {
        const metadataResponse = await drive.files.get({
            fileId: fileId,
            fields: 'name, mimeType, size' // Get name, type, and size
        });
        if (metadataResponse.data.name) {
            fileName = metadataResponse.data.name;
        }
        if (metadataResponse.data.mimeType) {
            mimeType = metadataResponse.data.mimeType;
        }
        if (metadataResponse.data.size) {
            fileSize = metadataResponse.data.size;
        }
        console.log(`File Metadata - Name: ${fileName}, Type: ${mimeType}, Size: ${fileSize || 'Unknown'}`);
    } catch (metaError: any) {
        console.warn(`Could not retrieve file metadata for ${fileId}: ${metaError.message}`);
        // Proceed without metadata if needed, or handle specific errors (e.g., 404 Not Found)
        if (metaError.code === 404) {
             return NextResponse.json({ error: 'File not found in Google Drive' }, { status: 404 });
        }
         if (metaError.code === 403) {
             return NextResponse.json({ error: 'Permission denied to access Google Drive file' }, { status: 403 });
        }
        // Continue with default headers if metadata fetch fails for other reasons
    }


    // 5. Get File Content Stream
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' } // Important: Get response as a stream
    );

    // Type assertion needed because the default type doesn't guarantee Readable
    const fileStream = response.data as unknown as Readable;

    // 6. Create Headers for Download
    const headers = new Headers();
    // Use encodeURIComponent to handle special characters in filenames
    headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    headers.set('Content-Type', mimeType);
    if (fileSize) {
        headers.set('Content-Length', fileSize);
    }

    // 7. Stream the Response
    // Convert Node.js Readable stream to a Web Stream using NextResponse
    return new NextResponse(fileStream as any, { // Type assertion might be needed depending on versions
        status: 200,
        headers: headers,
    });

  } catch (error: any) {
    console.error('Google Drive API Error during download:', error);
    // Handle specific Drive API errors
    if (error.code === 404) {
        return NextResponse.json({ error: 'File not found in Google Drive' }, { status: 404 });
    }
    if (error.code === 403) {
        return NextResponse.json({ error: 'Permission denied to access Google Drive file' }, { status: 403 });
    }
    return NextResponse.json({ error: `Failed to download file: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}

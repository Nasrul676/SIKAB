import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';


export async function GET(request: NextRequest, { params }: { params: { fileId: string } }) {
  const { fileId } = params;

  if (!fileId) {
    return new NextResponse('File ID tidak ditemukan', { status: 400 });
  }

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

     const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      // Scope for reading files (drive.readonly is safer if only downloading)
      ['https://www.googleapis.com/auth/drive.readonly']
    );
    const drive = google.drive({ version: 'v3', auth });


    // Ambil metadata file untuk mendapatkan tipe mime (misalnya, 'image/jpeg')
    const fileMetadataResponse = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType',
    });
    const mimeType = fileMetadataResponse.data.mimeType;

    // Ambil konten file sebagai stream
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    // Konversi Node.js stream ke Web Stream yang kompatibel dengan Next.js Response
    const nodeStream = response.data as Readable;
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on('data', (chunk) => controller.enqueue(chunk));
        nodeStream.on('end', () => controller.close());
        nodeStream.on('error', (err) => controller.error(err));
      }
    });

    // Kirim stream gambar kembali ke klien
    return new Response(webStream, {
      headers: {
        'Content-Type': mimeType || 'application/octet-stream',
      },
    });

  } catch (error:any) {
    console.error('Gagal mengambil file dari Google Drive:', error.message);
    // Kirim pesan error yang sesuai
    if (error.code === 404) {
      return new NextResponse('File tidak ditemukan di Google Drive', { status: 404 });
    }
    return new NextResponse('Terjadi kesalahan pada server', { status: 500 });
  }
}

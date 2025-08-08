import { NextRequest } from "next/server";

interface SSEClient {
  id: number;
  controller: ReadableStreamDefaultController<Uint8Array>;
  res: {
    write: (data: string) => void;
  };
}

let clients: SSEClient[] = [];

export function notifyClients(data: any) {
  console.log(`Notifying ${clients.length} SSE clients with data:`, data);
  clients.forEach(client => {
    try {
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      console.error("Error writing to client, removing client:", e);
      // Hapus klien jika tidak bisa ditulis lagi
      clients = clients.filter(c => c.id !== client.id);
    }
  });
}

export async function GET(request: NextRequest) {
  // Header penting untuk SSE
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  };

  // Next.js Route Handlers tidak secara langsung memberikan akses ke objek `res` seperti di Pages Router.
  // Kita perlu membuat Response stream.
  const stream = new ReadableStream({
    start(controller) {
      const clientId = Date.now(); // ID unik sederhana untuk klien
      const newClient = {
        id: clientId,
        controller: controller, // Simpan controller untuk mengirim data
        res: { // Objek res tiruan untuk kompatibilitas dengan fungsi notifyClients
            write: (data: string | undefined) => {
                try {
                    controller.enqueue(new TextEncoder().encode(data));
                } catch (e) {
                    console.error("Error enqueueing data for client:", clientId, e);
                    // Mungkin controller sudah ditutup
                }
            }
        }
      };
      clients.push(newClient);
      console.log(`SSE Client connected: ${clientId}, total clients: ${clients.length}`);

      // Kirim pesan koneksi awal jika perlu
      // newClient.res.write(`data: ${JSON.stringify({ type: "connection_established", clientId })}\n\n`);

      // Tangani saat klien menutup koneksi
      request.signal.onabort = () => {
        clients = clients.filter(client => client.id !== clientId);
        console.log(`SSE Client disconnected: ${clientId}, total clients: ${clients.length}`);
        try {
            controller.close(); // Pastikan stream ditutup
        } catch(e) {
            // Bisa jadi sudah ditutup
        }
      };
    }
  });

  return new Response(stream, { headers });
}
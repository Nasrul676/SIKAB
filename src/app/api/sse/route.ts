import prisma from "@/lib/prisma";
import { get } from "http";
import { NextRequest, NextResponse } from "next/server";

const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );
  const startOfTomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );
  const getData = async () => {
      
  const notification= await prisma.notifications.findMany();

  return notification;
  }

  const removeNotif=async()=>{
    await prisma.notifications.deleteMany();
  } 
 
export async function GET(req: NextRequest) {
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    start(controller) {
         
      let counter = 0;
      const intervalId = setInterval(async () => {
        counter++;
        const msg = await getData();
        // The data is encoded and enqueued into the stream.
        // The connection remains open as long as controller.close() is not called.
        const message = `data: ${JSON.stringify({ 
                        message: msg, 
                    })}\n\n`;
        controller.enqueue(encoder.encode(message));
        await removeNotif();
      }, 5000);

      // This listener ensures cleanup when the client disconnects,
      // preventing the interval from running indefinitely on the server.
      req.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        controller.close(); // This closes the stream and the connection gracefully
        console.log("Client disconnected");
      });
    },
    cancel() {
      // This is called if the stream is cancelled for other reasons
      console.log("Stream cancelled");
    },
  });

  // Returning the NextResponse with the stream keeps the connection open
  // and pipes the stream data to the client.
  return new NextResponse(readableStream, { headers });
}
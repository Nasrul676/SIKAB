"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from 'react'
import { set } from 'zod';

const NotifWeighing = ({totalData}:{totalData:number}) => {
    const [connectionStatus, setConnectionStatus] = useState("Connecting...");
    const [messages, setMessages] = useState<number>(totalData)
      const router = useRouter();
    
    useEffect(() => {
    // Setup EventSource untuk SSE
    const eventSource = new EventSource("/api/sse");
    eventSource.onopen = () => {
      console.log("SSE connection established");
      setConnectionStatus("Connected");
    };
    eventSource.onmessage = (event) => {
      const data= JSON.parse(event.data);
      const arrival= data.message.find((item: any) => item.table === "arrivals");
      if (arrival) {
        router.refresh();
      } 
    };

    eventSource.onerror = (err) => {
      setConnectionStatus("Connectioning...");
    };

    // Cleanup EventSource saat komponen di-unmount
    return () => {
      eventSource.close();
    };
  }, []);

  // useEffect(() => {
  //   if (messages !== totalData) {
  //       router.refresh();
  //   } 
  //   }, [messages]);  
  return (
    <div>
    <h2 className="text-3xl font-bold mb-6">
        Dashboard Penimbangan
    </h2>
    <p>{connectionStatus}</p>
    
    </div>
  )
}

export default NotifWeighing

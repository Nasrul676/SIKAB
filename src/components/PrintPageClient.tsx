"use client";

import React, { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/registry/new-york-v4/ui/button";
import QueuePrint from "@/components/QueuePrint";
import {useRouter} from "next/navigation";
import Link from "next/link";

function PrintPageClient({ arrivalData }: { arrivalData: any | null }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const handlePrint = useReactToPrint({contentRef});
  useEffect(() => {
    setIsMounted(true);
    if (arrivalData) {
      handlePrint();
    }
  }, [arrivalData, handlePrint]);
  if (!arrivalData) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <p>Memuat data cetak...</p>
      </div>
    );
  }

  const handleBack = () => {
    router.push("/security");
  };

  return (
    <div className="p-8 flex flex-col items-center gap-8 bg-gray-100 min-h-screen">
      <div className="p-4 bg-white shadow-lg">
        <QueuePrint ref={contentRef} arrivalData={arrivalData} />
      </div>
      <div className="flex flex-row gap-4">
        <Link href="/security" className="px-8 py-4 text-lg cursor-pointer">
          Kembali
        </Link>
        <Button onClick={handlePrint} className="px-8 py-4 text-lg bg-blue-600 cursor-pointer">
          Cetak Ulang Struk
        </Button>
      </div>
    </div>
  );
}

export default PrintPageClient;

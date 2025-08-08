import React from "react";
import PrintPageClient from "@/components/PrintPageClient";
import prisma from "@/lib/prisma";

export default async function Page({ params }: { params: { id: string } }) {

  const arrivalData = await prisma.arrivals.findFirst({
    where: { idKedatangan: params.id },
    include: { supplier:true }
  });
  console.log("Arrival Data:", arrivalData);
  if (!arrivalData) {
    return <div className="p-8 text-center">Data kedatangan tidak ditemukan.</div>;
  }

  return <>{arrivalData ? <PrintPageClient arrivalData={arrivalData} /> : <div className="p-8 text-center">Memuat data...</div>}</>;
}

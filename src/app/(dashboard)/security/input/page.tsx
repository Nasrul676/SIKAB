import SecurityForm from "@/components/forms/SecurityForm";
import prisma from "@/lib/prisma";
import React from "react";

async function page() {
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

  const supplier = await prisma.suppliers.findMany({
    select: { id: true, name: true },
  });
  const materials = await prisma.materials.findMany({
    select: { id: true, name: true },
  });
  const conditions = await prisma.conditions.findMany({
    select: { id: true, name: true },
  });

  const arrivalNo = await prisma.arrivals.count({
    where: {
      arrivalDate: {
        gte: startOfToday, // Greater than or equal to (lebih besar atau sama dengan awal hari ini)
        lt: startOfTomorrow, // Less than (lebih kecil dari awal hari esok)
      },
    },
  });

  const relatedData = {
    supplier: supplier,
    arrivalNo: arrivalNo,
    materials: materials,
    conditions: conditions,
  };
  return (
    <div className="p-4 flex gap-4 flex-col">
      <SecurityForm relatedData={relatedData} />
    </div>
  );
}

export default page;

import WeighingForm from "@/components/forms/weighingForm";
import prisma from "@/lib/prisma";
import React from "react";

async function page({ params }: { params: { id: string } }) {
  const { id } = await params;

  const arrivalItems = await prisma.arrivalItems.findMany({
    where: {
      arrivalId: parseInt(id),
    },
    include: {
          material: true,
          condition: true,
          parameter: true,
          Weighings: true
        },
    
  });

  const arrival = await prisma.arrivals.findFirst({
    where: {
      id: parseInt(id),
    },
    include: {
      supplier: true,
    },
  });

    const materials = await prisma.materials.findMany({
        select: { id: true, name: true },
    });

    const condition = await prisma.conditions.findMany({
        select: { id: true, name: true },
    })

  const relatedData = {
    arrivalItems: arrivalItems,
    arrival: arrival,
    materials: materials,
    conditions: condition,
  };
  return (
    <div className="p-4 flex gap-4 flex-col">
      <WeighingForm relatedData={relatedData} />
    </div>
  );
}

export default page;

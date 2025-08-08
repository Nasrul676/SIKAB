
import WeighingReview from "@/components/forms/review/WeighingReview";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import React from "react";

async function page({ params }: { params: { id: string } }) {
  const session = await getSession();
    const role = session.user?.role;
  const { id } = await params;
  const arrivalItems = await prisma.arrivalItems.findMany({
    where: {
      arrivalId: parseInt(id),
    },
    include: {
          material: true,
          condition: true,
          parameter: true,
          Weighings: true,
          WeighingsPhotos: true
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

  const relatedData = {
    arrivalItems: arrivalItems,
    arrival: arrival,
    role: role,
  };
  return (
    <div className="p-4 flex gap-4 flex-col">
      <WeighingReview relatedData={relatedData} />
    </div>
  );
}

export default page;

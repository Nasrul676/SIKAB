import QcReview from "@/components/forms/review/QcReview";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import React from "react";

async function page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await getSession();
      const role = session.user?.role;
  const arrivalItems = await prisma.arrivalItems.findMany({
    where: {
      arrivalId: parseInt(id),
    },
    include: {
          material: true,
          condition: true,
          parameter: true,
          QcResults: {
            include: {
              parameter: true,
            },
          },
          QcPhotos: true,
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
  const qcParameters = await prisma.parameters.findMany();
  const qcStatuses = await prisma.qcStatus.findMany(
    {select: { id: true, name: true },}
  );

  const relatedData = {
    arrivalItems: arrivalItems,
    arrival: arrival,
    qcParameters: qcParameters,
    qcStatuses: qcStatuses,
    role: role,
  };
  return (
    <div className="p-4 flex gap-4 flex-col">
      <QcReview relatedData={relatedData} />
    </div>
  );
}

export default page;

import QcForm from "@/components/forms/QcForm";
import prisma from "@/lib/prisma";
import React from "react";
import CollapseItem from "@/components/collapse";
import { XCircle, CheckCircle, Clock } from "lucide-react";
import { formatDate } from "@/app/utils/formatDate";

async function page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const arrivalItems = await prisma.arrivalItems.findMany({
    where: {
      id: parseInt(id),
    },
    include: {
          material: true,
          condition: true,
          parameter: true,
          QcPhotos: true,
          QcResults: {
            include: {
              parameter: true,
            },
          },
        },
  });

  const arrival = await prisma.arrivals.findFirst({
    where: {
      id: arrivalItems[0]?.arrivalId,
    },
    include: {
      supplier: true,
    },
  });
  const qcParameters = await prisma.parameters.findMany({
    include: { settings: true },
  });
  const qcStatuses = await prisma.qcStatus.findMany(
    {select: { id: true, name: true },}
  );

  const historyQc = await prisma.qcHistories.findMany({
    where: {
      arrivalItemId: parseInt(id),
    },
    include: {
      user: true,
      status: true,
      QcResults: {
        include: {
          parameter: true,
        },
      }
    },
  });

  const relatedData = {
    arrivalItems: arrivalItems,
    arrival: arrival,
    qcParameters: qcParameters,
    qcStatuses: qcStatuses,
  };

  const getStatusStyle = (statusName: string): { icon: React.ReactElement; color: string } => {
    switch (statusName.toLowerCase()) {
      case "tidak lolos":
        return { icon: <XCircle className="text-red-500" />, color: "text-red-500" };
      case "karantina":
        return { icon: <Clock className="text-yellow-500" />, color: "text-yellow-500" };
      default:
        return { icon: <CheckCircle className="text-green-500" />, color: "text-green-500" };
    }
  };

  return (
    <div className="p-4 flex gap-4 flex-col">
      {arrivalItems.length === 0 && (
        <div className="text-red-500 text-center">
          <div className="p-4">Tidak ada data kedatangan bahan baku yang ditemukan.</div>
        </div>
      )}
      {arrivalItems.length > 0 && <QcForm relatedData={relatedData} />}

      <CollapseItem title="Riwayat Proses Quality Control">
        <div className="w-full max-w-2xl mx-auto">
          <div className="space-y-6">
            {
              historyQc.length === 0 && (
                <div className="text-gray-500 text-center p-4">
                  Belum ada riwayat proses Quality Control untuk ID Kedatangan ini.
                </div>
              )
            }
            {historyQc.map((item: any) => {
              const { icon, color } = getStatusStyle(item.status.name);
              return (
                <div key={item.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 pt-1">{icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className={`text-lg font-bold ${color}`}>{item.status.name}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Diproses oleh: <span className="font-bold">{item.user.username}</span>
                      </p>

                      <CollapseItem title={item.QcResults.length > 0 ? "Lihat Hasil QC" : "Tidak ada hasil QC"} disabled={item.QcResults.length === 0}>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-700">
                            <span className="text-gray-600 dark:text-gray-300">Berat Uji Sampel</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{item.qcSample ? `${item.qcSample} gr` : "Tidak ada data"}</span>
                          </li>
                          {item.QcResults.map((result: any) => (
                            <li key={result.id} className="flex justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-700">
                              <span className="text-gray-600 dark:text-gray-300">{result.parameter.name}</span>
                              <span className="font-semibold text-gray-800 dark:text-gray-200">{result.value ? `${result.value} gr` : "Tidak ada data"}</span>
                            </li>
                          ))}
                          <li className="flex justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-700">
                            <span className="text-gray-600 dark:text-gray-300">Total Berat Bahan</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{item.totalBerat ? `${item.totalBerat} gr` : "Tidak ada data"}</span>
                          </li>
                          <li className="flex justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-700">
                            <span className="text-gray-600 dark:text-gray-300">Air Dan Kotoran</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{item.qcKotoran ? `${item.qcKotoran} gr` : "Tidak ada data"}</span>
                          </li>
                          <li className="flex justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-700">
                            <span className="text-gray-600 dark:text-gray-300">Lama Pengeringan</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{item.pengeringan ? `${item.pengeringan} menit` : "Tidak ada data"}</span>
                          </li>

                          <li className="flex justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-700">
                            <span className="text-gray-600 dark:text-gray-300">Note</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{item.qcNote ? `${item.qcNote}` : "Tidak ada data"}</span>
                          </li>
                        </ul>
                      </CollapseItem>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CollapseItem>
    </div>
  );
}

export default page;  
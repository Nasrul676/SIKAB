"use client";

import { ListCollapse, QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/registry/new-york-v4/ui/dialog";
import moment from "moment";
import { Button } from "@/registry/new-york-v4/ui/button";
import { useEffect, useState } from "react";
import { CircleAlert, CircleCheckBig } from "lucide-react";
import { ArrivalStatus } from "@/app/utils/enum";
import { approve } from "@/lib/actions/arrivalActions";
import { useRouter } from "next/navigation";

export default function ApproveQueue({data}: { data: any }) {

  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [queueNumber, setQueueNumber] = useState(data.queueNumber || "");
  const [note, setNote] = useState(data.note);

  useEffect(() => {
    if (data) {
      const splitQueueNumber = data.idKedatangan.split("-");
      if (splitQueueNumber.length > 0) {
        setQueueNumber(splitQueueNumber[1]);
      }
    }
  }, [data]);

  const handleConfirm = async () => {
    try {
      await approve(data.id, ArrivalStatus.WAITING_ARRIVAL, note);
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating arrival status:", error);
    }
  };

  console.log('data ', data);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 hover:text-white text-white p-2 rounded-lg shadow-md flex items-center gap-2 font-semibold transition duration-300 ease-in-out transform hover:scale-105 text-center justify-center text-xs"
        >
          Approve
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="capitalize"></DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto">
          <div className="p-6 rounded-lg shadow-md">
            {/* <h2 className="text-lg font-semibold mb-2">Data Kedatangan</h2> */}
            <div className="flex flex-row justify-between gap-3">
              <div className="flex gap-3 flex-col">
                <div className="flex flex-col">
                  <span className="font-semibold">No Antrian:</span>
                  <span>{queueNumber}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">Nama Supplier:</span>
                  <span>{data.supplier.name}</span>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center border-2 border-dashed border-gray-600 p-5 rounded-lg">
                <div className="flex flex-col items-center justify-center gap-2">
                  {data.ArrivalStatuses.statusQc === ArrivalStatus.QC_COMPLETED && data.ArrivalStatuses.statusWeighing === ArrivalStatus.WEIGHING_COMPLETED ? (
                    <>
                      <CircleCheckBig className="text-green-600" />
                      <span className="font-semibold text-center text-xl text-green-600 mt-3"> Semua Proses Sudah Selesai</span>
                    </>
                  ) : (
                    <>
                      <CircleAlert className="text-red-600" />
                      {data.ArrivalStatuses.statusQc !== ArrivalStatus.QC_COMPLETED && <span className="text-xl text-red-600 text-center">{data.ArrivalStatuses.statusQc}</span>}
                      {data.ArrivalStatuses.statusWeighing !== ArrivalStatus.WEIGHING_COMPLETED && <span className="text-xl text-red-600 text-center">{data.ArrivalStatuses.statusWeighing}</span>}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div>
              <input
                type="text"
                value={note}
                className="mt-4 w-full p-2 ring-gray-400 ring-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                placeholder="Catatan (jika ada)"
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <Button type="button" onClick={handleConfirm} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
            Konfirmasi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
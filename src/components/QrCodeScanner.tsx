"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { approve, getArrivalByArrivalId } from "@/lib/actions/arrivalActions";
import { CircleAlert, CircleCheckBig } from "lucide-react";
import { Button } from "@/registry/new-york-v4/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrivalStatus } from "@/app/utils/enum";

export default function QrCodeScanPage({ setIsOpen, isOpen }: { setIsOpen: (isOpen: boolean) => void, isOpen: boolean }) {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const qrcodeRegionId = "html5qr-code-full-region";
  const [cameraPermission, setCameraPermission] = useState<any>("loading");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [queueNumber, setQueueNumber] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (scannerRef.current) {
      return;
    }

    const scanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      },
      /* verbose= */ false
    );

    const onScanSuccess = (decodedText: string, decodedResult: any) => {
      console.log(`Scan result: ${decodedText}`, decodedResult);
      setScannedData(decodedText);
      scanner
        .clear()
        .then(() => {
          console.log("Scanner cleared successfully.");
        })
        .catch((error) => {
          console.error("Failed to clear scanner:", error);
        });
    };

    const onScanError = (errorMessage: any) => {
      if (errorMessage.includes("No QR code found")) {
        return;
      }
      console.warn(`QR Code scan error: ${errorMessage}`);
    };

    scanner.render(onScanSuccess, onScanError);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Gagal membersihkan scanner saat unmount.", error);
        });
      }
    };
  }, []);

  useEffect(() => {
    const checkCameraPermission = async () => {
      if (navigator.permissions) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: "camera" as PermissionName });
          setCameraPermission(permissionStatus.state);
          permissionStatus.onchange = () => {
            setCameraPermission(permissionStatus.state);
          };
        } catch (err) {
          console.error("Gagal mengecek izin kamera:", err);
          setCameraPermission("denied");
        }
      } else {
        setCameraPermission("prompt");
      }
    };
    checkCameraPermission();
  }, []);

  const getArrivaData = async (arrivalId: string) => {
    setIsLoading(true);
    setError("");
    setQueryResult(null);
    try {
      const result = await getArrivalByArrivalId(arrivalId);
      if (result.success && result.data) {
        console.log("Data hasil query:", result.data);
        setQueryResult(result.data);
        const splitQueueNumber = result.data.idKedatangan.split("-");
        if (splitQueueNumber.length > 1) {
          setQueueNumber(splitQueueNumber[1]);
        } else {
          setQueueNumber(result.data.idKedatangan);
        }
      } else {
        setError(result.message || "Data tidak ditemukan.");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scannedData) {
      getArrivaData(scannedData);
    }
  }, [scannedData]);

  const updateStatus = async (arrivalId: string) => {
    if (!queryResult) {
      return;
    }

    try {
      if (scannerRef.current) {
        await scannerRef.current.clear();
      }
      await approve(Number(arrivalId), ArrivalStatus.WAITING_ARRIVAL, note);
      console.log(`Update status for arrival ID: ${arrivalId}`);
      toast.success("Antrian berhasil di proses.");
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      toast.error("Proses konfirmasi antrian gagal.");
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="flex flex-col justify-start p-4 gap-6 font-sans">
      <div className="w-full max-w-6xl mx-auto rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex flex-col">
          <div className="p-4 rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center">
            <div id={qrcodeRegionId} className="w-full"></div>
            <p className="mt-4">
              Hasil Pindai : <span className="font-mono bg-gray-700 px-2 py-1 rounded text-gray-100">{scannedData || "Belum ada"}</span>
            </p>
          </div>
        </div>
      </div>
      <div
        className={`
            transition-all duration-500 ease-in-out overflow-hidden
            ${queryResult ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"}
          `}
      >
        {isLoading && <p className="text-center text-gray-500 animate-spin border-2 border-gray-500 rounded-full w-6 h-6">Sedang memuat data...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {queryResult && (
          <>
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
                    <span>{queryResult.supplier.name}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 dotted border-2 border-dashed border-gray-600 m-1 rounded-lg">
                  {queryResult.ArrivalStatuses.statusQc === ArrivalStatus.QC_COMPLETED && queryResult.ArrivalStatuses.statusWeighing === ArrivalStatus.WEIGHING_COMPLETED ? (
                    <>
                      <CircleCheckBig className="text-green-600" />
                      <span className="font-semibold text-center text-xl text-green-600 mt-3"> Semua Proses Sudah Selesai</span>
                    </>
                  ) : (
                    <>
                      <CircleAlert className="text-red-600" />
                      {queryResult.ArrivalStatuses.statusQc !== ArrivalStatus.QC_COMPLETED && <span className="text-xl text-red-600 text-center">{queryResult.ArrivalStatuses.statusQc}</span>}
                      {queryResult.ArrivalStatuses.statusWeighing !== ArrivalStatus.WEIGHING_COMPLETED && <span className="text-xl text-red-600 text-center">{queryResult.ArrivalStatuses.statusWeighing}</span>}
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="font-semibold text-start mt-4">Keterangan</p>
                <input type="text" value={queryResult.note} className="mt-4 w-full p-2 ring-gray-400 ring-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" placeholder="Catatan (jika ada)" onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
            <div className="flex w-full justify-center">
              <Button onClickCapture={() => updateStatus(queryResult.id)} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" onClick={() => scannerRef.current?.clear()}>
                Approve
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

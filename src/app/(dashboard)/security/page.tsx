import prisma from "@/lib/prisma";
import { AlertCircle, CheckCircle, ClipboardList, Edit, Plus, Printer, QrCode, Scan } from "lucide-react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import moment from "moment";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/new-york-v4/ui/table";
import ModalDashboarSecurity from "@/components/modal/ModalDashboarSecurity";
import NotifSecurity from "./notif";
import ScanQrCodeModal from "@/components/modal/ScanQrCodeModal";
import ApproveQueue from "@/components/modal/ApproveQueue";
import { ArrivalStatus } from "@/app/utils/enum";

const SecurityPage = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
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
    const todayArrivals = await prisma.arrivals.findMany({
      where: {
        arrivalDate: {
        gte: startOfToday, // Greater than or equal to (lebih besar atau sama dengan awal hari ini)
        lt: startOfTomorrow, // Less than (lebih kecil dari awal hari esok)
      },
      },
      orderBy: {
        id: "desc", // Sort by arrival time in descending order
      },
      include: {
        supplier: true,
        ArrivalStatuses: true,
        ArrivalItems:{
          include: {
            material: true,
            condition: true,
            parameter: true,
          }
        }
      },
    });
    const processedArrivals = todayArrivals.filter((a) => a.ArrivalStatuses && a.ArrivalStatuses.statusApproval === ArrivalStatus.APPROVAL_COMPLETED);

    const unprocessedArrivals = todayArrivals.filter((a) => a.ArrivalStatuses && a.ArrivalStatuses.statusApproval === ArrivalStatus.APPROVAL_PENDING);


  return (
    <div className="p-4 flex gap-4 flex-col">
      <NotifSecurity />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Antrian Hari Ini" value={todayArrivals.length} icon={ClipboardList} color="bg-blue-100 text-blue-600" />
        <StatCard title="Sudah Diproses" value={processedArrivals.length} icon={CheckCircle} color="bg-green-100 text-green-600" />
        <StatCard title="Belum Diproses" value={unprocessedArrivals.length} icon={AlertCircle} color="bg-yellow-100 text-yellow-600" />
      </div>

      <div className="flex gap-14 mb-6 items-center justify-between">
        <ScanQrCodeModal />
        <Link
          href="/security/input"
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-md flex items-center gap-2 text-sm font-semibold transition duration-300 ease-in-out transform hover:scale-105 text-center justify-center"
        >
          <Plus size={24} /> Input Kedatangan Baru
        </Link>
      </div>
      <div className="gap-2 grid grid-cols-2">
        <div className="p-6 rounded-xl shadow-lg dark:shadow-slate-700">
          <h3 className="text-xl font-semibold  mb-4">Daftar Antrian Hari Ini ({moment().format("dddd, DD MMMM YYYY")})</h3>
          {unprocessedArrivals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada kedatangan hari ini.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Kedatangan</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unprocessedArrivals.map((arrival: any) => (
                  <TableRow key={arrival.id}>
                    <TableCell>
                      <p className="text-xs">{arrival.idKedatangan}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs">{arrival.arrivalTime}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs">{arrival.supplier.name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs">{moment(arrival.arrivalDate).format("DD MMMM YYYY")}</p>
                    </TableCell>
                    <TableCell className="flex justify-start">
                      <Link href={`/security/print/${arrival.idKedatangan}`} type="button" className="cursor-pointer flex justify-center items-center">
                        <Printer size={15} />
                      </Link>
                      <ModalDashboarSecurity data={arrival} />
                      <ApproveQueue data={arrival} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <div className="p-6 rounded-xl shadow-lg dark:shadow-slate-700 flex-1">
          <h3 className="text-xl font-semibold  mb-4">Daftar Sudah Di Proses Hari Ini ({moment().format("dddd, DD MMMM YYYY")})</h3>
          {processedArrivals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada kedatangan hari ini.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Kedatangan</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedArrivals.map((arrival: any) => (
                  <TableRow key={arrival.id}>
                    <TableCell>
                      <p className="text-xs">{arrival.idKedatangan}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs">{arrival.arrivalTime}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs">{arrival.supplier.name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs">{moment(arrival.arrivalDate).format("DD MMMM YYYY")}</p>
                    </TableCell>
                    <TableCell className="flex justify-start">
                      <ModalDashboarSecurity data={arrival} />
                      <Link href={`/security/print/${arrival.idKedatangan}`} type="button" className="cursor-pointer flex justify-center items-center">
                        <Printer size={15} />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;

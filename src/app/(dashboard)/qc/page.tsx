import prisma from "@/lib/prisma";
import { AlertCircle, CheckCircle, Scale, Vote } from "lucide-react";
import StatCard from "@/components/StatCard";
import { TableCell, TableRow } from "@/registry/new-york-v4/ui/table";
import { Prisma } from "@/generated/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import moment from "moment";
import TableSearch from "@/components/TableSearch";
import Link from "next/link";
import NotifQC from "./notif";
import ListQcDialog from "@/components/ListQcDialog";
import { Button } from "@/registry/new-york-v4/ui/button";
const QcPage = async ({
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
  const { page, ...queryParams } = await searchParams;
  const p = page ? parseInt(page) : 1;
  const query: Prisma.ArrivalsWhereInput = {};
  // query.arrivalDate = {
  //   gte: startOfToday, // Greater than or equal to (lebih besar atau sama dengan awal hari ini)
  //   lt: startOfTomorrow, // Less than (lebih kecil dari awal hari esok)
  // };
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.idKedatangan = { contains: value };

            break;
          default:
            break;
        }
      }
    }
  }

  const todayArrivals = await prisma.arrivals.findMany({
    select: {
      id: true,
      idKedatangan: true,
      _count: {
        select: {
          ArrivalItems: true,
        },
      },
      ArrivalItems: {
        select: {
          _count: {
            select: {
              QcResults: true,
            },
          },
        },
      },
    },
  });

  const processedTodayArrivals = todayArrivals.map((arrival) => {
    const totalQc = arrival.ArrivalItems.reduce(
      (sum, item) => sum + item._count.QcResults,
      0
    );

    return {
      id: arrival.id,
      idKedatangan: arrival.idKedatangan,
      total_items: arrival._count.ArrivalItems,
      qc_done: totalQc,
    };
  });
  const pendingQcArrivals: typeof processedTodayArrivals = processedTodayArrivals.filter(
    (a) => a.qc_done ==0
  );
  const qcDoneArrivals = processedTodayArrivals.filter((a) => a.qc_done >0);

  const [data, count] = await prisma.$transaction([
    prisma.arrivals.findMany({
      where: query,
      orderBy: {
        arrivalDate: "desc",
      },
      select: {
        id: true,
        idKedatangan: true,
        arrivalTime: true,
        arrivalDate: true,
        supplier: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            ArrivalItems: true,
          },
        },
        ArrivalItems: {
          select: {
            id: true,
            itemName: true,
            statusQc: true,
            _count: {
              select: {
                QcResults: true,
              },
            },
          },
        },
      }, 
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
    }),

    prisma.arrivals.count({ where: query }),
  ]);

  const processedArrivals = data.map((arrival) => {
      const totalResults = arrival.ArrivalItems.reduce(
        (sum, item) => sum + (item._count.QcResults>0?1:0),
        0
      );
  
      return {
        id: arrival.id,
        idKedatangan: arrival.idKedatangan,
        arrivalTime: arrival.arrivalTime,
        arrivalDate: moment(arrival.arrivalDate).format("YYYY-MM-DD"),
        supplierName: arrival.supplier.name,
        total_items: arrival._count.ArrivalItems,
        arrivalItems: arrival.ArrivalItems,
        qc_done: totalResults,
      };
    });

  const columns = [
     {
      header: "Actions",
      accessor: "actions",
    },
    {
      header: "ID Kedatangan",
      accessor: "idKedatangan",
    },
    {
      header: "Supplier",
      accessor: "supplier.name",
    },
    {
      header: "Jam Kedatangan",
      accessor: "waktu",
    },

    {
      header: "Tanggal Kedatangan",
      accessor: "arrivalDate",
    },
    {
      header: "Jumlah Bahan",
      accessor: "jmlBahan",
    },
    {
      header: "Selesai QC",
      accessor: "selesaiQC",
    },
  ];

  

  const renderRow = (item: any) => (
    <TableRow key={item.id}>
      <TableCell>
        {/* <Link
          href={`/qc/${item.id}`}
          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 transition duration-200"
        >
          <CheckCircle size={16} /> Proses QC
        </Link> */}
        <ListQcDialog items={item}/>
        <Button type="button" variant={"outline"} className="flex items-center gap-2 mt-2">
          <Link
            href={`/qc/review/${item.id}`}
            className="text-blue-600 hover:text-blue-900 flex items-center gap-1 transition duration-200"
          >
            <Vote size={16} /> Review
          </Link>
        </Button>
      </TableCell>
      <TableCell>{item.idKedatangan}</TableCell>
      <TableCell>{item.supplierName}</TableCell>
      <TableCell>{item.arrivalTime}</TableCell>
      <TableCell>{moment(item.arrivalDate).format("DD-MM-YYYY")}</TableCell>
      <TableCell>{item.total_items}</TableCell>
      <TableCell>{item.qc_done}</TableCell>
      
    </TableRow>
  );

  return (
    <div className="p-4 flex gap-4 flex-col">
      <NotifQC />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Menunggu QC" value={pendingQcArrivals.length} icon={AlertCircle} color="bg-yellow-100 text-yellow-600" />
        <StatCard title="Sudah QC (Total)" value={qcDoneArrivals.length} icon={CheckCircle} color="bg-green-100 text-green-600" />
      </div>

      <div className="p-6 rounded-xl shadow-lg dark:shadow-slate-700">
        <h3 className="text-xl font-semibold  mb-4">
          Daftar ID Kedatangan Menunggu QC
        </h3>
        <div className="mb-4 flex items-center gap-3">
          <TableSearch />
        </div>
        {data.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Tidak ada ID Kedatangan yang menunggu QC atau hasil pencarian tidak ditemukan.
          </p>
        ) : (
          <div>
            <Table columns={columns} renderRow={renderRow} data={processedArrivals} />
            <Pagination page={p} count={count} />
          </div>
        )}
      </div>
    </div>
  );
};

export default QcPage;

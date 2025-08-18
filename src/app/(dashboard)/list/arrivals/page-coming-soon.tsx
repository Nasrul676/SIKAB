import prisma from "@/lib/prisma";
import { CheckCircle, Filter, PieChart, RefreshCcw, Sparkles } from "lucide-react";
import { TableCell, TableRow } from "@/registry/new-york-v4/ui/table";
import { Prisma } from "@/generated/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import moment from "moment";
import Link from "next/link";
import NotifQC from "./notif";
// import { KuantitasBahan } from "@/components/charts/KuantitasBahan"
// import { KedatanganChart } from "@/components/charts/KedatanganChart";

type PageProps = {
  params: { [key: string]: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

const ArrivalLIst = async ({
  searchParams,
}: PageProps) => {
  
  const { page, ...queryParams } = searchParams ?? {};
  const filterStartDate=queryParams.startDay ?moment(queryParams.startDay).format("YYYY-MM-DD 00:00:00"): moment().format("YYYY-MM-DD 00:00:00");
  const filterEndDate=queryParams.endDay ?moment(queryParams.endDay).format("YYYY-MM-DD 00:00:00"):moment(filterStartDate).add(1, 'day').format("YYYY-MM-DD 00:00:00");


  const suppliers = await prisma.suppliers.findMany({
    select: { id: true, name: true },
  });
  const materials = await prisma.materials.findMany({
    select: { id: true, name: true },
  });
  const conditions = await prisma.conditions.findMany({
    select: { id: true, name: true },
  });

  const p = page
    ? parseInt(Array.isArray(page) ? page[0] : page)
    : 1;
  const query: Prisma.ArrivalsWhereInput = {};
  // query.arrivalDate = {
  //   gte:new Date(filterStartDate), // Greater than or equal to (lebih besar atau sama dengan awal hari ini)
  //   lt: new Date(filterEndDate), // Less than (lebih kecil dari awal hari esok)
  // };
  // query.statusQc = null;
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.idKedatangan = { contains: Array.isArray(value) ? value[0] : value };

            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.arrivals.findMany({
      where: query,
      include: {
        supplier: true,
        ArrivalItems: {
          include: {
            material: true,
            condition: true,
            parameter: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
    }),

    prisma.arrivals.count({ where: query }),
  ]);
const arrivalCountsByDate = data.reduce((accumulator: any, currentArrival) => {
  const dateKey = new Date(currentArrival.createdAt).toISOString().slice(0, 10); // Format YYYY-MM-DD
  accumulator[dateKey] = (accumulator[dateKey] || 0) + 1;
  return accumulator;
}, {});

const finalFormattedArray = Object.entries(arrivalCountsByDate).map(([date, total]) => {
  return {
    date: date,
    total: total
  };
});

  console.log("Data:", finalFormattedArray);

   const totalQtyByMaterial = data.reduce<Record<string, number>>((acc, arrival) => {
    arrival.ArrivalItems.forEach((item: any) => {
      console.log("Item:", item.material.name, "Qty:", item.quantity);
      const materialName = item.material.name;
      acc[materialName] = (acc[materialName] || 0) + (parseFloat(item.quantity) || 0);
    });
    return acc;
  }, {});
  
  const finalFormattedMaterial = Object.entries(totalQtyByMaterial).map(([material, total], index) => {
  return {
    name: material,
    total: total,
    fill: `var(--chart-${index + 1})`,
  };
});

  const columns = [
    {
      header: "ID Kedatangan",
      accessor: "idKedatangan",
    },
    {
      header: "Waktu",
      accessor: "waktu",
    },

    {
      header: "Supplier",
      accessor: "supplier.name",
    },
    {
      header: "Tanggal Kedatangan",
      accessor: "arrivalDate",
    },
    {
      header: "Status",
      accessor: "status",
    },

    {
      header: "Actions",
      accessor: "actions",
    },
  ];

  const renderRow = (item: any) => (
    <TableRow key={item.id}>
      <TableCell>{item.idKedatangan}</TableCell>
      <TableCell>{moment(item.arrivalDate).format("HH:mm")}</TableCell>
      <TableCell>{item.supplier.name}</TableCell>
      <TableCell>{moment(item.arrivalDate).format("DD-MM-YYYY")}</TableCell>
      <TableCell>{item.status}</TableCell>
      <TableCell>
        <Link
          href={`/qc/${item.id}`}
          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 transition duration-200"
        >
          <CheckCircle size={16} /> Proses QC
        </Link>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="p-4 flex gap-4 flex-col">
      <NotifQC />

      <div className=" p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-xl font-semibold  mb-4 flex items-center gap-2"><Filter size={20} /> Filter Pencarian</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="filterId" className="block  text-sm font-semibold mb-2">ID Kedatangan</label>
            <input
              type="text"
              id="filterId"
              className="p-2 border border-gray-300 rounded-lg w-full"
              value={queryParams.id}
            />
          </div>
          <div>
            <label htmlFor="filterSupplier" className="block  text-sm font-semibold mb-2">Nama Supplier</label>
            <select
              id="filterSupplier"
              className="p-2 border border-gray-300 rounded-lg w-full"
              value={queryParams.supplier}
            >
              <option value="">Semua Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filterMaterial" className="block  text-sm font-semibold mb-2">Jenis Bahan</label>
            <select
              id="filterMaterial"
              className="p-2 border border-gray-300 rounded-lg w-full"
              value={queryParams.materialType}
            >
              <option value="">Semua Jenis Bahan</option>
              {materials.map((material) => (
                <option key={material.id} value={material.id}>{material.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filterStartDate" className="block  text-sm font-semibold mb-2">Tanggal Mulai</label>
            <input
              type="date"
              id="filterStartDate"
              className="p-2 border border-gray-300 rounded-lg w-full"
              value={queryParams.startDate}
            />
          </div>
          <div>
            <label htmlFor="filterEndDate" className="block  text-sm font-semibold mb-2">Tanggal Akhir</label>
            <input
              type="date"
              id="filterEndDate"
              className="p-2 border border-gray-300 rounded-lg w-full"
              value={queryParams.endDate}
            />
          </div>
          <div>
            <label htmlFor="filterStatus" className="block  text-sm font-semibold mb-2">Status Kedatangan</label>
            <select
              id="filterStatus"
              className="p-2 border border-gray-300 rounded-lg w-full"
              value={queryParams.status}
            >
              <option value="">Semua Status</option>
              <option value="Menunggu QC/Timbang">Menunggu QC/Timbang</option>
              <option value="QC Selesai">QC Selesai</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
          >
            <RefreshCcw size={18} /> Reset Filter
          </button>
          {/* No explicit "Cari Data" button needed as useEffect handles changes */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg col-span-full">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><PieChart size={20} /> Persentase Status QC</h3>
          <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm mt-4">
            Grafik Donat (Status QC)
            {/* <ul className="text-xs  mt-2">
              {Object.entries(qcStatusData).map(([status, count]) => (
                <li key={status}>{status}: {count} ({((count / totalArrivalsCount) * 100 || 0).toFixed(1)}%)</li>
              ))}
            </ul> */}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex justify-between items-center">
          <span className="flex items-center gap-2"><Sparkles size={20} /> Insight Laporan AI ✨</span>
          <button
            // onClick={handleGetLlmInsight}
            // disabled={isGettingInsight || filteredArrivals.length === 0}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            'Dapatkan Insight ✨'
            {/* {isGettingInsight ? 'Mendapatkan Insight...' : 'Dapatkan Insight ✨'} */}
          </button>
        </h3>
        {/* {llmInsight ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm ">
            <p className="font-semibold text-blue-800 mb-2">Analisis dan Saran dari AI:</p>
            <p className="whitespace-pre-wrap">{llmInsight}</p>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Tekan "Dapatkan Insight ✨" untuk analisis AI.</p>
        )} */}
        <p className="text-gray-500 text-center py-4">Tekan "Dapatkan Insight ✨" untuk analisis AI.</p>
      </div>
    </div>
  );
};

export default ArrivalLIst;

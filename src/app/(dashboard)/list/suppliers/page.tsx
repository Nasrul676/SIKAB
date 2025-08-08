import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import {
  
  Prisma,
  Suppliers,
} from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { TableCell, TableRow } from "@/registry/new-york-v4/ui/table";
import { CloudUpload, Eye, Funnel, ListFilter } from "lucide-react";
import Link from "next/link";

type SuplierList = Suppliers;

const SupplierListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const session = await getSession();
  const role = session.user?.role;
  const columns = [
    {
      header: "Name",
      accessor: "name",
    },
    {
       header: "Description",
      accessor: "description",
    },
    {
      header: "Actions",
      accessor: "actions",
    },
  ];

  const renderRow = (item: SuplierList) => (
    <TableRow key={item.id}>
      <TableCell>{item.name}</TableCell>
      <TableCell>{item.phone}</TableCell>
      <TableCell>{item.address}</TableCell>      
      <TableCell>{item.email}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Link href={`/list/employees/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-300 hover:bg-blue-500">
              <Eye size={16} />
            </button>
          </Link>
         
          {role === "admin" ||
            (role === "superadmin" && (
              <>
                <FormContainer table="supplier" type="update" data={item} id={item.id} />
                <FormContainer table="supplier" type="delete" id={item.id} />
                
              </>
            ))}
        </div>
      </TableCell>
    </TableRow>
  );

  const { page, ...queryParams } = await searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.SuppliersWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          
          case "search":
            query.name = { contains: value};
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.suppliers.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
    }),

    prisma.suppliers.count({ where: query }),
  ]);

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 px-4">
      {/* TOP */}
      <div className="flex items-center justify-between py-4">
        <h1 className="hidden md:block text-lg font-semibold">All Suppliers</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-300">
              <Funnel />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <ListFilter />
            </button>
            {role === "admin" ||
              (role === "superadmin" && (
                <FormContainer table="supplier" type="create" />
              ))}
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default SupplierListPage;

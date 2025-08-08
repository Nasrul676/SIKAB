import { Table, TableBody, TableHead, TableHeader,TableRow } from "@/registry/new-york-v4/ui/table";

const CustomTable = ({
  columns,
  renderRow,
  data,
}: {
  columns: { header: string; accessor: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
        {columns.map((col) => (
            <TableHead key={col.accessor} className={col.className}>{col.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
      {data.map((item) => renderRow(item))}
      </TableBody>
      
    </Table>
    
  );
};

export default CustomTable;

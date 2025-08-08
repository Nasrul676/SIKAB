"use client";

import { ListCollapse } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/new-york-v4/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/new-york-v4/ui/table";
import moment from "moment";
import { Button } from "@/registry/new-york-v4/ui/button";


const ModalDashboarSecurity = ({data}:{data:any}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" className="cursor-pointer">
          <ListCollapse size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="capitalize">{data?.supplier?.name || "Unknown"}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Bahan Baku</TableHead>
                <TableHead>Jenis Bahan</TableHead>
                <TableHead>Kondisi</TableHead>
                <TableHead>Tingkat Kebersihan</TableHead>
                <TableHead>Qty (Kg)</TableHead>
                {/* <TableHead>Keterangan</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.ArrivalItems.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.material.name}</TableCell>
                  <TableCell>{item.conditionCategory}</TableCell>
                  <TableCell>{item.condition.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  {/* <TableCell>{item.note}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalDashboarSecurity;

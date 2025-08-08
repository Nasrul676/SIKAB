"use client";

import { ListCollapse, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/new-york-v4/ui/dialog";
import moment from "moment";
import { Button } from "@/registry/new-york-v4/ui/button";
import QrCodeScanPage from "../QrCodeScanner";
import { useState } from "react";

export default function ScanQrCodeModal() {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 hover:text-white text-white p-3 rounded-lg shadow-md flex items-center gap-2 text-sm font-semibold transition duration-300 ease-in-out transform hover:scale-105 text-center justify-center"
        >
          <QrCode size={24} /> Scan QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="capitalize">Scan QR Code</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto">
          <QrCodeScanPage setIsOpen={setIsOpen} isOpen={isOpen} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

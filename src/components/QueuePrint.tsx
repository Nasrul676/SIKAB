"use client";

import logo from "../../public/logo.png";
import moment from "moment";
import { QRCode } from "react-qrcode-logo";
import React from "react";

const QueuePrint = React.forwardRef<HTMLDivElement, { arrivalData: any }>(({ arrivalData }, ref) => {
  console.log("QueuePrint Arrival Data:", arrivalData);
  if (!arrivalData) {
    return (
      <div ref={ref} className="p-4 text-center">
        Memuat data...
      </div>
    );
  }

  const splitedArrivalId = arrivalData.idKedatangan.split("-");
  return (
    <div
      ref={ref}
      className="bg-white text-black font-mono"
      style={{
        width: "80mm",
        padding: "5mm",
        color: "black",
      }}
    >
      <header className="text-center mb-3">
        <img src={logo.src} alt="Logo Perusahaan" className="w-14 mx-auto mb-2" />
        <p className="font-bold text-base">PT. PRADHA KARYA PERKASA</p>
        <p className="text-xs">Jl. Mayjen H. Soemadi No. 83-85, Kutorejo, Mojokerto</p>
      </header>

      <div className="border-t-2 border-dashed border-black my-3"></div>
      <main className="text-sm">
        <h2 className="text-base font-bold text-center mb-2">NO. ANTRIAN : {splitedArrivalId[1]}</h2>
        <table className="w-full">
          <tbody>
            <tr>
              <td className="font-semibold pr-2">Tanggal</td>
              <td>:</td>
              <td className="text-right">{moment(splitedArrivalId[0]).format("DD/MM/YYYY")}</td>
            </tr>
            <tr>
              <td className="font-semibold pr-2">Jam</td>
              <td>:</td>
              <td className="text-right">{moment(arrivalData.arrivalTime, "HH:mm").format("HH:mm")} WIB</td>
            </tr>
          </tbody>
        </table>
        <div className="border-t border-dashed border-black my-2"></div>
        <table className="w-full">
          <tbody>
            <tr>
              <td className="font-semibold w-28 pr-2">Nama</td>
              <td>:</td>
              <td className="text-right">{arrivalData.supplier.name}</td>
            </tr>
            <tr>
              <td className="font-semibold pr-2">No. Polisi</td>
              <td>:</td>
              <td className="text-right">{arrivalData.nopol}</td>
            </tr>
            <tr>
              <td className="font-semibold pr-2">Keterangan</td>
              <td>:</td>
              <td className="text-right">{"Kirim bahan baku"}</td>
            </tr>
          </tbody>
        </table>
      </main>
      <div className="flex flex-row justify-between my-4">
        <section className="flex flex-col items-center justify-between h-full">
          <QRCode logoImage={logo.src} logoPadding={4} size={100} value={`https://app.pradha.co.id/guest-accept/${arrivalData.idKedatangan}`} />
          <p className="text-xs text-center">Scan oleh security</p>
        </section>
        <footer className="mt-4 text-xs flex flex-col">
          <div className="text-center flex flex-col items-center justify-between p-2 h-full">
            <p className="font-bold">Security</p>
            <p>(.............)</p>
          </div>
        </footer>
      </div>
      <div className="border-t-2 border-dashed border-black my-3"></div>
      <p className="text-center text-xs font-bold mt-4">Wajib verifikasi ke security sebelum meninggalkan pabrik.</p>
    </div>
  );
});

export default QueuePrint;

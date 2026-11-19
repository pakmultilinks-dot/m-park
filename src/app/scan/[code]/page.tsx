import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ScanClient from "./ScanClient";

export default async function ScanPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const qr = await db.qrCode.findUnique({ where: { code: code.toUpperCase() }, include: { vehicle: true } });
  if (!qr) notFound();
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-950 text-white">
      <div className="max-w-md mx-auto px-4 py-6">
        <header className="text-center">
          <p className="text-2xl font-black tracking-wide">M-PARK</p>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-green-200 mt-1">SMART VEHICLE COMMUNICATION SYSTEM</p>
          <p className="text-green-300 text-sm font-semibold mt-2">Scan | Connect | Move</p>
        </header>
        <div className="mt-5">
          <ScanClient code={qr.code} qrStatus={qr.status} vehicle={qr.vehicle ? { plate: qr.vehicle.plate, make: qr.vehicle.make, model: qr.vehicle.model, year: qr.vehicle.year, color: qr.vehicle.color } : null} />
        </div>
        <p className="text-center text-green-200 text-xs mt-6">M-Park never shares your number or personal data with the vehicle owner.</p>
      </div>
    </main>
  );
}

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ScanClient from "./ScanClient";

export default async function ScanPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const qr = await db.qrCode.findUnique({ where: { code: code.toUpperCase() }, include: { vehicle: true } });
  if (!qr) notFound();
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-lg mx-auto">
        <p className="text-teal-700 font-bold text-sm">M-Park - QR {qr.code}</p>
        <h1 className="text-2xl font-bold mt-2">Contact this car owner</h1>
        <div className="mt-4">
          <ScanClient code={qr.code} qrStatus={qr.status} vehicle={qr.vehicle ? { plate: qr.vehicle.plate, make: qr.vehicle.make, model: qr.vehicle.model, year: qr.vehicle.year, color: qr.vehicle.color } : null} />
        </div>
      </div>
    </main>
  );
}

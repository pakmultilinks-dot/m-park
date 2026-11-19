import Link from "next/link";
import { db } from "@/lib/db";
import OrderClient from "./OrderClient";

export default async function OrderPage() {
  const product = await db.product.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" } });
  return (
    <main className="min-h-screen bg-green-950 text-white">
      <div className="max-w-md mx-auto px-4 py-10">
        <p className="text-2xl font-black tracking-wide text-center">M-PARK</p>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-green-200 mt-1 text-center">SMART VEHICLE COMMUNICATION SYSTEM</p>
        <h1 className="text-2xl font-bold text-center mt-6">Buy your QR sticker</h1>
        <p className="text-green-100 text-sm text-center mt-2">Scan | Connect | Move. One sticker, one vehicle, permanently linked after registration.</p>
        <div className="mt-6 text-slate-900">
          {product ? <OrderClient pricePkr={product.pricePkr} productName={product.name} /> : <p className="card">Sticker sales are not open yet. Contact M-Park.</p>}
        </div>
        <p className="text-center mt-6"><Link href="/" className="text-green-300 font-semibold text-sm">Back to home</Link></p>
      </div>
    </main>
  );
}

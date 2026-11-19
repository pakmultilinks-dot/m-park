"use client";

import { useState } from "react";
import Link from "next/link";

export default function OrderClient({ pricePkr, productName }: { pricePkr: number; productName: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [plate, setPlate] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ stickerCode: string; pricePkr: number } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ buyerName: name, buyerPhone: phone, deliveryAddress: address, plate }) });
    const data = await res.json().catch(() => ({}));
    if (!data.ok) { setError(data.error || "Could not place the order."); return; }
    setDone({ stickerCode: data.stickerCode, pricePkr: data.pricePkr });
  }

  if (done) {
    return (
      <div className="card text-center space-y-3">
        <p className="text-2xl">✓</p>
        <h2 className="font-bold text-lg">Order placed</h2>
        <p className="text-slate-600 text-sm">Your M-Park QR sticker code is <strong>{done.stickerCode}</strong>. Price: <strong>PKR {done.pricePkr}</strong>. Payment status: <strong>Unpaid</strong>.</p>
        <p className="text-slate-600 text-sm">Pay by JazzCash, Easypaisa or bank transfer, then M-Park will confirm your payment and ship the sticker. After it arrives, register your vehicle with code {done.stickerCode} and the sticker will be permanently linked to your vehicle.</p>
        <Link href="/register" className="btn-primary w-full">Register your vehicle</Link>
        <Link href="/" className="text-green-700 font-semibold text-sm inline-block">Back to home</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div>
        <h2 className="font-bold text-lg">{productName} - PKR {pricePkr}</h2>
        <p className="text-slate-600 text-sm mt-1">Price to be confirmed with the client. One sticker, one unique QR code, permanently linked to your vehicle after registration.</p>
      </div>
      {error && <p className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm">{error}</p>}
      <div><label className="label">Your name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} required /></div>
      <div><label className="label">Mobile number</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 0000000" required /></div>
      <div><label className="label">Vehicle plate (optional now, needed at registration)</label><input className="input" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="LEK 7982" /></div>
      <div><label className="label">Delivery address</label><textarea className="input" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} required /></div>
      <button className="btn-primary w-full py-3" type="submit">Order Now - PKR {pricePkr}</button>
      <p className="text-slate-500 text-xs text-center">Pay after ordering. M-Park confirms payment before shipping.</p>
    </form>
  );
}

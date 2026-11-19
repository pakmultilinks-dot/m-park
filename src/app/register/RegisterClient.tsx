"use client";

import { useState } from "react";
import Link from "next/link";

type Plan = { id: string; name: string; pricePkr: number; durationMonths: number };

export default function RegisterClient({ plans }: { plans: Plan[] }) {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [qrInfo, setQrInfo] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2022");
  const [color, setColor] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.id || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [devCode, setDevCode] = useState("");

  async function checkQr(e: React.FormEvent) {
    e.preventDefault(); setError(""); setQrInfo("");
    const res = await fetch(`/api/qr/${encodeURIComponent(code.trim().toUpperCase())}`);
    const data = await res.json();
    if (!data.ok) { setError(data.error || "QR code not found."); return; }
    if (data.assigned) { setError("This QR code is already assigned to a vehicle."); return; }
    setQrInfo(`QR code ${data.code} is valid and unassigned, batch ${data.batch}.`);
    setStep(2);
  }

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault(); setError(""); setInfo(""); setDevCode("");
    if (!name || !phone || !plate || !make || !model || !color || !planId) { setError("All fields are required."); return; }
    const res = await fetch("/api/otp/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, purpose: "register" }) });
    const data = await res.json();
    if (!data.ok) { setError(data.error || "Could not send OTP."); return; }
    setStep(3);
    if (data.devCode) { setDevCode(String(data.devCode)); setInfo("Dev mode only: no SMS provider is configured yet, so your OTP is shown here. In production it will arrive by SMS."); }
    else setInfo("OTP sent by SMS. Enter it below.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: code.trim().toUpperCase(), name, phone, otp, plate, make, model, year: Number(year), color, planId }) });
    const data = await res.json();
    if (!data.ok) { setError(data.error || "Registration failed."); return; }
    window.location.href = "/customer";
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-lg">
        <Link href="/" className="text-teal-700 font-semibold text-sm">Back to home</Link>
        <h1 className="text-2xl font-bold mt-3">Register your vehicle</h1>
        <p className="text-slate-600 text-sm mt-1">Step {step} of 3: {step === 1 ? "Verify your QR code" : step === 2 ? "Vehicle and owner details" : "Verify your mobile with OTP"}</p>
        {error && <p className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 mt-4 text-sm">{error}</p>}
        {info && <p className="bg-blue-50 text-blue-800 border border-blue-200 rounded-lg px-3 py-2 mt-4 text-sm">{info}</p>}
        {devCode && <p className="bg-amber-50 text-amber-900 border border-amber-200 rounded-lg px-3 py-2 mt-3 text-sm">Dev OTP only: <strong>{devCode}</strong></p>}
        {qrInfo && <p className="bg-green-50 text-green-800 border border-green-200 rounded-lg px-3 py-2 mt-4 text-sm">{qrInfo}</p>}
        {step === 1 && (
          <form onSubmit={checkQr} className="mt-5 space-y-4">
            <div><label className="label">QR code on your sticker</label><input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="MPK-1009" required /></div>
            <button className="btn-primary w-full" type="submit">Verify QR code</button>
            <p className="text-slate-500 text-xs">Seeded unassigned codes include MPK-1009 to MPK-1050 and MPK-1051 to MPK-1100.</p>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={requestOtp} className="mt-5 space-y-4">
            <div><label className="label">Your name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div><label className="label">Mobile number</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 0000000" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Plate</label><input className="input" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="LEA-24-1234" required /></div>
              <div><label className="label">Year</label><input className="input" type="number" value={year} onChange={(e) => setYear(e.target.value)} required /></div>
              <div><label className="label">Make</label><input className="input" value={make} onChange={(e) => setMake(e.target.value)} placeholder="Toyota" required /></div>
              <div><label className="label">Model</label><input className="input" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Corolla" required /></div>
              <div><label className="label">Color</label><input className="input" value={color} onChange={(e) => setColor(e.target.value)} placeholder="White" required /></div>
              <div><label className="label">Plan</label><select className="input" value={planId} onChange={(e) => setPlanId(e.target.value)}>{plans.map((p) => <option key={p.id} value={p.id}>{p.name} - PKR {p.pricePkr}</option>)}</select></div>
            </div>
            <button className="btn-primary w-full" type="submit">Send OTP to my mobile</button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div><label className="label">OTP sent to {phone}</label><input className="input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6 digit code" required /></div>
            <button className="btn-primary w-full" type="submit">Verify OTP and register</button>
          </form>
        )}
      </div>
    </main>
  );
}

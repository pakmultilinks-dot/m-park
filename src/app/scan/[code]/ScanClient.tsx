"use client";

import { useState } from "react";
import Link from "next/link";

type VehicleInfo = { plate: string; make: string; model: string; year: number; color: string };
type Result = { ownerName: string; ownerPhone: string; emergency: { name: string; phone: string; relationship: string | null } | null; vehicle: VehicleInfo };

export default function ScanClient({ code, vehicle, qrStatus }: { code: string; vehicle: VehicleInfo | null; qrStatus: string }) {
  const [step, setStep] = useState<"form" | "otp" | "done">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [devCode, setDevCode] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault(); setError(""); setInfo(""); setDevCode("");
    const res = await fetch("/api/otp/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, purpose: `scan:${code}` }) });
    const data = await res.json();
    if (!data.ok) { setError(data.error || "Could not send OTP."); return; }
    setStep("otp");
    if (data.devCode) { setDevCode(String(data.devCode)); setInfo("Dev mode only: no SMS provider is configured yet, so your OTP is shown here. In production it will arrive by SMS."); }
    else setInfo("OTP sent by SMS. Enter it below.");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const res = await fetch(`/api/scan/${code}/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scannerName: name, scannerPhone: phone, message, otp }) });
    const data = await res.json();
    if (!data.ok) { setError(data.error || "Verification failed."); return; }
    setResult(data);
    setStep("done");
  }

  if (!vehicle) {
    return <p className="text-slate-600">This QR code is not linked to a vehicle yet.</p>;
  }
  if (qrStatus !== "ACTIVE") {
    return <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">This QR sticker is {qrStatus.toLowerCase()}. Contact M-Park for help.</p>;
  }

  return (
    <div>
      <div className="card">
        <p className="text-slate-500 text-sm">Car found</p>
        <h2 className="text-xl font-bold mt-1">{vehicle.plate} - {vehicle.make} {vehicle.model} {vehicle.year}, {vehicle.color}</h2>
        <p className="text-slate-600 text-sm mt-1">The owner phone number is hidden until you verify with OTP.</p>
      </div>
      {error && <p className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 mt-4 text-sm">{error}</p>}
      {info && <p className="bg-blue-50 text-blue-800 border border-blue-200 rounded-lg px-3 py-2 mt-4 text-sm">{info}</p>}
      {devCode && <p className="bg-amber-50 text-amber-900 border border-amber-200 rounded-lg px-3 py-2 mt-3 text-sm">Dev OTP only: <strong>{devCode}</strong></p>}
      {step === "form" && (
        <form onSubmit={requestOtp} className="card mt-4 space-y-4">
          <div><label className="label">Your name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div><label className="label">Your mobile number</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 0000000" required /></div>
          <div><label className="label">Message for the owner</label><textarea className="input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your car is blocking my driveway, please move it." required /></div>
          <button className="btn-primary w-full" type="submit">Send OTP to my mobile</button>
        </form>
      )}
      {step === "otp" && (
        <form onSubmit={verify} className="card mt-4 space-y-4">
          <div><label className="label">OTP sent to {phone}</label><input className="input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6 digit code" required /></div>
          <button className="btn-primary w-full" type="submit">Verify OTP and contact owner</button>
        </form>
      )}
      {step === "done" && result && (
        <div className="card mt-4 space-y-3">
          <h2 className="font-bold text-lg">Owner: {result.ownerName}</h2>
          <p className="text-slate-600 text-sm">Your request was sent to the owner and saved in M-Park.</p>
          <div className="flex flex-wrap gap-3">
            <a className="btn-primary" href={`tel:${result.ownerPhone}`}>Call owner</a>
            <a className="btn-secondary" href={`sms:${result.ownerPhone}?body=${encodeURIComponent(message)}`}>Text owner</a>
          </div>
          <p className="text-slate-600 text-sm">Owner number: {result.ownerPhone}</p>
          {result.emergency && (
            <div className="border-t pt-3">
              <p className="font-semibold">Emergency contact: {result.emergency.name}{result.emergency.relationship ? ` (${result.emergency.relationship})` : ""}</p>
              <a className="btn-secondary mt-2 inline-block" href={`tel:${result.emergency.phone}`}>Call emergency contact</a>
            </div>
          )}
          <Link href="/" className="text-teal-700 font-semibold text-sm inline-block mt-2">Back to home</Link>
        </div>
      )}
    </div>
  );
}

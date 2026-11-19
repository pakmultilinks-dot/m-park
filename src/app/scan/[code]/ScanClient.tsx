"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type VehicleInfo = { plate: string; make: string; model: string; year: number; color: string };

const REASONS = ["Car is blocked", "Lights are on", "Traffic blocked", "Important message"];

export default function ScanClient({ code, vehicle, qrStatus }: { code: string; vehicle: VehicleInfo | null; qrStatus: string }) {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"options" | "alert" | "calling" | "alertDone">("options");
  const [reason, setReason] = useState(REASONS[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  async function callOwner() {
    setError("");
    const res = await fetch(`/api/scan/${code}/call`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!data.ok) { setError(data.error || "Could not connect the call."); return; }
    setView("calling");
  }

  async function sendAlert(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const fullMessage = message.trim() ? `${reason}: ${message.trim()}` : reason;
    const res = await fetch(`/api/scan/${code}/alert`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason, message: fullMessage }) });
    const data = await res.json().catch(() => ({}));
    if (!data.ok) { setError(data.error || "Could not send the alert."); return; }
    setInfo("Alert sent. Message delivered instantly and anonymously.");
    setView("alertDone");
  }

  if (!vehicle) {
    return (
      <div className="bg-white text-slate-900 rounded-2xl p-5 shadow">
        <p className="font-bold">QR code not linked yet</p>
        <p className="text-slate-600 text-sm mt-1">This M-Park QR sticker is not linked to a vehicle yet. Contact M-Park for help.</p>
      </div>
    );
  }
  if (qrStatus !== "ACTIVE") {
    return (
      <div className="bg-white text-red-700 rounded-2xl p-5 shadow">
        <p className="font-bold">This QR sticker is {qrStatus.toLowerCase()}.</p>
        <p className="text-sm mt-1">Contact M-Park for help.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white text-slate-900 rounded-2xl p-5 shadow text-center">
        <p className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-700 text-2xl font-bold">✓</p>
        <p className="text-xs font-bold tracking-widest text-green-700 mt-3">M-PARK VEHICLE IDENTIFIED</p>
        <p className="text-4xl font-black tracking-wide mt-2">{vehicle.plate}</p>
        <p className="text-slate-600 font-semibold mt-1">{vehicle.color} {vehicle.make} {vehicle.model}</p>
        {loading && <p className="text-slate-500 text-sm mt-4">LOADING M-PARK OPTIONS...</p>}
      </div>

      {!loading && view === "options" && (
        <div className="mt-4 space-y-3">
          <button onClick={callOwner} className="w-full bg-green-400 hover:bg-green-300 text-green-950 font-bold text-lg py-4 rounded-2xl shadow">Call Owner</button>
          <button onClick={() => setView("alert")} className="w-full bg-green-500 hover:bg-green-400 text-white font-bold text-lg py-4 rounded-2xl shadow">Send M-Park Alert</button>
          <p className="text-green-100 text-sm text-center px-2 pt-1">Message delivered instantly and anonymously. Your identity is protected. M-Park never shares your number or personal data with the vehicle owner.</p>
          <p className="text-green-200 text-xs text-center px-2">Call goes through M-Park Secure Relay. The owner number is never shown publicly.</p>
        </div>
      )}

      {!loading && view === "alert" && (
        <form onSubmit={sendAlert} className="bg-white text-slate-900 rounded-2xl p-5 shadow mt-4 space-y-4">
          <h2 className="font-bold text-lg">Send M-Park Alert</h2>
          <p className="text-slate-600 text-sm">Anonymous. No name, no phone number, no sign up needed.</p>
          <div className="grid grid-cols-2 gap-2">
            {REASONS.map((r) => (
              <button key={r} type="button" onClick={() => setReason(r)} className={reason === r ? "bg-green-600 text-white font-semibold px-3 py-2 rounded-lg text-sm" : "bg-slate-100 hover:bg-slate-200 font-semibold px-3 py-2 rounded-lg text-sm"}>{r}</button>
            ))}
          </div>
          <div>
            <label className="label">Message (optional)</label>
            <textarea className="input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Add a short message for the owner, for example: your car is blocking my driveway." rows={3} />
          </div>
          <button className="btn-primary w-full py-3" type="submit">Send Alert Anonymously</button>
          <button type="button" onClick={() => setView("options")} className="btn-secondary w-full">Back</button>
        </form>
      )}

      {!loading && view === "calling" && (
        <div className="bg-white text-slate-900 rounded-2xl p-5 shadow mt-4 text-center space-y-3">
          <p className="text-xs font-bold tracking-widest text-green-700">M-PARK SECURE CALL CONNECTING</p>
          <p className="font-bold text-lg">Routing through M-Park Secure Relay</p>
          <p className="text-slate-600 text-sm">Owner number: +92 300 ••• •••• (masked)</p>
          <p className="text-slate-600 text-sm">Your number is never shared with the owner. The owner number is never shown to you. The call is connected by M-Park Secure Relay.</p>
          <p className="text-slate-500 text-xs">Live relay calling needs the telephony provider. Until it is connected, this screen shows the relay route and logs the call for the owner and admin.</p>
          <button onClick={() => setView("options")} className="btn-secondary w-full">Back to options</button>
          <Link href="/" className="text-green-700 font-semibold text-sm inline-block">Back to home</Link>
        </div>
      )}

      {!loading && view === "alertDone" && (
        <div className="bg-white text-slate-900 rounded-2xl p-5 shadow mt-4 text-center space-y-3">
          <p className="text-2xl">✓</p>
          <h2 className="font-bold text-lg">Alert sent</h2>
          <p className="text-slate-600 text-sm">{info}</p>
          <p className="text-slate-600 text-sm">The owner has been notified instantly and will come to move the car.</p>
          <button onClick={() => setView("options")} className="btn-secondary w-full">Back to options</button>
          <Link href="/" className="text-green-700 font-semibold text-sm inline-block">Back to home</Link>
        </div>
      )}

      {error && <p className="bg-red-100 text-red-800 rounded-lg px-3 py-2 mt-4 text-sm">{error}</p>}
    </div>
  );
}

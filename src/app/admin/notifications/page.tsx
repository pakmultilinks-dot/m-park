import { db } from "@/lib/db";

export default async function AdminNotifications() {
  const list = await db.notification.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 50 });
  const scans = await db.scanLog.findMany({ include: { vehicle: true }, orderBy: { createdAt: "desc" }, take: 20 });
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="card">
        <h2 className="font-bold text-lg">Notifications monitoring</h2>
        <div className="mt-4 space-y-3">
          {list.map((n) => (
            <div key={n.id} className="border-b pb-2"><p className="font-semibold">{n.title} - {n.user.name}</p><p className="text-slate-600 text-sm">{n.body}</p><p className="text-slate-400 text-xs">{n.createdAt.toISOString().slice(0, 16).replace("T", " ")}</p></div>
          ))}
        </div>
      </div>
      <div className="card">
        <h2 className="font-bold text-lg">Scan log</h2>
        <div className="mt-4 space-y-3">
          {scans.length === 0 && <p className="text-slate-600 text-sm">No scans logged yet.</p>}
          {scans.map((s) => (
            <div key={s.id} className="border-b pb-2"><p className="font-semibold">{s.scannerName || "Unknown"} scanned {s.vehicle.plate}</p><p className="text-slate-500 text-sm">{s.scannerPhone || ""} - Verified: {s.verified ? "Yes" : "No"} - {s.createdAt.toISOString().slice(0, 16).replace("T", " ")}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}

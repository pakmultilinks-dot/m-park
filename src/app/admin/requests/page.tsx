import { db } from "@/lib/db";

export default async function AdminRequests() {
  const list = await db.contactRequest.findMany({ include: { vehicle: { include: { owner: true } } }, orderBy: { createdAt: "desc" } });
  return (
    <div className="card">
      <h2 className="font-bold text-lg">Contact requests</h2>
      <p className="text-slate-600 text-sm">All contact requests from QR scans. Customers approve or ignore them in their own dashboard.</p>
      <div className="mt-4 space-y-3">
        {list.length === 0 && <p className="text-slate-600 text-sm">No contact requests yet.</p>}
        {list.map((r) => (
          <div key={r.id} className="border rounded-lg p-4">
            <p><strong>{r.scannerName}</strong> - {r.scannerPhone} <span className={r.status === "PENDING" ? "badge-amber" : r.status === "APPROVED" ? "badge-green" : "badge-grey"}>{r.status}</span></p>
            <p className="text-slate-600 text-sm mt-1">{r.message}</p>
            <p className="text-slate-400 text-xs mt-1">{r.vehicle.plate} - Owner {r.vehicle.owner.name} - {r.createdAt.toISOString().slice(0, 16).replace("T", " ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

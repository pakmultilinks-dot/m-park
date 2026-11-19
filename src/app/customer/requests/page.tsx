import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { customerRequestAction } from "@/lib/actions";

export default async function CustomerRequests() {
  const s = await getSession();
  if (!s) return null;
  const list = await db.contactRequest.findMany({ where: { vehicle: { ownerId: s.id } }, include: { vehicle: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="card">
      <h2 className="font-bold text-lg">Contact requests</h2>
      <p className="text-slate-600 text-sm">Requests from people who scanned your QR sticker.</p>
      <div className="mt-4 space-y-4">
        {list.length === 0 && <p className="text-slate-600 text-sm">No contact requests yet.</p>}
        {list.map((r) => (
          <div key={r.id} className="border rounded-lg p-4">
            <p><strong>{r.scannerName}</strong> - {r.scannerPhone} <span className={r.status === "PENDING" ? "badge-amber" : r.status === "APPROVED" ? "badge-green" : "badge-grey"}>{r.status}</span></p>
            <p className="text-slate-600 text-sm mt-1">{r.message}</p>
            <p className="text-slate-400 text-xs mt-1">{r.vehicle.plate} - {r.createdAt.toISOString().slice(0, 16).replace("T", " ")}</p>
            {r.status === "PENDING" && (
              <div className="flex gap-2 mt-3">
                <form action={customerRequestAction.bind(null, r.id, "APPROVED")}><button className="btn-primary" type="submit">Approve</button></form>
                <form action={customerRequestAction.bind(null, r.id, "IGNORED")}><button className="btn-secondary" type="submit">Ignore</button></form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

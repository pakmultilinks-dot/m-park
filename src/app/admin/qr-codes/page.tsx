import { db } from "@/lib/db";
import { adminQrStatus } from "@/lib/actions";

export default async function AdminQrCodes() {
  const list = await db.qrCode.findMany({ include: { vehicle: { include: { owner: true } } }, orderBy: { code: "asc" } });
  return (
    <div className="card">
      <h2 className="font-bold text-lg">QR Codes</h2>
      <p className="text-slate-600 text-sm">{list.length} codes in the database. Change a status to activate, deactivate, or mark a sticker lost.</p>
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th className="py-2">Code</th><th>Batch</th><th>Vehicle</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {list.map((q) => (
              <tr key={q.id} className="border-t">
                <td className="py-3 font-semibold">{q.code}</td>
                <td>{q.batch}</td>
                <td>{q.vehicle ? `${q.vehicle.plate} - ${q.vehicle.owner.name}` : "Unassigned"}</td>
                <td><span className={q.status === "ACTIVE" ? "badge-green" : q.status === "LOST" ? "badge-red" : "badge-grey"}>{q.status}</span></td>
                <td>
                  <div className="flex gap-1">
                    <form action={adminQrStatus.bind(null, q.id, "ACTIVE")}><button className="btn-secondary" type="submit">Activate</button></form>
                    <form action={adminQrStatus.bind(null, q.id, "INACTIVE")}><button className="btn-secondary" type="submit">Deactivate</button></form>
                    <form action={adminQrStatus.bind(null, q.id, "LOST")}><button className="btn-danger" type="submit">Lost</button></form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

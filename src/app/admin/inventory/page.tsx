import { db } from "@/lib/db";
import { adminGenerateBatch } from "@/lib/actions";

export default async function AdminInventory() {
  const batches = await db.qrCode.groupBy({ by: ["batch"], _count: { _all: true } });
  const total = await db.qrCode.count();
  const assigned = await db.qrCode.count({ where: { vehicleId: { not: null } } });
  const rows = [];
  for (const b of batches) {
    const assignedInBatch = await db.qrCode.count({ where: { batch: b.batch, vehicleId: { not: null } } });
    const codes = await db.qrCode.findMany({ where: { batch: b.batch }, orderBy: { code: "asc" }, select: { code: true } });
    rows.push({ batch: b.batch, total: b._count._all, assigned: assignedInBatch, unassigned: b._count._all - assignedInBatch, from: codes[0]?.code, to: codes[codes.length - 1]?.code });
  }
  rows.sort((a, b) => a.batch.localeCompare(b.batch));
  return (
    <div className="card">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div><h2 className="font-bold text-lg">QR Inventory</h2><p className="text-slate-600 text-sm">Sticker stock, batches, assigned and unassigned codes.</p></div>
        <form action={adminGenerateBatch.bind(null, 50)}><button className="btn-primary" type="submit">Generate new batch (50 codes)</button></form>
      </div>
      <div className="grid md:grid-cols-4 gap-4 mt-5">
        <div className="card"><p className="text-3xl font-bold">{total}</p><p className="text-slate-600 text-sm">Total stickers in stock</p></div>
        <div className="card"><p className="text-3xl font-bold">{assigned}</p><p className="text-slate-600 text-sm">Assigned</p></div>
        <div className="card"><p className="text-3xl font-bold">{total - assigned}</p><p className="text-slate-600 text-sm">Unassigned</p></div>
        <div className="card"><p className="text-3xl font-bold">{rows.length}</p><p className="text-slate-600 text-sm">Batches</p></div>
      </div>
      <table className="w-full text-sm mt-5">
        <thead><tr className="text-left text-slate-500"><th className="py-2">Batch</th><th>Code range</th><th>Total</th><th>Assigned</th><th>Unassigned</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.batch} className="border-t">
              <td className="py-3 font-semibold">{r.batch}</td>
              <td>{r.from} to {r.to}</td>
              <td>{r.total}</td>
              <td>{r.assigned}</td>
              <td>{r.unassigned}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-slate-500 text-sm mt-3">Generating a batch creates real codes in the database that can be assigned in registration or in Add Customer.</p>
    </div>
  );
}

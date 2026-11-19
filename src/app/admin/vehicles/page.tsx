import { db } from "@/lib/db";

export default async function AdminVehicles() {
  const list = await db.vehicle.findMany({ include: { owner: true, qrCodes: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="card">
      <h2 className="font-bold text-lg">Vehicles</h2>
      <p className="text-slate-600 text-sm">{list.length} registered vehicles in the database.</p>
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th className="py-2">Plate</th><th>Vehicle</th><th>Owner</th><th>QR code</th></tr></thead>
          <tbody>
            {list.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="py-3 font-semibold">{v.plate}</td>
                <td>{v.make} {v.model} {v.year}, {v.color}</td>
                <td>{v.owner.name}<br /><span className="text-slate-500">{v.owner.phone}</span></td>
                <td>{v.qrCodes[0]?.code || "-"} {v.qrCodes[0] && <span className="badge-green">{v.qrCodes[0].status}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

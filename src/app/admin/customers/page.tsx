import { db } from "@/lib/db";
import { adminAddCustomer, adminToggleBlock } from "@/lib/actions";

export default async function AdminCustomers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER", ...(q ? { OR: [{ name: { contains: q } }, { phone: { contains: q } }, { vehicles: { some: { plate: { contains: q } } } }] } : {}) },
    include: { vehicles: { include: { qrCodes: true } }, subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });
  const plans = await db.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: { pricePkr: "asc" } });
  const freeQr = await db.qrCode.findMany({ where: { vehicleId: null }, orderBy: { code: "asc" }, take: 50 });
  return (
    <div>
      <div className="card">
        <h2 className="font-bold text-lg">Customers</h2>
        <p className="text-slate-600 text-sm">Manage all registered customers, plans and status. Saved in the database.</p>
        <form method="get" className="flex gap-2 mt-4">
          <input name="q" defaultValue={q} placeholder="Search name, phone or plate" className="input" />
          <button className="btn-secondary" type="submit">Search</button>
        </form>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500"><th className="py-2">Customer</th><th>Vehicle</th><th>QR code</th><th>Plan</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {customers.map((c) => {
                const v = c.vehicles[0];
                const sub = c.subscriptions[0];
                return (
                  <tr key={c.id} className="border-t">
                    <td className="py-3"><p className="font-semibold">{c.name}</p><p className="text-slate-500">{c.phone}</p></td>
                    <td>{v ? <span>{v.plate}<br /><span className="text-slate-500">{v.make} {v.model} {v.year}, {v.color}</span></span> : "-"}</td>
                    <td>{v?.qrCodes[0]?.code || "-"} <span className={v?.qrCodes[0]?.status === "ACTIVE" ? "badge-green" : "badge-grey"}>{v?.qrCodes[0]?.status || ""}</span></td>
                    <td>{sub ? <span>{sub.plan.name}<br /><span className="text-slate-500">PKR {sub.plan.pricePkr} - {sub.status}</span></span> : "No plan"}</td>
                    <td>{c.isBlocked ? <span className="badge-red">Blocked</span> : <span className="badge-green">Active</span>}</td>
                    <td>
                      <form action={adminToggleBlock.bind(null, c.id, !c.isBlocked)}>
                        <button className={c.isBlocked ? "btn-primary" : "btn-danger"} type="submit">{c.isBlocked ? "Unblock" : "Block"}</button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-slate-500 text-sm mt-2">{customers.length} customers shown.</p>
        </div>
      </div>
      <div className="card mt-5 max-w-2xl">
        <h3 className="font-bold">Add customer</h3>
        <form action={adminAddCustomer} className="grid md:grid-cols-2 gap-3 mt-4">
          <div><label className="label">Name</label><input className="input" name="name" required /></div>
          <div><label className="label">Phone</label><input className="input" name="phone" placeholder="+92 300 0000000" required /></div>
          <div><label className="label">Plate</label><input className="input" name="plate" required /></div>
          <div><label className="label">Year</label><input className="input" name="year" type="number" defaultValue="2022" required /></div>
          <div><label className="label">Make</label><input className="input" name="make" required /></div>
          <div><label className="label">Model</label><input className="input" name="model" required /></div>
          <div><label className="label">Color</label><input className="input" name="color" required /></div>
          <div><label className="label">Plan</label><select className="input" name="planId">{plans.map((p) => <option key={p.id} value={p.id}>{p.name} - PKR {p.pricePkr}</option>)}</select></div>
          <div><label className="label">QR code (unassigned)</label><select className="input" name="qrCode">{freeQr.map((x) => <option key={x.id} value={x.code}>{x.code} ({x.batch})</option>)}</select></div>
          <button className="btn-primary md:col-span-2" type="submit">Add customer</button>
        </form>
      </div>
    </div>
  );
}

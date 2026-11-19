import { db } from "@/lib/db";
import { adminPlanCreate, adminPlanUpdate } from "@/lib/actions";

export default async function AdminSubscriptions() {
  const plans = await db.subscriptionPlan.findMany({ orderBy: { pricePkr: "asc" } });
  const subs = await db.subscription.findMany({ include: { user: true, plan: true }, orderBy: { createdAt: "desc" }, take: 20 });
  return (
    <div>
      <div className="card">
        <h2 className="font-bold text-lg">Subscription plans</h2>
        <p className="text-slate-600 text-sm">Prices in PKR. Create a plan or change a price, it applies to new subscriptions.</p>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {plans.map((p) => (
            <div key={p.id} className="border rounded-lg p-4">
              <p className="font-bold">{p.name} {!p.isActive && <span className="badge-grey">Inactive</span>}</p>
              <p className="text-2xl font-bold mt-1">PKR {p.pricePkr}</p>
              <p className="text-slate-600 text-sm">{p.durationMonths} month{p.durationMonths > 1 ? "s" : ""} - {p.description || ""}</p>
              <form action={adminPlanUpdate} className="flex gap-2 mt-3">
                <input type="hidden" name="id" value={p.id} />
                <input className="input" name="pricePkr" type="number" defaultValue={p.pricePkr} />
                <select className="input" name="isActive" defaultValue={p.isActive ? "true" : "false"}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <button className="btn-primary" type="submit">Save</button>
              </form>
            </div>
          ))}
        </div>
      </div>
      <div className="card mt-5 max-w-lg">
        <h3 className="font-bold">Create new plan</h3>
        <form action={adminPlanCreate} className="grid grid-cols-2 gap-3 mt-4">
          <div><label className="label">Name</label><input className="input" name="name" required /></div>
          <div><label className="label">Price PKR</label><input className="input" name="pricePkr" type="number" required /></div>
          <div><label className="label">Duration months</label><input className="input" name="durationMonths" type="number" defaultValue="1" required /></div>
          <div><label className="label">Description</label><input className="input" name="description" /></div>
          <button className="btn-primary col-span-2" type="submit">Create plan</button>
        </form>
      </div>
      <div className="card mt-5">
        <h3 className="font-bold">Recent subscriptions</h3>
        <div className="mt-3 space-y-2 text-sm">
          {subs.map((s) => <p key={s.id}>{s.user.name} - {s.plan.name} - PKR {s.plan.pricePkr} - {s.status} - {s.startDate.toISOString().slice(0, 10)} to {s.endDate.toISOString().slice(0, 10)}</p>)}
        </div>
        <p className="text-slate-500 text-sm mt-3">Subscriptions are created on registration and by the admin. Online payment is configured in the environment settings.</p>
      </div>
    </div>
  );
}

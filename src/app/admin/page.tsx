import { db } from "@/lib/db";

export default async function AdminOverview() {
  const [totalUsers, totalVehicles, activeQr, inactiveQr, pendingRequests] = await Promise.all([
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.vehicle.count(),
    db.qrCode.count({ where: { status: "ACTIVE" } }),
    db.qrCode.count({ where: { status: { not: "ACTIVE" } } }),
    db.contactRequest.count({ where: { status: "PENDING" } }),
  ]);
  const recentUsers = await db.user.findMany({ where: { role: "CUSTOMER" }, include: { vehicles: true }, orderBy: { createdAt: "desc" }, take: 5 });
  const recentScans = await db.scanLog.findMany({ include: { vehicle: true }, orderBy: { createdAt: "desc" }, take: 5 });
  const activeSubs = await db.subscription.count({ where: { status: "ACTIVE" } });
  return (
    <div>
      <p className="text-slate-600">All users, vehicles, QR codes and subscriptions at a glance. Data comes from the database.</p>
      <div className="grid md:grid-cols-4 gap-4 mt-5">
        <div className="card"><p className="text-3xl font-bold">{totalUsers}</p><p className="text-slate-600 text-sm">Total registered users</p></div>
        <div className="card"><p className="text-3xl font-bold">{totalVehicles}</p><p className="text-slate-600 text-sm">Total registered vehicles</p></div>
        <div className="card"><p className="text-3xl font-bold">{activeQr}</p><p className="text-slate-600 text-sm">Active QR codes</p><p className="text-slate-500 text-sm">{inactiveQr} inactive or lost</p></div>
        <div className="card"><p className="text-3xl font-bold">{pendingRequests}</p><p className="text-slate-600 text-sm">Pending contact requests</p><p className="text-slate-500 text-sm">{activeSubs} active subscriptions</p></div>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-5">
        <div className="card">
          <h3 className="font-bold">Recent registrations</h3>
          <div className="mt-3 space-y-3">
            {recentUsers.map((u) => <div key={u.id} className="border-b pb-2"><p className="font-semibold">{u.name} - {u.vehicles[0]?.plate || "No vehicle"}</p><p className="text-slate-500 text-sm">{u.phone} - Joined {u.createdAt.toISOString().slice(0, 10)}</p></div>)}
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold">Recent scans</h3>
          <div className="mt-3 space-y-3">
            {recentScans.length === 0 && <p className="text-slate-600 text-sm">No scans logged yet.</p>}
            {recentScans.map((s) => <div key={s.id} className="border-b pb-2"><p className="font-semibold">{s.scannerName || "Unknown"} scanned {s.vehicle.plate}</p><p className="text-slate-500 text-sm">{s.createdAt.toISOString().slice(0, 16).replace("T", " ")} - Verified: {s.verified ? "Yes" : "No"}</p></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

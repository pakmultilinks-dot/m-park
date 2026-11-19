import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { customerUpdateVehicle } from "@/lib/actions";

export default async function CustomerVehicle() {
  const s = await getSession();
  if (!s) return null;
  const vehicle = await db.vehicle.findFirst({ where: { ownerId: s.id }, include: { qrCodes: true } });
  if (!vehicle) return <p>No vehicle registered yet. Register one from the home page.</p>;
  return (
    <div className="card max-w-lg">
      <h2 className="font-bold text-lg">My vehicle</h2>
      <p className="text-slate-600 text-sm">Changes are saved in the database.</p>
      <form action={customerUpdateVehicle} className="space-y-4 mt-4">
        <input type="hidden" name="vehicleId" value={vehicle.id} />
        <div><label className="label">Plate</label><input className="input" name="plate" defaultValue={vehicle.plate} required /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Make</label><input className="input" name="make" defaultValue={vehicle.make} required /></div>
          <div><label className="label">Model</label><input className="input" name="model" defaultValue={vehicle.model} required /></div>
          <div><label className="label">Year</label><input className="input" name="year" type="number" defaultValue={vehicle.year} required /></div>
          <div><label className="label">Color</label><input className="input" name="color" defaultValue={vehicle.color} required /></div>
        </div>
        <p className="text-slate-600 text-sm">QR code: <strong>{vehicle.qrCodes[0]?.code || "None"}</strong> - {vehicle.qrCodes[0]?.status || ""}</p>
        <button className="btn-primary" type="submit">Save vehicle</button>
      </form>
    </div>
  );
}

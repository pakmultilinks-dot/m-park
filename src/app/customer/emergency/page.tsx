import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { customerEmergencyUpsert, customerEmergencyDelete } from "@/lib/actions";

export default async function CustomerEmergency() {
  const s = await getSession();
  if (!s) return null;
  const contact = await db.emergencyContact.findUnique({ where: { userId: s.id } });
  return (
    <div className="card max-w-lg">
      <h2 className="font-bold text-lg">Emergency contact</h2>
      <p className="text-slate-600 text-sm">Your emergency contact number is never shown on the scan page. If a scanner sends an alert, M-Park also notifies this contact through the secure system.</p>
      <form action={customerEmergencyUpsert} className="space-y-4 mt-4">
        <div><label className="label">Name</label><input className="input" name="name" defaultValue={contact?.name || ""} required /></div>
        <div><label className="label">Phone</label><input className="input" name="phone" defaultValue={contact?.phone || ""} required /></div>
        <div><label className="label">Relationship (optional)</label><input className="input" name="relationship" defaultValue={contact?.relationship || ""} /></div>
        <button className="btn-primary" type="submit">Save emergency contact</button>
      </form>
      {contact && (
        <form action={customerEmergencyDelete} className="mt-4">
          <button className="btn-danger" type="submit">Remove emergency contact</button>
        </form>
      )}
    </div>
  );
}

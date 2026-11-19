import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { markNotificationsRead } from "@/lib/actions";

export default async function CustomerNotifications() {
  const s = await getSession();
  if (!s) return null;
  const list = await db.notification.findMany({ where: { userId: s.id }, orderBy: { createdAt: "desc" } });
  return (
    <div className="card">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg">Notifications</h2>
        <form action={markNotificationsRead}><button className="btn-secondary" type="submit">Mark all read</button></form>
      </div>
      <div className="mt-4 space-y-3">
        {list.length === 0 && <p className="text-slate-600 text-sm">No notifications yet.</p>}
        {list.map((n) => (
          <div key={n.id} className="border-b pb-3">
            <p className="font-semibold">{n.title} {!n.isRead && <span className="badge-blue">Unread</span>}</p>
            <p className="text-slate-600 text-sm">{n.body}</p>
            <p className="text-slate-400 text-xs">{n.createdAt.toISOString().slice(0, 16).replace("T", " ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

import { db } from "@/lib/db";
import { adminOrderPayment, adminOrderStatus, adminProductPrice } from "@/lib/actions";

const STATUSES = ["ORDERED", "PRINTED", "SHIPPED", "DELIVERED", "ACTIVATED"] as const;

export default async function AdminOrders() {
  const orders = await db.stickerOrder.findMany({ orderBy: { createdAt: "desc" } });
  const product = await db.product.findFirst({ orderBy: { createdAt: "asc" } });
  const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.pricePkr, 0);
  return (
    <div>
      <p className="text-slate-600">QR sticker sales. This is the core M-Park business: sell the sticker, confirm payment, ship it, then it is permanently linked to the vehicle after registration.</p>
      <div className="grid md:grid-cols-3 gap-4 mt-5">
        <div className="card"><p className="text-3xl font-bold">{paidOrders.length}</p><p className="text-slate-600 text-sm">Total QR stickers sold (paid)</p><p className="text-slate-500 text-sm">{orders.length} orders in total</p></div>
        <div className="card"><p className="text-3xl font-bold">PKR {totalRevenue}</p><p className="text-slate-600 text-sm">Total revenue from sticker sales</p><p className="text-slate-500 text-sm">Paid orders only</p></div>
        <div className="card">
          <p className="text-3xl font-bold">PKR {product?.pricePkr ?? "-"}</p>
          <p className="text-slate-600 text-sm">Sticker price (to be confirmed with the client)</p>
          {product && (
            <form action={adminProductPrice} className="flex gap-2 mt-3">
              <input type="hidden" name="id" value={product.id} />
              <input className="input" name="pricePkr" type="number" defaultValue={product.pricePkr} min={1} />
              <button className="btn-primary" type="submit">Save price</button>
            </form>
          )}
        </div>
      </div>
      <div className="card mt-5 overflow-x-auto">
        <h3 className="font-bold">Orders</h3>
        {orders.length === 0 && <p className="text-slate-600 text-sm mt-2">No orders yet.</p>}
        <table className="w-full text-sm mt-3">
          <thead><tr className="text-left text-slate-500"><th className="py-2">Buyer</th><th>Plate</th><th>Sticker</th><th>Price</th><th>Payment</th><th>Order status</th><th>Actions</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="py-2"><strong>{o.buyerName}</strong><br /><span className="text-slate-500">{o.buyerPhone}</span><br /><span className="text-slate-500">{o.deliveryAddress}</span></td>
                <td>{o.plate || "-"}</td>
                <td>{o.stickerCode}</td>
                <td>PKR {o.pricePkr}</td>
                <td>{o.paymentStatus === "PAID" ? <span className="badge-green">Paid</span> : <span className="badge-amber">Unpaid</span>}{o.paymentMethod ? <span className="text-slate-500 block">{o.paymentMethod}</span> : null}</td>
                <td><span className="badge-grey">{o.orderStatus}</span></td>
                <td>
                  <form action={adminOrderPayment} className="inline">
                    <input type="hidden" name="id" value={o.id} />
                    <input type="hidden" name="paymentStatus" value={o.paymentStatus === "PAID" ? "UNPAID" : "PAID"} />
                    <button className="btn-secondary text-sm" type="submit">{o.paymentStatus === "PAID" ? "Mark Unpaid" : "Mark Paid"}</button>
                  </form>
                  <form action={adminOrderStatus} className="inline ml-2">
                    <input type="hidden" name="id" value={o.id} />
                    <select className="input inline-block w-auto" name="orderStatus" defaultValue={o.orderStatus}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="btn-primary text-sm ml-2" type="submit">Save status</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

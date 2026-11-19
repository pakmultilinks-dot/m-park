import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Buy a QR sticker. Creates a real StickerOrder in the database and reserves
// the next unassigned QR code for that order. Payment is confirmed by the
// admin after the customer pays by JazzCash, Easypaisa or bank transfer.
// Payment is confirmed by the admin after the customer pays. Online payment is configured in the environment settings, see README.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const buyerName = String(body.buyerName || "").trim();
  const buyerPhone = String(body.buyerPhone || "").trim();
  const deliveryAddress = String(body.deliveryAddress || "").trim();
  const plate = String(body.plate || "").trim().toUpperCase();
  const buyerEmail = String(body.buyerEmail || "").trim() || null;
  if (!buyerName || !buyerPhone || !deliveryAddress) {
    return NextResponse.json({ ok: false, error: "Name, phone and delivery address are required." }, { status: 400 });
  }
  const product = await db.product.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" } });
  if (!product) return NextResponse.json({ ok: false, error: "Sticker sales are not open yet. Contact M-Park." }, { status: 400 });
  if (plate && (await db.vehicle.findUnique({ where: { plate } }))) {
    return NextResponse.json({ ok: false, error: "This plate is already registered." }, { status: 400 });
  }
  const qr = await db.qrCode.findFirst({ where: { vehicleId: null, stickerOrder: null }, orderBy: { code: "asc" } });
  if (!qr) return NextResponse.json({ ok: false, error: "No QR stickers left in stock. Contact M-Park." }, { status: 400 });
  const order = await db.stickerOrder.create({
    data: { buyerName, buyerPhone, buyerEmail, deliveryAddress, plate: plate || null, stickerCode: qr.code, pricePkr: product.pricePkr, paymentStatus: "UNPAID", orderStatus: "ORDERED", qrCodeId: qr.id },
  });
  return NextResponse.json({ ok: true, orderId: order.id, stickerCode: qr.code, pricePkr: product.pricePkr, productName: product.name });
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Anonymous alert from a scanner. No OTP, no name, no phone required.
// Writes a ScanLog, a ContactRequest and a Notification for the customer.
export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const reason = String(body.reason || "Important message").trim();
  const message = String(body.message || reason).trim();
  const qr = await db.qrCode.findUnique({ where: { code: code.toUpperCase() }, include: { vehicle: true } });
  if (!qr || !qr.vehicle) return NextResponse.json({ ok: false, error: "This QR code is not linked to a vehicle." }, { status: 404 });
  if (qr.status !== "ACTIVE") return NextResponse.json({ ok: false, error: "This QR sticker is not active. Contact M-Park." }, { status: 400 });
  const vehicle = qr.vehicle;
  await db.scanLog.create({ data: { vehicleId: vehicle.id, scannerName: "Anonymous", scannerPhone: "Not shared", verified: false } });
  await db.contactRequest.create({ data: { vehicleId: vehicle.id, scannerName: "Anonymous", scannerPhone: "Not shared", message, status: "PENDING" } });
  await db.notification.create({ data: { userId: vehicle.ownerId, title: "M-Park Alert", body: `Anonymous alert for your car ${vehicle.plate}: ${message}` } });
  return NextResponse.json({ ok: true, message: "Alert sent anonymously." });
}

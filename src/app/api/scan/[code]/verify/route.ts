import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";

// Scanner flow: verify OTP for this scan, then reveal owner contact info.
// Creates a ScanLog, a ContactRequest and a Notification for the customer.
export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const scannerName = String(body.scannerName || "").trim();
  const scannerPhone = String(body.scannerPhone || "").trim();
  const message = String(body.message || "").trim();
  const otp = String(body.otp || "").trim();
  if (!scannerName || !scannerPhone || !message || !otp) {
    return NextResponse.json({ ok: false, error: "Name, phone, message and OTP are required." }, { status: 400 });
  }
  const qr = await db.qrCode.findUnique({ where: { code: code.toUpperCase() }, include: { vehicle: { include: { owner: { include: { emergency: true } } } } } });
  if (!qr || !qr.vehicle) return NextResponse.json({ ok: false, error: "This QR code is not linked to a vehicle." }, { status: 404 });
  if (qr.status !== "ACTIVE") return NextResponse.json({ ok: false, error: "This QR sticker is not active. Contact M-Park." }, { status: 400 });
  const v = await verifyOtp(scannerPhone, `scan:${code.toUpperCase()}`, otp);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });
  const vehicle = qr.vehicle;
  await db.scanLog.create({ data: { vehicleId: vehicle.id, scannerName, scannerPhone, verified: true } });
  await db.contactRequest.create({ data: { vehicleId: vehicle.id, scannerName, scannerPhone, message, status: "PENDING" } });
  await db.notification.create({ data: { userId: vehicle.ownerId, title: "New contact request", body: `${scannerName} scanned your car ${vehicle.plate}: ${message}` } });
  return NextResponse.json({
    ok: true,
    ownerName: vehicle.owner.name,
    ownerPhone: vehicle.owner.phone,
    emergency: vehicle.owner.emergency ? { name: vehicle.owner.emergency.name, phone: vehicle.owner.emergency.phone, relationship: vehicle.owner.emergency.relationship } : null,
    vehicle: { plate: vehicle.plate, make: vehicle.make, model: vehicle.model, year: vehicle.year, color: vehicle.color },
  });
}

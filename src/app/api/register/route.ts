import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";
import { createSession } from "@/lib/auth";

// Registration: QR code must exist and be unassigned, phone must pass OTP.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = String(body.code || "").trim().toUpperCase();
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const otp = String(body.otp || "").trim();
  const plate = String(body.plate || "").trim().toUpperCase();
  const make = String(body.make || "").trim();
  const model = String(body.model || "").trim();
  const year = Number(body.year || 0);
  const color = String(body.color || "").trim();
  const planId = String(body.planId || "");
  if (!code || !name || !phone || !otp || !plate || !make || !model || !year || !color || !planId) {
    return NextResponse.json({ ok: false, error: "All fields are required." }, { status: 400 });
  }
  const v = await verifyOtp(phone, "register", otp);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });
  const qr = await db.qrCode.findUnique({ where: { code } });
  if (!qr) return NextResponse.json({ ok: false, error: "QR code not found in inventory." }, { status: 404 });
  if (qr.vehicleId) return NextResponse.json({ ok: false, error: "This QR code is already assigned to a vehicle." }, { status: 400 });
  if (await db.vehicle.findUnique({ where: { plate } })) {
    return NextResponse.json({ ok: false, error: "This plate is already registered." }, { status: 400 });
  }
  const plan = await db.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) return NextResponse.json({ ok: false, error: "Plan not found." }, { status: 400 });
  let user = await db.user.findUnique({ where: { phone } });
  if (user && user.role !== "CUSTOMER") return NextResponse.json({ ok: false, error: "This phone belongs to an admin account." }, { status: 400 });
  if (!user) user = await db.user.create({ data: { role: "CUSTOMER", name, phone } });
  else if (user.name !== name) await db.user.update({ where: { id: user.id }, data: { name } });
  const vehicle = await db.vehicle.create({ data: { plate, make, model, year, color, ownerId: user.id } });
  await db.qrCode.update({ where: { id: qr.id }, data: { vehicleId: vehicle.id, status: "ACTIVE", assignedAt: new Date() } });
  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + plan.durationMonths);
  await db.subscription.create({ data: { userId: user.id, planId: plan.id, startDate: start, endDate: end, status: "ACTIVE" } });
  await db.notification.create({ data: { userId: user.id, title: "Welcome to M-Park", body: `Your QR sticker ${code} is active for ${plate}.` } });
  await createSession({ id: user.id, role: "CUSTOMER", name: user.name, phone: user.phone });
  return NextResponse.json({ ok: true });
}

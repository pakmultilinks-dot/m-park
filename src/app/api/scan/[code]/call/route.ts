import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Call Owner through M-Park Secure Relay. The scanner never sees the owner
// number and the owner never sees the scanner number. This route logs the
// call, creates a ContactRequest and notifies the owner. The live voice
// relay itself needs a telephony provider, see README.
export async function POST(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const qr = await db.qrCode.findUnique({ where: { code: code.toUpperCase() }, include: { vehicle: true } });
  if (!qr || !qr.vehicle) return NextResponse.json({ ok: false, error: "This QR code is not linked to a vehicle." }, { status: 404 });
  if (qr.status !== "ACTIVE") return NextResponse.json({ ok: false, error: "This QR sticker is not active. Contact M-Park." }, { status: 400 });
  const vehicle = qr.vehicle;
  const message = "Called owner via M-Park Secure Relay.";
  await db.scanLog.create({ data: { vehicleId: vehicle.id, scannerName: "Anonymous", scannerPhone: "Not shared", verified: false } });
  await db.contactRequest.create({ data: { vehicleId: vehicle.id, scannerName: "Anonymous", scannerPhone: "Not shared", message, status: "PENDING" } });
  await db.notification.create({ data: { userId: vehicle.ownerId, title: "M-Park Secure Call", body: `Someone called you through M-Park Secure Relay for your car ${vehicle.plate}.` } });
  return NextResponse.json({ ok: true, relay: "M-Park Secure Relay", maskedNumber: "+92 300 ••• ••••" });
}

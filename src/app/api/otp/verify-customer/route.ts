import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const phone = String(body.phone || "").trim();
  const code = String(body.code || "").trim();
  if (!phone || !code) return NextResponse.json({ ok: false, error: "Phone and OTP are required." }, { status: 400 });
  const v = await verifyOtp(phone, "login", code);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });
  const user = await db.user.findUnique({ where: { phone } });
  if (!user || user.role !== "CUSTOMER") {
    return NextResponse.json({ ok: false, error: "No customer account exists for this phone. Register first." }, { status: 404 });
  }
  if (user.isBlocked) return NextResponse.json({ ok: false, error: "This account is blocked. Contact M-Park." }, { status: 403 });
  await createSession({ id: user.id, role: "CUSTOMER", name: user.name, phone: user.phone });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { createOtp } from "@/lib/otp";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const phone = String(body.phone || "").trim();
  const purpose = String(body.purpose || "login").trim();
  if (!phone || phone.length < 10) return NextResponse.json({ ok: false, error: "Enter a valid phone number." }, { status: 400 });
  const result = await createOtp(phone, purpose);
  return NextResponse.json({ ok: true, smsSent: result.smsSent, provider: result.provider, note: result.note, devCode: result.devCode });
}

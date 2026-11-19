import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  const user = await db.user.findUnique({ where: { email } });
  if (!user || user.role !== "ADMIN" || !user.passwordHash) {
    return NextResponse.json({ ok: false, error: "Wrong email or password." }, { status: 401 });
  }
  if (user.isBlocked) return NextResponse.json({ ok: false, error: "This account is blocked." }, { status: 403 });
  const valid = await checkPassword(password, user.passwordHash);
  if (!valid) return NextResponse.json({ ok: false, error: "Wrong email or password." }, { status: 401 });
  await createSession({ id: user.id, role: "ADMIN", name: user.name, phone: user.phone });
  return NextResponse.json({ ok: true });
}

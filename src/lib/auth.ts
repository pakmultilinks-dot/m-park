import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";

export type SessionUser = { id: string; role: "ADMIN" | "CUSTOMER"; name: string; phone: string };

const COOKIE = "mpark_session";

function secretKey() {
  const s = process.env.SESSION_SECRET || "dev-only-change-me";
  return new TextEncoder().encode(s);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function checkPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ sub: user.id, role: user.role, name: user.name, phone: user.phone })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
  const store = await cookies();
  store.set(COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const id = String(payload.sub || "");
    if (!id) return null;
    const user = await db.user.findUnique({ where: { id } });
    if (!user || user.isBlocked) return null;
    return { id: user.id, role: user.role, name: user.name, phone: user.phone };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<SessionUser> {
  const s = await getSession();
  if (!s || s.role !== "ADMIN") throw new Error("Admin login required");
  return s;
}

export async function requireCustomer(): Promise<SessionUser> {
  const s = await getSession();
  if (!s || s.role !== "CUSTOMER") throw new Error("Customer login required");
  return s;
}

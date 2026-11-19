import { createHash, randomInt } from "crypto";
import { db } from "./db";
import { sendSms } from "./sms";

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function createOtp(phone: string, purpose: string) {
  const code = String(randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await db.otpCode.create({ data: { phone, purpose, codeHash: hashCode(code), expiresAt } });
  const sms = await sendSms(phone, `Your M-Park OTP is ${code}. It expires in 10 minutes.`);
  const isDev = process.env.NODE_ENV !== "production";
  return { ok: true, smsSent: sms.sent, provider: sms.provider, note: sms.note, devCode: isDev ? code : undefined };
}

export async function verifyOtp(phone: string, purpose: string, code: string) {
  const record = await db.otpCode.findFirst({
    where: { phone, purpose, verified: false },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return { ok: false, error: "No OTP was requested for this number. Request a new code." };
  if (record.expiresAt < new Date()) return { ok: false, error: "OTP has expired. Request a new code." };
  if (record.attempts >= 5) return { ok: false, error: "Too many wrong attempts. Request a new code." };
  if (record.codeHash !== hashCode(code.trim())) {
    await db.otpCode.update({ where: { id: record.id }, data: { attempts: record.attempts + 1 } });
    return { ok: false, error: "Wrong OTP. Try again." };
  }
  await db.otpCode.update({ where: { id: record.id }, data: { verified: true } });
  return { ok: true };
}

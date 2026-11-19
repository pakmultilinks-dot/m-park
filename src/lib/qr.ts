import QRCode from "qrcode";

export function scanUrlFor(code: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/scan/${code}`;
}

export async function qrDataUrl(code: string) {
  return QRCode.toDataURL(scanUrlFor(code), { width: 400, margin: 1 });
}

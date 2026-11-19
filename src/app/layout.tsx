import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "M-Park - Smart Parking System",
  description: "M-Park QR sticker parking: scan a car sticker, verify with OTP, and contact the owner by call or text.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

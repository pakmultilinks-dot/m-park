import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "M-Park - Smart Vehicle Communication System",
  description: "M-Park: Scan, Connect, Move. Scan a car QR sticker, call the owner through M-Park Secure Relay, or send an anonymous M-Park Alert. Your number is never shared.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

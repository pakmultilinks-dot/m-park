import Link from "next/link";
import { db } from "@/lib/db";

export default async function Home() {
  const product = await db.product.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" } }).catch(() => null);
  return (
    <main className="min-h-screen">
      <header className="bg-green-950 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <p className="inline-block bg-green-600 text-xs font-bold px-3 py-1 rounded-full">M-PARK - SMART VEHICLE COMMUNICATION SYSTEM</p>
          <h1 className="text-4xl md:text-5xl font-bold mt-5">Scan | Connect | Move</h1>
          <p className="text-green-100 mt-4 max-w-2xl mx-auto">
            M-Park makes communication between car owners and the public easy and secure. Scan the round QR sticker on a car windscreen, call the owner through M-Park Secure Relay, or send an anonymous M-Park Alert. The owner number is never shown publicly.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link href="/order" className="btn-primary">Order Now - {product ? `PKR ${product.pricePkr}` : "QR sticker"}</Link>
            <Link href="/login" className="bg-white text-green-950 font-semibold px-4 py-2 rounded-lg">Login</Link>
          </div>
          <p className="text-green-200 text-xs mt-3">QR sticker price to be confirmed with the client. Buy the sticker, pay, register your vehicle, and the sticker is permanently linked to your vehicle.</p>
        </div>
      </header>
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold">When to scan a car</h2>
        <div className="grid md:grid-cols-4 gap-4 mt-5">
          {[
            ["Car blocked", "Your car is blocked behind another parked car. Scan and ask the owner to move it."],
            ["Lights left on", "A car has its lights on. Scan and send an alert so the battery does not die."],
            ["Traffic blocked", "A vehicle is blocking traffic. Scan and notify the owner instantly."],
            ["Important message", "You need to give the vehicle owner an important message. Send it anonymously."],
          ].map(([title, body]) => (
            <div key={title} className="card">
              <h3 className="font-bold mt-1">{title}</h3>
              <p className="text-slate-600 text-sm mt-1">{body}</p>
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-bold mt-10">How M-Park works</h2>
        <div className="grid md:grid-cols-4 gap-4 mt-5">
          {[
            ["Step 1", "Buy the sticker", "A customer purchases an M-Park QR sticker and registers the vehicle. The sticker is permanently linked to that vehicle until ownership or registration changes."],
            ["Step 2", "Stick it on", "Stick the round QR sticker on the car windscreen. Every sticker has a unique QR code."],
            ["Step 3", "Scan it", "Anyone scans the sticker. M-Park identifies the vehicle and loads the options. No OTP, no sign up, no phone number needed from the scanner."],
            ["Step 4", "Connect", "Tap Call Owner through M-Park Secure Relay, or tap Send M-Park Alert. The owner gets an instant notification and comes to move the car."],
          ].map(([step, title, body]) => (
            <div key={title} className="card">
              <p className="text-green-700 text-xs font-bold">{step}</p>
              <h3 className="font-bold mt-1">{title}</h3>
              <p className="text-slate-600 text-sm mt-1">{body}</p>
            </div>
          ))}
        </div>
        <div className="card mt-10">
          <h2 className="text-xl font-bold">Privacy first</h2>
          <p className="text-slate-600 text-sm mt-2">The vehicle owner personal mobile number is never shown publicly. Communication happens only through the M-Park secure system. Messages are delivered instantly and anonymously. Your identity is protected. M-Park never shares your number or personal data with the vehicle owner.</p>
        </div>
        <h2 className="text-2xl font-bold mt-10">Choose a dashboard</h2>
        <p className="text-slate-600 mt-2">This is the real M-Park app. Data is stored in the database, not in the browser.</p>
        <div className="grid md:grid-cols-2 gap-4 mt-5">
          <div className="card">
            <h3 className="font-bold text-lg">Customer Dashboard</h3>
            <p className="text-slate-600 text-sm mt-1">For a car owner. See your vehicle, your QR sticker, notifications, contact requests, and emergency contact.</p>
            <Link href="/login?role=customer" className="btn-primary mt-4">Open Customer Dashboard</Link>
          </div>
          <div className="card">
            <h3 className="font-bold text-lg">Admin Dashboard</h3>
            <p className="text-slate-600 text-sm mt-1">For the single owner of M-Park. See all users, vehicles, QR codes, inventory, contact requests, notifications, and subscriptions.</p>
            <Link href="/login?role=admin" className="btn-primary mt-4">Open Admin Dashboard</Link>
          </div>
        </div>
        <p className="text-slate-500 text-sm mt-8">To try a scan, use a seeded QR code, for example MPK-1009 for LEK 7982, Grey Suzuki Cultus, at /scan/MPK-1009 after the database is seeded. Future vision: AI-based parking detection, smart parking, vehicle alerts, and fleet management.</p>
      </section>
    </main>
  );
}

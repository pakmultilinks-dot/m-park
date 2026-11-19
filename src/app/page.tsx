import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <p className="inline-block bg-teal-600 text-xs font-bold px-3 py-1 rounded-full">M-Park - Smart Parking System</p>
          <h1 className="text-4xl md:text-5xl font-bold mt-5">Park smart. Contact the owner in seconds.</h1>
          <p className="text-slate-300 mt-4 max-w-2xl mx-auto">
            One QR sticker on the car. Anyone who needs the car moved can scan it, verify with OTP, and reach the owner by call or text. No phone number is shown openly.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link href="/register" className="btn-primary">Order a QR sticker</Link>
            <Link href="/login" className="bg-white text-slate-900 font-semibold px-4 py-2 rounded-lg">Login</Link>
          </div>
        </div>
      </header>
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold">How M-Park works</h2>
        <div className="grid md:grid-cols-4 gap-4 mt-5">
          {[
            ["Step 1", "Order a sticker", "A car owner orders an M-Park QR sticker and registers the vehicle."],
            ["Step 2", "Verify with OTP", "Mobile number and QR code are verified with OTP, then the sticker is activated."],
            ["Step 3", "Scan the sticker", "A visitor scans the sticker on the car and enters name and number with OTP verification."],
            ["Step 4", "Contact the owner", "The visitor can call or text the owner, or use the emergency contact if needed."],
          ].map(([step, title, body]) => (
            <div key={title} className="card">
              <p className="text-teal-700 text-xs font-bold">{step}</p>
              <h3 className="font-bold mt-1">{title}</h3>
              <p className="text-slate-600 text-sm mt-1">{body}</p>
            </div>
          ))}
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
        <p className="text-slate-500 text-sm mt-8">To try a scan, use a seeded QR code, for example MPK-1001, at /scan/MPK-1001 after the database is seeded.</p>
      </section>
    </main>
  );
}

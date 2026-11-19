# M-Park - Smart Vehicle Communication System

M-Park is a real SaaS. Brand: M-PARK, Smart Vehicle Communication System. Tagline: Scan | Connect | Move. Green theme, dark green on the scan page.

This branch is `contribution/proper-saas`, a proper app: Next.js App Router, TypeScript, Tailwind CSS, Prisma database, real auth, real OTP flow for login and registration only, real QR scan, and real subscriptions in PKR.

This is not the old static HTML demo. That demo stays on branch `contribution/customer-admin-dashboards`. Main does not exist yet. The user merges this branch to main himself.

## What M-Park is

M-Park makes communication between car owners and the public easy and secure. A customer purchases an M-Park QR sticker, registers the vehicle, and the sticker is permanently linked to that vehicle until ownership or registration changes. The round blue QR sticker goes on the car windscreen, with the QR code in the middle.

When someone needs the car owner, they scan the sticker. M-Park opens and identifies the vehicle, for example LEK 7982, Grey Suzuki Cultus. They tap Call Owner or Send M-Park Alert. The owner gets an instant notification and comes to move the car.

Use cases:
- A car is blocked behind another parked car.
- A car has its lights left on.
- A vehicle is blocking traffic.
- Someone needs to give the vehicle owner an important message.

Privacy is the most important feature. The vehicle owner personal mobile number is never shown publicly. Communication happens only through the M-Park secure system. Messages are delivered instantly and anonymously. Your identity is protected. M-Park never shares your number or personal data with the vehicle owner.

## What is in this app

- `/` - Landing page, Smart Vehicle Communication System, Scan | Connect | Move, use cases, how it works, privacy, dashboards
- `/register` - Vehicle registration with QR verification and mobile OTP verification. OTP is used here, for the owner only.
- `/scan/[code]` - Scan page, mobile first, green. Shows M-PARK VEHICLE IDENTIFIED, plate in big text, make, model and color, then Call Owner and Send M-Park Alert. No OTP, no name, no phone needed from the scanner. Call goes through M-Park Secure Relay, the owner number is never shown. Alert is anonymous, with preset reasons: Car is blocked, Lights are on, Traffic blocked, Important message, plus a free text box. Every call and alert writes a ScanLog, a ContactRequest and a Notification in the database, so the owner and the admin see it.
- `/login` - Admin login with email and password, customer login with phone and OTP. OTP is used here, for login only, never for the scanner.
- `/customer` - Customer Dashboard C: Overview, My Vehicle, My QR Sticker (real QR image generated from the scan URL), Notifications, Contact Requests (Approve/Ignore), Emergency Contact management
- `/admin` - Admin Dashboard D: Overview totals, Customers, Vehicles, QR Codes, QR Inventory (generate new batch of real codes in the database), Contact Requests, Notifications monitoring, Subscriptions and Plans

Future vision, not built now: AI-based parking detection, smart parking, vehicle alerts, and fleet management.

## Run locally

```
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Open http://localhost:3000

Seeded test accounts, from `prisma/seed.ts` only:
- Admin: admin@m-park.example / Admin1234! - change this password before launch
- Customer: +92 300 1234567, login with phone and OTP (dev OTP is shown on screen in dev mode only)
- Video vehicle: LEK 7982, Grey Suzuki Cultus, QR code MPK-1009, scan at /scan/MPK-1009. Test owner name is from the video TikTok handle, replace with the real owner when confirmed.
- Seeded unassigned QR codes for registration: MPK-1010 to MPK-1050, MPK-1051 to MPK-1100
- Seeded plans: Basic Monthly PKR 499, Standard Monthly PKR 999, Premium Yearly PKR 9999

## Database

Prisma with SQLite for local development. The file is `prisma/dev.db`, created by migrate, and is git ignored. For production Postgres, change `provider` in `prisma/schema.prisma` to `postgresql`, set `DATABASE_URL` to the Postgres connection string, and run a new migration.

## OTP and SMS

OTP codes are 6 digits, expire in 10 minutes, max 5 attempts, stored as a SHA-256 hash in the `OtpCode` table. OTP is used only for customer registration and login, and for admin login by password. The scanner never needs OTP. `src/lib/sms.ts` is a pluggable sender. With no provider configured, the OTP is logged to the server console and, in dev mode only, shown on screen labelled as a dev code.

## Secure Relay and live calling

Call Owner goes through M-Park Secure Relay. The scan page never renders the owner phone number, and the call route never returns it. The live voice relay needs a telephony provider. Until it is connected, the call screen shows M-Park Secure Call Connecting, Routing through M-Park Secure Relay, and the masked number, and logs the call for the owner and admin.

Still needed from the client to go live:
- SMS provider and keys, for example Twilio, or a Pakistan SMS gateway. Set `SMS_PROVIDER` and its keys in `.env`. Needed for owner registration and login OTP.
- Telephony provider and keys for the live Secure Relay voice call.
- Payment provider and merchant keys, for example JazzCash or Easypaisa, or Stripe. Set `PAYMENT_PROVIDER` and its keys in `.env`. Subscriptions are currently created on registration and by the admin, online payment is not wired yet.
- A production `SESSION_SECRET`, a production `DATABASE_URL`, and `NEXT_PUBLIC_BASE_URL` set to the live domain, so QR scan links point to the live site.
- Change the seeded admin password, and decide the real subscription prices with the client.

## Build

```
npm run build
npm run start
```

# M-Park - Real SaaS

M-Park is a real SaaS for QR sticker parking. This branch is `contribution/proper-saas`, a proper app: Next.js App Router, TypeScript, Tailwind CSS, Prisma database, real auth, real OTP flow, real QR scan, and real subscriptions in PKR.

This is not the old static HTML demo. That demo stays on branch `contribution/customer-admin-dashboards`. Main does not exist yet. The user merges this branch to main himself.

## What is in this app

- `/` - Landing chooser
- `/register` - Vehicle registration with QR verification and mobile OTP verification
- `/scan/[code]` - Real scan page. Looks up the QR code in the database, asks the scanner for name and phone, verifies OTP, then shows Call Owner, Text Owner, and Emergency Contact. Logs the scan and creates a ContactRequest and a Notification for the customer.
- `/login` - Admin login with email and password, customer login with phone and OTP
- `/customer` - Customer Dashboard C: Overview, My Vehicle, My QR Sticker (real QR image generated from the scan URL), Notifications, Contact Requests (Approve/Ignore), Emergency Contact management
- `/admin` - Admin Dashboard D: Overview totals, Customers, Vehicles, QR Codes, QR Inventory (generate new batch of real codes in the database), Contact Requests, Notifications monitoring, Subscriptions and Plans

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
- Seeded unassigned QR codes for registration: MPK-1009 to MPK-1050, MPK-1051 to MPK-1100
- Seeded plans: Basic Monthly PKR 499, Standard Monthly PKR 999, Premium Yearly PKR 9999

## Database

Prisma with SQLite for local development. The file is `prisma/dev.db`, created by migrate, and is git ignored. For production Postgres, change `provider` in `prisma/schema.prisma` to `postgresql`, set `DATABASE_URL` to the Postgres connection string, and run a new migration.

## OTP and SMS

OTP codes are 6 digits, expire in 10 minutes, max 5 attempts, stored as a SHA-256 hash in the `OtpCode` table. `src/lib/sms.ts` is a pluggable sender. With no provider configured, the OTP is logged to the server console and, in dev mode only, shown on screen labelled as a dev code.

Still needed from the client to go live:
- SMS provider and keys, for example Twilio, or a Pakistan SMS gateway. Set `SMS_PROVIDER` and its keys in `.env`.
- Payment provider and merchant keys, for example JazzCash or Easypaisa, or Stripe. Set `PAYMENT_PROVIDER` and its keys in `.env`. Subscriptions are currently created on registration and by the admin, online payment is not wired yet.
- A production `SESSION_SECRET`, a production `DATABASE_URL`, and `NEXT_PUBLIC_BASE_URL` set to the live domain, so QR scan links point to the live site.
- Change the seeded admin password, and decide the real subscription prices with the client.

## Build

```
npm run build
npm run start
```

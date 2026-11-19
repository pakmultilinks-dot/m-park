# M-Park

## Smart Vehicle Communication System

**Scan | Connect | Move**

M-Park connects car owners and the public through a QR sticker on the car windscreen. Anyone who needs the owner scans the sticker, and M-Park identifies the vehicle and offers two options: Call Owner and Send M-Park Alert. The owner receives an instant notification and can act on the situation.

The vehicle owner personal mobile number is never shown publicly. Communication happens only through the M-Park secure system. Messages are delivered instantly and anonymously. Your identity is protected. M-Park never shares your number or personal data with the vehicle owner.

## How it works

1. **Buy the sticker.** A customer purchases an M-Park QR sticker and registers the vehicle. The sticker is permanently linked to that vehicle until ownership or registration changes.
2. **Stick it on.** The round blue QR sticker goes on the car windscreen. Every sticker has a unique QR code.
3. **Scan it.** Anyone scans the sticker. M-Park identifies the vehicle and loads the options. No OTP, no sign up, and no phone number is needed from the scanner.
4. **Connect.** Tap Call Owner through M-Park Secure Relay, or tap Send M-Park Alert. The owner gets an instant notification and comes to move the car.

### When to scan a car

- A car is blocked behind another parked car.
- A car has its lights left on.
- A vehicle is blocking traffic.
- Someone needs to give the vehicle owner an important message.

## Features

### Scan page

- Mobile first, green M-Park design.
- Shows M-PARK VEHICLE IDENTIFIED, the plate in large text, and the make, model, and colour.
- Call Owner through M-Park Secure Relay. The owner number is never shown, and the scanner number is never shared with the owner.
- Send M-Park Alert anonymously, with preset reasons: Car is blocked, Lights are on, Traffic blocked, Important message, plus a free text box.
- Every call and alert creates a scan log, a contact request, and a notification in the database, so the owner and the admin can see it.
- Example: LEK 7982, Grey Suzuki Cultus, QR code MPK-1009, at `/scan/MPK-1009`.

### Customer Dashboard

For a car owner:

- Overview of vehicle, QR sticker, pending requests, and notifications.
- My Vehicle: registered vehicle details, editable.
- My QR Sticker: the QR image for the vehicle, with download and print.
- Notifications: contact requests and system messages.
- Contact Requests: approve or ignore requests from scanners.
- Emergency Contact: add, edit, and remove an emergency contact.
- My Sticker Order: sticker price paid, payment status, order status, and delivery status.

### Admin Dashboard

For the owner of M-Park:

- Overview: total registered users, total registered vehicles, active and inactive QR codes, pending contact requests, active subscriptions, QR stickers sold, and revenue from sticker sales.
- Orders: QR sticker sales, buyer, plate, sticker code, price, payment status, and order status from Ordered to Activated. Mark orders paid or unpaid, change order status, and set the sticker price.
- Customers: search, view, edit, add, block, and unblock customers.
- Vehicles: all registered vehicles.
- QR Codes: activate, deactivate, and mark codes lost.
- QR Inventory: sticker stock, batches, assigned and unassigned codes, and generate a new batch.
- Contact Requests and Notifications: monitoring of all scans, calls, alerts, and notifications.
- Subscriptions and Plans: create and edit subscription plans and prices.

### QR sticker selling

Selling QR stickers is the core M-Park business:

- The M-Park QR sticker costs PKR 999.
- A customer orders the sticker on the Order Now page, pays, and then registers the vehicle.
- The order reserves the next unassigned QR code and creates a sticker order in the database.
- The admin confirms payment, ships the sticker, and the sticker is permanently linked to the vehicle after registration.
- The admin can see total QR stickers sold and total revenue from sticker sales.

### Privacy and security

- The owner phone number is never rendered on the scan page, and the call route never returns it.
- The scanner phone number is never shared with the owner.
- Alerts are anonymous by design.
- Admin login uses email and password with bcrypt password hashing and a JWT session cookie.
- Customer login uses phone number and a 6 digit OTP. OTP codes expire in 10 minutes, allow a maximum of 5 attempts, and are stored as a SHA-256 hash in the database.
- OTP is used only for customer registration and login. The scanner never needs OTP.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 15, App Router, TypeScript |
| Styling | Tailwind CSS |
| Database | Prisma, SQLite for local development, PostgreSQL for production |
| Authentication | Bcrypt password hashing, JWT session cookies, phone OTP |
| QR codes | Unique code per sticker, generated QR image from the scan URL |

## Getting started

### Prerequisites

- Node.js 20 or later
- npm

### Run locally

```bash
git clone https://github.com/rehmantechx/M-PARK.git
cd M-PARK
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Open http://localhost:3000 in the browser.

### Build for production

```bash
npm run build
npm run start
```

## Environment variables

Copy `.env.example` to `.env` and fill in the values. Never commit `.env`.

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | SQLite file for local development, for example `file:./dev.db`. For production, a PostgreSQL connection string. |
| `SESSION_SECRET` | A long random string used to sign session cookies. Generate one per install. |
| `NEXT_PUBLIC_BASE_URL` | Public base URL used to build QR scan links, for example `https://m-park.example`. Use `http://localhost:3000` locally. |
| `SMS_PROVIDER` | SMS provider for OTP delivery. Leave empty in development. Set to `twilio` in production. |
| `TWILIO_ACCOUNT_SID` | Twilio account SID, required when `SMS_PROVIDER` is `twilio`. |
| `TWILIO_AUTH_TOKEN` | Twilio auth token, required when `SMS_PROVIDER` is `twilio`. |
| `TWILIO_FROM` | Twilio sender phone number, required when `SMS_PROVIDER` is `twilio`. |
| `PAYMENT_PROVIDER` | Payment provider for online sticker payment, for example `jazzcash`, `easypaisa`, or `stripe`. |
| `PAYMENT_MERCHANT_ID` | Merchant ID for the payment provider. |
| `PAYMENT_SECRET` | Secret key for the payment provider. |

With no SMS provider configured, OTP codes are logged to the server console and, in development mode only, shown on screen labelled as a development code. In production, configure an SMS provider so OTP codes are delivered by SMS.

## Database and test accounts

Prisma manages the database. SQLite is used for local development. The file is `prisma/dev.db`, created by the migration, and it is git ignored. For production PostgreSQL, change the provider in `prisma/schema.prisma` to `postgresql`, set `DATABASE_URL` to the PostgreSQL connection string, and run a new migration.

The seed script in `prisma/seed.ts` creates test data only, for local development. Do not run the seed script on a live database. Test accounts are:

| Account | Details |
| --- | --- |
| Admin | `admin@m-park.example` / `Admin1234!` - change this password before launch |
| Customer | `+92 300 1234567`, login with phone and OTP |
| Video vehicle | LEK 7982, Grey Suzuki Cultus, QR code MPK-1009, at `/scan/MPK-1009` |
| Unassigned QR codes | MPK-1010 to MPK-1050, MPK-1051 to MPK-1100 |

Subscription plans in the seed data:

| Plan | Price | Duration |
| --- | --- | --- |
| Basic Monthly | PKR 499 | 1 month |
| Standard Monthly | PKR 999 | 1 month |
| Premium Yearly | PKR 9999 | 12 months |

## Project structure

```text
prisma/
  schema.prisma        Database models
  seed.ts              Test data only
  migrations/          Database migrations
src/
  app/
    page.tsx           Landing page
    order/             Order a QR sticker
    register/          Vehicle registration with QR and OTP verification
    scan/[code]/       Scan page, Call Owner, Send M-Park Alert
    login/             Admin login and customer OTP login
    customer/          Customer Dashboard
    admin/             Admin Dashboard
    api/               Authentication, OTP, order, register, scan, and QR routes
  components/          Shared layout and logout components
  lib/                 Database, authentication, OTP, SMS, QR, and admin actions
  middleware.ts        Route protection for admin and customer areas
```

## Deployment notes

Before launch, complete these steps:

- Set a production `SESSION_SECRET`, a production `DATABASE_URL`, and `NEXT_PUBLIC_BASE_URL` to the live domain, so QR scan links point to the live site.
- Configure an SMS provider and keys for registration and login OTP.
- Configure a telephony provider and keys for live Secure Relay voice calls. Until it is connected, the call screen shows the relay route and logs the call for the owner and the admin.
- Configure a payment provider and merchant keys for online sticker payment. Until it is connected, orders are created as unpaid and the admin confirms payment after the customer pays.
- Change the seeded admin password.
- Confirm the sticker price and the subscription plan prices.

## Roadmap

Future vision for M-Park:

- AI based parking detection
- Smart parking
- Vehicle alerts
- Fleet management

## License and contact

License: to be confirmed by the owner.

Contact: to be confirmed by the owner.

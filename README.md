# M-Park - Customer and Admin Dashboards

Contribution branch: `contribution/customer-admin-dashboards`
Main branch is untouched. The owner will merge to main himself.

## What this build contains

This is a static web app, no build step. Open it in a browser or deploy it on Vercel as a static site.

- `index.html`: chooser for Customer Dashboard and Admin Dashboard, with the M-Park flow explained.
- `admin/index.html`: Admin Dashboard for the single owner of M-Park.
- `customer/index.html`: Customer Dashboard for a car owner.
- `assets/css/style.css`: shared styles.

## C. Customer Dashboard

- Overview: vehicle, QR status, pending requests, unread notifications, plan validity
- My Vehicle: registered vehicle details, edit plate, vehicle and phone, saves in the browser
- My QR Sticker: QR image for MPK-1001, bundled locally as assets/img/qr-mpk-1001.png so it loads without an external service, scan URL https://m-park.example/scan/MPK-1001, download and print
- Notifications: received notifications, mark as read, mark all as read
- Contact Requests: Approve or Ignore requests from people who scanned the sticker
- Emergency Contact: add, edit, or remove an emergency contact, saves in the browser

Demo customer: Ahmed Raza, +92 300 1234567, LEA-24-1234, Toyota Corolla 2022, White, QR MPK-1001, Monthly PKR 499.

## D. Admin Dashboard

- Overview: total registered users, total registered vehicles, active QR codes, inactive QR codes, recent registrations, recent scans, subscription snapshot
- Customers: searchable table, view, edit, block and unblock, subscription status, add customer
- Vehicles: all registered vehicles with owner and QR code
- QR Codes: all codes, Activate, Deactivate, Mark Lost
- QR Inventory: batches, total stock, assigned and unassigned counts, Generate new batch adds 50 demo codes
- Contact Requests: Approve or Ignore
- Notifications: monitoring, mark as read, mark all as read
- Subscriptions: demo plans in PKR, edit and save prices in the browser
- Settings: business name, support phone, scan page message, OTP and emergency contact toggles

Demo plans, prices are placeholders until the client confirms real prices:
- Basic, Monthly, PKR 499
- Standard, Monthly, PKR 999
- Premium, Yearly, PKR 9999

## Demo data

All data is demo data only. It is stored in the browser with localStorage, keys `mpark_admin_v1` and `mpark_customer_v1`. Use Reset demo data in either dashboard to restore the original demo data.

There is no backend, no real database, no real SMS or OTP service, and no real payment in this build.

## How to run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/

## How to deploy on Vercel

Import this repo in Vercel as a static site, no build command, no output directory change needed. The root `index.html` is the entry page.

## Scope note

Landing Page (A) and Registration Portal (B) are not in this branch. Only Customer Dashboard (C) and Admin Dashboard (D) are built here, as confirmed by the user on 19 Nov 2026.

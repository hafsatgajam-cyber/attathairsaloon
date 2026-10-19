# Attat Hair Saloon

The website for Attat Hair Saloon, a Nigerian hair salon. Customers can browse services and prices in Naira, book an appointment online (with an optional Paystack deposit), and chat with the salon on WhatsApp. Staff manage bookings, prices and opening hours in a simple admin dashboard.

**Stack:** Next.js 15 (App Router) + Tailwind CSS 4, deployed on **Vercel**, with **Supabase** (Postgres + Auth) as the backend. Product spec: [docs/PRD.md](docs/PRD.md).

## Features (Phase 1 MVP)

| Area | What's included |
|------|-----------------|
| Public site | Home, Services & Prices, Gallery, FAQ, Contact (map + hours), Privacy policy; floating WhatsApp button on every page |
| Booking | Pick services → stylist (or "any") → date → free time slots → details. Slots respect opening hours, closures, service length and existing bookings. A database constraint makes double-booking a stylist impossible. |
| Deposits | Paystack checkout (card, transfer, USSD) for services with a deposit. Unpaid bookings hold the slot for 30 minutes. Webhook + redirect both confirm payment. |
| WhatsApp | Click-to-chat links with pre-filled messages everywhere; booking confirmations and daily reminders through the WhatsApp Cloud API (optional) |
| Manage booking | Each booking gets a private link to view or cancel it |
| Admin (`/admin`) | Staff login; day view with a 7-day strip and stylist filter; mark done / no-show / cancel; add walk-in and WhatsApp bookings; edit services, prices and deposits; opening hours and holiday closures |

The site works **before** anything is connected: it shows demo services and prices, and the booking form sends people to WhatsApp instead. Connecting Supabase switches on real booking.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in values
npm run dev                  # http://localhost:3000
```

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), then [`supabase/seed.sql`](supabase/seed.sql) (starter services, stylists and hours: edit the prices later in the admin).
3. From **Project Settings → API**, copy the URL, the `anon` key and the `service_role` key into your env vars.
4. Create a staff login: **Authentication → Users → Add user** (email + password). Then make them staff in SQL Editor:
   ```sql
   insert into staff (user_id, name, role)
   select id, 'Owner', 'owner' from auth.users where email = 'owner@example.com';
   ```
5. Turn off public sign-ups: **Authentication → Providers → Email → disable "Allow new users to sign up"**. Only staff need accounts.

### 2. Vercel

1. Import this GitHub repo in [vercel.com/new](https://vercel.com/new) (framework: Next.js, no build settings to change).
2. Add every variable from [`.env.example`](.env.example) under **Settings → Environment Variables**. Set `NEXT_PUBLIC_SITE_URL` to your live domain and `CRON_SECRET` to a long random string.
3. Deploy. [`vercel.json`](vercel.json) schedules `/api/cron/reminders` daily at 07:00 UTC (08:00 in Lagos). It sends "today" and "tomorrow" reminders and releases unpaid holds.

### 3. Paystack (optional)

1. Put your **secret key** in `PAYSTACK_SECRET_KEY` (use the `sk_test_…` key until you're ready to go live).
2. In **Paystack → Settings → API Keys & Webhooks**, set the webhook URL to `https://<your-domain>/api/paystack/webhook`.

Without a key, bookings are confirmed straight away with no deposit.

### 4. WhatsApp Cloud API (optional)

Click-to-chat works with just `NEXT_PUBLIC_WHATSAPP_NUMBER`. For automatic confirmations and reminders:

1. Set up the WhatsApp Business Platform in Meta Business Manager and get a permanent token and phone number ID.
2. Create two **utility** message templates (language `en`) and get them approved:
   - `booking_confirmation`: *Hi {{1}}, your appointment for {{2}} at Attat Hair Saloon is confirmed for {{3}}. View or cancel: {{4}}*
   - `booking_reminder`: *Hi {{1}}, a reminder of your {{2}} appointment {{3}}. Need to change it? {{4}}*
3. Set `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`.

### 5. Branding

- **Logo:** save it as `public/logo.png`, then set `logo: "/logo.png"` in [`src/lib/config.ts`](src/lib/config.ts).
- **Salon details** (address, Instagram, cancellation window): [`src/lib/config.ts`](src/lib/config.ts).
- **Colours** (olive green, cream and gold): [`src/app/globals.css`](src/app/globals.css).
- **Gallery photos:** add rows to the `gallery_images` table (image URL + style). Supabase Storage public URLs work.

## Project structure

```
src/
├── app/
│   ├── (site)/            # public pages: home, services, gallery, faq, contact, book, booking/[token]
│   ├── admin/             # staff login + dashboard (bookings, services, hours)
│   └── api/               # availability, bookings, paystack webhook, cron reminders
├── components/            # header, footer, logo, WhatsApp button…
├── lib/                   # availability engine, Supabase clients, Paystack, WhatsApp, config
└── middleware.ts          # refreshes staff sessions on /admin
supabase/
├── migrations/0001_init.sql   # tables, double-booking constraint, row-level security
└── seed.sql                   # starter catalogue
docs/PRD.md
```

## Not in this phase

From the PRD's Phase 2 and later: the interactive WhatsApp bot (menus, FAQ answers, booking inside WhatsApp), self-service rescheduling (customers change times on WhatsApp for now), group bookings, reports, and AI answers.

# Product Requirements Document: Attat Hair Salon Website

| | |
|---|---|
| **Product** | Attat Hair Salon website, with WhatsApp assistance and online booking |
| **Owner** | @hafsatgajam-cyber |
| **Status** | Draft v0.1 |
| **Last updated** | 19 October 2026 |

---

## 1. Overview

Attat Hair Salon is a Nigerian hair salon. Today most customers find it through word of mouth, Instagram and WhatsApp, and they book by sending messages back and forth. That works, but it costs staff time, leads to double bookings and no-shows, and leaves enquiries unanswered outside working hours.

This project is a mobile-first website that:

1. Shows the salon's services, prices and work.
2. Lets customers book an appointment online, any time of day.
3. Makes WhatsApp, the channel customers already use, the centre of support, using click-to-chat plus an automated assistant that answers common questions, takes bookings and sends reminders.

## 2. Goals and non-goals

### Goals

| # | Goal | Measure |
|---|------|---------|
| G1 | Move bookings from manual chats to self-service | At least 50% of bookings made online or through the WhatsApp assistant within 3 months of launch |
| G2 | Fewer no-shows | No-show rate down by 30%, helped by deposits and reminders |
| G3 | Faster replies | 80% of WhatsApp enquiries answered right away by the assistant; median time to a human reply under 15 minutes during opening hours |
| G4 | More new customers | Steady month-on-month growth in website visitors and first-time bookings |
| G5 | Less staff time on admin | Staff report spending noticeably less time handling bookings |

### Non-goals (for v1)

- Selling hair products online (possible in a later phase)
- A native mobile app
- Payroll or full accounting for staff
- Running more than one branch (the design should allow it later)

## 3. Target users

| Persona | Description | Needs |
|---------|-------------|-------|
| **Busy professional (Amaka, 29)** | Works in Lagos and books on her phone during breaks | Clear prices, fast booking, reminders, short waits |
| **Student / budget customer (Zainab, 21)** | Price-conscious, uses a lot of WhatsApp, often on limited data | Upfront prices, a light site, booking through WhatsApp |
| **Mother booking for kids (Mrs. Bello, 38)** | Books several services for herself and her children | Group or multiple bookings, kids' styles, a time estimate |
| **Salon owner / manager** | Runs the business | One view of all bookings, control of prices and availability, deposits |
| **Stylist** | Does the hair | Their own schedule for the day, customer notes and preferences |

## 4. User stories

### Customer

- As a customer, I want to see all services with prices in Naira and how long they take, so I can decide before booking.
- As a customer, I want to see photos of the salon's past work, so I can trust their quality and choose a style.
- As a customer, I want to book a service, a stylist (optional) and a time slot in a few taps.
- As a customer, I want to pay a deposit with my card, a bank transfer or USSD, so my slot is secured.
- As a customer, I want my booking confirmation and a reminder on WhatsApp, so I don't forget.
- As a customer, I want to reschedule or cancel easily, through a link or on WhatsApp.
- As a customer, I want to ask questions on WhatsApp and get an instant answer, even at night.
- As a customer, I want to know whether I need to bring my own hair or attachments, or can buy them at the salon.

### Salon

- As the owner, I want to see every booking for the day or week in one place.
- As the owner, I want to set opening hours, holidays, and each stylist's availability.
- As the owner, I want to update services and prices without a developer.
- As the owner, I want to require deposits for long or expensive services.
- As staff, I want to take over a WhatsApp conversation from the assistant when needed.
- As a stylist, I want to see my appointments and the customer's notes.

## 5. Functional requirements

Priorities: **P0** = must have for launch, **P1** = should have, **P2** = nice to have.

### 5.1 Public website

| ID | Requirement | Priority |
|----|-------------|----------|
| W1 | **Home page**: hero section, featured styles, a "Book now" button and a "Chat on WhatsApp" button | P0 |
| W2 | **Services and prices**: grouped by category (Braids, Cornrows, Weaves and Wigs, Locs, Relaxer and Treatments, Natural Hair, Kids, Makeup or extras); each service shows its price or price range in ₦, how long it takes, and whether hair is included | P0 |
| W3 | **Gallery**: photos filterable by style, with images compressed for low data use | P0 |
| W4 | **About and contact**: story, address, Google Maps embed, opening hours, phone number, WhatsApp and Instagram links | P0 |
| W5 | **FAQ**: preparation tips, deposit and cancellation policy, hair-bringing policy | P1 |
| W6 | **Reviews and testimonials** | P1 |
| W7 | **Stylist profiles** with specialities | P2 |
| W8 | Floating WhatsApp button on every page | P0 |

### 5.2 Booking

| ID | Requirement | Priority |
|----|-------------|----------|
| B1 | Pick one or more services; the total time and price are calculated automatically | P0 |
| B2 | Pick a stylist, or choose "Any available" | P1 |
| B3 | Show only free time slots, based on opening hours, stylist availability, service length and existing bookings | P0 |
| B4 | Collect the customer's name, WhatsApp phone number (+234 format, checked) and optional notes. No account needed | P0 |
| B5 | **Deposit payment** through Paystack or Flutterwave (card, bank transfer, USSD); the deposit amount or percentage can be set per service | P0 |
| B6 | Booking confirmation on screen and on WhatsApp, with an "add to calendar" link | P0 |
| B7 | Reminders on WhatsApp 24 hours and 2 hours before the appointment | P0 |
| B8 | Reschedule or cancel through a secure link, following the cancellation policy (for example, deposit not refunded if cancelled less than 24 hours ahead) | P0 |
| B9 | Book for several people in one go (for example, a mother and her kids) | P2 |
| B10 | Option to pay the full amount online | P2 |
| B11 | Waitlist for fully booked days | P2 |

### 5.3 WhatsApp assistance

Built on the **WhatsApp Business Platform (Cloud API)**, using approved message templates for confirmations and reminders.

| ID | Requirement | Priority |
|----|-------------|----------|
| A1 | **Click-to-chat** (`wa.me` links) with a pre-filled message such as "Hi, I'd like to book knotless braids" | P0 |
| A2 | **Automated replies to FAQs**: prices, opening hours, location and directions, deposit policy, hair and attachment questions | P0 |
| A3 | **Main menu** using WhatsApp interactive messages (buttons and lists): *See prices · Book appointment · My booking · Talk to a stylist* | P0 |
| A4 | **Booking in WhatsApp**: choose a service, then a date and time from a list, then receive a payment link and a confirmation | P1 |
| A5 | **Hand-off to a person**: "Talk to someone" or an unrecognised question sends the chat to staff, with the conversation history | P0 |
| A6 | Transactional messages: confirmation, reminders, reschedule or cancel notices, a thank-you and review request after the visit | P0 |
| A7 | Understands Nigerian English and common Pidgin phrases (for example, "how much be braids?") | P1 |
| A8 | Customer can send a reference photo of a style and the assistant passes it to staff | P1 |
| A9 | Opt-in and opt-out for promotional messages, following WhatsApp policy | P0 |
| A10 | AI-powered free-text answers that stick to the salon's own information, and hand over to staff when unsure | P2 |

### 5.4 Admin dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| D1 | Secure login for the owner and staff, with roles (Owner, Staff) | P0 |
| D2 | Calendar view of bookings by day and week, filterable by stylist | P0 |
| D3 | Create, edit or cancel bookings manually (for walk-ins and phone bookings) | P0 |
| D4 | Manage services: name, category, price, duration, deposit, photo | P0 |
| D5 | Manage opening hours, holidays and closures, and stylist availability | P0 |
| D6 | View deposit and payment status | P0 |
| D7 | Customer list with visit history and notes | P1 |
| D8 | Simple reports: bookings, revenue from deposits, no-shows, most popular services | P1 |
| D9 | WhatsApp inbox to answer handed-off conversations (or use the WhatsApp Business app or a provider's inbox) | P1 |

## 6. Non-functional requirements

- **Mobile-first:** designed for phone screens around 360px wide first.
- **Performance:** home page under 1.5 MB, usable on 3G. Images in WebP and lazy-loaded. Target Lighthouse performance score of 85 or more on mobile.
- **Availability:** 99.5% uptime. Booking must keep working even if WhatsApp is down, with confirmations falling back to SMS or email.
- **Security:** HTTPS everywhere, payments handled only by Paystack or Flutterwave (no card data stored), admin sessions protected, and payment webhooks verified.
- **Privacy:** compliant with the **Nigeria Data Protection Act (NDPA) 2023**. Collect only what is needed, publish a privacy policy, record WhatsApp opt-in, and allow customers to have their data deleted.
- **Accessibility:** WCAG 2.1 AA basics: colour contrast, alt text on gallery images, keyboard-friendly forms.
- **Localisation:** prices in ₦ (NGN), West Africa Time (WAT, UTC+1), phone numbers in +234 format. English first, with Pidgin-friendly wording for the assistant.
- **SEO:** local search (for example, "hair salon in [area]"), a Google Business Profile link, and structured data (`HairSalon` schema).

## 7. Key user flows

### 7.1 Booking on the website

```
Home → "Book now" → Pick service(s) → Pick stylist (optional) → Pick date and time
     → Enter name + WhatsApp number → Pay deposit (Paystack/Flutterwave)
     → Confirmation page + WhatsApp confirmation → Reminders at 24h and 2h → Visit
     → Thank-you + review request
```

### 7.2 Booking on WhatsApp

```
Customer: "Hi"
Assistant: Welcome to Attat Hair Salon 💇🏾‍♀️ What would you like to do?
  [See prices] [Book appointment] [My booking] [Talk to a stylist]
→ Book appointment → pick category → pick service → pick date → pick time
→ Payment link for deposit → "You're booked! ✅ Knotless braids, Sat 10:00am"
```

### 7.3 Hand-off to staff

```
Unrecognised question, or customer taps "Talk to a stylist"
→ Assistant: "Connecting you to our team, they'll reply shortly."
→ Staff notified → Staff replies from the inbox → Assistant pauses for that chat
```

## 8. Suggested technical approach

These are suggestions, still to be confirmed.

| Layer | Option |
|-------|--------|
| Frontend | Next.js (React) + Tailwind CSS; static pages for speed |
| Backend / API | Next.js API routes or Node.js (Express/Nest) |
| Database | PostgreSQL (for example, Supabase) |
| Payments | Paystack (main) or Flutterwave, using webhooks |
| WhatsApp | WhatsApp Business Cloud API (direct from Meta, or through a provider such as Twilio or 360dialog) |
| Hosting | Vercel or Netlify for the frontend, with a managed database |
| Images | Cloudinary or a similar service for image optimisation |
| Notifications fallback | SMS through Termii, or email |

**Core data model:** `Service`, `Category`, `Stylist`, `Availability`, `Booking`, `Customer`, `Payment`, `Conversation`, `MessageLog`.

## 9. Release plan

| Phase | What ships | Rough timing |
|-------|-------------|--------------|
| **Phase 1: MVP** | Website (W1–W4, W8), click-to-chat (A1), booking with deposit (B1, B3–B8), basic admin (D1–D6), WhatsApp confirmations and reminders (A6) | 4–6 weeks |
| **Phase 2: Assistant** | WhatsApp menu and FAQ bot (A2, A3, A5, A9), booking in WhatsApp (A4), stylist choice (B2), FAQ and reviews (W5, W6), customer list and reports (D7, D8) | +3–4 weeks |
| **Phase 3: Growth** | AI answers (A10), Pidgin understanding (A7), group bookings, waitlist, loyalty and referrals, online product shop | Later |

## 10. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| WhatsApp Business API approval or template rejection | Apply early; keep click-to-chat as a fallback; write templates that follow Meta's policy |
| WhatsApp message costs | Use free customer-initiated conversation windows where possible; keep business-initiated messages to transactional ones |
| Customers don't trust paying deposits online | Use well-known Paystack or Flutterwave checkout; state the deposit policy clearly; also accept bank transfer |
| Poor connectivity or power outages at the salon | Cloud-hosted, so the system keeps running regardless; the admin works on a phone |
| Prices vary with hair length or size | Show price ranges and "from ₦…" prices; confirm the final price at the salon |
| Double bookings from walk-ins | Staff record walk-ins in the admin straight away |

## 11. Success metrics

- Number of online bookings each week (website and WhatsApp)
- Share of bookings that pay a deposit
- No-show rate
- WhatsApp: number of conversations, share answered automatically, hand-off rate, reply time
- Conversion from website visit to booking
- Repeat-customer rate

## 12. Open questions

1. What is the salon's exact location (city or area), and are there any plans for more branches?
2. Is there an existing WhatsApp Business number we should use, and is the business Meta-verified?
3. Which payment provider: Paystack, Flutterwave, or both? Does the salon already have an account?
4. What is the deposit policy (fixed amount or percentage), and what is the cancellation or refund window?
5. How many stylists are there, and can customers choose a specific one?
6. Does the salon sell hair and attachments, and should they be listed or bookable together with a service?
7. Which brand assets exist already (logo, colours, photos)?
8. Should the assistant reply in Hausa, Yoruba or Igbo as well as English and Pidgin?
9. What is the budget for monthly running costs (hosting, WhatsApp messages, SMS)?

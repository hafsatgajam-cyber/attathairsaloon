import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { addDays, isValidDate, MAX_DAYS_AHEAD, salonToday } from "@/lib/availability";
import { getSlots, resolveServices, summarise } from "@/lib/booking-server";
import { bookingEnabled, paymentsEnabled, siteUrl } from "@/lib/config";
import { normalizeNgPhone } from "@/lib/format";
import { loadBooking, sendConfirmation } from "@/lib/notify";
import { initializePayment } from "@/lib/paystack";
import { createSupabaseAdmin } from "@/lib/supabase/server";

type Body = {
  serviceIds?: string[];
  stylistId?: string | null;
  date?: string;
  time?: string;
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
  whatsappOptIn?: boolean;
};

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: NextRequest) {
  if (!bookingEnabled) {
    return bad("Online booking isn't switched on yet. Please book with us on WhatsApp.", 503);
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const serviceIds = Array.isArray(body.serviceIds) ? body.serviceIds.slice(0, 5) : [];
  const date = body.date ?? "";
  const time = body.time ?? "";
  const name = (body.name ?? "").trim().slice(0, 80);
  const phone = normalizeNgPhone(body.phone ?? "");
  const email = (body.email ?? "").trim().slice(0, 120) || null;
  const notes = (body.notes ?? "").trim().slice(0, 500) || null;

  const today = salonToday();
  if (!serviceIds.length) return bad("Pick at least one service.");
  if (!isValidDate(date) || date < today || date > addDays(today, MAX_DAYS_AHEAD)) return bad("Pick a valid date.");
  if (!/^\d{2}:\d{2}$/.test(time)) return bad("Pick a time.");
  if (name.length < 2) return bad("Enter your name.");
  if (!phone) return bad("Enter a valid Nigerian phone number, e.g. 0803 123 4567.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("Enter a valid email address.");

  const { services, complete } = await resolveServices(serviceIds);
  if (!complete) return bad("One of those services is no longer available.");
  const summary = summarise(services);
  const needsPayment = paymentsEnabled && summary.deposit > 0;
  if (needsPayment && !email) return bad("Enter your email so Paystack can send your deposit receipt.");

  // Re-check the slot on the server: never trust what the browser saw.
  const { slots } = await getSlots(date, serviceIds, body.stylistId ?? null);
  const slot = slots.find((s) => s.time === time);
  if (!slot) return bad("Sorry, that time was just taken. Please pick another.", 409);
  const stylistId = slot.stylistIds[0];
  const start = new Date(slot.start);
  const end = new Date(start.getTime() + summary.duration * 60_000);

  const db = createSupabaseAdmin();
  const { data: customer, error: custErr } = await db
    .from("customers")
    .upsert(
      { phone, name, ...(email ? { email } : {}), whatsapp_opt_in: body.whatsappOptIn !== false },
      { onConflict: "phone" },
    )
    .select("id")
    .single();
  if (custErr || !customer) return bad("Could not save your details. Please try again.", 500);

  const paymentRef = needsPayment ? `ATT-${randomBytes(6).toString("hex").toUpperCase()}` : null;
  const { data: booking, error: bookErr } = await db
    .from("bookings")
    .insert({
      customer_id: customer.id,
      stylist_id: stylistId,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      status: needsPayment ? "pending_payment" : "confirmed",
      price_estimate: summary.priceMin,
      deposit_amount: needsPayment ? summary.deposit : 0,
      payment_ref: paymentRef,
      notes,
      source: "website",
    })
    .select("id, manage_token")
    .single();

  if (bookErr || !booking) {
    // 23P01 = exclusion violation: someone booked the same stylist/time first.
    if (bookErr?.code === "23P01") return bad("Sorry, that time was just taken. Please pick another.", 409);
    return bad("Could not create your booking. Please try again.", 500);
  }

  await db.from("booking_services").insert(
    services.map((s) => ({ booking_id: booking.id, service_id: s.id, price_min: s.price_min, duration_min: s.duration_min })),
  );

  const manageUrl = `${siteUrl}/booking/${booking.manage_token}`;

  if (needsPayment && paymentRef && email) {
    try {
      const url = await initializePayment({
        email,
        amountNaira: summary.deposit,
        reference: paymentRef,
        callbackUrl: manageUrl,
        metadata: { booking_id: booking.id, customer_name: name },
      });
      return NextResponse.json({ redirect: url });
    } catch (e) {
      console.error(e);
      await db.from("bookings").update({ status: "cancelled" }).eq("id", booking.id);
      return bad("We couldn't start the payment. Please try again or book on WhatsApp.", 502);
    }
  }

  const detail = await loadBooking({ id: booking.id });
  if (detail) await sendConfirmation(detail);
  return NextResponse.json({ redirect: `/booking/${booking.manage_token}` });
}

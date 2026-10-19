import "server-only";
import { siteUrl } from "./config";
import { formatDateTime } from "./format";
import { createSupabaseAdmin } from "./supabase/server";
import { sendWhatsAppTemplate, templates } from "./whatsapp";

export const BOOKING_SELECT =
  "id, start_at, end_at, status, price_estimate, deposit_amount, deposit_paid, payment_ref, notes, manage_token, created_at," +
  " customer:customers(name, phone, email, whatsapp_opt_in), stylist:stylists(name)," +
  " items:booking_services(price_min, duration_min, service:services(name))";

export type BookingDetail = {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  price_estimate: number;
  deposit_amount: number;
  deposit_paid: boolean;
  payment_ref: string | null;
  notes: string | null;
  manage_token: string;
  created_at: string;
  customer: { name: string; phone: string; email: string | null; whatsapp_opt_in: boolean } | null;
  stylist: { name: string } | null;
  items: { price_min: number; duration_min: number; service: { name: string } | null }[];
};

export async function loadBooking(by: { id?: string; token?: string; paymentRef?: string }) {
  let q = createSupabaseAdmin().from("bookings").select(BOOKING_SELECT);
  if (by.id) q = q.eq("id", by.id);
  else if (by.token) q = q.eq("manage_token", by.token);
  else if (by.paymentRef) q = q.eq("payment_ref", by.paymentRef);
  else return null;
  const { data } = await q.maybeSingle();
  return data as unknown as BookingDetail | null;
}

export const serviceNames = (b: BookingDetail) =>
  b.items.map((i) => i.service?.name).filter(Boolean).join(", ");

/**
 * Template "booking_confirmation" body, e.g.:
 * Hi {{1}}, your appointment for {{2}} at Attat Hair Saloon is confirmed for {{3}}.
 * View or cancel: {{4}}
 */
export async function sendConfirmation(b: BookingDetail) {
  if (!b.customer?.whatsapp_opt_in) return false;
  return sendWhatsAppTemplate(b.customer.phone, templates.confirmation, [
    b.customer.name,
    serviceNames(b),
    formatDateTime(b.start_at),
    `${siteUrl}/booking/${b.manage_token}`,
  ]);
}

/**
 * Template "booking_reminder" body, e.g.:
 * Hi {{1}}, a reminder of your {{2}} appointment {{3}}. Need to change it? {{4}}
 */
export async function sendReminder(b: BookingDetail, when: string) {
  if (!b.customer?.whatsapp_opt_in) return false;
  return sendWhatsAppTemplate(b.customer.phone, templates.reminder, [
    b.customer.name,
    serviceNames(b),
    when,
    `${siteUrl}/booking/${b.manage_token}`,
  ]);
}

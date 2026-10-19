import "server-only";
import { addDays, computeSlots, salonInstant, type Busy, type Slot } from "./availability";
import { getCatalog } from "./catalog";
import { bookingEnabled, supabaseConfigured } from "./config";
import { createSupabaseAdmin, createSupabasePublic } from "./supabase/server";
import type { Service } from "./types";

/** Unpaid bookings hold their slot for this long before being released. */
export const PENDING_HOLD_MIN = 30;

export async function releaseStalePending() {
  if (!bookingEnabled) return;
  const cutoff = new Date(Date.now() - PENDING_HOLD_MIN * 60_000).toISOString();
  await createSupabaseAdmin()
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("status", "pending_payment")
    .lt("created_at", cutoff);
}

async function busyOn(date: string): Promise<Busy[]> {
  if (!bookingEnabled) return [];
  const dayStart = salonInstant(date, "00:00").toISOString();
  const dayEnd = salonInstant(addDays(date, 1), "00:00").toISOString();
  const { data, error } = await createSupabaseAdmin()
    .from("bookings")
    .select("stylist_id, start_at, end_at")
    .in("status", ["pending_payment", "confirmed"])
    .lt("start_at", dayEnd)
    .gt("end_at", dayStart);
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function isClosure(date: string) {
  if (!supabaseConfigured) return false;
  const { data } = await createSupabasePublic().from("closures").select("date").eq("date", date);
  return Boolean(data?.length);
}

export async function resolveServices(serviceIds: string[]) {
  const catalog = await getCatalog();
  const services = serviceIds
    .map((id) => catalog.services.find((s) => s.id === id))
    .filter((s): s is Service => Boolean(s));
  return { catalog, services, complete: services.length === serviceIds.length };
}

export function summarise(services: Service[]) {
  return {
    duration: services.reduce((n, s) => n + s.duration_min, 0),
    priceMin: services.reduce((n, s) => n + s.price_min, 0),
    priceMax: services.reduce((n, s) => n + (s.price_max ?? s.price_min), 0),
    deposit: services.reduce((n, s) => n + s.deposit_amount, 0),
  };
}

export async function getSlots(date: string, serviceIds: string[], stylistId?: string | null) {
  const { catalog, services, complete } = await resolveServices(serviceIds);
  if (!services.length || !complete) return { slots: [] as Slot[], error: "Unknown service" };
  const stylistIds = stylistId
    ? catalog.stylists.filter((s) => s.id === stylistId).map((s) => s.id)
    : catalog.stylists.map((s) => s.id);
  await releaseStalePending();
  const [busy, closed] = await Promise.all([busyOn(date), isClosure(date)]);
  const slots = computeSlots({
    date,
    durationMin: summarise(services).duration,
    hours: catalog.hours,
    closed,
    stylistIds,
    busy,
  });
  return { slots, error: null };
}

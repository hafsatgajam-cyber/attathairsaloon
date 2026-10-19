"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { salonInstant } from "@/lib/availability";
import { normalizeNgPhone } from "@/lib/format";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/types";

// Every action runs as the signed-in user, so Supabase RLS (is_staff()) is the
// real gatekeeper: non-staff writes are rejected by the database.

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const int = (f: FormData, k: string) => {
  const v = str(f, k);
  return v === "" ? null : Math.max(0, Math.round(Number(v)));
};

function back(path: string, msg?: { error?: string; ok?: string }): never {
  const qs = msg?.error ? `?error=${encodeURIComponent(msg.error)}` : msg?.ok ? `?ok=${encodeURIComponent(msg.ok)}` : "";
  redirect(`${path}${path.includes("?") && qs ? qs.replace("?", "&") : qs}`);
}

export async function signOut() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

const STATUSES: BookingStatus[] = ["confirmed", "completed", "no_show", "cancelled"];

export async function setBookingStatus(formData: FormData) {
  const status = str(formData, "status") as BookingStatus;
  if (!STATUSES.includes(status)) return;
  const supabase = await createSupabaseServer();
  await supabase.from("bookings").update({ status }).eq("id", str(formData, "id"));
  revalidatePath("/admin");
}

export async function createWalkIn(formData: FormData) {
  const date = str(formData, "date");
  const ret = `/admin?date=${date}`;
  const supabase = await createSupabaseServer();
  const phone = normalizeNgPhone(str(formData, "phone"));
  const name = str(formData, "name");
  if (!phone || name.length < 2) back(ret, { error: "Enter the customer's name and a valid phone number." });

  const { data: service } = await supabase.from("services").select("id, price_min, duration_min").eq("id", str(formData, "service_id")).single();
  if (!service) back(ret, { error: "Pick a service." });

  const start = salonInstant(date, str(formData, "time"));
  if (Number.isNaN(start.getTime())) back(ret, { error: "Pick a valid date and time." });
  const end = new Date(start.getTime() + service.duration_min * 60_000);

  const { data: customer, error: cErr } = await supabase
    .from("customers")
    .upsert({ phone, name }, { onConflict: "phone" })
    .select("id")
    .single();
  if (cErr || !customer) back(ret, { error: cErr?.message ?? "Could not save customer." });

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: customer.id,
      stylist_id: str(formData, "stylist_id"),
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      status: "confirmed",
      price_estimate: service.price_min,
      notes: str(formData, "notes") || null,
      source: str(formData, "source") || "walk_in",
    })
    .select("id")
    .single();
  if (error || !booking) {
    back(ret, { error: error?.code === "23P01" ? "That stylist is already booked at that time." : error?.message ?? "Could not create booking." });
  }
  await supabase.from("booking_services").insert({
    booking_id: booking.id,
    service_id: service.id,
    price_min: service.price_min,
    duration_min: service.duration_min,
  });
  revalidatePath("/admin");
  back(ret, { ok: "Booking added." });
}

export async function saveService(formData: FormData) {
  const supabase = await createSupabaseServer();
  const id = str(formData, "id");
  const row = {
    name: str(formData, "name"),
    category_id: str(formData, "category_id"),
    description: str(formData, "description") || null,
    price_min: int(formData, "price_min") ?? 0,
    price_max: int(formData, "price_max"),
    duration_min: int(formData, "duration_min") ?? 60,
    deposit_amount: int(formData, "deposit_amount") ?? 0,
    hair_included: formData.get("hair_included") === "on",
    active: formData.get("active") === "on",
  };
  if (!row.name) back("/admin/services", { error: "Service name is required." });
  if (row.price_max !== null && row.price_max < row.price_min) row.price_max = null;
  const { error } = id
    ? await supabase.from("services").update(row).eq("id", id)
    : await supabase.from("services").insert(row);
  if (error) back("/admin/services", { error: error.message });
  revalidatePath("/", "layout");
  back("/admin/services", { ok: `Saved “${row.name}”.` });
}

export async function saveHours(formData: FormData) {
  const supabase = await createSupabaseServer();
  const rows = [0, 1, 2, 3, 4, 5, 6].map((d) => {
    const closed = formData.get(`closed_${d}`) === "on";
    return {
      weekday: d,
      closed,
      opens: closed ? null : str(formData, `opens_${d}`) || null,
      closes: closed ? null : str(formData, `closes_${d}`) || null,
    };
  });
  const { error } = await supabase.from("opening_hours").upsert(rows);
  if (error) back("/admin/hours", { error: "Check the times: closing must be after opening." });
  revalidatePath("/", "layout");
  back("/admin/hours", { ok: "Opening hours saved." });
}

export async function addClosure(formData: FormData) {
  const supabase = await createSupabaseServer();
  const { error } = await supabase.from("closures").upsert({ date: str(formData, "date"), reason: str(formData, "reason") || null });
  if (error) back("/admin/hours", { error: error.message });
  back("/admin/hours", { ok: "Closure added." });
}

export async function removeClosure(formData: FormData) {
  const supabase = await createSupabaseServer();
  await supabase.from("closures").delete().eq("date", str(formData, "date"));
  revalidatePath("/admin/hours");
}

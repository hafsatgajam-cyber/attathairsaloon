"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function cancelBooking(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(token)) return;
  await createSupabaseAdmin()
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("manage_token", token)
    .in("status", ["pending_payment", "confirmed"])
    .gt("start_at", new Date().toISOString());
  redirect(`/booking/${token}?cancelled=1`);
}

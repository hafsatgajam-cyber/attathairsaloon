import { NextResponse, type NextRequest } from "next/server";
import { addDays, salonInstant, salonToday } from "@/lib/availability";
import { releaseStalePending } from "@/lib/booking-server";
import { bookingEnabled } from "@/lib/config";
import { formatTime } from "@/lib/format";
import { loadBooking, sendReminder } from "@/lib/notify";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Runs once a day at 08:00 Lagos time (vercel.json). Sends a "tomorrow"
 * reminder for tomorrow's bookings and a "today" reminder for today's.
 * (Vercel Hobby allows one cron run per day; on Pro you can run it hourly.)
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!bookingEnabled) return NextResponse.json({ skipped: "booking not configured" });

  await releaseStalePending();
  const db = createSupabaseAdmin();
  const today = salonToday();
  let sent = 0;

  const batches = [
    { from: today, column: "reminder_today_sent_at", label: (t: string) => `today at ${t}` },
    { from: addDays(today, 1), column: "reminder_day_sent_at", label: (t: string) => `tomorrow at ${t}` },
  ] as const;

  for (const batch of batches) {
    const { data } = await db
      .from("bookings")
      .select("id")
      .eq("status", "confirmed")
      .is(batch.column, null)
      .gte("start_at", salonInstant(batch.from, "00:00").toISOString())
      .lt("start_at", salonInstant(addDays(batch.from, 1), "00:00").toISOString());

    for (const { id } of data ?? []) {
      const b = await loadBooking({ id });
      if (!b) continue;
      if (await sendReminder(b, batch.label(formatTime(b.start_at)))) sent++;
      await db.from("bookings").update({ [batch.column]: new Date().toISOString() }).eq("id", id);
    }
  }

  return NextResponse.json({ sent });
}

import Link from "next/link";
import { addDays, isValidDate, salonInstant, salonToday } from "@/lib/availability";
import { formatNaira, formatTime } from "@/lib/format";
import type { BookingDetail } from "@/lib/notify";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createWalkIn, setBookingStatus } from "../actions";
import { Flash } from "../Flash";

const SELECT =
  "id, start_at, end_at, status, price_estimate, deposit_amount, deposit_paid, notes, source, stylist_id," +
  " customer:customers(name, phone), stylist:stylists(name), items:booking_services(service:services(name))";

type Row = Pick<BookingDetail, "id" | "start_at" | "end_at" | "status" | "price_estimate" | "deposit_amount" | "deposit_paid" | "notes"> & {
  source: string;
  stylist_id: string;
  customer: { name: string; phone: string } | null;
  stylist: { name: string } | null;
  items: { service: { name: string } | null }[];
};

const tone: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-900",
  confirmed: "bg-olive-100 text-olive-900",
  completed: "bg-sky-100 text-sky-900",
  cancelled: "bg-red-100 text-red-900 line-through",
  no_show: "bg-red-100 text-red-900",
};

function label(date: string) {
  return salonInstant(date, "12:00").toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", timeZone: "Africa/Lagos" });
}

export default async function AdminBookings({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; stylist?: string; error?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const today = salonToday();
  const date = sp.date && isValidDate(sp.date) ? sp.date : today;
  const supabase = await createSupabaseServer();

  const weekStart = date;
  const weekEnd = addDays(date, 7);
  const [{ data: week }, { data: stylists }, { data: services }] = await Promise.all([
    supabase
      .from("bookings")
      .select(SELECT)
      .gte("start_at", salonInstant(weekStart, "00:00").toISOString())
      .lt("start_at", salonInstant(weekEnd, "00:00").toISOString())
      .order("start_at"),
    supabase.from("stylists").select("id, name").eq("active", true).order("sort"),
    supabase.from("services").select("id, name").eq("active", true).order("sort"),
  ]);

  const rows = (week ?? []) as unknown as Row[];
  const dayEnd = salonInstant(addDays(date, 1), "00:00").getTime();
  const day = rows.filter((b) => new Date(b.start_at).getTime() < dayEnd && (!sp.stylist || b.stylist_id === sp.stylist));
  const live = (b: Row) => b.status === "confirmed" || b.status === "pending_payment";
  const days = Array.from({ length: 7 }, (_, i) => addDays(date, i));
  const countOn = (d: string) => {
    const s = salonInstant(d, "00:00").getTime();
    const e = salonInstant(addDays(d, 1), "00:00").getTime();
    return rows.filter((b) => live(b) && new Date(b.start_at).getTime() >= s && new Date(b.start_at).getTime() < e).length;
  };
  const q = (d: string) => `/admin?date=${d}${sp.stylist ? `&stylist=${sp.stylist}` : ""}`;

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
      <div>
        <Flash error={sp.error} ok={sp.ok} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-3xl font-semibold text-olive-900">Bookings · {label(date)}</h1>
          <div className="flex gap-2 text-sm">
            <Link href={q(addDays(date, -1))} className="btn btn-outline px-3 py-1.5">← Prev</Link>
            <Link href={q(today)} className="btn btn-outline px-3 py-1.5">Today</Link>
            <Link href={q(addDays(date, 1))} className="btn btn-outline px-3 py-1.5">Next →</Link>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {days.map((d) => (
            <Link key={d} href={q(d)} className={`shrink-0 rounded-xl px-3 py-2 text-center text-sm ${d === date ? "bg-olive-700 text-cream" : "bg-white ring-1 ring-cream-dark"}`}>
              <span className="block">{label(d)}</span>
              <span className="block text-xs opacity-75">{countOn(d)} booked</span>
            </Link>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href={`/admin?date=${date}`} className={`rounded-full px-3 py-1 ${!sp.stylist ? "bg-olive-700 text-cream" : "bg-white ring-1 ring-cream-dark"}`}>All stylists</Link>
          {(stylists ?? []).map((s) => (
            <Link key={s.id} href={`/admin?date=${date}&stylist=${s.id}`} className={`rounded-full px-3 py-1 ${sp.stylist === s.id ? "bg-olive-700 text-cream" : "bg-white ring-1 ring-cream-dark"}`}>{s.name}</Link>
          ))}
        </div>

        <ul className="mt-6 space-y-3">
          {day.length === 0 && <li className="rounded-2xl bg-white p-6 text-ink/60 ring-1 ring-cream-dark">No bookings for this day.</li>}
          {day.map((b) => (
            <li key={b.id} className="rounded-2xl bg-white p-4 ring-1 ring-cream-dark sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-olive-900">
                    {formatTime(b.start_at)} – {formatTime(b.end_at)} · {b.stylist?.name}
                  </p>
                  <p className="mt-1">{b.items.map((i) => i.service?.name).join(", ")}</p>
                  <p className="mt-1 text-sm text-ink/70">
                    {b.customer?.name} ·{" "}
                    <a className="font-semibold text-[#188a45]" href={`https://wa.me/${b.customer?.phone}`} target="_blank" rel="noopener noreferrer">
                      WhatsApp +{b.customer?.phone}
                    </a>
                  </p>
                  <p className="mt-1 text-xs text-ink/60">
                    From {formatNaira(b.price_estimate)} · {b.source.replace("_", " ")}
                    {b.deposit_amount > 0 && ` · Deposit ${formatNaira(b.deposit_amount)} ${b.deposit_paid ? "paid ✓" : "unpaid"}`}
                  </p>
                  {b.notes && <p className="mt-2 rounded-lg bg-cream p-2 text-sm whitespace-pre-line">{b.notes}</p>}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[b.status]}`}>{b.status.replace("_", " ")}</span>
              </div>
              {b.status !== "cancelled" && (
                <form action={setBookingStatus} className="mt-3 flex flex-wrap gap-2 text-xs">
                  <input type="hidden" name="id" value={b.id} />
                  {b.status !== "completed" && <button name="status" value="completed" className="rounded-full bg-olive-700 px-3 py-1.5 text-cream">Mark done</button>}
                  {b.status === "pending_payment" && <button name="status" value="confirmed" className="rounded-full border border-olive-300 px-3 py-1.5">Confirm (paid offline)</button>}
                  {live(b) && <button name="status" value="no_show" className="rounded-full border border-olive-300 px-3 py-1.5">No-show</button>}
                  {live(b) && <button name="status" value="cancelled" className="rounded-full border border-red-300 px-3 py-1.5 text-red-800">Cancel</button>}
                </form>
              )}
            </li>
          ))}
        </ul>
      </div>

      <aside>
        <form action={createWalkIn} className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-cream-dark xl:sticky xl:top-6">
          <h2 className="font-serif text-2xl font-semibold text-olive-900">Add a booking</h2>
          <p className="text-xs text-ink/60">For walk-ins, phone calls and WhatsApp chats.</p>
          <input type="hidden" name="date" value={date} />
          <select name="service_id" required className="field" defaultValue="">
            <option value="" disabled>Service…</option>
            {(services ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select name="stylist_id" required className="field" defaultValue={sp.stylist ?? ""}>
            <option value="" disabled>Stylist…</option>
            {(stylists ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="flex gap-2">
            <input name="date_display" disabled value={label(date)} className="field flex-1 bg-cream" />
            <input name="time" type="time" required step={900} className="field w-32" />
          </div>
          <input name="name" required placeholder="Customer name" className="field" />
          <input name="phone" required type="tel" placeholder="0803 123 4567" className="field" />
          <select name="source" className="field" defaultValue="walk_in">
            <option value="walk_in">Walk-in</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="admin">Phone call</option>
          </select>
          <textarea name="notes" rows={2} placeholder="Notes (optional)" className="field" />
          <button className="btn btn-primary w-full">Add booking</button>
        </form>
      </aside>
    </div>
  );
}

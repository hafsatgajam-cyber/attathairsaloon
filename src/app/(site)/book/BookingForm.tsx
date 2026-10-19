"use client";

import { useEffect, useMemo, useState } from "react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { addDays, salonInstant, weekdayOf } from "@/lib/availability";
import { whatsappLink } from "@/lib/config";
import { formatDuration, formatNaira, formatPrice } from "@/lib/format";
import type { Catalog } from "@/lib/types";

type Props = {
  catalog: Catalog;
  initialServiceId?: string;
  today: string;
  bookingEnabled: boolean;
  paymentsEnabled: boolean;
};

const DAY_COUNT = 14;

function dayLabel(date: string) {
  const d = salonInstant(date, "12:00");
  return {
    weekday: d.toLocaleDateString("en-NG", { weekday: "short", timeZone: "Africa/Lagos" }),
    day: d.toLocaleDateString("en-NG", { day: "numeric", timeZone: "Africa/Lagos" }),
    month: d.toLocaleDateString("en-NG", { month: "short", timeZone: "Africa/Lagos" }),
  };
}

function to12h(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`;
}

export function BookingForm({ catalog, initialServiceId, today, bookingEnabled, paymentsEnabled }: Props) {
  const { categories, services, stylists, hours } = catalog;
  const [selected, setSelected] = useState<string[]>(
    initialServiceId && services.some((s) => s.id === initialServiceId) ? [initialServiceId] : [],
  );
  const [openCat, setOpenCat] = useState<string | null>(
    services.find((s) => s.id === initialServiceId)?.category_id ?? categories[0]?.id ?? null,
  );
  const [stylistId, setStylistId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<{ time: string }[] | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [time, setTime] = useState("");
  const [reload, setReload] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "", optIn: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chosen = useMemo(() => services.filter((s) => selected.includes(s.id)), [services, selected]);
  const total = {
    duration: chosen.reduce((n, s) => n + s.duration_min, 0),
    min: chosen.reduce((n, s) => n + s.price_min, 0),
    max: chosen.reduce((n, s) => n + (s.price_max ?? s.price_min), 0),
    deposit: chosen.reduce((n, s) => n + s.deposit_amount, 0),
  };
  const needsDeposit = paymentsEnabled && total.deposit > 0;

  const days = useMemo(() => Array.from({ length: DAY_COUNT }, (_, i) => addDays(today, i)), [today]);
  const isClosed = (d: string) => {
    const h = hours.find((x) => x.weekday === weekdayOf(d));
    return !h || h.closed;
  };

  // Load free times whenever the services, stylist or date change.
  useEffect(() => {
    setTime("");
    if (!date || !selected.length) {
      setSlots(null);
      return;
    }
    const ctrl = new AbortController();
    setSlots(null);
    setSlotError(null);
    const qs = new URLSearchParams({ date, services: selected.join(","), ...(stylistId ? { stylist: stylistId } : {}) });
    fetch(`/api/availability?${qs}`, { signal: ctrl.signal })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Could not load times");
        setSlots(json.slots);
      })
      .catch((e: Error) => {
        if (e.name !== "AbortError") setSlotError(e.message);
      });
    return () => ctrl.abort();
  }, [date, selected, stylistId, reload]);

  const toggle = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 5 ? cur : [...cur, id]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceIds: selected,
          stylistId: stylistId || null,
          date,
          time,
          name: form.name,
          phone: form.phone,
          email: form.email,
          notes: form.notes,
          whatsappOptIn: form.optIn,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        if (res.status === 409) setReload((n) => n + 1); // refresh times; user re-picks
        return;
      }
      window.location.href = json.redirect;
    } catch {
      setError("Network problem. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const waMessage = `Hi Attat Hair Saloon 👋 I'd like to book: ${chosen.map((s) => s.name).join(", ") || "an appointment"}${date ? ` on ${date}` : ""}${time ? ` at ${to12h(time)}` : ""}.`;
  const canSubmit = selected.length > 0 && date && time && form.name.trim().length > 1 && form.phone.trim() && (!needsDeposit || form.email.trim());

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0 space-y-8">
        {/* 1. Services */}
        <section className="rounded-2xl bg-white p-5 ring-1 ring-cream-dark sm:p-6">
          <h2 className="flex items-center gap-3 font-serif text-2xl font-semibold text-olive-900">
            <Step n={1} /> Choose your service
          </h2>
          <div className="mt-5 space-y-2">
            {categories.map((c) => {
              const items = services.filter((s) => s.category_id === c.id);
              const count = items.filter((s) => selected.includes(s.id)).length;
              const isOpen = openCat === c.id;
              return (
                <div key={c.id} className="rounded-xl border border-cream-dark">
                  <button type="button" onClick={() => setOpenCat(isOpen ? null : c.id)} className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-olive-900" aria-expanded={isOpen}>
                    <span>{c.name}{count > 0 && <span className="ml-2 rounded-full bg-olive-700 px-2 py-0.5 text-xs text-cream">{count}</span>}</span>
                    <span className="text-gold">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <ul className="space-y-2 px-3 pb-3">
                      {items.map((s) => {
                        const on = selected.includes(s.id);
                        return (
                          <li key={s.id}>
                            <label className={`flex cursor-pointer items-start gap-3 rounded-lg p-3 transition ${on ? "bg-olive-100 ring-1 ring-olive-500" : "hover:bg-cream"}`}>
                              <input type="checkbox" checked={on} onChange={() => toggle(s.id)} className="mt-1 h-4 w-4 accent-olive-700" />
                              <span className="flex-1">
                                <span className="block font-medium">{s.name}</span>
                                <span className="block text-sm text-ink/60">{formatDuration(s.duration_min)}{s.deposit_amount > 0 && paymentsEnabled ? ` · ${formatNaira(s.deposit_amount)} deposit` : ""}</span>
                              </span>
                              <span className="text-sm font-semibold whitespace-nowrap">{formatPrice(s.price_min, s.price_max)}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. Stylist, date & time */}
        <section className={`rounded-2xl bg-white p-5 ring-1 ring-cream-dark sm:p-6 ${!selected.length ? "opacity-50" : ""}`}>
          <h2 className="flex items-center gap-3 font-serif text-2xl font-semibold text-olive-900">
            <Step n={2} /> Pick a date & time
          </h2>
          <fieldset disabled={!selected.length} className="mt-5 space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold">Stylist</p>
              <div className="flex flex-wrap gap-2">
                {[{ id: "", name: "Any available" }, ...stylists].map((s) => (
                  <button key={s.id} type="button" onClick={() => setStylistId(s.id)} className={`rounded-full px-4 py-2 text-sm ${stylistId === s.id ? "bg-olive-700 text-cream" : "border border-olive-200 text-olive-800 hover:bg-olive-50"}`}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Date</p>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                {days.map((d) => {
                  const l = dayLabel(d);
                  const closed = isClosed(d);
                  return (
                    <button key={d} type="button" disabled={closed} onClick={() => setDate(d)} className={`flex w-16 shrink-0 flex-col items-center rounded-xl py-2 text-sm ${date === d ? "bg-olive-700 text-cream" : closed ? "bg-cream text-ink/30 line-through" : "border border-olive-200 hover:bg-olive-50"}`}>
                      <span className="text-xs uppercase">{l.weekday}</span>
                      <span className="font-serif text-xl font-semibold">{l.day}</span>
                      <span className="text-xs">{l.month}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {date && (
              <div>
                <p className="mb-2 text-sm font-semibold">Time</p>
                {slotError ? (
                  <p className="text-sm text-red-700">{slotError}</p>
                ) : slots === null ? (
                  <p className="text-sm text-ink/60">Checking free times…</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-ink/70">No free times on this day for {formatDuration(total.duration)}. Try another day or stylist.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {slots.map((s) => (
                      <button key={s.time} type="button" onClick={() => setTime(s.time)} className={`rounded-lg py-2 text-sm ${time === s.time ? "bg-olive-700 text-cream" : "border border-olive-200 hover:bg-olive-50"}`}>
                        {to12h(s.time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </fieldset>
        </section>

        {/* 3. Details */}
        <section className={`rounded-2xl bg-white p-5 ring-1 ring-cream-dark sm:p-6 ${!time ? "opacity-50" : ""}`}>
          <h2 className="flex items-center gap-3 font-serif text-2xl font-semibold text-olive-900">
            <Step n={3} /> Your details
          </h2>
          <fieldset disabled={!time} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Full name
              <input className="field mt-1 font-normal" required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="block text-sm font-semibold">
              WhatsApp number
              <input className="field mt-1 font-normal" required type="tel" inputMode="tel" autoComplete="tel" placeholder="0803 123 4567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label className="block text-sm font-semibold sm:col-span-2">
              Email {needsDeposit ? "(for your payment receipt)" : "(optional)"}
              <input className="field mt-1 font-normal" type="email" autoComplete="email" required={needsDeposit} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className="block text-sm font-semibold sm:col-span-2">
              Notes for your stylist (optional)
              <textarea className="field mt-1 font-normal" rows={3} placeholder="Length, colour, bringing my own hair…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </label>
            <label className="flex items-start gap-3 text-sm sm:col-span-2">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-olive-700" checked={form.optIn} onChange={(e) => setForm({ ...form, optIn: e.target.checked })} />
              Send my booking confirmation and reminders on WhatsApp.
            </label>
          </fieldset>
        </section>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-olive-900 p-6 text-cream">
          <p className="eyebrow text-gold-light">Your booking</p>
          {chosen.length === 0 ? (
            <p className="mt-3 text-cream/70">No service selected yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {chosen.map((s) => (
                <li key={s.id} className="flex justify-between gap-3">
                  <span>{s.name}</span>
                  <button type="button" onClick={() => toggle(s.id)} className="text-cream/50 hover:text-cream" aria-label={`Remove ${s.name}`}>✕</button>
                </li>
              ))}
            </ul>
          )}
          <dl className="mt-5 space-y-1 border-t border-olive-700 pt-4 text-sm">
            {date && <Row k="Date" v={`${dayLabel(date).weekday} ${dayLabel(date).day} ${dayLabel(date).month}${time ? `, ${to12h(time)}` : ""}`} />}
            {chosen.length > 0 && <Row k="Time needed" v={formatDuration(total.duration)} />}
            {chosen.length > 0 && <Row k="Estimated price" v={formatPrice(total.min, total.max === total.min ? null : total.max)} />}
            {needsDeposit && <Row k="Deposit now" v={formatNaira(total.deposit)} strong />}
          </dl>

          {error && <p className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-800">{error}</p>}

          {bookingEnabled ? (
            <button type="submit" disabled={!canSubmit || submitting} className="btn mt-5 w-full bg-gold text-ink hover:bg-gold-light">
              {submitting ? "Booking…" : needsDeposit ? `Pay ${formatNaira(total.deposit)} deposit & book` : "Confirm booking"}
            </button>
          ) : (
            <p className="mt-5 rounded-lg bg-olive-800 p-3 text-sm text-cream/80">
              Online booking opens soon. Send your choice to us on WhatsApp and we&apos;ll book you in.
            </p>
          )}
          <a href={whatsappLink(waMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-3 w-full">
            <WhatsAppIcon /> Book on WhatsApp instead
          </a>
          {needsDeposit && <p className="mt-3 text-xs text-cream/60">Secure payment by Paystack: card, bank transfer or USSD. The deposit comes off your final bill.</p>}
        </div>
      </aside>
    </form>
  );
}

function Step({ n }: { n: number }) {
  return <span className="flex h-8 w-8 items-center justify-center rounded-full bg-olive-700 font-sans text-sm text-cream">{n}</span>;
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-cream/70">{k}</dt>
      <dd className={strong ? "font-semibold text-gold-light" : ""}>{v}</dd>
    </div>
  );
}

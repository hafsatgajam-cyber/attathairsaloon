import type { OpeningHours } from "./types";

// All salon times are Africa/Lagos, which is a fixed UTC+1 (no daylight saving).
const OFFSET = "+01:00";
export const SLOT_STEP_MIN = 30;
export const MIN_LEAD_MIN = 60; // earliest bookable slot is an hour from now
export const MAX_DAYS_AHEAD = 60;

export type Busy = { stylist_id: string; start_at: string; end_at: string };
export type Slot = { time: string; start: string; stylistIds: string[] };

export const salonInstant = (date: string, time: string) => new Date(`${date}T${time}:00${OFFSET}`);

export function weekdayOf(date: string) {
  return salonInstant(date, "12:00").getUTCDay();
}

/** Today's date in Lagos as YYYY-MM-DD. */
export function salonToday(now = new Date()) {
  return new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number) {
  const d = salonInstant(date, "12:00");
  d.setUTCDate(d.getUTCDate() + days);
  return salonToday(new Date(d.getTime() - 60 * 60 * 1000));
}

export function isValidDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(salonInstant(date, "12:00").getTime());
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

/**
 * Free start times on `date` for an appointment lasting `durationMin`.
 * A slot is offered when at least one of `stylistIds` is free for the whole
 * appointment and it finishes by closing time.
 */
export function computeSlots(opts: {
  date: string;
  durationMin: number;
  hours: OpeningHours[];
  closed?: boolean;
  stylistIds: string[];
  busy: Busy[];
  now?: Date;
}): Slot[] {
  const { date, durationMin, hours, stylistIds, busy, now = new Date() } = opts;
  const day = hours.find((h) => h.weekday === weekdayOf(date));
  if (opts.closed || !day || day.closed || !day.opens || !day.closes) return [];

  const open = toMinutes(day.opens);
  const close = toMinutes(day.closes);
  const earliest = now.getTime() + MIN_LEAD_MIN * 60_000;
  const busyMs = busy.map((b) => ({
    stylist: b.stylist_id,
    start: new Date(b.start_at).getTime(),
    end: new Date(b.end_at).getTime(),
  }));

  const slots: Slot[] = [];
  for (let t = open; t + durationMin <= close; t += SLOT_STEP_MIN) {
    const time = toHHMM(t);
    const start = salonInstant(date, time).getTime();
    if (start < earliest) continue;
    const end = start + durationMin * 60_000;
    const free = stylistIds.filter(
      (s) => !busyMs.some((b) => b.stylist === s && b.start < end && b.end > start),
    );
    if (free.length) slots.push({ time, start: new Date(start).toISOString(), stylistIds: free });
  }
  return slots;
}

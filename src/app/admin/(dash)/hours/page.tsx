import { salonToday } from "@/lib/availability";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { OpeningHours } from "@/lib/types";
import { addClosure, removeClosure, saveHours } from "../../actions";
import { Flash } from "../../Flash";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ORDER = [1, 2, 3, 4, 5, 6, 0];
const hhmm = (t: string | null | undefined) => (t ? t.slice(0, 5) : "");

export default async function AdminHours({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams;
  const supabase = await createSupabaseServer();
  const [{ data: hours }, { data: closures }] = await Promise.all([
    supabase.from("opening_hours").select("*"),
    supabase.from("closures").select("*").gte("date", salonToday()).order("date"),
  ]);
  const byDay = new Map(((hours ?? []) as OpeningHours[]).map((h) => [h.weekday, h]));

  return (
    <div className="max-w-2xl">
      <Flash error={sp.error} ok={sp.ok} />
      <h1 className="font-serif text-3xl font-semibold text-olive-900">Opening hours</h1>
      <form action={saveHours} className="mt-6 space-y-3 rounded-2xl bg-white p-5 ring-1 ring-cream-dark">
        {ORDER.map((d) => {
          const h = byDay.get(d);
          return (
            <div key={d} className="grid grid-cols-[110px_1fr_1fr_auto] items-center gap-3 text-sm">
              <span className="font-semibold">{DAYS[d]}</span>
              <input type="time" name={`opens_${d}`} defaultValue={hhmm(h?.opens) || "08:00"} className="field py-2" />
              <input type="time" name={`closes_${d}`} defaultValue={hhmm(h?.closes) || "19:00"} className="field py-2" />
              <label className="flex items-center gap-1.5"><input type="checkbox" name={`closed_${d}`} defaultChecked={h?.closed} className="accent-olive-700" /> Closed</label>
            </div>
          );
        })}
        <button className="btn btn-primary mt-2">Save hours</button>
      </form>

      <h2 className="mt-10 font-serif text-2xl font-semibold text-olive-900">Holidays & closures</h2>
      <p className="mt-1 text-sm text-ink/60">No online bookings are offered on these dates.</p>
      <form action={addClosure} className="mt-4 flex flex-wrap gap-2">
        <input type="date" name="date" required min={salonToday()} className="field w-auto" />
        <input name="reason" placeholder="Reason (e.g. Sallah)" className="field flex-1" />
        <button className="btn btn-primary">Add</button>
      </form>
      <ul className="mt-4 space-y-2">
        {(closures ?? []).map((c: { date: string; reason: string | null }) => (
          <li key={c.date} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-cream-dark">
            <span>{c.date}{c.reason && <span className="text-ink/60"> · {c.reason}</span>}</span>
            <form action={removeClosure}><input type="hidden" name="date" value={c.date} /><button className="text-sm text-red-700">Remove</button></form>
          </li>
        ))}
      </ul>
    </div>
  );
}

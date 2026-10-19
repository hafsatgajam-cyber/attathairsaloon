import type { OpeningHours } from "@/lib/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first

function fmt(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, "0")}${suffix}` : `${hour}${suffix}`;
}

export function HoursList({ hours, className = "" }: { hours: OpeningHours[]; className?: string }) {
  return (
    <dl className={`grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 ${className}`}>
      {ORDER.map((d) => {
        const h = hours.find((x) => x.weekday === d);
        return (
          <div key={d} className="contents">
            <dt>{DAYS[d]}</dt>
            <dd className="text-right sm:text-left">
              {!h || h.closed || !h.opens || !h.closes ? "Closed" : `${fmt(h.opens)} – ${fmt(h.closes)}`}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

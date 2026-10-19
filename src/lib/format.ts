const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export const formatNaira = (n: number) => naira.format(n);

export function formatPrice(min: number, max: number | null) {
  return max && max !== min ? `${formatNaira(min)} – ${formatNaira(max)}` : formatNaira(min);
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} hr ${m} min` : `${h} hr${h > 1 ? "s" : ""}`;
}

/** Salon time zone. Lagos has no daylight saving, so it is always UTC+1. */
export const SALON_TZ = "Africa/Lagos";

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    timeZone: SALON_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-NG", {
    timeZone: SALON_TZ,
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Normalise a Nigerian phone number to digits-only E.164 (234XXXXXXXXXX). */
export function normalizeNgPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let local: string | null = null;
  if (digits.startsWith("234") && digits.length === 13) local = digits.slice(3);
  else if (digits.startsWith("0") && digits.length === 11) local = digits.slice(1);
  else if (digits.length === 10) local = digits;
  if (!local || !/^[789]\d{9}$/.test(local)) return null;
  return `234${local}`;
}

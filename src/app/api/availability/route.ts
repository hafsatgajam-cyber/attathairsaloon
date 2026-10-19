import { NextResponse, type NextRequest } from "next/server";
import { addDays, isValidDate, MAX_DAYS_AHEAD, salonToday } from "@/lib/availability";
import { getSlots } from "@/lib/booking-server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const date = p.get("date") ?? "";
  const serviceIds = (p.get("services") ?? "").split(",").filter(Boolean);
  const stylist = p.get("stylist") || null;

  const today = salonToday();
  if (!isValidDate(date) || date < today || date > addDays(today, MAX_DAYS_AHEAD)) {
    return NextResponse.json({ error: "Pick a date within the next two months." }, { status: 400 });
  }
  if (!serviceIds.length) return NextResponse.json({ error: "Pick at least one service." }, { status: 400 });

  const { slots, error } = await getSlots(date, serviceIds, stylist);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ slots: slots.map(({ time, start }) => ({ time, start })) });
}

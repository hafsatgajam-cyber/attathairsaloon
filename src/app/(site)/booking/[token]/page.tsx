import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { bookingEnabled, salon, whatsappLink } from "@/lib/config";
import { formatDateTime, formatDuration, formatNaira } from "@/lib/format";
import { loadBooking, serviceNames } from "@/lib/notify";
import { confirmDeposit } from "@/lib/payments-server";
import { cancelBooking } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your booking", robots: { index: false } };

const UUID = /^[0-9a-f-]{36}$/i;

const statusText: Record<string, { label: string; tone: string }> = {
  pending_payment: { label: "Waiting for deposit", tone: "bg-amber-100 text-amber-900" },
  confirmed: { label: "Confirmed", tone: "bg-olive-100 text-olive-900" },
  cancelled: { label: "Cancelled", tone: "bg-red-100 text-red-900" },
  completed: { label: "Completed", tone: "bg-olive-100 text-olive-900" },
  no_show: { label: "Missed", tone: "bg-red-100 text-red-900" },
};

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ reference?: string; cancelled?: string }>;
}) {
  const { token } = await params;
  const { reference, cancelled } = await searchParams;
  if (!bookingEnabled || !UUID.test(token)) notFound();

  let booking = await loadBooking({ token });
  if (!booking) notFound();

  // Returning from Paystack: confirm the payment straight away rather than
  // waiting for the webhook.
  if (booking.status === "pending_payment" && booking.payment_ref && reference === booking.payment_ref) {
    booking = (await confirmDeposit(booking.payment_ref)) ?? booking;
  }

  const status = statusText[booking.status] ?? statusText.confirmed;
  const upcoming = new Date(booking.start_at).getTime() > Date.now();
  const canCancel = upcoming && ["pending_payment", "confirmed"].includes(booking.status);
  const freeCancel = new Date(booking.start_at).getTime() - Date.now() > salon.cancellationHours * 3600_000;
  const duration = booking.items.reduce((n, i) => n + i.duration_min, 0);

  return (
    <div className="container-page max-w-2xl py-12">
      {booking.status === "confirmed" && !cancelled && (
        <div className="mb-6 text-center">
          <p className="text-4xl">✅</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-olive-900">You&apos;re booked!</h1>
          <p className="mt-2 text-ink/70">We&apos;ve sent your confirmation to WhatsApp. See you soon, {booking.customer?.name.split(" ")[0]}.</p>
        </div>
      )}
      {booking.status === "pending_payment" && (
        <div className="mb-6 rounded-2xl bg-amber-50 p-5 text-amber-900 ring-1 ring-amber-200">
          <p className="font-semibold">Your slot is held, but the deposit isn&apos;t confirmed yet.</p>
          <p className="mt-1 text-sm">If you&apos;ve just paid, refresh this page in a minute. Unpaid bookings are released after 30 minutes.</p>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 ring-1 ring-cream-dark">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">Booking details</p>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</span>
        </div>
        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          <dt className="text-ink/60">Service</dt><dd className="font-semibold">{serviceNames(booking)}</dd>
          <dt className="text-ink/60">When</dt><dd>{formatDateTime(booking.start_at)} ({formatDuration(duration)})</dd>
          <dt className="text-ink/60">Stylist</dt><dd>{booking.stylist?.name ?? "Any available"}</dd>
          <dt className="text-ink/60">Estimate</dt><dd>From {formatNaira(booking.price_estimate)}</dd>
          {booking.deposit_amount > 0 && (
            <><dt className="text-ink/60">Deposit</dt><dd>{formatNaira(booking.deposit_amount)} {booking.deposit_paid ? "· paid ✓" : "· not paid"}</dd></>
          )}
          <dt className="text-ink/60">Where</dt><dd>{salon.address}</dd>
        </dl>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href={whatsappLink(`Hi, I'd like to change my booking (${serviceNames(booking)}, ${formatDateTime(booking.start_at)}).`)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
          <WhatsAppIcon /> Change time on WhatsApp
        </a>
        <Link href="/book" className="btn btn-outline">Make another booking</Link>
      </div>

      {canCancel && (
        <form action={cancelBooking} className="mt-10 rounded-2xl border border-red-200 p-5">
          <input type="hidden" name="token" value={booking.manage_token} />
          <p className="font-semibold text-red-900">Cancel this booking</p>
          <p className="mt-1 text-sm text-ink/70">
            {freeCancel || !booking.deposit_paid
              ? "You can cancel for free."
              : `Your appointment is less than ${salon.cancellationHours} hours away, so the deposit can't be refunded.`}
          </p>
          <button className="btn mt-4 border border-red-300 text-red-800 hover:bg-red-50">Cancel booking</button>
        </form>
      )}
    </div>
  );
}

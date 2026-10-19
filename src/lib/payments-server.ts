import "server-only";
import { loadBooking, sendConfirmation } from "./notify";
import { verifyPayment } from "./paystack";
import { createSupabaseAdmin } from "./supabase/server";

/**
 * Mark a booking's deposit as paid once Paystack confirms it, and confirm the
 * booking. Safe to call more than once (webhook + redirect both call it).
 */
export async function confirmDeposit(reference: string) {
  const booking = await loadBooking({ paymentRef: reference });
  if (!booking || booking.deposit_paid) return booking;
  if (!(await verifyPayment(reference, booking.deposit_amount))) return booking;

  const db = createSupabaseAdmin();
  const { error } = await db
    .from("bookings")
    .update({ deposit_paid: true, status: "confirmed" })
    .eq("id", booking.id);

  if (error) {
    // Usually the hold expired and someone else took the slot. Keep the money
    // on record so staff can rebook or refund.
    await db
      .from("bookings")
      .update({
        deposit_paid: true,
        notes: `${booking.notes ? booking.notes + "\n" : ""}⚠ Deposit paid after the slot was released. Rebook or refund.`,
      })
      .eq("id", booking.id);
    return loadBooking({ id: booking.id });
  }

  const updated = await loadBooking({ id: booking.id });
  if (updated) await sendConfirmation(updated);
  return updated;
}

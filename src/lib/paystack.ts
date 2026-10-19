import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.paystack.co";
const auth = () => ({ Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` });

/** Start a Paystack checkout. Amount is in Naira; Paystack expects kobo. */
export async function initializePayment(opts: {
  email: string;
  amountNaira: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}) {
  const res = await fetch(`${API}/transaction/initialize`, {
    method: "POST",
    headers: { ...auth(), "Content-Type": "application/json" },
    body: JSON.stringify({
      email: opts.email,
      amount: opts.amountNaira * 100,
      currency: "NGN",
      reference: opts.reference,
      callback_url: opts.callbackUrl,
      metadata: opts.metadata,
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.status) throw new Error(json.message ?? "Paystack initialize failed");
  return json.data.authorization_url as string;
}

/** True when Paystack confirms the transaction succeeded for at least `amountNaira`. */
export async function verifyPayment(reference: string, amountNaira: number) {
  const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: auth(),
    cache: "no-store",
  });
  if (!res.ok) return false;
  const json = await res.json();
  return json.data?.status === "success" && json.data.amount >= amountNaira * 100;
}

export function validWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;
  const expected = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

import { NextResponse, type NextRequest } from "next/server";
import { confirmDeposit } from "@/lib/payments-server";
import { validWebhookSignature } from "@/lib/paystack";

// Set this URL as the webhook in Paystack → Settings → API Keys & Webhooks:
//   https://<your-domain>/api/paystack/webhook
export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!validWebhookSignature(raw, req.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  const event = JSON.parse(raw) as { event: string; data?: { reference?: string } };
  if (event.event === "charge.success" && event.data?.reference) {
    await confirmDeposit(event.data.reference);
  }
  return NextResponse.json({ received: true });
}

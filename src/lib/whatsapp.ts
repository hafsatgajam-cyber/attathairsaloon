import "server-only";
import { whatsappApiEnabled } from "./config";

/**
 * Send an approved WhatsApp template through the Cloud API.
 * Templates must be created and approved in Meta Business Manager first;
 * `params` fill the {{1}}, {{2}}… placeholders in the template body.
 * Does nothing (returns false) when the API is not configured.
 */
export async function sendWhatsAppTemplate(to: string, template: string, params: string[]) {
  if (!whatsappApiEnabled) return false;
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: "en" },
          components: [
            { type: "body", parameters: params.map((text) => ({ type: "text", text })) },
          ],
        },
      }),
    },
  );
  if (!res.ok) {
    console.error("WhatsApp send failed", res.status, await res.text());
    return false;
  }
  return true;
}

export const templates = {
  confirmation: process.env.WHATSAPP_TEMPLATE_CONFIRMATION ?? "booking_confirmation",
  reminder: process.env.WHATSAPP_TEMPLATE_REMINDER ?? "booking_reminder",
};

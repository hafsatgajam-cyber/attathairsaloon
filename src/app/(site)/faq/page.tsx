import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { salon, whatsappLink } from "@/lib/config";

export const metadata: Metadata = { title: "FAQ" };

const faqs = [
  {
    q: "Do I need to bring my own hair?",
    a: "Yes, for most braids, weaves and wigs, unless the service says “hair included”. Not sure how many packs you need? Message us on WhatsApp and we'll tell you.",
  },
  {
    q: "Why do some services need a deposit?",
    a: "Long styles block a stylist's whole day, so we ask for a small deposit to secure your slot. It is taken off your final bill.",
  },
  {
    q: "What is your cancellation policy?",
    a: `You can cancel or move your appointment for free up to ${salon.cancellationHours} hours before. After that, the deposit is not refundable.`,
  },
  {
    q: "How should I come prepared?",
    a: "Come with clean, detangled hair unless you booked a wash. Tell us about any scalp sensitivity when booking.",
  },
  {
    q: "Can I bring my children?",
    a: "Yes! We have kids' styles for ages 3–12. Book a slot for each child.",
  },
  {
    q: "How do I pay?",
    a: "Deposits are paid online by card, bank transfer or USSD through Paystack. You can pay the balance at the salon by transfer, POS or cash.",
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHeader eyebrow="FAQ" title="Good to know" />
      <div className="container-page max-w-3xl py-12">
        <div className="divide-y divide-cream-dark rounded-2xl bg-white ring-1 ring-cream-dark">
          {faqs.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-olive-900">
                {f.q}
                <span className="text-gold transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-ink/75">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-ink/70">Still have a question?</p>
          <a href={whatsappLink("Hi, I have a question:")} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-3">
            <WhatsAppIcon /> Ask on WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}

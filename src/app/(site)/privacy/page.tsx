import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { salon, whatsappLink } from "@/lib/config";

export const metadata: Metadata = { title: "Privacy policy" };

// Starter policy in the spirit of the Nigeria Data Protection Act 2023.
// Have it reviewed before launch.
export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Privacy" title="Privacy policy" />
      <article className="container-page max-w-3xl space-y-5 py-12 text-ink/80">
        <p>
          {salon.name} collects only the details we need to manage your appointments: your name,
          WhatsApp number, optional email address, and the services you book.
        </p>
        <h2 className="font-serif text-2xl font-semibold text-olive-900">How we use your data</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>To confirm, remind you about, and manage your bookings.</li>
          <li>To send booking messages on WhatsApp, which you agree to when you book.</li>
          <li>To process deposits through Paystack. We never see or store your card details.</li>
        </ul>
        <h2 className="font-serif text-2xl font-semibold text-olive-900">Your rights</h2>
        <p>
          Under the Nigeria Data Protection Act 2023 you can ask to see, correct or delete your
          data, or stop WhatsApp messages at any time. Reply STOP on WhatsApp or{" "}
          <a className="font-semibold text-olive-700" href={whatsappLink("Please delete my data")}>message us</a>.
        </p>
        <h2 className="font-serif text-2xl font-semibold text-olive-900">Storage</h2>
        <p>Your data is stored securely with our service providers (Supabase, Vercel and Paystack).</p>
      </article>
    </>
  );
}

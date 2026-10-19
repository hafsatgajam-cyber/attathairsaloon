import type { Metadata } from "next";
import Link from "next/link";
import { HoursList } from "@/components/HoursList";
import { PageHeader } from "@/components/PageHeader";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { getCatalog } from "@/lib/catalog";
import { salon, whatsappLink } from "@/lib/config";

export const revalidate = 300;
export const metadata: Metadata = { title: "Contact & Directions" };

export default async function ContactPage() {
  const { hours } = await getCatalog();
  return (
    <>
      <PageHeader eyebrow="Contact" title="Visit the salon" />
      <div className="container-page grid gap-8 py-12 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-cream-dark">
            <p className="eyebrow">Address</p>
            <p className="mt-2 text-lg">{salon.address}</p>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.mapsQuery)}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-olive-700">
              Get directions →
            </a>
          </div>
          <div className="rounded-2xl bg-white p-6 ring-1 ring-cream-dark">
            <p className="eyebrow mb-3">Opening hours</p>
            <HoursList hours={hours} />
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={whatsappLink("Hi Attat Hair Saloon 👋")} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
              <WhatsAppIcon /> WhatsApp us
            </a>
            <Link href="/book" className="btn btn-primary">Book now</Link>
          </div>
        </div>
        <iframe
          title="Map to Attat Hair Saloon"
          src={`https://www.google.com/maps?q=${encodeURIComponent(salon.mapsQuery)}&output=embed`}
          className="h-80 w-full rounded-2xl border-0 md:h-full md:min-h-[420px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </>
  );
}

import Link from "next/link";
import { salon, whatsappLink } from "@/lib/config";
import { getCatalog } from "@/lib/catalog";
import { HoursList } from "./HoursList";

export async function Footer() {
  const { hours } = await getCatalog();
  return (
    <footer className="mt-24 bg-olive-950 text-cream/80">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-3">
        <div>
          <p className="font-serif text-2xl tracking-[0.12em] text-cream uppercase">{salon.name}</p>
          <p className="mt-1 text-xs tracking-[0.3em] text-gold-light uppercase">{salon.tagline}</p>
          <p className="mt-4 text-sm">{salon.address}</p>
        </div>
        <div>
          <p className="eyebrow mb-3">Opening hours</p>
          <HoursList hours={hours} className="text-sm" />
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="eyebrow mb-1">Get in touch</p>
          <a href={whatsappLink("Hi Attat Hair Saloon 👋")} className="hover:text-cream">WhatsApp: +{salon.phone}</a>
          <a href={salon.instagram} className="hover:text-cream">Instagram</a>
          <Link href="/book" className="hover:text-cream">Book an appointment</Link>
          <Link href="/privacy" className="hover:text-cream">Privacy policy</Link>
        </div>
      </div>
      <div className="border-t border-olive-800 py-5 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} {salon.name}. All rights reserved.
      </div>
    </footer>
  );
}

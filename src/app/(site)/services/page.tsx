import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { getCatalog } from "@/lib/catalog";
import { whatsappLink } from "@/lib/config";
import { formatDuration, formatNaira, formatPrice } from "@/lib/format";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Services & Prices",
  description: "Braids, cornrows, wigs, locs and treatments, with prices in Naira.",
};

export default async function ServicesPage() {
  const { categories, services } = await getCatalog();

  return (
    <>
      <PageHeader
        eyebrow="Services & prices"
        title="What we do"
        intro="Prices depend on length and size. The final price is confirmed at the salon. Hair and attachments are not included unless we say so."
      />

      <nav className="sticky top-16 z-30 border-b border-cream-dark bg-cream/95 backdrop-blur">
        <div className="container-page flex gap-2 overflow-x-auto py-3 text-sm">
          {categories.map((c) => (
            <a key={c.id} href={`#${c.slug}`} className="shrink-0 rounded-full border border-olive-200 px-4 py-1.5 text-olive-800 hover:bg-olive-100">
              {c.name}
            </a>
          ))}
        </div>
      </nav>

      <div className="container-page space-y-14 py-14">
        {categories.map((c) => {
          const items = services.filter((s) => s.category_id === c.id);
          if (!items.length) return null;
          return (
            <section key={c.id} id={c.slug} className="scroll-mt-32">
              <h2 className="font-serif text-3xl font-semibold text-olive-900">{c.name}</h2>
              <ul className="mt-5 divide-y divide-cream-dark overflow-hidden rounded-2xl bg-white ring-1 ring-cream-dark">
                {items.map((s) => (
                  <li key={s.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-olive-900">{s.name}</p>
                      {s.description && <p className="mt-1 text-sm text-ink/70">{s.description}</p>}
                      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60">
                        <span>⏱ {formatDuration(s.duration_min)}</span>
                        {s.deposit_amount > 0 && <span>Deposit {formatNaira(s.deposit_amount)}</span>}
                        <span>{s.hair_included ? "Hair included" : "Hair not included"}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                      <p className="font-semibold whitespace-nowrap text-ink">{formatPrice(s.price_min, s.price_max)}</p>
                      <Link href={`/book?service=${s.id}`} className="btn btn-primary px-4 py-2 text-sm">Book</Link>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <div className="rounded-2xl bg-olive-100 p-6 text-center">
          <p className="font-semibold text-olive-900">Don&apos;t see your style?</p>
          <p className="mt-1 text-sm text-ink/70">Send us a photo on WhatsApp and we&apos;ll give you a price.</p>
          <a href={whatsappLink("Hi! Can I get a price for this style? (I'll send a photo)")} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-4">
            <WhatsAppIcon /> Send a photo
          </a>
        </div>
      </div>
    </>
  );
}

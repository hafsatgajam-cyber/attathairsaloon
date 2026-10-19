import Link from "next/link";
import { StyleTile } from "@/components/StyleTile";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { getCatalog } from "@/lib/catalog";
import { salon, whatsappLink } from "@/lib/config";
import { formatDuration, formatNaira } from "@/lib/format";

export const revalidate = 300;

const featured = ["Knotless braids (medium)", "Frontal wig install", "Stitch braids", "Starter locs"];

const steps = [
  { title: "Pick your style", text: "Choose from braids, wigs, locs and more, with clear prices in Naira." },
  { title: "Choose a time", text: "See free slots right away and pick your stylist if you like." },
  { title: "Get reminders on WhatsApp", text: "We confirm your booking and remind you the day before." },
];

export default async function Home() {
  const { services } = await getCatalog();
  const featuredServices = featured
    .map((name) => services.find((s) => s.name === name))
    .filter((s) => s !== undefined);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-olive-900 text-cream">
        <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(var(--color-gold-light) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="container-page relative grid gap-10 py-16 sm:py-24 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <p className="eyebrow text-gold-light">{salon.tagline}</p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.05] font-semibold sm:text-6xl">
              Beautiful hair,<br />
              <span className="text-gold-light italic">booked in minutes.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-cream/80">
              Braids, cornrows, wig installs, locs and natural hair care in Lagos. See our prices,
              book online and chat with us on WhatsApp any time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book" className="btn bg-gold text-ink hover:bg-gold-light">Book an appointment</Link>
              <a href={whatsappLink("Hi Attat Hair Saloon 👋 I'd like to make an enquiry.")} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                <WhatsAppIcon /> Chat on WhatsApp
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StyleTile label="Knotless" index={1} className="aspect-[3/4]" />
            <StyleTile label="Frontals" index={3} className="mt-8 aspect-[3/4]" />
          </div>
        </div>
      </section>

      {/* Featured services */}
      <section className="container-page py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Popular styles</p>
            <h2 className="mt-2 font-serif text-4xl font-semibold text-olive-900">Our customers&apos; favourites</h2>
          </div>
          <Link href="/services" className="font-semibold text-olive-700 hover:text-olive-900">See all prices →</Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredServices.map((s, i) => (
            <Link key={s.id} href={`/book?service=${s.id}`} className="group rounded-2xl bg-white p-3 shadow-sm ring-1 ring-cream-dark transition hover:shadow-md">
              <StyleTile label={s.name.replace(/ \(.*\)/, "")} index={i} className="aspect-[4/3]" />
              <div className="p-2 pt-4">
                <p className="font-semibold text-olive-900">{s.name}</p>
                <p className="mt-1 text-sm text-ink/70">From {formatNaira(s.price_min)} · {formatDuration(s.duration_min)}</p>
                <p className="mt-3 text-sm font-semibold text-olive-700 group-hover:text-olive-900">Book this →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-olive-100">
        <div className="container-page py-20">
          <p className="eyebrow text-center">How it works</p>
          <h2 className="mt-2 text-center font-serif text-4xl font-semibold text-olive-900">Easy booking, no back-and-forth</h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl bg-cream p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-olive-700 font-serif text-xl text-cream">{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold text-olive-900">{s.title}</h3>
                <p className="mt-2 text-ink/75">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="container-page py-20">
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-olive-800 p-8 text-cream sm:p-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold">Have a question? Ask us on WhatsApp.</h2>
            <p className="mt-2 text-cream/75">Prices, hair to bring, directions: we reply fast.</p>
          </div>
          <a href={whatsappLink("Hi Attat Hair Saloon 👋")} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp shrink-0">
            <WhatsAppIcon /> Message us
          </a>
        </div>
      </section>
    </>
  );
}

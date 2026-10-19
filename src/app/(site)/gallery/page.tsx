import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/PageHeader";
import { StyleTile } from "@/components/StyleTile";
import { getGallery } from "@/lib/catalog";

export const revalidate = 300;
export const metadata: Metadata = { title: "Gallery", description: "Braids, wigs, locs and more done at Attat Hair Saloon." };

const placeholderStyles = ["Knotless braids", "Boho braids", "Stitch braids", "Frontal install", "Starter locs", "Silk press", "Ghana weaving", "Kids braids"];

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ style?: string }> }) {
  const { style } = await searchParams;
  const images = await getGallery();
  const styles = [...new Set(images.map((i) => i.style))];
  const shown = style ? images.filter((i) => i.style === style) : images;

  return (
    <>
      <PageHeader eyebrow="Gallery" title="Our work" intro="A few of the styles our stylists have done recently." />
      <div className="container-page py-12">
        {images.length > 0 ? (
          <>
            <div className="mb-8 flex flex-wrap gap-2 text-sm">
              <a href="/gallery" className={`rounded-full px-4 py-1.5 ${!style ? "bg-olive-700 text-cream" : "border border-olive-200 text-olive-800"}`}>All</a>
              {styles.map((s) => (
                <a key={s} href={`/gallery?style=${encodeURIComponent(s)}`} className={`rounded-full px-4 py-1.5 ${style === s ? "bg-olive-700 text-cream" : "border border-olive-200 text-olive-800"}`}>{s}</a>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {shown.map((img) => (
                <figure key={img.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-cream-dark">
                  <Image src={img.url} alt={img.caption ?? img.style} width={600} height={800} sizes="(min-width: 1024px) 25vw, 50vw" className="aspect-[3/4] w-full object-cover" />
                  <figcaption className="px-3 py-2 text-sm text-ink/70">{img.caption ?? img.style}</figcaption>
                </figure>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="mb-6 text-sm text-ink/60">Photos coming soon.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {placeholderStyles.map((s, i) => (
                <StyleTile key={s} label={s} index={i} className="aspect-[3/4]" />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

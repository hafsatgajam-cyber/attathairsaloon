export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="bg-olive-900 text-cream">
      <div className="container-page py-14 sm:py-16">
        <p className="eyebrow text-gold-light">{eyebrow}</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-cream/80">{intro}</p>}
      </div>
    </section>
  );
}

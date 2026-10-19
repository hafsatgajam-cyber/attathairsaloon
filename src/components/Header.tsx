"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

const links = [
  { href: "/services", label: "Services & Prices" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Header({ logo }: { logo: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-olive-800 bg-olive-900/95 text-cream backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          {logo}
          <span className="font-serif text-xl font-semibold tracking-[0.12em] uppercase">
            Attat <span className="text-gold-light">Hair</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname === l.href ? "text-gold-light" : "text-cream/85 hover:text-cream"}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/book" className="btn bg-gold px-5 py-2 text-ink hover:bg-gold-light">
            Book now
          </Link>
        </nav>

        <button
          className="rounded-md p-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-olive-800 md:hidden">
          <div className="container-page flex flex-col py-2">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="py-3 text-cream/90" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link href="/book" className="btn my-3 bg-gold text-ink" onClick={() => setOpen(false)}>
              Book now
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

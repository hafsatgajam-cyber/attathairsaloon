import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { supabaseConfigured } from "@/lib/config";
import { createSupabaseServer } from "@/lib/supabase/server";
import { signOut } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Salon admin", robots: { index: false } };

const nav = [
  { href: "/admin", label: "Bookings" },
  { href: "/admin/services", label: "Services & prices" },
  { href: "/admin/hours", label: "Opening hours" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured) redirect("/admin/login");
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: staff } = await supabase.from("staff").select("name, role").eq("user_id", user.id).maybeSingle();

  return (
    <div className="min-h-dvh bg-olive-50">
      <header className="bg-olive-900 text-cream">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo size={36} />
            <span className="font-serif text-lg font-semibold tracking-wider uppercase">Salon admin</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {nav.map((n) => <Link key={n.href} href={n.href} className="text-cream/85 hover:text-cream">{n.label}</Link>)}
            <Link href="/" className="text-cream/60 hover:text-cream">View site ↗</Link>
            <form action={signOut}><button className="rounded-full border border-cream/30 px-3 py-1 text-cream/85 hover:text-cream">Sign out</button></form>
          </nav>
        </div>
      </header>
      <div className="container-page py-8">
        {staff ? children : (
          <div className="rounded-2xl bg-white p-6 ring-1 ring-cream-dark">
            <p className="font-semibold">Your account ({user.email}) isn&apos;t set up as salon staff yet.</p>
            <p className="mt-2 text-sm text-ink/70">Ask the owner to add you to the <code>staff</code> table in Supabase (see README).</p>
          </div>
        )}
      </div>
    </div>
  );
}

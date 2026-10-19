import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { supabaseConfigured } from "@/lib/config";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Staff login", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-olive-900 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-cream p-8">
        <div className="flex flex-col items-center text-center">
          <Logo size={64} />
          <h1 className="mt-4 font-serif text-3xl font-semibold text-olive-900">Staff login</h1>
        </div>
        {supabaseConfigured ? (
          <LoginForm />
        ) : (
          <p className="mt-6 text-sm text-ink/70">Connect Supabase first (see README) to enable staff login.</p>
        )}
      </div>
    </div>
  );
}

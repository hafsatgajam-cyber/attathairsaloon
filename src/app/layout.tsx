import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { salon, siteUrl } from "@/lib/config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${salon.name} | Braids, Wigs & Natural Hair`, template: `%s | ${salon.name}` },
  description:
    "Braids, cornrows, wig installs, locs and natural hair care. See prices in Naira, book online and chat with us on WhatsApp.",
  openGraph: { type: "website", siteName: salon.name, locale: "en_NG" },
};

export const viewport: Viewport = { themeColor: "#2a3419" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}

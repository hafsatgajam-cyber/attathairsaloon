import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Logo } from "@/components/Logo";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { salon, siteUrl } from "@/lib/config";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: salon.name,
  url: siteUrl,
  telephone: `+${salon.phone}`,
  address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
  priceRange: "₦₦",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header logo={<Logo size={40} />} />
      <main>{children}</main>
      <Footer />
      <WhatsAppFab />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

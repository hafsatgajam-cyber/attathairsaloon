// Salon details shown across the site. Edit these to match the business.
export const salon = {
  name: "Attat Hair Saloon",
  tagline: "Hair · Beauty · Confidence",
  // Save the logo as public/logo.png, then change this to "/logo.png".
  logo: null as string | null,
  address: "Lagos, Nigeria", // TODO: full street address
  mapsQuery: "Attat Hair Saloon Lagos",
  phone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2348000000000",
  instagram: "https://instagram.com/", // TODO: salon handle
  cancellationHours: 24,
};

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const bookingEnabled = Boolean(supabaseConfigured && process.env.SUPABASE_SERVICE_ROLE_KEY);
export const paymentsEnabled = Boolean(process.env.PAYSTACK_SECRET_KEY);
export const whatsappApiEnabled = Boolean(
  process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID,
);

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${salon.phone}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

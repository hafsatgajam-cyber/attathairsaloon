import { salon } from "@/lib/config";

// Set `salon.logo` in src/lib/config.ts once the logo file is in public/.
// Until then a crowned "A" monogram is shown.
export function Logo({ size = 44 }: { size?: number }) {
  if (salon.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={salon.logo} alt={salon.name} width={size} height={size} className="rounded-full" />
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-label="Attat Hair Saloon" role="img">
      <circle cx="24" cy="24" r="22.5" fill="var(--color-cream)" stroke="var(--color-gold)" strokeWidth="1.5" />
      <path d="M16.5 11l2.2 2 2.4-3 2.4 3 2.4-3 2.4 3 2.2-2-1.2 5h-11.6z" fill="var(--color-gold)" />
      <text
        x="24"
        y="36"
        textAnchor="middle"
        fontFamily="var(--font-cormorant), Georgia, serif"
        fontSize="22"
        fontWeight="600"
        fill="var(--color-ink)"
      >
        A
      </text>
    </svg>
  );
}

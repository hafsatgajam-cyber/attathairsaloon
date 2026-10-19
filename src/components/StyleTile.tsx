// Placeholder artwork for a hairstyle until real photos are uploaded.
const palettes = [
  ["#48582b", "#2a3419"],
  ["#a8813f", "#6b4f22"],
  ["#5a6d35", "#384522"],
  ["#7a5c3a", "#2a1d14"],
];

export function StyleTile({ label, index = 0, className = "" }: { label: string; index?: number; className?: string }) {
  const [a, b] = palettes[index % palettes.length];
  return (
    <div
      className={`relative flex items-end overflow-hidden rounded-2xl p-4 text-cream ${className}`}
      style={{ background: `linear-gradient(150deg, ${a}, ${b})` }}
    >
      <svg className="absolute -top-6 -right-6 h-40 w-40 opacity-15" viewBox="0 0 100 100" aria-hidden="true">
        <path
          d="M50 5c-20 0-32 18-30 40 2 18 10 30 6 50h48c-4-20 4-32 6-50 2-22-10-40-30-40z"
          fill="currentColor"
        />
      </svg>
      <span className="relative font-serif text-xl font-semibold">{label}</span>
    </div>
  );
}

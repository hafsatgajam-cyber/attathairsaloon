export function Flash({ error, ok }: { error?: string; ok?: string }) {
  if (!error && !ok) return null;
  return (
    <p className={`mb-6 rounded-xl p-3 text-sm ${error ? "bg-red-100 text-red-900" : "bg-olive-100 text-olive-900"}`}>
      {error ?? ok}
    </p>
  );
}

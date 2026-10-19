import { createSupabaseServer } from "@/lib/supabase/server";
import type { Category, Service } from "@/lib/types";
import { saveService } from "../../actions";
import { Flash } from "../../Flash";

function ServiceForm({ s, categories }: { s?: Service; categories: Category[] }) {
  return (
    <form action={saveService} className="grid gap-3 sm:grid-cols-6">
      {s && <input type="hidden" name="id" value={s.id} />}
      <label className="text-xs font-semibold sm:col-span-3">Name
        <input name="name" required defaultValue={s?.name} className="field mt-1 font-normal" />
      </label>
      <label className="text-xs font-semibold sm:col-span-3">Category
        <select name="category_id" required defaultValue={s?.category_id ?? categories[0]?.id} className="field mt-1 font-normal">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold sm:col-span-6">Description
        <input name="description" defaultValue={s?.description ?? ""} className="field mt-1 font-normal" />
      </label>
      <label className="text-xs font-semibold sm:col-span-2">From (₦)
        <input name="price_min" type="number" min={0} step={500} required defaultValue={s?.price_min} className="field mt-1 font-normal" />
      </label>
      <label className="text-xs font-semibold sm:col-span-2">Up to (₦, optional)
        <input name="price_max" type="number" min={0} step={500} defaultValue={s?.price_max ?? ""} className="field mt-1 font-normal" />
      </label>
      <label className="text-xs font-semibold sm:col-span-2">Deposit (₦)
        <input name="deposit_amount" type="number" min={0} step={500} defaultValue={s?.deposit_amount ?? 0} className="field mt-1 font-normal" />
      </label>
      <label className="text-xs font-semibold sm:col-span-2">Duration (minutes)
        <input name="duration_min" type="number" min={15} step={15} required defaultValue={s?.duration_min ?? 60} className="field mt-1 font-normal" />
      </label>
      <div className="flex items-end gap-5 pb-3 text-sm sm:col-span-2">
        <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={s?.active ?? true} className="accent-olive-700" /> Active</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="hair_included" defaultChecked={s?.hair_included} className="accent-olive-700" /> Hair incl.</label>
      </div>
      <div className="flex items-end sm:col-span-2">
        <button className="btn btn-primary w-full py-2.5">{s ? "Save" : "Add service"}</button>
      </div>
    </form>
  );
}

export default async function AdminServices({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams;
  const supabase = await createSupabaseServer();
  const [{ data: categories }, { data: services }] = await Promise.all([
    supabase.from("categories").select("*").order("sort"),
    supabase.from("services").select("*").order("sort"),
  ]);
  const cats = (categories ?? []) as Category[];
  const all = (services ?? []) as Service[];

  return (
    <div className="max-w-4xl">
      <Flash error={sp.error} ok={sp.ok} />
      <h1 className="font-serif text-3xl font-semibold text-olive-900">Services & prices</h1>
      <p className="mt-1 text-sm text-ink/60">Changes show on the website within a few minutes.</p>

      <details className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-cream-dark">
        <summary className="cursor-pointer font-semibold text-olive-800">+ Add a new service</summary>
        <div className="mt-4"><ServiceForm categories={cats} /></div>
      </details>

      {cats.map((c) => {
        const items = all.filter((s) => s.category_id === c.id);
        if (!items.length) return null;
        return (
          <section key={c.id} className="mt-8">
            <h2 className="font-serif text-2xl font-semibold text-olive-900">{c.name}</h2>
            <div className="mt-3 space-y-3">
              {items.map((s) => (
                <details key={s.id} className={`rounded-2xl bg-white p-5 ring-1 ring-cream-dark ${!s.active ? "opacity-60" : ""}`}>
                  <summary className="flex cursor-pointer justify-between gap-3">
                    <span className="font-semibold">{s.name}{!s.active && " (hidden)"}</span>
                    <span className="text-sm text-ink/70">₦{s.price_min.toLocaleString()}{s.price_max ? `–₦${s.price_max.toLocaleString()}` : ""} · {s.duration_min} min</span>
                  </summary>
                  <div className="mt-4"><ServiceForm s={s} categories={cats} /></div>
                </details>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

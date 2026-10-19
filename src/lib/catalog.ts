import { supabaseConfigured } from "./config";
import { demoCatalog } from "./demo-data";
import { createSupabasePublic } from "./supabase/server";
import type { Catalog, GalleryImage } from "./types";

/** Services, categories, stylists and hours, from Supabase or the demo data. */
export async function getCatalog(): Promise<Catalog> {
  if (!supabaseConfigured) return demoCatalog;
  const db = createSupabasePublic();
  const [categories, services, stylists, hours] = await Promise.all([
    db.from("categories").select("*").order("sort"),
    db.from("services").select("*").eq("active", true).order("sort"),
    db.from("stylists").select("*").eq("active", true).order("sort"),
    db.from("opening_hours").select("*").order("weekday"),
  ]);
  const error = categories.error ?? services.error ?? stylists.error ?? hours.error;
  if (error) throw new Error(`Could not load catalogue: ${error.message}`);
  return {
    categories: categories.data ?? [],
    services: services.data ?? [],
    stylists: stylists.data ?? [],
    hours: hours.data ?? [],
  };
}

export async function getGallery(): Promise<GalleryImage[]> {
  if (!supabaseConfigured) return [];
  const { data, error } = await createSupabasePublic()
    .from("gallery_images")
    .select("*")
    .order("sort");
  if (error) throw new Error(`Could not load gallery: ${error.message}`);
  return data ?? [];
}

import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Charity } from "@/types/domain";

function mapCharity(row: {
  id: string; slug: string; name: string; description: string;
  cover_image_url: string | null; logo_url: string | null;
  website_url: string | null; upcoming_events: unknown;
  is_featured: boolean; is_active: boolean;
  [key: string]: unknown;
}): Charity {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    coverImageUrl: row.cover_image_url,
    logoUrl: row.logo_url,
    websiteUrl: row.website_url,
    upcomingEvents: Array.isArray(row.upcoming_events) ? row.upcoming_events : [],
    isFeatured: row.is_featured,
    isActive: row.is_active,
  };
}

export async function getCharities(): Promise<Charity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("charities")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("name");

  if (error) throw error;
  return (data ?? []).map(mapCharity);
}

export async function getFeaturedCharities(limit = 3): Promise<Charity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("charities")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("name")
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapCharity);
}

export async function getCharityBySlug(slug: string): Promise<Charity | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("charities")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapCharity(data);
}

export async function getAllCharitySlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("charities")
    .select("slug")
    .eq("is_active", true);
  return (data ?? []).map((r) => (r as { slug: string }).slug);
}

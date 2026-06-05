-- =============================================================
-- 0004_seed_charities.sql
-- Idempotent seed data for local development & previews.
-- =============================================================

insert into charities (slug, name, description, cover_image_url, logo_url, website_url, upcoming_events, is_featured, is_active)
values
  (
    'hopebridge',
    'HopeBridge Foundation',
    'Connecting families in crisis to the housing, food, and counselling services they need to rebuild — one bridge at a time.',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=80',
    'https://api.dicebear.com/7.x/icons/svg?seed=hopebridge&backgroundColor=059669',
    'https://example.org/hopebridge',
    '[{"title":"Summer Family Camp","date":"2026-07-12","location":"Lake District"}]'::jsonb,
    true,
    true
  ),
  (
    'oceanmind',
    'OceanMind Conservation',
    'Protecting marine ecosystems through community-led cleanups, education, and policy advocacy across coastal communities.',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1600&q=80',
    'https://api.dicebear.com/7.x/icons/svg?seed=oceanmind&backgroundColor=2563eb',
    'https://example.org/oceanmind',
    '[{"title":"World Oceans Day Cleanup","date":"2026-06-08","location":"Brighton Beach"}]'::jsonb,
    true,
    true
  ),
  (
    'brightminds',
    'BrightMinds Education',
    'Funding scholarships, tutoring, and STEM mentorship for under-resourced students from primary through university.',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80',
    'https://api.dicebear.com/7.x/icons/svg?seed=brightminds&backgroundColor=7c3aed',
    'https://example.org/brightminds',
    '[]'::jsonb,
    false,
    true
  ),
  (
    'pawhaven',
    'PawHaven Animal Rescue',
    'A no-kill shelter network rescuing, rehabilitating, and rehoming over 3,000 animals every year.',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1600&q=80',
    'https://api.dicebear.com/7.x/icons/svg?seed=pawhaven&backgroundColor=ea580c',
    'https://example.org/pawhaven',
    '[]'::jsonb,
    false,
    true
  ),
  (
    'greenroots',
    'GreenRoots Reforestation',
    'Planting native trees with local communities to restore biodiversity and capture carbon at scale.',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&q=80',
    'https://api.dicebear.com/7.x/icons/svg?seed=greenroots&backgroundColor=16a34a',
    'https://example.org/greenroots',
    '[]'::jsonb,
    true,
    true
  ),
  (
    'safeharbour',
    'SafeHarbour Mental Health',
    '24/7 crisis support, therapy subsidies, and peer-led community circles for people navigating mental illness.',
    'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1600&q=80',
    'https://api.dicebear.com/7.x/icons/svg?seed=safeharbour&backgroundColor=0891b2',
    'https://example.org/safeharbour',
    '[]'::jsonb,
    false,
    true
  )
on conflict (slug) do update
  set name             = excluded.name,
      description      = excluded.description,
      cover_image_url  = excluded.cover_image_url,
      logo_url         = excluded.logo_url,
      website_url      = excluded.website_url,
      upcoming_events  = excluded.upcoming_events,
      is_featured      = excluded.is_featured,
      is_active        = excluded.is_active;

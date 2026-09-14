-- =====================================================================
-- Adds fields your current /data/catalog.ts already relies on in the
-- UI (color swatches, bullet details, photo-frame coordinates) so the
-- storefront components don't need to change shape when you switch
-- from the static catalog to Supabase.
-- =====================================================================

alter table products
  add column if not exists color          text,
  add column if not exists details        text[] not null default '{}',
  add column if not exists personalization jsonb;   -- e.g. { "photoFrame": { "left": 27, "top": 43, "width": 46, "height": 40, "radius": 5 } }

comment on column products.personalization is
  'Optional photo-frame layout metadata for photo-personalized access cards. Only used by the frontend for display positioning — never used server-side to composite images.';

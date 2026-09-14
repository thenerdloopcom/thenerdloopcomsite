-- =====================================================================
-- Adds the extra personal-info fields the new /profile page needs.
--
-- Note on "Age": age is not stored — it's derived on the frontend from
-- date_of_birth (storing both would let them drift out of sync).
--
-- Existing RLS policies "profiles_select_own" / "profiles_update_own"
-- (from 001_tnl_schema.sql) already cover these new columns — no
-- policy changes needed, a user can already select/update their own
-- profile row, this migration just widens what that row can hold.
-- =====================================================================

alter table profiles
  add column if not exists date_of_birth date,
  add column if not exists gender        text;

comment on column profiles.date_of_birth is
  'Optional. Used to display a computed age on the profile page.';

comment on column profiles.gender is
  'Optional, free text (e.g. "female", "male", "non-binary", "prefer not to say"). Left as text rather than an enum so the profile form can offer a "prefer not to say" style option without a migration every time the list changes.';

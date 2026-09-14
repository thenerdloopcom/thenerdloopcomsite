-- =====================================================================
-- The Nerd Loop — Supabase schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`
-- as a migration file). Safe to re-run: uses IF NOT EXISTS / OR REPLACE
-- everywhere it reasonably can.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Utility: updated_at trigger
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =====================================================================
-- 1. profiles  (1:1 with auth.users)
-- =====================================================================
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  phone        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_profiles_updated_at
before update on profiles
for each row execute function set_updated_at();

-- auto-create a profile row whenever a new auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- =====================================================================
-- 2. addresses  (customer address book)
-- =====================================================================
create table if not exists addresses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  label           text,
  full_name       text not null,
  phone           text,
  address_line_1  text not null,
  address_line_2  text,
  city            text not null,
  state           text not null,
  postal_code     text not null,
  country         text not null default 'IN',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_addresses_user_id on addresses(user_id);

create trigger trg_addresses_updated_at
before update on addresses
for each row execute function set_updated_at();

-- =====================================================================
-- 3. categories  (self-referencing for subcategories)
-- =====================================================================
create table if not exists categories (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  description     text,
  parent_id       uuid references categories(id) on delete set null,
  sort_order      integer not null default 0,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);
create index if not exists idx_categories_parent_id on categories(parent_id);

-- =====================================================================
-- 4. products
-- =====================================================================
create table if not exists products (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  name                text not null,
  subtitle            text,
  description         text,

  category_id         uuid references categories(id) on delete set null,

  product_type        text not null default 'standard',   -- 'standard' | 'access-card'
  card_type           text,                                -- 'ready-made' | 'photo-personalized' (only for access-card)

  price               bigint not null,                     -- store in paise/cents
  compare_at_price    bigint,

  badge               text,

  status              text not null default 'draft',       -- 'draft' | 'active' | 'archived'
  featured            boolean not null default false,

  inventory_count     integer,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint chk_product_type check (product_type in ('standard', 'access-card')),
  constraint chk_card_type_valid_for_access_card check (
    product_type <> 'access-card'
    or card_type in ('ready-made', 'photo-personalized')
  )
);
create index if not exists idx_products_category_id on products(category_id);
create index if not exists idx_products_status on products(status);

create trigger trg_products_updated_at
before update on products
for each row execute function set_updated_at();

-- =====================================================================
-- 5. product_images
-- =====================================================================
create table if not exists product_images (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references products(id) on delete cascade,
  url             text not null,
  image_type      text not null default 'gallery',  -- 'front' | 'back' | 'gallery' | ...
  sort_order      integer not null default 0,
  alt_text        text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_product_images_product_id on product_images(product_id);

-- =====================================================================
-- 6. orders
-- =====================================================================
create table if not exists orders (
  id                      uuid primary key default gen_random_uuid(),

  user_id                 uuid references profiles(id) on delete set null,

  order_number            text not null unique,

  status                  text not null default 'pending',       -- pending | confirmed | cancelled | completed
  payment_status          text not null default 'unpaid',        -- unpaid | paid | refunded | failed
  fulfillment_status      text not null default 'unfulfilled',   -- unfulfilled | processing | shipped | delivered | cancelled

  subtotal                bigint not null default 0,
  shipping_fee            bigint not null default 0,
  discount                bigint not null default 0,
  total                   bigint not null default 0,

  currency                text not null default 'INR',

  razorpay_order_id       text,
  razorpay_payment_id     text,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_status on orders(status);

create trigger trg_orders_updated_at
before update on orders
for each row execute function set_updated_at();

-- human-friendly order number generator, e.g. TNL10042
create sequence if not exists order_number_seq start 10001;

create or replace function generate_order_number()
returns text as $$
begin
  return 'TNL' || nextval('order_number_seq')::text;
end;
$$ language plpgsql;

-- =====================================================================
-- 7. order_items  (snapshot of purchased item — never joins live product for price/name)
-- =====================================================================
create table if not exists order_items (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references orders(id) on delete cascade,

  product_id          uuid references products(id) on delete set null,

  product_name        text not null,
  product_slug        text not null,

  unit_price          bigint not null,
  quantity            integer not null default 1,
  line_total          bigint not null,

  customization_type  text,     -- 'photo-personalized' | null
  instructions         text,

  created_at          timestamptz not null default now()
);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_order_items_product_id on order_items(product_id);

-- =====================================================================
-- 8. order_addresses  (immutable snapshot, separate from address book)
-- =====================================================================
create table if not exists order_addresses (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references orders(id) on delete cascade,
  address_type        text not null default 'shipping', -- 'shipping' | 'billing'

  full_name           text not null,
  phone               text,
  address_line_1      text not null,
  address_line_2      text,
  city                text not null,
  state               text not null,
  postal_code         text not null,
  country             text not null default 'IN',

  created_at          timestamptz not null default now()
);
create index if not exists idx_order_addresses_order_id on order_addresses(order_id);

-- =====================================================================
-- 9. payments
-- =====================================================================
create table if not exists payments (
  id                      uuid primary key default gen_random_uuid(),
  order_id                uuid not null references orders(id) on delete cascade,

  provider                text not null default 'razorpay',
  provider_order_id       text,
  provider_payment_id     text,

  amount                  bigint not null,
  currency                text not null default 'INR',

  status                  text not null default 'created', -- created | authorized | captured | failed | refunded

  method                  text,
  raw_data                jsonb,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index if not exists idx_payments_order_id on payments(order_id);

create trigger trg_payments_updated_at
before update on payments
for each row execute function set_updated_at();

-- =====================================================================
-- 10. customer_uploads  (metadata only — file bytes live in Cloudflare R2)
-- =====================================================================
create table if not exists customer_uploads (
  id                  uuid primary key default gen_random_uuid(),

  user_id             uuid references profiles(id) on delete set null,
  order_id            uuid references orders(id) on delete set null,
  order_item_id       uuid references order_items(id) on delete set null,

  storage_provider    text not null default 'cloudflare-r2',
  bucket              text not null,
  object_key          text not null,

  original_filename   text,
  content_type        text,
  file_size           bigint,

  status              text not null default 'pending', -- pending | uploaded | attached | deleted

  created_at          timestamptz not null default now()
);
create index if not exists idx_customer_uploads_user_id on customer_uploads(user_id);
create index if not exists idx_customer_uploads_order_id on customer_uploads(order_id);
create index if not exists idx_customer_uploads_order_item_id on customer_uploads(order_item_id);

-- =====================================================================
-- 11. shipments
-- =====================================================================
create table if not exists shipments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references orders(id) on delete cascade,

  provider            text,
  provider_order_id   text,
  tracking_number     text,
  tracking_url        text,

  status              text not null default 'not_shipped', -- not_shipped | shipped | out_for_delivery | delivered | returned

  shipped_at          timestamptz,
  delivered_at        timestamptz,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists idx_shipments_order_id on shipments(order_id);

create trigger trg_shipments_updated_at
before update on shipments
for each row execute function set_updated_at();

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table profiles enable row level security;
alter table addresses enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_addresses enable row level security;
alter table payments enable row level security;
alter table customer_uploads enable row level security;
alter table shipments enable row level security;

-- profiles: user can read/update own row
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- addresses: user can CRUD own rows
create policy "addresses_select_own" on addresses
  for select using (auth.uid() = user_id);
create policy "addresses_insert_own" on addresses
  for insert with check (auth.uid() = user_id);
create policy "addresses_update_own" on addresses
  for update using (auth.uid() = user_id);
create policy "addresses_delete_own" on addresses
  for delete using (auth.uid() = user_id);

-- categories: public read of active rows
create policy "categories_public_read" on categories
  for select using (active = true);

-- products: public read of active rows
create policy "products_public_read" on products
  for select using (status = 'active');

-- product_images: public read, joined via active products
create policy "product_images_public_read" on product_images
  for select using (
    exists (
      select 1 from products p
      where p.id = product_images.product_id
      and p.status = 'active'
    )
  );

-- orders: user can read own orders (no direct insert/update from browser —
-- orders are created/mutated only via the Next.js server using the
-- service role key, bypassing RLS deliberately)
create policy "orders_select_own" on orders
  for select using (auth.uid() = user_id);

-- order_items: user can read items belonging to their own orders
create policy "order_items_select_own" on order_items
  for select using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
      and o.user_id = auth.uid()
    )
  );

-- order_addresses: user can read addresses on their own orders
create policy "order_addresses_select_own" on order_addresses
  for select using (
    exists (
      select 1 from orders o
      where o.id = order_addresses.order_id
      and o.user_id = auth.uid()
    )
  );

-- payments: user can read payments on their own orders (no write from browser)
create policy "payments_select_own" on payments
  for select using (
    exists (
      select 1 from orders o
      where o.id = payments.order_id
      and o.user_id = auth.uid()
    )
  );

-- customer_uploads: user can read/insert only their own uploads
create policy "customer_uploads_select_own" on customer_uploads
  for select using (auth.uid() = user_id);
create policy "customer_uploads_insert_own" on customer_uploads
  for insert with check (auth.uid() = user_id);

-- shipments: user can read shipments on their own orders
create policy "shipments_select_own" on shipments
  for select using (
    exists (
      select 1 from orders o
      where o.id = shipments.order_id
      and o.user_id = auth.uid()
    )
  );

-- =====================================================================
-- Notes:
-- - There are intentionally NO insert/update policies on orders,
--   order_items, order_addresses, payments, or shipments for regular
--   users. Those rows are only ever written by your Next.js server
--   using the Supabase service role key (which bypasses RLS entirely).
--   Never expose the service role key to the browser.
-- - Admin/staff access (viewing all orders, uploads, etc.) should go
--   through server-side routes using the service role key, not through
--   client-side RLS policies.
-- =====================================================================

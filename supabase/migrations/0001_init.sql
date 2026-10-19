-- Attat Hair Salon: initial schema
-- Run in Supabase → SQL Editor, or with `supabase db push`.

create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------
create table categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  sort       int  not null default 0
);

create table services (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid not null references categories(id) on delete restrict,
  name           text not null,
  description    text,
  price_min      int  not null check (price_min >= 0),          -- Naira
  price_max      int  check (price_max is null or price_max >= price_min),
  duration_min   int  not null check (duration_min > 0),        -- minutes
  deposit_amount int  not null default 0 check (deposit_amount >= 0),
  hair_included  boolean not null default false,
  active         boolean not null default true,
  sort           int  not null default 0,
  created_at     timestamptz not null default now()
);

create table stylists (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  bio         text,
  specialties text[] not null default '{}',
  active      boolean not null default true,
  sort        int not null default 0
);

create table gallery_images (
  id      uuid primary key default gen_random_uuid(),
  url     text not null,
  style   text not null,
  caption text,
  sort    int not null default 0
);

-- ---------------------------------------------------------------------------
-- Opening hours (salon local time, Africa/Lagos)
-- ---------------------------------------------------------------------------
create table opening_hours (
  weekday int primary key check (weekday between 0 and 6), -- 0 = Sunday
  opens   time,
  closes  time,
  closed  boolean not null default false,
  check (closed or (opens is not null and closes is not null and closes > opens))
);

create table closures (
  date   date primary key,
  reason text
);

-- ---------------------------------------------------------------------------
-- Customers & bookings
-- ---------------------------------------------------------------------------
create table customers (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  phone            text not null unique,  -- E.164 digits, e.g. 2348012345678
  email            text,
  whatsapp_opt_in  boolean not null default true,
  notes            text,
  created_at       timestamptz not null default now()
);

create type booking_status as enum
  ('pending_payment', 'confirmed', 'cancelled', 'completed', 'no_show');

create table bookings (
  id                   uuid primary key default gen_random_uuid(),
  customer_id          uuid not null references customers(id) on delete restrict,
  stylist_id           uuid not null references stylists(id) on delete restrict,
  start_at             timestamptz not null,
  end_at               timestamptz not null,
  status               booking_status not null default 'pending_payment',
  price_estimate       int not null default 0,
  deposit_amount       int not null default 0,
  deposit_paid         boolean not null default false,
  payment_ref          text unique,
  notes                text,
  source               text not null default 'website', -- website | whatsapp | walk_in | admin
  manage_token         uuid not null unique default gen_random_uuid(),
  reminder_day_sent_at timestamptz,
  reminder_today_sent_at timestamptz,
  created_at           timestamptz not null default now(),
  check (end_at > start_at),
  -- A stylist can never have two live bookings that overlap.
  constraint bookings_no_overlap exclude using gist (
    stylist_id with =,
    tstzrange(start_at, end_at) with &&
  ) where (status in ('pending_payment', 'confirmed'))
);

create index bookings_start_idx on bookings (start_at);

create table booking_services (
  booking_id   uuid not null references bookings(id) on delete cascade,
  service_id   uuid not null references services(id) on delete restrict,
  price_min    int not null,
  duration_min int not null,
  primary key (booking_id, service_id)
);

-- ---------------------------------------------------------------------------
-- Staff (salon admin users). Add a row after creating the user in Auth.
-- ---------------------------------------------------------------------------
create table staff (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  role       text not null default 'staff' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now()
);

create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Row level security
--   * Public (anon) can read the catalogue, hours and gallery.
--   * Bookings/customers are only touched by staff, or by the server using
--     the service-role key (which bypasses RLS).
-- ---------------------------------------------------------------------------
alter table categories       enable row level security;
alter table services         enable row level security;
alter table stylists         enable row level security;
alter table gallery_images   enable row level security;
alter table opening_hours    enable row level security;
alter table closures         enable row level security;
alter table customers        enable row level security;
alter table bookings         enable row level security;
alter table booking_services enable row level security;
alter table staff            enable row level security;

create policy "public read" on categories     for select using (true);
create policy "public read" on services       for select using (active or is_staff());
create policy "public read" on stylists       for select using (active or is_staff());
create policy "public read" on gallery_images for select using (true);
create policy "public read" on opening_hours  for select using (true);
create policy "public read" on closures       for select using (true);

create policy "staff all" on categories       for all using (is_staff()) with check (is_staff());
create policy "staff all" on services         for all using (is_staff()) with check (is_staff());
create policy "staff all" on stylists         for all using (is_staff()) with check (is_staff());
create policy "staff all" on gallery_images   for all using (is_staff()) with check (is_staff());
create policy "staff all" on opening_hours    for all using (is_staff()) with check (is_staff());
create policy "staff all" on closures         for all using (is_staff()) with check (is_staff());
create policy "staff all" on customers        for all using (is_staff()) with check (is_staff());
create policy "staff all" on bookings         for all using (is_staff()) with check (is_staff());
create policy "staff all" on booking_services for all using (is_staff()) with check (is_staff());
create policy "staff read self" on staff      for select using (user_id = auth.uid() or is_staff());

-- =============================================================
-- 0001_init_schema.sql
-- Golf Charity Subscription Platform — core tables and enums
-- =============================================================

-- ENUMS -------------------------------------------------------
create type user_role         as enum ('USER', 'ADMIN');
create type sub_plan          as enum ('MONTHLY', 'YEARLY');
create type sub_status        as enum ('ACTIVE', 'EXPIRED', 'CANCELLED');
create type draw_mode         as enum ('RANDOM', 'WEIGHTED');
create type draw_status       as enum ('DRAFT', 'PUBLISHED');
create type match_count       as enum ('THREE', 'FOUR', 'FIVE');
create type verify_status     as enum ('PENDING', 'APPROVED', 'REJECTED');
create type payout_status     as enum ('PENDING', 'PAID');
create type notification_kind as enum (
  'SUB_EXPIRING',
  'SUB_EXPIRED',
  'DRAW_PUBLISHED',
  'YOU_WON',
  'PROOF_APPROVED',
  'PROOF_REJECTED',
  'PAID'
);

-- PROFILES (extends auth.users) -------------------------------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text,
  avatar_url  text,
  role        user_role not null default 'USER',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_profiles_role on profiles(role);

-- CHARITIES ---------------------------------------------------
create table charities (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name             text not null,
  description      text not null,
  cover_image_url  text,
  logo_url         text,
  website_url      text,
  upcoming_events  jsonb not null default '[]'::jsonb,
  is_featured      boolean not null default false,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_charities_featured on charities(is_featured) where is_active;
create index idx_charities_active   on charities(is_active);

-- USER_CHARITIES (current selection) --------------------------
create table user_charities (
  user_id           uuid primary key references profiles(id) on delete cascade,
  charity_id        uuid not null references charities(id) on delete restrict,
  contribution_pct  numeric(5,2) not null
                    check (contribution_pct >= 10 and contribution_pct <= 100),
  updated_at        timestamptz not null default now()
);

create index idx_user_charities_charity on user_charities(charity_id);

-- SUBSCRIPTIONS -----------------------------------------------
-- Snapshot charity_id + contribution_pct at subscription start
-- so the pool/donation math is reproducible after a user later
-- switches charity.
create table subscriptions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references profiles(id) on delete cascade,
  plan              sub_plan not null,
  status            sub_status not null default 'ACTIVE',
  start_date        timestamptz not null default now(),
  expiry_date       timestamptz not null,
  price             numeric(10,2) not null check (price >= 0),
  charity_id        uuid references charities(id),
  contribution_pct  numeric(5,2)
                    check (contribution_pct is null
                           or (contribution_pct >= 10 and contribution_pct <= 100)),
  mock_payment_id   text,
  cancelled_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_sub_user_status on subscriptions(user_id, status);
create index idx_sub_expiry on subscriptions(expiry_date) where status = 'ACTIVE';
create unique index idx_sub_one_active
  on subscriptions(user_id) where status = 'ACTIVE';

-- SCORES (max 5 per user, enforced by trigger in 0003) --------
create table scores (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  score       smallint not null check (score between 1 and 45),
  played_at   date not null,
  created_at  timestamptz not null default now()
);

create index idx_scores_user_created on scores(user_id, created_at desc);

-- DRAWS -------------------------------------------------------
create table draws (
  id                 uuid primary key default gen_random_uuid(),
  draw_month         date not null unique,
  mode               draw_mode not null,
  status             draw_status not null default 'DRAFT',
  winning_numbers    smallint[],
  pool_total         numeric(12,2) not null default 0,
  jackpot_carry_in   numeric(12,2) not null default 0,
  jackpot_carry_out  numeric(12,2) not null default 0,
  published_at       timestamptz,
  created_by         uuid references profiles(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- Length-only CHECK (Postgres forbids subqueries in CHECK constraints).
  -- Range (1–45) and uniqueness are enforced by a trigger in 0003.
  constraint chk_winning_numbers_length check (
    winning_numbers is null or array_length(winning_numbers, 1) = 5
  ),
  constraint chk_published_requires_numbers check (
    status <> 'PUBLISHED' or winning_numbers is not null
  )
);

create index idx_draws_status_month on draws(status, draw_month desc);
create index idx_draws_month on draws(draw_month desc);

-- WINNERS -----------------------------------------------------
create table winners (
  id                uuid primary key default gen_random_uuid(),
  draw_id           uuid not null references draws(id) on delete cascade,
  user_id           uuid not null references profiles(id) on delete cascade,
  match_count       match_count not null,
  prize_amount      numeric(12,2) not null check (prize_amount >= 0),
  proof_url         text,
  proof_notes       text,
  verification      verify_status not null default 'PENDING',
  verified_by       uuid references profiles(id),
  verified_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (draw_id, user_id)
);

create index idx_winners_draw         on winners(draw_id);
create index idx_winners_user         on winners(user_id);
create index idx_winners_verification on winners(verification);

-- PAYOUTS -----------------------------------------------------
create table payouts (
  id           uuid primary key default gen_random_uuid(),
  winner_id    uuid not null unique references winners(id) on delete cascade,
  amount       numeric(12,2) not null check (amount >= 0),
  status       payout_status not null default 'PENDING',
  paid_at      timestamptz,
  admin_notes  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_payouts_status on payouts(status);

-- NOTIFICATIONS ----------------------------------------------
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  kind        notification_kind not null,
  payload     jsonb not null default '{}'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index idx_notif_user_unread on notifications(user_id, created_at desc)
  where read_at is null;
create index idx_notif_user_all on notifications(user_id, created_at desc);

-- updated_at touch helper -------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger trg_charities_updated_at
  before update on charities
  for each row execute function set_updated_at();

create trigger trg_user_charities_updated_at
  before update on user_charities
  for each row execute function set_updated_at();

create trigger trg_subscriptions_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

create trigger trg_draws_updated_at
  before update on draws
  for each row execute function set_updated_at();

create trigger trg_winners_updated_at
  before update on winners
  for each row execute function set_updated_at();

create trigger trg_payouts_updated_at
  before update on payouts
  for each row execute function set_updated_at();

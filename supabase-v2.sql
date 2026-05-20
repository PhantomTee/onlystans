-- OnlyStans v2 migration — subscriptions, follows, creator tiers
-- Run in Supabase SQL Editor after the original supabase.sql

-- ── Creator tier columns ─────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists is_paid_tier      boolean not null default false,
  add column if not exists subscription_price numeric(18,6),          -- USDC/month
  add column if not exists rate_per_second   numeric(18,6) default 0.0001; -- default watch rate

-- ── Subscriptions ────────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id              uuid primary key default gen_random_uuid(),
  viewer_id       text not null,   -- Circle wallet ID of viewer
  creator_handle  text not null references public.profiles(handle) on delete cascade,
  amount_paid     numeric(18,6) not null,
  tx_hash         text not null,
  starts_at       timestamptz not null default now(),
  expires_at      timestamptz not null,
  created_at      timestamptz not null default now()
);

create index if not exists subs_viewer_creator_idx on public.subscriptions(viewer_id, creator_handle);
create index if not exists subs_creator_handle_idx on public.subscriptions(creator_handle);
create index if not exists subs_viewer_idx         on public.subscriptions(viewer_id);
create index if not exists subs_expires_idx        on public.subscriptions(expires_at);

-- ── Follows ──────────────────────────────────────────────────────────────────
create table if not exists public.follows (
  viewer_id      text not null,
  creator_handle text not null references public.profiles(handle) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (viewer_id, creator_handle)
);

create index if not exists follows_creator_idx on public.follows(creator_handle);

-- ── Viewer balances (prepaid USDC for nanopayments) ──────────────────────────
create table if not exists public.viewer_balances (
  viewer_wallet_id   text primary key,   -- Circle wallet ID
  circle_wallet_addr text,               -- on-chain address
  balance            numeric(18,6) not null default 0,
  total_spent        numeric(18,6) not null default 0,
  updated_at         timestamptz not null default now()
);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.subscriptions   enable row level security;
alter table public.follows         enable row level security;
alter table public.viewer_balances enable row level security;

drop policy if exists "public read subscriptions" on public.subscriptions;
create policy "public read subscriptions" on public.subscriptions for select using (true);

drop policy if exists "public read follows" on public.follows;
create policy "public read follows" on public.follows for select using (true);

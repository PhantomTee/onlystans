-- OnlyStans production schema for Supabase Postgres.
-- Paste this into Supabase SQL Editor, run it once, then set DATABASE_URL in Vercel.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique,
  circle_wallet_id text unique,
  handle text unique not null check (handle ~ '^[a-zA-Z0-9_]{2,32}$'),
  display_name text not null,
  avatar_initials text not null default 'OS',
  bio text not null default '',
  role text not null default 'viewer' check (role in ('viewer', 'creator', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.videos (
  id text primary key,
  creator_id uuid references public.profiles(id) on delete set null,
  title text not null check (char_length(title) between 1 and 60),
  description text not null check (char_length(description) between 1 and 200),
  tags text[] not null default '{}',
  video_cid text not null,
  thumbnail_cid text not null,
  video_src text not null,
  thumbnail_src text not null,
  rate_per_second numeric(18, 6) not null check (rate_per_second > 0 and rate_per_second <= 0.01),
  total_earned numeric(18, 6) not null default 0,
  total_watch_seconds integer not null default 0,
  live_viewers integer not null default 0,
  active boolean not null default true,
  contract_tx_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stream_sessions (
  id text primary key,
  video_id text not null references public.videos(id) on delete cascade,
  viewer_wallet_id text not null,
  creator_wallet_address text not null,
  rate_per_second numeric(18, 6) not null,
  balance_cap numeric(18, 6),
  status text not null check (status in ('playing', 'paused', 'stopped')),
  started_at timestamptz not null default now(),
  last_accounted_at timestamptz not null default now(),
  total_paid numeric(18, 6) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text unique not null,
  session_id text references public.stream_sessions(id) on delete set null,
  video_id text references public.videos(id) on delete set null,
  kind text not null check (kind in ('stream', 'tip', 'withdraw', 'topup')),
  amount numeric(18, 6) not null check (amount >= 0),
  tx_hash text not null,
  status text not null default 'settled',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles(id) on delete set null,
  destination_chain text not null,
  destination_address text not null,
  amount numeric(18, 6) not null check (amount > 0),
  message_hash text,
  attestation text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists videos_creator_id_idx on public.videos(creator_id);
create index if not exists videos_created_at_idx on public.videos(created_at desc);
create index if not exists videos_rate_idx on public.videos(rate_per_second);
create index if not exists stream_sessions_video_id_idx on public.stream_sessions(video_id);
create index if not exists payment_events_session_id_idx on public.payment_events(session_id);
create index if not exists payment_events_created_at_idx on public.payment_events(created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists videos_updated_at on public.videos;
create trigger videos_updated_at before update on public.videos
for each row execute function public.set_updated_at();

drop trigger if exists stream_sessions_updated_at on public.stream_sessions;
create trigger stream_sessions_updated_at before update on public.stream_sessions
for each row execute function public.set_updated_at();

drop trigger if exists withdrawals_updated_at on public.withdrawals;
create trigger withdrawals_updated_at before update on public.withdrawals
for each row execute function public.set_updated_at();

insert into public.profiles (id, wallet_address, circle_wallet_id, handle, display_name, avatar_initials, bio, role)
values
  ('00000000-0000-0000-0000-000000000001', '0x8a1A7dCafE000000000000000000000000000001', 'creator_wallet_maya', 'maya', 'Maya Flux', 'MF', 'Motion loops, studio notes, and microscopic pricing experiments.', 'creator'),
  ('00000000-0000-0000-0000-000000000002', '0x8a1A7dCafE000000000000000000000000000002', 'creator_wallet_rio', 'rio', 'Rio Vale', 'RV', 'Short essays, clean edits, and decentralized video experiments.', 'creator'),
  ('00000000-0000-0000-0000-000000000003', '0x8a1A7dCafE000000000000000000000000000003', 'creator_wallet_sana', 'sana', 'Sana Kepler', 'SK', 'Teaching practical crypto UX in compact video lessons.', 'creator'),
  ('00000000-0000-0000-0000-000000000004', '0x8a1A7dCafE000000000000000000000000000004', 'creator_wallet_niko', 'niko', 'Niko Chain', 'NC', 'Infrastructure explainers for people who like receipts.', 'creator'),
  ('00000000-0000-0000-0000-000000000005', '0x8a1A7dCafE000000000000000000000000000005', 'creator_wallet_lyra', 'lyra', 'Lyra Node', 'LN', 'Publishing experiments for independent creators.', 'creator')
on conflict (handle) do nothing;

insert into public.videos (
  id, creator_id, title, description, tags, video_cid, thumbnail_cid, video_src, thumbnail_src,
  rate_per_second, total_earned, total_watch_seconds, live_viewers
)
values
  (
    'vid_arcflow_001',
    '00000000-0000-0000-0000-000000000001',
    'Arc Flow Warmup',
    'A crisp movement study with pay-per-second creator support.',
    array['movement', 'studio', 'arc'],
    'bafybeimockarcflow',
    'bafybeimockthumb1',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 675%22%3E%3Crect width=%221200%22 height=%22675%22 fill=%22%2307110f%22/%3E%3Ccircle cx=%22960%22 cy=%22120%22 r=%22220%22 fill=%22%232dd4bf%22 opacity=%22.18%22/%3E%3Ctext x=%2288%22 y=%22525%22 fill=%22white%22 font-family=%22Arial%22 font-size=%2264%22 font-weight=%22700%22%3EArc Flow Warmup%3C/text%3E%3C/svg%3E',
    0.000001, 12.431202, 18420, 7
  ),
  (
    'vid_noads_002',
    '00000000-0000-0000-0000-000000000002',
    'No Ads Cut',
    'A creator-first clip about direct USDC attention streams.',
    array['essay', 'creator', 'usdc'],
    'bafybeimocknoads',
    'bafybeimockthumb2',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 675%22%3E%3Crect width=%221200%22 height=%22675%22 fill=%22%2307110f%22/%3E%3Ccircle cx=%22960%22 cy=%22120%22 r=%22220%22 fill=%22%23a7f3d0%22 opacity=%22.18%22/%3E%3Ctext x=%2288%22 y=%22525%22 fill=%22white%22 font-family=%22Arial%22 font-size=%2264%22 font-weight=%22700%22%3ENo Ads Cut%3C/text%3E%3C/svg%3E',
    0.000010, 42.100040, 32110, 12
  ),
  (
    'vid_micro_003',
    '00000000-0000-0000-0000-000000000003',
    'Micro Price Test',
    'A premium workflow demo priced by the second.',
    array['tutorial', 'wallet', 'payments'],
    'bafybeimockmicro',
    'bafybeimockthumb3',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 675%22%3E%3Crect width=%221200%22 height=%22675%22 fill=%22%2307110f%22/%3E%3Ccircle cx=%22960%22 cy=%22120%22 r=%22220%22 fill=%22%235eead4%22 opacity=%22.18%22/%3E%3Ctext x=%2288%22 y=%22525%22 fill=%22white%22 font-family=%22Arial%22 font-size=%2264%22 font-weight=%22700%22%3EMicro Price Test%3C/text%3E%3C/svg%3E',
    0.000100, 103.987654, 55120, 3
  ),
  (
    'vid_cctp_004',
    '00000000-0000-0000-0000-000000000004',
    'CCTP Studio Payout',
    'A behind-the-scenes look at cross-chain creator withdrawal flows.',
    array['cctp', 'withdraw', 'infra'],
    'bafybeimockcctp',
    'bafybeimockthumb4',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 675%22%3E%3Crect width=%221200%22 height=%22675%22 fill=%22%2307110f%22/%3E%3Ccircle cx=%22960%22 cy=%22120%22 r=%22220%22 fill=%22%2399f6e4%22 opacity=%22.18%22/%3E%3Ctext x=%2288%22 y=%22525%22 fill=%22white%22 font-family=%22Arial%22 font-size=%2264%22 font-weight=%22700%22%3ECCTP Studio Payout%3C/text%3E%3C/svg%3E',
    0.001000, 331.442001, 8450, 1
  ),
  (
    'vid_pinata_005',
    '00000000-0000-0000-0000-000000000005',
    'Pinata Clip Drop',
    'A tiny video release stored on IPFS and monetized live.',
    array['ipfs', 'publishing', 'clip'],
    'bafybeimockpinata',
    'bafybeimockthumb5',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 675%22%3E%3Crect width=%221200%22 height=%22675%22 fill=%22%2307110f%22/%3E%3Ccircle cx=%22960%22 cy=%22120%22 r=%22220%22 fill=%22%23ccfbf1%22 opacity=%22.18%22/%3E%3Ctext x=%2288%22 y=%22525%22 fill=%22white%22 font-family=%22Arial%22 font-size=%2264%22 font-weight=%22700%22%3EPinata Clip Drop%3C/text%3E%3C/svg%3E',
    0.000010, 76.220091, 44990, 9
  )
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.videos enable row level security;
alter table public.stream_sessions enable row level security;
alter table public.payment_events enable row level security;
alter table public.withdrawals enable row level security;

drop policy if exists "public read profiles" on public.profiles;
create policy "public read profiles" on public.profiles for select using (true);

drop policy if exists "public read active videos" on public.videos;
create policy "public read active videos" on public.videos for select using (active = true);

-- Server-side Next.js routes should use DATABASE_URL with elevated service credentials.
-- Add user-scoped insert/update policies later when wallet-signature auth is finalized.

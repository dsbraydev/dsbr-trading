-- ============================================================
-- Trading Journal Schema
-- Paste this into the Supabase SQL editor and run it.
-- ============================================================

-- 1. Checklist items (reusable, user-defined)
create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table checklist_items enable row level security;

drop policy if exists "checklist_items_all" on checklist_items;
create policy "checklist_items_all" on checklist_items
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Challenges (one active per user at a time)
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  starting_balance numeric(12,2) not null,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table challenges enable row level security;

drop policy if exists "challenges_all" on challenges;
create policy "challenges_all" on challenges
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Prop firm accounts
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  starting_balance numeric(12,2) not null,
  created_at timestamptz not null default now()
);

alter table accounts enable row level security;

drop policy if exists "accounts_all" on accounts;
create policy "accounts_all" on accounts
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Trades
create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  currency text not null check (currency in ('NAS100', 'Gold')),
  win boolean not null,
  amount numeric(12,2) not null,
  notes text,
  image_url text,
  challenge_id uuid references challenges(id) on delete cascade,
  traded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table trades enable row level security;

drop policy if exists "trades_all" on trades;
create policy "trades_all" on trades
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Trade <-> Account join (one trade can link to multiple prop firm accounts)
create table if not exists trade_accounts (
  trade_id uuid references trades(id) on delete cascade not null,
  account_id uuid references accounts(id) on delete cascade not null,
  primary key (trade_id, account_id)
);

alter table trade_accounts enable row level security;

drop policy if exists "trade_accounts_all" on trade_accounts;
create policy "trade_accounts_all" on trade_accounts
  for all to authenticated
  using (
    exists (
      select 1 from trades
      where trades.id = trade_id
        and trades.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from trades
      where trades.id = trade_id
        and trades.user_id = auth.uid()
    )
  );

-- 6. Trade <-> Checklist items join (which items were checked per trade)
create table if not exists trade_checklist_items (
  trade_id uuid references trades(id) on delete cascade not null,
  checklist_item_id uuid references checklist_items(id) on delete cascade not null,
  primary key (trade_id, checklist_item_id)
);

alter table trade_checklist_items enable row level security;

drop policy if exists "trade_checklist_items_all" on trade_checklist_items;
create policy "trade_checklist_items_all" on trade_checklist_items
  for all to authenticated
  using (
    exists (
      select 1 from trades
      where trades.id = trade_id
        and trades.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from trades
      where trades.id = trade_id
        and trades.user_id = auth.uid()
    )
  );

-- 7. Storage bucket for trade screenshots
insert into storage.buckets (id, name, public)
values ('trade-images', 'trade-images', true)
on conflict (id) do nothing;

drop policy if exists "trade_images_insert" on storage.objects;
drop policy if exists "trade_images_select" on storage.objects;
drop policy if exists "trade_images_delete" on storage.objects;

create policy "trade_images_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'trade-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "trade_images_select" on storage.objects
  for select
  using (bucket_id = 'trade-images');

create policy "trade_images_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'trade-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

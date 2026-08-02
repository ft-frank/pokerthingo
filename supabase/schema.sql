-- ─────────────────────────────────────────────────────────────────────────
-- Poker Night — database schema
--
-- Paste this whole file into the Supabase SQL Editor and run it once.
--   Dashboard → SQL Editor → New query → paste → Run
--
-- It creates one table, `public.games`, and locks it down with Row Level
-- Security so each signed-in user can only read/write their OWN games.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.games (
  -- Client-generated short id (matches the app's ids).
  id          text primary key,

  -- Owner. Auto-filled from the logged-in user, so the app never has to
  -- send it. `on delete cascade` cleans up games if the account is removed.
  user_id     uuid not null default auth.uid()
                references auth.users (id) on delete cascade,

  stakes      text not null,
  date        date not null default current_date,

  -- The players array, stored as JSON:
  -- [{ "id": "...", "name": "...", "buyin": 40, "cashout": 0 }, ...]
  players     jsonb not null default '[]'::jsonb,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists games_user_id_idx on public.games (user_id);

-- Keep updated_at fresh on every change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists games_set_updated_at on public.games;
create trigger games_set_updated_at
  before update on public.games
  for each row execute function public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────
alter table public.games enable row level security;

drop policy if exists "select own games" on public.games;
create policy "select own games"
  on public.games for select
  using (auth.uid() = user_id);

drop policy if exists "insert own games" on public.games;
create policy "insert own games"
  on public.games for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own games" on public.games;
create policy "update own games"
  on public.games for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "delete own games" on public.games;
create policy "delete own games"
  on public.games for delete
  using (auth.uid() = user_id);

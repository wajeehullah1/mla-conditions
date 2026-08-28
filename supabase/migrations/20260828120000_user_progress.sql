-- Career progress for the dashboard's quest map.
--
-- One row per student. `days` maps a local calendar day to the mini-games
-- finished that day ({"2026-08-28": ["medmatch", "abg-ninja"]}); XP is derived
-- from it rather than stored, so a bonus can never be counted twice. Days older
-- than the client's history window are folded into `archived_xp`, and
-- `archived_through` records the cutoff that total covers so two devices can
-- merge without double-counting.

create table if not exists public.user_progress (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  archived_xp      integer     not null default 0,
  archived_through text        not null default '',
  days             jsonb       not null default '{}'::jsonb,
  updated_at       timestamptz not null default now()
);

alter table public.user_progress enable row level security;

-- A student can only ever see and write their own row.
drop policy if exists "read own progress"   on public.user_progress;
drop policy if exists "insert own progress" on public.user_progress;
drop policy if exists "update own progress" on public.user_progress;

create policy "read own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

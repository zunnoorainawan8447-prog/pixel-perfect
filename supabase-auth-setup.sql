-- CITIZEN PREP — User accounts & private progress storage
-- Run this in Supabase Dashboard → SQL Editor → New query → Paste → Run
--
-- What this does:
-- 1. Creates a `profiles` table (one row per user, stores email)
-- 2. Creates a `user_progress` table (one row per user, stores their study progress as JSON)
-- 3. Enables Row Level Security (RLS) so EVERY user can ONLY see/edit THEIR OWN data.
--    No user can ever read another user's email, progress, bookmarks, or exam results.
-- 4. Auto-creates a profile row when a new user signs up.

-- ─── 1. Profiles table ──────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

-- ─── 2. User progress table ─────────────────────────────────────────
create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ─── 3. Enable Row Level Security (privacy lock) ────────────────────
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;

-- Drop old policies if re-running
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can view own progress" on public.user_progress;
drop policy if exists "Users can insert own progress" on public.user_progress;
drop policy if exists "Users can update own progress" on public.user_progress;
drop policy if exists "Users can delete own progress" on public.user_progress;

-- Profiles: only the owner can read/update their own row
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Progress: only the owner can read/write their own row
create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

create policy "Users can delete own progress"
  on public.user_progress for delete
  using (auth.uid() = user_id);

-- ─── 4. Auto-create profile on signup ───────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

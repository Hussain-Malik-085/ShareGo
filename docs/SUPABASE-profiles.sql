-- Run in Supabase: SQL Editor > New query
-- Table used by app Signup (profiles) before auth.signUp

create table if not exists public.profiles (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now()
);

-- Dev / FYP: simple open policies (tighten for production)
alter table public.profiles enable row level security;

create policy "profiles_read" on public.profiles
  for select using (true);

create policy "profiles_insert" on public.profiles
  for insert with check (true);

create policy "profiles_update" on public.profiles
  for update using (true);

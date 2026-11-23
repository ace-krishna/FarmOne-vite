-- FarmOne: user profiles (name + email) for login.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Also turn OFF email confirmation: Authentication -> Providers -> Email -> "Confirm email".

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  email      text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Creates the profile row automatically whenever someone signs up.
-- The name comes from the sign-up form (stored as user metadata "full_name").
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

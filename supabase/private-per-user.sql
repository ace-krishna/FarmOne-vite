-- FarmOne: make animals and vaccinations private per user.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Needs supabase/schema.sql and supabase/vaccinations.sql to have been run already.

-- 1) Every new row is stamped with the signed-in user automatically,
--    so the app does not have to send owner_id itself.
alter table public.animals       alter column owner_id set default auth.uid();
alter table public.vaccinations  alter column owner_id set default auth.uid();

-- 2) Link owner_id to real users (safe: existing empty owner_id values are allowed).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'animals_owner_fk') then
    alter table public.animals
      add constraint animals_owner_fk foreign key (owner_id) references auth.users (id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'vaccinations_owner_fk') then
    alter table public.vaccinations
      add constraint vaccinations_owner_fk foreign key (owner_id) references auth.users (id) on delete cascade;
  end if;
end $$;

-- 3) Replace the open policies with "only my own rows".
drop policy if exists "temporary open access" on public.animals;
drop policy if exists "owners manage their own animals" on public.animals;
create policy "owners manage their own animals"
  on public.animals for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "temporary open access" on public.vaccinations;
drop policy if exists "owners manage their own vaccinations" on public.vaccinations;
create policy "owners manage their own vaccinations"
  on public.vaccinations for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ------------------------------------------------------------------
-- OPTIONAL: animals and vaccinations saved BEFORE login have no owner,
-- so after step 3 nobody can see them. To give them all to one user:
-- 1. Authentication -> Users -> copy that user's id (UUID).
-- 2. Remove the "--" in front of the two lines below, paste the id, run.
--
-- update public.animals      set owner_id = 'PASTE-USER-ID-HERE' where owner_id is null;
-- update public.vaccinations set owner_id = 'PASTE-USER-ID-HERE' where owner_id is null;

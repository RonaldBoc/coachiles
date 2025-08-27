-- Migration: Add onboarding_done flag to coaches table
-- Purpose: Distinguish between account activation and completion of onboarding.
-- Visibility rule: Only show coaches where is_active = true AND onboarding_done = true.

begin;

-- 1. Add column (idempotent)
alter table if exists public.coaches
  add column if not exists onboarding_done boolean not null default false;

-- 2. Backfill: mark currently active coaches as done (assumes they were previously visible)
update public.coaches
  set onboarding_done = true
  where is_active = true
    and onboarding_done = false;

-- 3. Optional performance index for visibility filtering
create index if not exists idx_coaches_visible
  on public.coaches (is_active, onboarding_done)
  where is_active and onboarding_done;

-- 4. (Optional) Recreate a marketplace view if you use one. Uncomment and adapt as needed.
-- create or replace view public.visible_coaches as
--   select * from public.coaches
--   where is_active and onboarding_done;

commit;

-- Down (manual rollback if ever needed):
-- alter table public.coaches drop column if exists onboarding_done;

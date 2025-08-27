-- 34_add_coach_profile_structured_fields.sql
-- Purpose: Support new structured coach profile editor (personal/contact/activity) and course modalities
-- Adds JSONB columns + availability text + (safety) experience if missing
-- Safe to run multiple times (IF NOT EXISTS guards).

BEGIN;

-- Add new JSONB profile fields & modalities. Do NOT add availability (already text[] in canonical schema).
ALTER TABLE public.coaches
  ADD COLUMN IF NOT EXISTS profile_personal  JSONB,
  ADD COLUMN IF NOT EXISTS profile_contact   JSONB,
  ADD COLUMN IF NOT EXISTS profile_activity  JSONB,
  ADD COLUMN IF NOT EXISTS modalities        JSONB,
  ADD COLUMN IF NOT EXISTS experience        INTEGER; -- legacy mirror of experience_years if used by app

-- Optional: index for querying inside modalities (e.g., enabled locations, freeTrial etc.)
CREATE INDEX IF NOT EXISTS idx_coaches_modalities_gin ON public.coaches USING GIN (modalities);

-- Optional: index for languages inside profile_personal (only if you plan to filter by language frequently)
-- CREATE INDEX IF NOT EXISTS idx_coaches_profile_personal_gin ON public.coaches USING GIN (profile_personal);

-- RLS: ensure coach can update their own new JSON columns.
-- We create a dedicated policy if none exists specifically referencing these columns.
DO $$
DECLARE
  pol_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'coaches'
      AND policyname = 'coaches_update_own_profile_structured'
  ) INTO pol_exists;

  IF NOT pol_exists THEN
    CREATE POLICY "coaches_update_own_profile_structured" ON public.coaches
      FOR UPDATE USING ( auth.uid() = id )
      WITH CHECK ( auth.uid() = id );
  END IF;
END$$;

-- (No automatic backfill performed to avoid referencing uncertain legacy column names. Add below if desired.)
-- Example backfill sketch (uncomment & adapt only if columns exist):
-- UPDATE public.coaches SET profile_personal = jsonb_build_object(
--   'firstName', first_name,
--   'lastName', last_name,
--   'age', NULL,
--   'gender', '',
--   'territory', NULL,
--   'city', NULL,
--   'languages', COALESCE(to_jsonb(languages), '[]'::jsonb)
-- ) WHERE profile_personal IS NULL;

COMMIT;

-- Down migration (manual): to revert, run
-- ALTER TABLE public.coaches DROP COLUMN IF EXISTS profile_personal, DROP COLUMN IF EXISTS profile_contact,
--   DROP COLUMN IF EXISTS profile_activity, DROP COLUMN IF EXISTS modalities, DROP COLUMN IF EXISTS availability;
-- DROP INDEX IF EXISTS idx_coaches_modalities_gin;

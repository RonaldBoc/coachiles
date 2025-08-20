-- Migration: Add start_timeframe to leads and deprecate budget
-- Safely adds the new column and relaxes budget constraints for backward compatibility.

-- Add new column for client readiness to start
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS start_timeframe TEXT;

-- Make budget optional if it exists (deprecated)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'budget'
  ) THEN
    BEGIN
      ALTER TABLE public.leads ALTER COLUMN budget DROP NOT NULL;
    EXCEPTION WHEN others THEN
      -- Ignore if the column is already nullable or constraint cannot be changed
      NULL;
    END;
  END IF;
END $$;

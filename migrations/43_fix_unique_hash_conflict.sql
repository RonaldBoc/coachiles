-- Migration 43: Fix ON CONFLICT (unique_hash) error (42P10)
-- Problem: enqueue function uses ON CONFLICT (unique_hash) DO NOTHING but only a PARTIAL unique index existed
-- (WHERE unique_hash IS NOT NULL). Postgres cannot use a partial unique index for a column-list ON CONFLICT
-- inference, leading to 42P10. Solution: replace partial unique index with a full UNIQUE constraint that
-- naturally allows multiple NULLs.

BEGIN;

-- 1. Drop old partial unique index if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='uq_notification_events_unique_hash'
  ) THEN
    EXECUTE 'DROP INDEX public.uq_notification_events_unique_hash';
  END IF;
END$$;

-- 2. Add UNIQUE constraint (idempotent guard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.notification_events'::regclass
      AND conname = 'notification_events_unique_hash'
  ) THEN
    ALTER TABLE public.notification_events
      ADD CONSTRAINT notification_events_unique_hash UNIQUE (unique_hash);
  END IF;
END$$;

-- 3. (Optional) Comment for clarity
COMMENT ON CONSTRAINT notification_events_unique_hash ON public.notification_events
  IS 'Ensures unique_hash is unique (NULLs allowed); supports ON CONFLICT (unique_hash) DO NOTHING.';

COMMIT;

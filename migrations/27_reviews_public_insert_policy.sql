-- 27_reviews_public_insert_policy.sql
-- Purpose: Allow unauthenticated (anon) visitors to submit a pending review without a booking.
-- The review will remain unpublished until a superadmin approves it.

-- Drop legacy booking-only insert policy if present (keep it if you still want booking-based reviews as well)
-- (We keep the existing booking policy so both paths are valid.)
-- Ensure table RLS enabled (idempotent)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create a permissive insert policy for anyone submitting a basic review
DROP POLICY IF EXISTS "Anyone can create pending profile reviews" ON public.reviews;
CREATE POLICY "Anyone can create pending profile reviews" ON public.reviews
  FOR INSERT
  WITH CHECK (
    -- Must target a coach
    coach_id IS NOT NULL
    AND rating BETWEEN 1 AND 5
    -- Force moderation workflow fields
    AND moderation_status = 'pending'
    AND is_published = false
    AND is_verified = false
    -- Disallow coach pre-response injection
    AND coach_response IS NULL
  );

-- Optional hardening: prevent anonymous users from setting privileged fields differently
CREATE OR REPLACE FUNCTION public.normalise_new_review()
RETURNS trigger AS $$
BEGIN
  -- Enforce server-side values irrespective of client attempt
  NEW.moderation_status := 'pending';
  NEW.is_published := false;
  NEW.is_verified := false;
  NEW.coach_response := NULL; -- cannot be pre-filled
  NEW.updated_at := timezone('utc', now());
  NEW.created_at := COALESCE(NEW.created_at, timezone('utc', now()));
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_normalise_new_review ON public.reviews;
CREATE TRIGGER trg_normalise_new_review
BEFORE INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.normalise_new_review();

COMMENT ON POLICY "Anyone can create pending profile reviews" ON public.reviews IS 'Allows public visitors to submit a pending, unpublished review (moderated later).';

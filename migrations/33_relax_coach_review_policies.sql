-- 33_relax_coach_review_policies.sql
-- Purpose: Allow coaches whose auth.uid() does NOT match reviews.coach_id (e.g., imported data)
--          but whose email matches the coach record to view and respond to their reviews.
-- Approach: Replace existing coach select/update policies with OR condition including email match.

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Coaches can view own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Coaches can respond to own reviews" ON public.reviews;

-- Recreate with OR email-based ownership (joins to coaches by id)
CREATE POLICY "Coaches can view own reviews" ON public.reviews
  FOR SELECT TO authenticated
  USING (
    auth.uid()::text = coach_id::text OR
    EXISTS (
      SELECT 1 FROM public.coaches c
      WHERE c.id = reviews.coach_id
        AND c.email = auth.email()
    )
  );

CREATE POLICY "Coaches can respond to own reviews" ON public.reviews
  FOR UPDATE TO authenticated
  USING (
    auth.uid()::text = coach_id::text OR
    EXISTS (
      SELECT 1 FROM public.coaches c
      WHERE c.id = reviews.coach_id
        AND c.email = auth.email()
    )
  );

COMMENT ON POLICY "Coaches can view own reviews" ON public.reviews IS 'Coach may view reviews where they own the coach record by id or email.';
COMMENT ON POLICY "Coaches can respond to own reviews" ON public.reviews IS 'Coach may add single response to reviews they own by id or email.';

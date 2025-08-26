-- 28_relax_review_insert_policy.sql
-- Purpose: Relax review insert RLS to avoid client mismatch on moderation fields (handles 401/RLS errors).
-- The normalization trigger (trg_normalise_new_review) still enforces secure values.

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop stricter policy created earlier
DROP POLICY IF EXISTS "Anyone can create pending profile reviews" ON public.reviews;

-- Create simpler public insert policy: only require target coach + valid rating
DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;
CREATE POLICY "Anyone can submit a review" ON public.reviews
  FOR INSERT
  WITH CHECK (
    coach_id IS NOT NULL AND rating BETWEEN 1 AND 5
  );

COMMENT ON POLICY "Anyone can submit a review" ON public.reviews IS 'Public (anon/auth) may insert a review; trigger normalizes moderation fields.';

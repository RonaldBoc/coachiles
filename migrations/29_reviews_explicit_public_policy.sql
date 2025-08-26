-- 29_reviews_explicit_public_policy.sql
-- Purpose: Ensure anonymous & authenticated users can insert pending reviews (fix persistent RLS 42501).
-- Adds explicit role-targeted policy and reuses normalization trigger.

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Cleanup prior generic public insert policies
DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can create pending profile reviews" ON public.reviews;

-- Explicit insert policy for anon + authenticated roles
CREATE POLICY "Public (anon+auth) can insert reviews" ON public.reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    coach_id IS NOT NULL
    AND rating BETWEEN 1 AND 5
  );

-- (Optional) Reassert select policy for published reviews (idempotent)
DROP POLICY IF EXISTS "Public can view published reviews" ON public.reviews;
CREATE POLICY "Public can view published reviews" ON public.reviews
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

-- Coach & admin policies (retain or recreate minimal set)
DROP POLICY IF EXISTS "Coaches can view own reviews" ON public.reviews;
CREATE POLICY "Coaches can view own reviews" ON public.reviews
  FOR SELECT TO authenticated
  USING (auth.uid()::text = coach_id::text);

DROP POLICY IF EXISTS "Coaches can respond to own reviews" ON public.reviews;
CREATE POLICY "Coaches can respond to own reviews" ON public.reviews
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = coach_id::text);

COMMENT ON POLICY "Public (anon+auth) can insert reviews" ON public.reviews IS 'Allows anyone to submit a raw review row; moderation trigger normalizes & keeps it pending.';

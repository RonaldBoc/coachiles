-- RLS HARDENING PATCH
-- Apply carefully in Supabase SQL Editor. Review each change to ensure it matches intent.
-- After running, re-run scripts/audit-rls.sql to verify.

BEGIN;

-- 1) coach_deletion_log: fix "Only system can insert/view" (previously too permissive / denied all)
DROP POLICY IF EXISTS "Only system can insert deletion logs" ON public.coach_deletion_log;
CREATE POLICY "Only system can insert deletion logs" ON public.coach_deletion_log
  FOR INSERT TO public
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Only system can view deletion logs" ON public.coach_deletion_log;
CREATE POLICY "Only system can view deletion logs" ON public.coach_deletion_log
  FOR SELECT TO public
  USING (auth.role() = 'service_role');

-- 2) services: remove broad SELECT-all policy and ensure public only sees active
-- Drop overly broad policy if present
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='services' AND policyname='services_select_policy'
  ) THEN
    EXECUTE 'DROP POLICY "services_select_policy" ON public.services';
  END IF;
END $$;

-- Ensure a safe public SELECT policy exists (only active services)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='services' AND policyname='Public can view active services'
  ) THEN
    EXECUTE $$CREATE POLICY "Public can view active services" ON public.services
      FOR SELECT TO public USING (is_active = true)$$;
  END IF;
END $$;

-- Optionally restrict manage-own-services policy to authenticated (ownership already enforced by USING)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='services' AND policyname='Coaches can manage own services'
  ) THEN
    -- Recreate with TO authenticated (no behavior change for anon, but clearer intent)
    EXECUTE 'DROP POLICY "Coaches can manage own services" ON public.services';
    EXECUTE $$CREATE POLICY "Coaches can manage own services" ON public.services
      FOR ALL TO authenticated USING (auth.uid()::text = coach_id::text)$$;
  END IF;
END $$;

-- 3) storage.objects: tighten avatar policies to require ownership for UPDATE/DELETE/INSERT
-- Drop permissive update/delete policies if they don't check ownership
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Users can update their own avatars'
  ) THEN
    EXECUTE 'DROP POLICY "Users can update their own avatars" ON storage.objects';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Users can delete their own avatars'
  ) THEN
    EXECUTE 'DROP POLICY "Users can delete their own avatars" ON storage.objects';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Authenticated users can upload avatars'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can upload avatars" ON storage.objects';
  END IF;
END $$;

-- Create strict policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Coaches can upload own avatars'
  ) THEN
    EXECUTE $$CREATE POLICY "Coaches can upload own avatars" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id='coach-avatars' AND auth.uid()::text = (storage.foldername(name))[1])$$;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Coaches can update own avatars'
  ) THEN
    EXECUTE $$CREATE POLICY "Coaches can update own avatars" ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id='coach-avatars' AND auth.uid()::text = (storage.foldername(name))[1])$$;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Coaches can delete own avatars'
  ) THEN
    EXECUTE $$CREATE POLICY "Coaches can delete own avatars" ON storage.objects
      FOR DELETE TO authenticated
      USING (bucket_id='coach-avatars' AND auth.uid()::text = (storage.foldername(name))[1])$$;
  END IF;
END $$;

-- 4) reviews: prevent fake inserts without booking proof
-- Drop permissive generic insert (if present) and keep the stricter booking-completed rule
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='Public (anon+auth) can insert reviews'
  ) THEN
    EXECUTE 'DROP POLICY "Public (anon+auth) can insert reviews" ON public.reviews';
  END IF;
END $$;

-- 5) notification_preferences: restrict policies to authenticated (ownership enforced either way)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notification_preferences' AND policyname='Owner can view notification prefs'
  ) THEN
    EXECUTE 'DROP POLICY "Owner can view notification prefs" ON public.notification_preferences';
    EXECUTE $$CREATE POLICY "Owner can view notification prefs" ON public.notification_preferences
      FOR SELECT TO authenticated USING (auth.uid() = user_id)$$;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notification_preferences' AND policyname='Owner can insert own notification prefs'
  ) THEN
    EXECUTE 'DROP POLICY "Owner can insert own notification prefs" ON public.notification_preferences';
    EXECUTE $$CREATE POLICY "Owner can insert own notification prefs" ON public.notification_preferences
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)$$;
  END IF;
END $$;

-- 6) coaches: avoid exposing all coaches (including inactive/deleted) to any authenticated user
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='coaches' AND policyname='Authenticated users can view all coaches'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can view all coaches" ON public.coaches';
  END IF;
END $$;

-- 7) leads: optional privacy tightening (comment out if intentional)
-- DO $$ BEGIN
--   IF EXISTS (
--     SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='leads' AND policyname='Public can view unassigned incomplete leads'
--   ) THEN
--     EXECUTE 'DROP POLICY "Public can view unassigned incomplete leads" ON public.leads';
--   END IF;
-- END $$;

COMMIT;

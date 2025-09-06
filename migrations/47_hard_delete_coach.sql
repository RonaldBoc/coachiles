-- 47_hard_delete_coach.sql
-- Purpose: Enable full hard deletion of a coach and all dependent data (DEV STAGE ONLY)
-- This migration:
--   1. Alters foreign keys on leads.coach_id and subscriptions.coach_id to ON DELETE CASCADE
--   2. Creates a SECURITY DEFINER function admin_hard_delete_coach(uuid) that:
--        - Authorizes caller (service_role OR JWT claim is_superadmin=true)
--        - Deletes related storage avatar objects
--        - Deletes the coach row (cascading to dependent tables)
--   3. Returns a JSON status object
--
-- Revert strategy (manual):
--   - Recreate the foreign keys with original delete rules (NO ACTION for subscriptions/leads)
--   - DROP FUNCTION public.admin_hard_delete_coach(uuid);
--
-- IMPORTANT: This is meant for development / reset flows. In production you should implement
--            a soft delete + grace period + anonymization. See account deletion docs.

BEGIN;

-- 1. Adjust foreign keys to cascade for full hard delete
-- (Original delete_rule for leads.coach_id = NO ACTION, for subscriptions.coach_id = NO ACTION)

ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_coach_id_fkey,
  ADD CONSTRAINT leads_coach_id_fkey
    FOREIGN KEY (coach_id) REFERENCES public.coaches(id) ON DELETE CASCADE;

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_coach_id_fkey,
  ADD CONSTRAINT subscriptions_coach_id_fkey
    FOREIGN KEY (coach_id) REFERENCES public.coaches(id) ON DELETE CASCADE;

-- 2. Hard delete function
-- Authorization notes:
--   auth.role() returns 'service_role' for backend key usage.
--   We also allow an authenticated JWT with custom claim is_superadmin=true.
--   If neither, the function raises an exception.

CREATE OR REPLACE FUNCTION public.admin_hard_delete_coach(p_coach_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
  v_role text := auth.role();
  v_is_superadmin boolean := (coalesce(auth.jwt() ->> 'is_superadmin', 'false') = 'true');
BEGIN
  -- Authorization check
  IF NOT (v_role = 'service_role' OR v_is_superadmin) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.coaches WHERE id = p_coach_id) INTO v_exists;
  IF NOT v_exists THEN
    RETURN jsonb_build_object('status','not_found','coach_id',p_coach_id);
  END IF;

  -- Best-effort cleanup of avatar assets (ignore if bucket not present / no objects)
  BEGIN
    DELETE FROM storage.objects
    WHERE bucket_id = 'coach-avatars'
      AND (name = p_coach_id::text OR name LIKE p_coach_id::text || '/%');
  EXCEPTION WHEN others THEN
    -- Swallow errors (dev convenience); in prod you might log these.
    NULL;
  END;

  -- Delete coach (cascades to dependent tables due to ON DELETE CASCADE FKs)
  DELETE FROM public.coaches WHERE id = p_coach_id;

  RETURN jsonb_build_object('status','deleted','coach_id',p_coach_id);
END;
$$;

-- Restrict execution to relevant roles (service_role already implicit). Grant to authenticated if you want JWT superadmin usage.
GRANT EXECUTE ON FUNCTION public.admin_hard_delete_coach(uuid) TO authenticated;

COMMIT;

-- Usage Example (in SQL):
--   SELECT public.admin_hard_delete_coach('00000000-0000-0000-0000-000000000000');
-- Usage Example (JS via supabase client with service key or superadmin JWT):
--   const { data, error } = await supabase.rpc('admin_hard_delete_coach', { p_coach_id: coachId });

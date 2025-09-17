-- Migration 53: Resolve claim_notification_events default-parameter conflict
-- Drops any existing overloaded versions and recreates a single, unambiguous signature.

-- 1) Drop both possible existing signatures (with/without defaults)
DROP FUNCTION IF EXISTS public.claim_notification_events(int);
DROP FUNCTION IF EXISTS public.claim_notification_events(int, boolean);

-- 2) Recreate intended function WITHOUT parameter defaults
CREATE FUNCTION public.claim_notification_events(
  p_batch int,
  p_ignore_schedule boolean
)
RETURNS SETOF public.notification_events
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH cte AS (
    SELECT id
    FROM public.notification_events
    WHERE status='PENDING' AND (p_ignore_schedule OR next_attempt_at <= now())
    ORDER BY created_at ASC
    LIMIT p_batch
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.notification_events e
  SET status='PROCESSING'
  FROM cte
  WHERE e.id = cte.id
  RETURNING e.*;
$$;

GRANT EXECUTE ON FUNCTION public.claim_notification_events(int, boolean) TO authenticated, service_role;

COMMENT ON FUNCTION public.claim_notification_events(int, boolean) IS 'Atomically claims a batch of PENDING notification_events; optional ignore of next_attempt_at.';

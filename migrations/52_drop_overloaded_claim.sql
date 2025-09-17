-- Migration 52: Drop overloaded claim function to resolve PostgREST ambiguity

DROP FUNCTION IF EXISTS public.claim_notification_events(int);

-- Ensure the desired signature exists
CREATE OR REPLACE FUNCTION public.claim_notification_events(
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

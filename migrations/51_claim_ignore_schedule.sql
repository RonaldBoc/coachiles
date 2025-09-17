-- Migration 51: Add ignore-schedule option to claim_notification_events

CREATE OR REPLACE FUNCTION public.claim_notification_events(
  p_batch int DEFAULT 25,
  p_ignore_schedule boolean DEFAULT false
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

-- Migration 50: Atomic claim function for notification events
-- Provides a single-step UPDATE ... RETURNING for PENDING events to avoid leaving rows stuck in PROCESSING.
-- Usage (RPC): POST /rest/v1/rpc/claim_notification_events {"p_batch":25}

CREATE OR REPLACE FUNCTION public.claim_notification_events(p_batch int DEFAULT 25)
RETURNS SETOF public.notification_events
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH cte AS (
    SELECT id
    FROM public.notification_events
    WHERE status='PENDING' AND next_attempt_at <= now()
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

GRANT EXECUTE ON FUNCTION public.claim_notification_events(int) TO authenticated, service_role;

COMMENT ON FUNCTION public.claim_notification_events(int) IS 'Atomically claims a batch of PENDING notification_events by setting status=PROCESSING and returning the rows.';

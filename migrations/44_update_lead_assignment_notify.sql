-- Migration 44: Guard lead assignment notification when coach_id not an auth user
-- Prevent foreign key 23503 errors when coaches.id is not present in auth.users
-- by checking existence before enqueueing the notification event.

BEGIN;

CREATE OR REPLACE FUNCTION public.trg_lead_assignment_notify()
RETURNS TRIGGER AS $$
DECLARE
  v_unique text;
  v_is_user boolean;
BEGIN
  IF NEW.coach_id IS NOT NULL AND (OLD.coach_id IS DISTINCT FROM NEW.coach_id) THEN
    SELECT EXISTS(SELECT 1 FROM auth.users u WHERE u.id = NEW.coach_id) INTO v_is_user;
    IF v_is_user THEN
      v_unique := 'lead_assign_'|| NEW.id || '_' || NEW.coach_id; -- unique per coach assignment
      PERFORM public.enqueue_notification(
        'NEW_LEAD',
        NEW.coach_id,
        NULL,
        'lead',
        NEW.id,
        v_unique,
        jsonb_build_object(
          'lead_id', NEW.id,
          'client_name', NEW.client_name,
          'goals', NEW.goals,
          'status', NEW.status
        )
      );
    END IF; -- silently skip if no matching auth user
  END IF;
  RETURN NEW;
END;$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger to ensure it uses updated function (idempotent)
DROP TRIGGER IF EXISTS trg_lead_assignment_notify ON public.leads;
CREATE TRIGGER trg_lead_assignment_notify
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.trg_lead_assignment_notify();

COMMIT;

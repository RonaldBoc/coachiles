-- Fallback: record a payment row whenever subscriptions.last_payment_at changes
-- This complements the Stripe webhook and ensures a ledger entry even if webhook delivery lags.
BEGIN;

CREATE OR REPLACE FUNCTION public.record_payment_on_subscription_payment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.last_payment_at IS NOT NULL AND (OLD.last_payment_at IS DISTINCT FROM NEW.last_payment_at) THEN
      -- Avoid duplicates: check if a similar payment exists near this timestamp
      IF NOT EXISTS (
        SELECT 1 FROM public.payments
        WHERE coach_id = NEW.coach_id
          AND payment_type = 'subscription'
          AND status = 'completed'
          AND processed_at >= NEW.last_payment_at - interval '5 minutes'
          AND processed_at <= NEW.last_payment_at + interval '5 minutes'
      ) THEN
        INSERT INTO public.payments (
          coach_id, amount, currency, payment_method, transaction_id, status,
          payment_type, processed_at, description, platform_fee, payment_processor_fee, coach_earnings, metadata
        ) VALUES (
          NEW.coach_id,
          COALESCE(NEW.price, 0),
          'EUR',
          'stripe',
          NULL,
          'completed',
          'subscription',
          NEW.last_payment_at,
          'Auto from subscription update',
          0,
          0,
          COALESCE(NEW.price, 0),
          jsonb_build_object('source', 'subscription_trigger', 'subscription_id', NEW.id)
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_record_payment_on_subscription_payment ON public.subscriptions;
CREATE TRIGGER trg_record_payment_on_subscription_payment
AFTER UPDATE OF last_payment_at ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.record_payment_on_subscription_payment();

COMMIT;

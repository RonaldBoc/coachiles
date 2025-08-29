-- 38_subscription_invoices.sql
-- Creates subscription_invoices table to store individual Stripe (or manual) invoice/payment records
-- Assumes subscriptions table already has: id (uuid), coach_id (uuid), stripe_subscription_id, stripe_customer_id
-- If you also want to record refunds/failed invoices, insert those rows with appropriate status.

BEGIN;

-- 1. Table
CREATE TABLE IF NOT EXISTS public.subscription_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id text, -- id like in_xxxxx
  stripe_customer_id text,
  hosted_invoice_url text,
  pdf_url text,
  amount integer NOT NULL, -- stored in cents
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL CHECK (status IN ('paid','open','uncollectible','void','draft','pending','refunded','failed')),
  period_start timestamptz,
  period_end timestamptz,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (stripe_invoice_id),
  UNIQUE (coach_id, period_start, period_end)
);

COMMENT ON TABLE public.subscription_invoices IS 'Historical invoice/payment records per coach subscription.';

-- 2. Helpful index
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_coach_created ON public.subscription_invoices(coach_id, created_at DESC);

-- 3. RLS
ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;

-- Policies: coach can read own invoices; service role/admin can manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscription_invoices' AND policyname = 'select_own_invoices'
  ) THEN
    CREATE POLICY select_own_invoices ON public.subscription_invoices
      FOR SELECT USING ( auth.uid() = coach_id );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscription_invoices' AND policyname = 'admin_all_invoices'
  ) THEN
    -- Admin policy uses allowlist function is_superadmin(email) with email from JWT
    CREATE POLICY admin_all_invoices ON public.subscription_invoices
      FOR ALL USING ( public.is_superadmin( auth.jwt() ->> 'email' ) )
      WITH CHECK ( public.is_superadmin( auth.jwt() ->> 'email' ) );
  END IF;
END $$;

-- 4. Upsert function to insert/update an invoice (used by webhook)
CREATE OR REPLACE FUNCTION public.upsert_subscription_invoice(
  p_coach_id uuid,
  p_subscription_id uuid,
  p_stripe_invoice_id text,
  p_stripe_customer_id text,
  p_hosted_invoice_url text,
  p_pdf_url text,
  p_amount integer,
  p_currency text,
  p_status text,
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_description text,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.subscription_invoices (
    coach_id, subscription_id, stripe_invoice_id, stripe_customer_id, hosted_invoice_url, pdf_url,
    amount, currency, status, period_start, period_end, description, metadata
  ) VALUES (
    p_coach_id, p_subscription_id, p_stripe_invoice_id, p_stripe_customer_id, p_hosted_invoice_url, p_pdf_url,
    p_amount, COALESCE(p_currency,'eur'), p_status, p_period_start, p_period_end, p_description, p_metadata
  )
  ON CONFLICT (stripe_invoice_id) DO UPDATE SET
    coach_id = EXCLUDED.coach_id,
    subscription_id = EXCLUDED.subscription_id,
    hosted_invoice_url = EXCLUDED.hosted_invoice_url,
    pdf_url = EXCLUDED.pdf_url,
    amount = EXCLUDED.amount,
    currency = EXCLUDED.currency,
    status = EXCLUDED.status,
    period_start = EXCLUDED.period_start,
    period_end = EXCLUDED.period_end,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.upsert_subscription_invoice FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_subscription_invoice TO authenticated, service_role;

COMMIT;

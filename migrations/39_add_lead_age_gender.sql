-- 39_add_lead_age_gender.sql
-- Adds age (integer) and gender (text) columns to leads table.
-- Gender enumeration kept simple.

BEGIN;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS client_age INTEGER CHECK (client_age >= 0 AND client_age <= 120),
  ADD COLUMN IF NOT EXISTS client_gender TEXT CHECK (client_gender IN ('male','female','other','prefer_not_say'));

COMMENT ON COLUMN public.leads.client_age IS 'Client age provided at lead creation';
COMMENT ON COLUMN public.leads.client_gender IS 'Client gender: male|female|other|prefer_not_say';

COMMIT;

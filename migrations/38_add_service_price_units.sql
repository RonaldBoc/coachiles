-- 38_add_service_price_units.sql
-- Adds price unit columns for solo and group pricing to coach_services.
-- Allows coaches to specify whether a price is per hour or per session.

BEGIN;

ALTER TABLE coach_services
  ADD COLUMN IF NOT EXISTS solo_price_unit TEXT CHECK (solo_price_unit IN ('per_hour','per_session')) DEFAULT 'per_session',
  ADD COLUMN IF NOT EXISTS group_price_unit TEXT CHECK (group_price_unit IN ('per_hour','per_session')) DEFAULT 'per_session';

COMMENT ON COLUMN coach_services.solo_price_unit IS 'Unit for solo price: per_hour or per_session';
COMMENT ON COLUMN coach_services.group_price_unit IS 'Unit for group price: per_hour or per_session';

COMMIT;

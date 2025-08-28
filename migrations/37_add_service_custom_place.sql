-- 37_add_service_custom_place.sql
-- Adds custom_place column to coach_services to store structured data for 'Autre lieu spécifique'.
-- The column is JSONB to allow future extensibility (label, address, geo info, etc.).

BEGIN;

ALTER TABLE coach_services
  ADD COLUMN IF NOT EXISTS custom_place JSONB; -- Example: {"label": "Salle privée", "address": "12 rue Exemple, Paris"}

COMMENT ON COLUMN coach_services.custom_place IS 'Custom / specific place for the service when not covered by standard location booleans. JSON: {"label": string, "address": string}';

COMMIT;

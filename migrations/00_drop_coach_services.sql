-- Drop existing coach_services table and recreate with correct schema
-- Run this BEFORE running the updated 01_add_coach_services.sql

-- Drop existing table and related objects
DROP TABLE IF EXISTS coach_services CASCADE;

-- Drop the trigger function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Note: After running this, run the updated 01_add_coach_services.sql migration

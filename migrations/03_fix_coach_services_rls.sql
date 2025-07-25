-- Migration: Fix Coach Services RLS Policies
-- Description: Update RLS policies to work with coaches table relationship

-- Drop existing policies
DROP POLICY IF EXISTS "Coaches can view their own services" ON coach_services;
DROP POLICY IF EXISTS "Coaches can create their own services" ON coach_services;
DROP POLICY IF EXISTS "Coaches can update their own services" ON coach_services;
DROP POLICY IF EXISTS "Coaches can delete their own services" ON coach_services;

-- Create new policies that check coach ownership through coaches table

-- Coaches can view their own services (check via coaches table)
CREATE POLICY "Coaches can view their own services" ON coach_services
  FOR SELECT USING (
    coach_id IN (
      SELECT id FROM coaches WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Coaches can insert their own services (check via coaches table)
CREATE POLICY "Coaches can create their own services" ON coach_services
  FOR INSERT WITH CHECK (
    coach_id IN (
      SELECT id FROM coaches WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Coaches can update their own services (check via coaches table)
CREATE POLICY "Coaches can update their own services" ON coach_services
  FOR UPDATE USING (
    coach_id IN (
      SELECT id FROM coaches WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Coaches can delete their own services (check via coaches table)
CREATE POLICY "Coaches can delete their own services" ON coach_services
  FOR DELETE USING (
    coach_id IN (
      SELECT id FROM coaches WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Everyone can view active services (for public browsing) - keep this one
-- CREATE POLICY "Anyone can view active services" ON coach_services
--   FOR SELECT USING (
--     is_active = true
--   );

COMMENT ON TABLE coach_services IS 'Coach services with RLS policies updated to work with coaches table relationship';

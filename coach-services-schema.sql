-- Coach Services Database Schema
-- Table for storing coach services with comprehensive service management

CREATE TABLE IF NOT EXISTS coach_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Service Details
  title TEXT NOT NULL,
  description TEXT,
  
  -- Service Type & Pricing
  can_be_solo BOOLEAN DEFAULT true,
  can_be_group BOOLEAN DEFAULT false,
  solo_price DECIMAL(10,2),
  group_price DECIMAL(10,2),
  
  -- Category & Classification
  category TEXT NOT NULL,
  sub_category TEXT,
  
  -- Session Details
  duration INTEGER NOT NULL, -- in minutes
  
  -- Location Options
  can_be_at_home BOOLEAN DEFAULT true,
  can_be_online BOOLEAN DEFAULT false,
  can_be_in_public_spaces BOOLEAN DEFAULT true,
  
  -- Free Trial
  has_free_trial BOOLEAN DEFAULT false,
  free_trial_modalities TEXT,
  
  -- Cancellation
  cancellation_policy TEXT NOT NULL,
  
  -- Availability
  use_profile_availability BOOLEAN DEFAULT true,
  custom_availability JSONB, -- Store ServiceAvailability[] as JSON
  
  -- Meta
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coach_services_coach_id ON coach_services(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_services_category ON coach_services(category);
CREATE INDEX IF NOT EXISTS idx_coach_services_active ON coach_services(is_active);

-- Enable Row Level Security
ALTER TABLE coach_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Coaches can view their own services
CREATE POLICY "Coaches can view own services" ON coach_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM coaches 
      WHERE coaches.email = auth.jwt() ->> 'email' 
      AND coaches.id::text = coach_services.coach_id::text
    )
  );

-- Coaches can insert their own services
CREATE POLICY "Coaches can create own services" ON coach_services
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM coaches 
      WHERE coaches.email = auth.jwt() ->> 'email' 
      AND coaches.id::text = coach_services.coach_id::text
    )
  );

-- Coaches can update their own services
CREATE POLICY "Coaches can update own services" ON coach_services
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM coaches 
      WHERE coaches.email = auth.jwt() ->> 'email' 
      AND coaches.id::text = coach_services.coach_id::text
    )
  );

-- Coaches can delete their own services
CREATE POLICY "Coaches can delete own services" ON coach_services
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM coaches 
      WHERE coaches.email = auth.jwt() ->> 'email' 
      AND coaches.id::text = coach_services.coach_id::text
    )
  );

-- Public can view active services for public profiles
CREATE POLICY "Public can view active services" ON coach_services
  FOR SELECT USING (is_active = true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_coach_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row changes
DROP TRIGGER IF EXISTS update_coach_services_updated_at ON coach_services;
CREATE TRIGGER update_coach_services_updated_at
  BEFORE UPDATE ON coach_services
  FOR EACH ROW
  EXECUTE FUNCTION update_coach_services_updated_at();

-- Sample data (optional - remove in production)
-- This shows the expected data structure
/*
INSERT INTO coach_services (coach_id, title, description, category, duration, solo_price, cancellation_policy) 
VALUES 
  ('existing-coach-uuid', 'Coaching personnalisé', 'Accompagnement individuel adapté à vos objectifs', 'Fitness', 60, 50.00, 'Annulation gratuite jusqu''à 24h avant'),
  ('existing-coach-uuid', 'Préparation physique', 'Programme intensif pour améliorer vos performances', 'Préparation physique', 90, 75.00, 'Annulation gratuite jusqu''à 48h avant');
*/

-- Migration: Add Coach Services Table and Related Functions
-- Created: 2024
-- Description: Adds the coach_services table to support dynamic service management

-- Create coach_services table
CREATE TABLE IF NOT EXISTS coach_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  sub_category TEXT,
  
  -- Delivery Options
  can_be_solo BOOLEAN DEFAULT false,
  can_be_group BOOLEAN DEFAULT false,
  
  -- Pricing
  solo_price DECIMAL(10,2),
  group_price DECIMAL(10,2),
  
  -- Session Details
  duration INTEGER NOT NULL, -- in minutes
  
  -- Location & Format
  can_be_at_home BOOLEAN DEFAULT false,
  can_be_online BOOLEAN DEFAULT false,
  can_be_in_public_spaces BOOLEAN DEFAULT false,
  
  -- Trial Options
  has_free_trial BOOLEAN DEFAULT false,
  free_trial_modalities TEXT,
  
  -- Policies
  cancellation_policy TEXT DEFAULT 'flexible',
  
  -- Scheduling
  use_profile_availability BOOLEAN DEFAULT true,
  custom_availability JSONB,
  
  -- Status & Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_coach_services_coach_id ON coach_services(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_services_category ON coach_services(category);
CREATE INDEX IF NOT EXISTS idx_coach_services_active ON coach_services(is_active);
CREATE INDEX IF NOT EXISTS idx_coach_services_solo ON coach_services(can_be_solo);
CREATE INDEX IF NOT EXISTS idx_coach_services_group ON coach_services(can_be_group);

-- Enable Row Level Security
ALTER TABLE coach_services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Coaches can view all their own services
CREATE POLICY "Coaches can view their own services" ON coach_services
  FOR SELECT USING (
    auth.uid() = coach_id
  );

-- Coaches can insert their own services
CREATE POLICY "Coaches can create their own services" ON coach_services
  FOR INSERT WITH CHECK (
    auth.uid() = coach_id
  );

-- Coaches can update their own services
CREATE POLICY "Coaches can update their own services" ON coach_services
  FOR UPDATE USING (
    auth.uid() = coach_id
  );

-- Coaches can delete their own services
CREATE POLICY "Coaches can delete their own services" ON coach_services
  FOR DELETE USING (
    auth.uid() = coach_id
  );

-- Everyone can view active services (for public browsing)
CREATE POLICY "Anyone can view active services" ON coach_services
  FOR SELECT USING (
    is_active = true
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_coach_services_updated_at
  BEFORE UPDATE ON coach_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional)
-- Note: Replace with actual coach IDs from your system
-- INSERT INTO coach_services (coach_id, title, description, category, can_be_solo, can_be_group, solo_price, group_price, duration, can_be_at_home) VALUES
-- ('your-coach-id-here', 'Personal Football Training', 'Individual football coaching session', 'football', true, false, 50.00, null, 60, true);

COMMENT ON TABLE coach_services IS 'Stores coach-created services with pricing, scheduling, and delivery options';

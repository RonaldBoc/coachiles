-- Database migration for coach services and schema updates
-- Run this in your Supabase SQL Editor

-- First, add last_name column to coaches table if it doesn't exist
ALTER TABLE public.coaches 
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Create coach_services table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.coach_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Foreign key to coaches table
    coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
    
    -- Service details
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    
    -- Service options
    individual_available BOOLEAN DEFAULT true,
    group_available BOOLEAN DEFAULT false,
    individual_price DECIMAL(10,2),
    group_price DECIMAL(10,2),
    
    -- Session details
    duration_minutes INTEGER DEFAULT 60,
    max_group_size INTEGER DEFAULT 1,
    
    -- Status
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS on coach_services table
ALTER TABLE public.coach_services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active coach services" ON public.coach_services;
DROP POLICY IF EXISTS "Authenticated users can view all coach services" ON public.coach_services;
DROP POLICY IF EXISTS "Coaches can manage their own services" ON public.coach_services;

-- RLS Policy: Users can read all active services (for marketplace)
CREATE POLICY "Anyone can view active coach services" ON public.coach_services
    FOR SELECT USING (is_active = true);

-- RLS Policy: Authenticated users can view all services (for coach management)
CREATE POLICY "Authenticated users can view all coach services" ON public.coach_services
    FOR SELECT TO authenticated USING (true);

-- RLS Policy: Coaches can manage their own services
CREATE POLICY "Coaches can manage their own services" ON public.coach_services
    FOR ALL TO authenticated USING (
        coach_id IN (
            SELECT id FROM public.coaches WHERE email = auth.email()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coach_services_coach_id ON public.coach_services(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_services_category ON public.coach_services(category);
CREATE INDEX IF NOT EXISTS idx_coach_services_active ON public.coach_services(is_active);

-- Update coaches table RLS policies
DROP POLICY IF EXISTS "Anyone can view active coaches" ON public.coaches;
DROP POLICY IF EXISTS "Authenticated users can view all coaches" ON public.coaches;
DROP POLICY IF EXISTS "Coaches can update their own profile" ON public.coaches;
DROP POLICY IF EXISTS "Authenticated users can create coach profiles" ON public.coaches;

-- Enable RLS on coaches table
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view active coaches (for public profiles)
CREATE POLICY "Anyone can view active coaches" ON public.coaches
    FOR SELECT USING (is_active = true);

-- RLS Policy: Authenticated users can view all coaches
CREATE POLICY "Authenticated users can view all coaches" ON public.coaches
    FOR SELECT TO authenticated USING (true);

-- RLS Policy: Coaches can update their own profile
CREATE POLICY "Coaches can update their own profile" ON public.coaches
    FOR ALL TO authenticated USING (email = auth.email());

-- RLS Policy: Authenticated users can create coach profiles
CREATE POLICY "Authenticated users can create coach profiles" ON public.coaches
    FOR INSERT TO authenticated WITH CHECK (email = auth.email());

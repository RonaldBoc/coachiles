-- Enhanced Availability Schema for Calendar Integration
-- Run this in Supabase SQL Editor

-- Create availability_templates table for recurring schedules
CREATE TABLE IF NOT EXISTS public.availability_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create availability_exceptions table for one-time changes
CREATE TABLE IF NOT EXISTS public.availability_exceptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT true, -- false = blocked/unavailable, true = extra availability
    reason TEXT, -- "vacation", "sick", "extra session", etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create booking_slots table for actual bookings
CREATE TABLE IF NOT EXISTS public.booking_slots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE,
    client_email TEXT NOT NULL,
    client_name TEXT NOT NULL,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    service_type TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_availability_templates_coach_day ON public.availability_templates(coach_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_coach_date ON public.availability_exceptions(coach_id, date);
CREATE INDEX IF NOT EXISTS idx_booking_slots_coach_datetime ON public.booking_slots(coach_id, start_datetime);

-- RLS Policies
ALTER TABLE public.availability_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;

-- Availability templates policies
CREATE POLICY "Coaches can manage own availability templates" ON public.availability_templates
    FOR ALL USING (coach_id IN (SELECT id FROM public.coaches WHERE email = auth.jwt() ->> 'email'));

-- Availability exceptions policies  
CREATE POLICY "Coaches can manage own availability exceptions" ON public.availability_exceptions
    FOR ALL USING (coach_id IN (SELECT id FROM public.coaches WHERE email = auth.jwt() ->> 'email'));

-- Booking slots policies
CREATE POLICY "Coaches can view own bookings" ON public.booking_slots
    FOR SELECT USING (coach_id IN (SELECT id FROM public.coaches WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Anyone can create bookings" ON public.booking_slots
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Coaches can update own bookings" ON public.booking_slots
    FOR UPDATE USING (coach_id IN (SELECT id FROM public.coaches WHERE email = auth.jwt() ->> 'email'));

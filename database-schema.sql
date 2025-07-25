-- Coachiles Database Schema for Supabase
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create coaches table
CREATE TABLE IF NOT EXISTS public.coaches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Basic Info
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    
    -- Professional Info
    specialties TEXT[] DEFAULT '{}',
    certifications TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    availability TEXT[] DEFAULT '{}',
    locations TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Subscription Info
    subscription_type TEXT DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Performance Metrics
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_sessions INTEGER DEFAULT 0,
    response_time_hours DECIMAL(5,2) DEFAULT 0
);

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Client Info
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    
    -- Request Details
    preferred_coaching TEXT[] NOT NULL,
    goals TEXT NOT NULL,
    experience TEXT NOT NULL,
    availability TEXT NOT NULL,
    budget TEXT NOT NULL,
    location TEXT NOT NULL,
    additional_info TEXT,
    
    -- Lead Management
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'contacted', 'converted', 'declined', 'expired')),
    coach_id UUID REFERENCES public.coaches(id),
    coach_note TEXT,
    contacted_at TIMESTAMP WITH TIME ZONE,
    converted_at TIMESTAMP WITH TIME ZONE
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Subscription Details
    coach_id UUID REFERENCES public.coaches(id) NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'basic', 'premium', 'enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')),
    
    -- Billing Info
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features TEXT[] DEFAULT '{}',
    
    -- Status Flags
    is_active BOOLEAN DEFAULT true,
    auto_renew BOOLEAN DEFAULT true,
    
    -- Payment Info
    payment_method TEXT,
    last_payment_at TIMESTAMP WITH TIME ZONE,
    next_payment_at TIMESTAMP WITH TIME ZONE
);

-- Create storage bucket for coach avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('coach-avatars', 'coach-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coaches_email ON public.coaches(email);
CREATE INDEX IF NOT EXISTS idx_coaches_first_name ON public.coaches(first_name);
CREATE INDEX IF NOT EXISTS idx_coaches_specialties ON public.coaches USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_coaches_locations ON public.coaches USING GIN(locations);
CREATE INDEX IF NOT EXISTS idx_coaches_is_active ON public.coaches(is_active);

CREATE INDEX IF NOT EXISTS idx_leads_coach_id ON public.leads(coach_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_preferred_coaching ON public.leads USING GIN(preferred_coaching);

CREATE INDEX IF NOT EXISTS idx_subscriptions_coach_id ON public.subscriptions(coach_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active ON public.subscriptions(is_active);

-- Enable Row Level Security
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coaches table
CREATE POLICY "Coaches can view all active coaches" ON public.coaches
    FOR SELECT USING (is_active = true);

CREATE POLICY "Coaches can update own profile" ON public.coaches
    FOR UPDATE USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Coaches can insert own profile" ON public.coaches
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = email);

-- RLS Policies for leads table
CREATE POLICY "Anyone can create leads" ON public.leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Coaches can view assigned leads" ON public.leads
    FOR SELECT USING (coach_id::text = auth.uid()::text);

CREATE POLICY "Coaches can update assigned leads" ON public.leads
    FOR UPDATE USING (coach_id::text = auth.uid()::text);

-- RLS Policies for subscriptions table
CREATE POLICY "Coaches can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (coach_id::text = auth.uid()::text);

CREATE POLICY "Coaches can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (coach_id::text = auth.uid()::text);

CREATE POLICY "Coaches can insert own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (coach_id::text = auth.uid()::text);

-- Storage policies for coach avatars
CREATE POLICY "Coaches can upload own avatars" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'coach-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Coaches can update own avatars" ON storage.objects
    FOR UPDATE USING (bucket_id = 'coach-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'coach-avatars');

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER handle_coaches_updated_at
    BEFORE UPDATE ON public.coaches
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data (optional - for testing)
INSERT INTO public.coaches (
    id,
    email,
    first_name,
    phone,
    bio,
    specialties,
    certifications,
    experience_years,
    hourly_rate,
    availability,
    locations,
    languages,
    rating,
    total_sessions,
    response_time_hours
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    'marie@example.com',
    'Marie',
    '+33 6 12 34 56 78',
    'Coach professionnelle spécialisée en développement de carrière et leadership. J''aide mes clients à atteindre leurs objectifs professionnels.',
    ARRAY['Développement de carrière', 'Leadership', 'Gestion du stress'],
    ARRAY['ICF Certified', 'Leadership Certificate'],
    8,
    85.00,
    ARRAY['Lundi 9h-17h', 'Mardi 9h-17h', 'Mercredi 9h-12h'],
    ARRAY['Paris', 'En ligne'],
    ARRAY['Français', 'Anglais'],
    4.8,
    156,
    2.5
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'jean@example.com',
    'Jean',
    '+33 6 98 76 54 32',
    'Expert en coaching sportif et préparation mentale. Accompagnement personnalisé pour atteindre vos objectifs sportifs.',
    ARRAY['Coaching sportif', 'Préparation mentale', 'Nutrition'],
    ARRAY['Diplôme STAPS', 'Certification nutrition sportive'],
    12,
    75.00,
    ARRAY['Lundi 6h-20h', 'Mardi 6h-20h', 'Samedi 8h-16h'],
    ARRAY['Lyon', 'En ligne'],
    ARRAY['Français'],
    4.9,
    243,
    1.8
);

-- Insert sample subscription
INSERT INTO public.subscriptions (
    coach_id,
    plan_type,
    status,
    current_period_start,
    current_period_end,
    price,
    features,
    is_active,
    auto_renew
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'premium',
    'active',
    '2024-01-01T00:00:00Z',
    '2024-12-31T23:59:59Z',
    299.00,
    ARRAY['Profil premium', 'Leads illimités', 'Support prioritaire'],
    true,
    true
);

-- Show completion message
SELECT 'Database schema created successfully!' as status;

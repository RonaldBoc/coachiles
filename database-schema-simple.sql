-- Coachiles Database Schema for Supabase (Simplified)
-- Run this script in your Supabase SQL Editor
-- This version works without authentication setup

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
    
    -- Requirements
    preferred_coaching TEXT[] DEFAULT '{}',
    goals TEXT NOT NULL,
    experience TEXT NOT NULL,
    availability TEXT NOT NULL,
    budget TEXT NOT NULL,
    location TEXT NOT NULL,
    additional_info TEXT,
    
    -- Lead Management
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'contacted', 'converted', 'closed')),
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
    plan_type TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    
    -- Billing
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features TEXT[] DEFAULT '{}',
    
    -- Settings
    is_active BOOLEAN DEFAULT true,
    auto_renew BOOLEAN DEFAULT true,
    payment_method TEXT,
    last_payment_at TIMESTAMP WITH TIME ZONE,
    next_payment_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coaches_first_name ON public.coaches(first_name);
CREATE INDEX IF NOT EXISTS idx_coaches_specialties ON public.coaches USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_coaches_locations ON public.coaches USING GIN(locations);
CREATE INDEX IF NOT EXISTS idx_coaches_active ON public.coaches(is_active);

CREATE INDEX IF NOT EXISTS idx_leads_coach_id ON public.leads(coach_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);

CREATE INDEX IF NOT EXISTS idx_subscriptions_coach_id ON public.subscriptions(coach_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON public.subscriptions(is_active);

-- Insert sample data
INSERT INTO public.coaches (
    email, first_name, phone, bio, specialties, certifications, 
    experience_years, hourly_rate, availability, locations, languages,
    rating, total_sessions, response_time_hours
) VALUES 
    (
        'marie.coach@example.com', 'Marie', '+33 6 12 34 56 78',
        'Coach certifiée en développement personnel avec 8 ans d''expérience. Spécialisée dans l''accompagnement des professionnels en transition de carrière.',
        ARRAY['Développement personnel', 'Transition de carrière', 'Confiance en soi'],
        ARRAY['ICF Certified Coach', 'Certification en PNL'],
        8, 75.00,
        ARRAY['Lundi matin', 'Mercredi après-midi', 'Vendredi matin'],
        ARRAY['Paris', 'En ligne'],
        ARRAY['Français', 'Anglais'],
        4.8, 156, 2.5
    ),
    (
        'pierre.wellness@example.com', 'Pierre', '+33 6 98 76 54 32',
        'Coach en bien-être et gestion du stress. J''accompagne les entrepreneurs et les cadres vers un meilleur équilibre vie pro/perso.',
        ARRAY['Bien-être', 'Gestion du stress', 'Équilibre vie pro/perso'],
        ARRAY['Certification en méditation', 'Formation en sophrologie'],
        5, 65.00,
        ARRAY['Mardi soir', 'Jeudi matin', 'Samedi matin'],
        ARRAY['Lyon', 'En ligne'],
        ARRAY['Français'],
        4.6, 89, 3.2
    ),
    (
        'sophie.business@example.com', 'Sophie', '+33 6 45 67 89 12',
        'Consultante en stratégie d''entreprise et coach pour dirigeants. 12 ans d''expérience dans l''accompagnement des leaders.',
        ARRAY['Leadership', 'Stratégie d''entreprise', 'Management'],
        ARRAY['MBA', 'Certification en coaching exécutif'],
        12, 120.00,
        ARRAY['Lundi après-midi', 'Mercredi matin', 'Jeudi après-midi'],
        ARRAY['Paris', 'Marseille'],
        ARRAY['Français', 'Anglais', 'Espagnol'],
        4.9, 234, 1.8
    );

-- Insert sample leads
INSERT INTO public.leads (
    client_name, client_email, client_phone, preferred_coaching,
    goals, experience, availability, budget, location, additional_info,
    status
) VALUES 
    (
        'Jean Dupont', 'jean.dupont@email.com', '+33 6 11 22 33 44',
        ARRAY['Développement personnel', 'Confiance en soi'],
        'Améliorer ma confiance en moi pour prendre des responsabilités managériales',
        'Aucune expérience en coaching',
        'Weekends et soirées en semaine',
        '50-75€/heure',
        'Paris',
        'Disponible pour commencer rapidement',
        'new'
    ),
    (
        'Claire Martin', 'claire.martin@email.com', '+33 6 55 66 77 88',
        ARRAY['Bien-être', 'Équilibre vie pro/perso'],
        'Retrouver un équilibre entre ma vie professionnelle intense et ma vie personnelle',
        'J''ai déjà fait quelques séances de coaching il y a 2 ans',
        'Mardi et jeudi matin',
        '60-80€/heure',
        'Lyon',
        'Préférence pour le coaching en ligne',
        'new'
    );

-- Insert sample subscription
INSERT INTO public.subscriptions (
    coach_id, plan_type, current_period_start, current_period_end,
    price, features
) VALUES 
    (
        (SELECT id FROM public.coaches WHERE email = 'marie.coach@example.com'),
        'premium',
        '2024-01-01T00:00:00Z',
        '2024-12-31T23:59:59Z',
        99.00,
        ARRAY['Leads illimités', 'Profil mis en avant', 'Analytics avancées']
    );

-- Create storage bucket for coach avatars (this will create the bucket if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'coach-avatars',
    'coach-avatars',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Set up storage policies (allow public read, authenticated upload)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'coach-avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'coach-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatars" ON storage.objects
    FOR UPDATE USING (bucket_id = 'coach-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own avatars" ON storage.objects
    FOR DELETE USING (bucket_id = 'coach-avatars' AND auth.role() = 'authenticated');

-- Success message
SELECT 'Database schema created successfully! You can now connect your app.' AS result;

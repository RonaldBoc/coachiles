-- Coachiles Full Marketplace Database Schema for Supabase (Fixed Version)
-- Run this script in your Supabase SQL Editor
-- This version handles existing tables and adds missing columns

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, let's check and fix the existing coaches table
DO $$
BEGIN
    -- Add missing columns to coaches table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coaches' AND column_name = 'total_earnings') THEN
        ALTER TABLE public.coaches ADD COLUMN total_earnings DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coaches' AND column_name = 'total_reviews') THEN
        ALTER TABLE public.coaches ADD COLUMN total_reviews INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coaches' AND column_name = 'total_sessions') THEN
        ALTER TABLE public.coaches ADD COLUMN total_sessions INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coaches' AND column_name = 'response_time_hours') THEN
        ALTER TABLE public.coaches ADD COLUMN response_time_hours DECIMAL(5,2) DEFAULT 0;
    END IF;
END $$;

-- Create services table for coach offerings
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Service Details
    coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    
    -- Pricing & Logistics
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    location_type TEXT CHECK (location_type IN ('online', 'in-person', 'both')) DEFAULT 'both',
    group_size TEXT CHECK (group_size IN ('individual', 'small_group', 'large_group')) DEFAULT 'individual',
    max_participants INTEGER DEFAULT 1,
    
    -- Availability
    is_active BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    advance_booking_hours INTEGER DEFAULT 24,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    target_audience TEXT[] DEFAULT '{}',
    prerequisites TEXT,
    materials_included TEXT,
    cancellation_policy TEXT
);

-- Create bookings table for appointments
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Booking Details
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
    coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    
    -- Schedule
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    timezone TEXT DEFAULT 'Europe/Paris',
    
    -- Status & Management
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    
    -- Details
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    notes TEXT,
    internal_notes TEXT,
    
    -- Confirmation & Communication
    confirmed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Meeting Details (for online sessions)
    meeting_url TEXT,
    meeting_id TEXT,
    meeting_password TEXT
);

-- Create reviews table for coach ratings
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Review Details
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    
    -- Client Info
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    
    -- Category Ratings (optional detailed feedback)
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    expertise_rating INTEGER CHECK (expertise_rating >= 1 AND expertise_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    
    -- Status & Moderation
    is_verified BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    is_anonymous BOOLEAN DEFAULT false,
    moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    moderation_notes TEXT,
    
    -- Response from Coach
    coach_response TEXT,
    coach_responded_at TIMESTAMP WITH TIME ZONE
);

-- Create payments table for transaction tracking
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Payment Details
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
    
    -- Transaction Info
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    payment_method TEXT,
    transaction_id TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    payment_type TEXT DEFAULT 'booking' CHECK (payment_type IN ('booking', 'subscription', 'commission', 'refund', 'payout')),
    
    -- Fees & Commissions
    platform_fee DECIMAL(10,2) DEFAULT 0,
    payment_processor_fee DECIMAL(10,2) DEFAULT 0,
    coach_earnings DECIMAL(10,2) NOT NULL,
    
    -- External References
    stripe_payment_intent_id TEXT,
    stripe_charge_id TEXT,
    paypal_transaction_id TEXT,
    
    -- Timing
    processed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    description TEXT,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Payout tracking
    payout_id TEXT,
    payout_status TEXT CHECK (payout_status IN ('pending', 'paid', 'failed')),
    payout_date TIMESTAMP WITH TIME ZONE
);

-- Fix the leads table - add missing columns if they don't exist
DO $$
BEGIN
    -- Check if leads table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leads') THEN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'source') THEN
            ALTER TABLE public.leads ADD COLUMN source TEXT DEFAULT 'web' CHECK (source IN ('web', 'mobile', 'referral', 'social', 'ads'));
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'priority') THEN
            ALTER TABLE public.leads ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'converted_booking_id') THEN
            ALTER TABLE public.leads ADD COLUMN converted_booking_id UUID REFERENCES public.bookings(id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'estimated_value') THEN
            ALTER TABLE public.leads ADD COLUMN estimated_value DECIMAL(10,2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'actual_value') THEN
            ALTER TABLE public.leads ADD COLUMN actual_value DECIMAL(10,2);
        END IF;
    ELSE
        -- Create the complete leads table
        CREATE TABLE public.leads (
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
            status TEXT DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'contacted', 'converted', 'closed', 'expired')),
            coach_id UUID REFERENCES public.coaches(id),
            coach_note TEXT,
            contacted_at TIMESTAMP WITH TIME ZONE,
            converted_at TIMESTAMP WITH TIME ZONE,
            
            -- Lead Source & Priority
            source TEXT DEFAULT 'web' CHECK (source IN ('web', 'mobile', 'referral', 'social', 'ads')),
            priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
            
            -- Conversion Tracking
            converted_booking_id UUID REFERENCES public.bookings(id),
            estimated_value DECIMAL(10,2),
            actual_value DECIMAL(10,2)
        );
    END IF;
END $$;

-- Create comprehensive indexes for performance (with IF NOT EXISTS to avoid errors)
CREATE INDEX IF NOT EXISTS idx_coaches_email ON public.coaches(email);
CREATE INDEX IF NOT EXISTS idx_coaches_first_name ON public.coaches(first_name);
CREATE INDEX IF NOT EXISTS idx_coaches_specialties ON public.coaches USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_coaches_locations ON public.coaches USING GIN(locations);
CREATE INDEX IF NOT EXISTS idx_coaches_is_active ON public.coaches(is_active);
CREATE INDEX IF NOT EXISTS idx_coaches_rating ON public.coaches(rating DESC);
CREATE INDEX IF NOT EXISTS idx_coaches_subscription_type ON public.coaches(subscription_type);

CREATE INDEX IF NOT EXISTS idx_services_coach_id ON public.services(coach_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_price ON public.services(price);
CREATE INDEX IF NOT EXISTS idx_services_tags ON public.services USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_bookings_coach_id ON public.bookings(coach_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON public.bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON public.bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_client_email ON public.bookings(client_email);

CREATE INDEX IF NOT EXISTS idx_reviews_coach_id ON public.reviews(coach_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON public.reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_is_published ON public.reviews(is_published);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_coach_id ON public.payments(coach_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON public.payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);

CREATE INDEX IF NOT EXISTS idx_leads_coach_id ON public.leads(coach_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_preferred_coaching ON public.leads USING GIN(preferred_coaching);

-- Only create source index if column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'source') THEN
        CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Public can view active coaches" ON public.coaches;
DROP POLICY IF EXISTS "Coaches can update own profile" ON public.coaches;
DROP POLICY IF EXISTS "Coaches can insert own profile" ON public.coaches;

-- RLS Policies for coaches table
CREATE POLICY "Public can view active coaches" ON public.coaches
    FOR SELECT USING (is_active = true);

CREATE POLICY "Coaches can update own profile" ON public.coaches
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Coaches can insert own profile" ON public.coaches
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies for services table
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
DROP POLICY IF EXISTS "Coaches can manage own services" ON public.services;

CREATE POLICY "Public can view active services" ON public.services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Coaches can manage own services" ON public.services
    FOR ALL USING (auth.uid()::text = coach_id::text);

-- RLS Policies for bookings table
DROP POLICY IF EXISTS "Coaches can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Coaches can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

CREATE POLICY "Coaches can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid()::text = coach_id::text);

CREATE POLICY "Coaches can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid()::text = coach_id::text);

CREATE POLICY "Anyone can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

-- RLS Policies for reviews table
DROP POLICY IF EXISTS "Public can view published reviews" ON public.reviews;
DROP POLICY IF EXISTS "Coaches can view own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Coaches can respond to own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Clients can create reviews for completed bookings" ON public.reviews;

CREATE POLICY "Public can view published reviews" ON public.reviews
    FOR SELECT USING (is_published = true);

CREATE POLICY "Coaches can view own reviews" ON public.reviews
    FOR SELECT USING (auth.uid()::text = coach_id::text);

CREATE POLICY "Coaches can respond to own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid()::text = coach_id::text);

CREATE POLICY "Clients can create reviews for completed bookings" ON public.reviews
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE id = booking_id 
            AND status = 'completed'
        )
    );

-- RLS Policies for payments table
DROP POLICY IF EXISTS "Coaches can view own payments" ON public.payments;
DROP POLICY IF EXISTS "System can manage payments" ON public.payments;

CREATE POLICY "Coaches can view own payments" ON public.payments
    FOR SELECT USING (auth.uid()::text = coach_id::text);

CREATE POLICY "System can manage payments" ON public.payments
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for leads table
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
DROP POLICY IF EXISTS "Coaches can view assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Coaches can update assigned leads" ON public.leads;

CREATE POLICY "Anyone can create leads" ON public.leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Coaches can view assigned leads" ON public.leads
    FOR SELECT USING (auth.uid()::text = coach_id::text);

CREATE POLICY "Coaches can update assigned leads" ON public.leads
    FOR UPDATE USING (auth.uid()::text = coach_id::text);

-- Create helpful database functions for complex queries

-- Function to calculate coach rating from reviews
CREATE OR REPLACE FUNCTION calculate_coach_rating(coach_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    avg_rating DECIMAL(3,2);
BEGIN
    SELECT ROUND(AVG(rating)::numeric, 2) INTO avg_rating
    FROM public.reviews
    WHERE coach_id = coach_uuid AND is_published = true;
    
    RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update coach statistics
CREATE OR REPLACE FUNCTION update_coach_stats(coach_uuid UUID)
RETURNS void AS $$
DECLARE
    new_rating DECIMAL(3,2);
    review_count INTEGER;
    session_count INTEGER;
    total_earnings DECIMAL(10,2);
BEGIN
    -- Calculate average rating
    SELECT calculate_coach_rating(coach_uuid) INTO new_rating;
    
    -- Count reviews
    SELECT COUNT(*) INTO review_count
    FROM public.reviews
    WHERE coach_id = coach_uuid AND is_published = true;
    
    -- Count completed sessions
    SELECT COUNT(*) INTO session_count
    FROM public.bookings
    WHERE coach_id = coach_uuid AND status = 'completed';
    
    -- Calculate total earnings
    SELECT COALESCE(SUM(coach_earnings), 0) INTO total_earnings
    FROM public.payments
    WHERE coach_id = coach_uuid AND status = 'completed';
    
    -- Update coach record
    UPDATE public.coaches
    SET 
        rating = new_rating,
        total_reviews = review_count,
        total_sessions = session_count,
        total_earnings = total_earnings,
        updated_at = timezone('utc'::text, now())
    WHERE id = coach_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates (with IF NOT EXISTS equivalent)
DROP TRIGGER IF EXISTS handle_coaches_updated_at ON public.coaches;
CREATE TRIGGER handle_coaches_updated_at
    BEFORE UPDATE ON public.coaches
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_services_updated_at ON public.services;
CREATE TRIGGER handle_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_bookings_updated_at ON public.bookings;
CREATE TRIGGER handle_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_reviews_updated_at ON public.reviews;
CREATE TRIGGER handle_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_payments_updated_at ON public.payments;
CREATE TRIGGER handle_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_leads_updated_at ON public.leads;
CREATE TRIGGER handle_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data for testing
DO $$
BEGIN
    -- Only insert sample data if tables are empty
    IF NOT EXISTS (SELECT 1 FROM public.services LIMIT 1) THEN
        -- Sample services
        INSERT INTO public.services (
            coach_id, name, description, category, subcategory, price, duration_minutes,
            location_type, group_size, is_active, tags, target_audience
        ) 
        SELECT 
            c.id,
            'Coaching de développement personnel',
            'Accompagnement personnalisé pour développer votre potentiel',
            'Développement personnel',
            'Coaching individuel',
            75.00, 60,
            'both', 'individual', true,
            ARRAY['développement', 'personnel', 'coaching'],
            ARRAY['Professionnels', 'Étudiants']
        FROM public.coaches c 
        WHERE c.email LIKE '%@%' 
        LIMIT 1;
    END IF;
    
    -- Sample reviews (only if no reviews exist)
    IF NOT EXISTS (SELECT 1 FROM public.reviews LIMIT 1) THEN
        INSERT INTO public.reviews (
            coach_id, client_name, client_email, rating, title, comment,
            communication_rating, professionalism_rating, expertise_rating, value_rating,
            is_verified, is_published
        )
        SELECT 
            c.id,
            'Client Test',
            'client.test@example.com',
            5,
            'Excellent coaching',
            'Très satisfait de l''accompagnement reçu.',
            5, 5, 5, 5,
            true, true
        FROM public.coaches c 
        WHERE c.email LIKE '%@%' 
        LIMIT 1;
    END IF;
END $$;

-- Success message
SELECT 'Fixed marketplace database schema applied successfully! 🎉' as result,
       'Tables: coaches (updated), services, bookings, reviews, payments, leads (fixed)' as tables_status,
       'All RLS policies and functions are now properly configured' as security_status;

-- Coachiles Full Marketplace Database Schema for Supabase
-- Run this script in your Supabase SQL Editor
-- This is an expanded version that includes the full marketplace functionality

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create coaches table (enhanced)
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
    is_verified BOOLEAN DEFAULT false,
    
    -- Subscription Info
    subscription_type TEXT DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Performance Metrics
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_sessions INTEGER DEFAULT 0,
    response_time_hours DECIMAL(5,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0
);

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
    payment_method TEXT, -- 'stripe', 'paypal', 'bank_transfer', etc.
    transaction_id TEXT, -- External payment processor ID
    
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

-- Create leads table (enhanced from existing)
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

-- Create subscriptions table (enhanced)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Subscription Details
    coach_id UUID REFERENCES public.coaches(id) NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'basic', 'premium', 'enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'pending', 'trialing')),
    
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
    next_payment_at TIMESTAMP WITH TIME ZONE,
    
    -- Limits & Usage
    monthly_lead_limit INTEGER DEFAULT 5,
    leads_used_this_month INTEGER DEFAULT 0,
    monthly_booking_limit INTEGER DEFAULT -1, -- -1 = unlimited
    bookings_this_month INTEGER DEFAULT 0,
    
    -- External Payment References
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    
    -- Trial & Discounts
    trial_end TIMESTAMP WITH TIME ZONE,
    discount_code TEXT,
    discount_percentage DECIMAL(5,2) DEFAULT 0
);

-- Create comprehensive indexes for performance
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
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);

CREATE INDEX IF NOT EXISTS idx_subscriptions_coach_id ON public.subscriptions(coach_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active ON public.subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON public.subscriptions(current_period_end);

-- Enable Row Level Security (RLS)
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coaches table
CREATE POLICY "Public can view active coaches" ON public.coaches
    FOR SELECT USING (is_active = true);

CREATE POLICY "Coaches can update own profile" ON public.coaches
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Coaches can insert own profile" ON public.coaches
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies for services table
CREATE POLICY "Public can view active services" ON public.services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Coaches can manage own services" ON public.services
    FOR ALL USING (auth.uid()::text = coach_id::text);

-- RLS Policies for bookings table
CREATE POLICY "Coaches can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid()::text = coach_id::text);

CREATE POLICY "Coaches can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid()::text = coach_id::text);

CREATE POLICY "Anyone can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

-- RLS Policies for reviews table
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
CREATE POLICY "Coaches can view own payments" ON public.payments
    FOR SELECT USING (auth.uid()::text = coach_id::text);

CREATE POLICY "System can manage payments" ON public.payments
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for leads table
CREATE POLICY "Anyone can create leads" ON public.leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Coaches can view assigned leads" ON public.leads
    FOR SELECT USING (auth.uid()::text = coach_id::text);

CREATE POLICY "Coaches can update assigned leads" ON public.leads
    FOR UPDATE USING (auth.uid()::text = coach_id::text);

-- RLS Policies for subscriptions table
CREATE POLICY "Coaches can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid()::text = coach_id::text);

CREATE POLICY "Coaches can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid()::text = coach_id::text);

CREATE POLICY "Coaches can insert own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid()::text = coach_id::text);

-- Create storage bucket for coach avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'coach-avatars',
    'coach-avatars',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for coach avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'coach-avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'coach-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatars" ON storage.objects
    FOR UPDATE USING (bucket_id = 'coach-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own avatars" ON storage.objects
    FOR DELETE USING (bucket_id = 'coach-avatars' AND auth.role() = 'authenticated');

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

-- Function to get available time slots for a coach
CREATE OR REPLACE FUNCTION get_coach_availability(
    coach_uuid UUID,
    start_date DATE,
    end_date DATE
)
RETURNS TABLE(
    available_date DATE,
    available_slots TEXT[]
) AS $$
BEGIN
    -- This is a simplified version - in practice, you'd implement
    -- more complex availability logic based on coach schedule
    RETURN QUERY
    SELECT 
        d.date_value as available_date,
        ARRAY['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] as available_slots
    FROM generate_series(start_date, end_date, '1 day'::interval) AS d(date_value)
    WHERE EXTRACT(DOW FROM d.date_value) BETWEEN 1 AND 5; -- Monday to Friday
END;
$$ LANGUAGE plpgsql;

-- Function to search coaches with advanced filtering
CREATE OR REPLACE FUNCTION search_coaches(
    search_term TEXT DEFAULT NULL,
    specialty_filter TEXT[] DEFAULT NULL,
    location_filter TEXT[] DEFAULT NULL,
    min_rating DECIMAL DEFAULT 0,
    max_price DECIMAL DEFAULT NULL,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
    coach_id UUID,
    first_name TEXT,
    bio TEXT,
    rating DECIMAL,
    hourly_rate DECIMAL,
    specialties TEXT[],
    locations TEXT[],
    total_reviews INTEGER,
    relevance_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.first_name,
        c.bio,
        c.rating,
        c.hourly_rate,
        c.specialties,
        c.locations,
        c.total_reviews,
        -- Simple relevance scoring
        CASE 
            WHEN search_term IS NULL THEN 1
            WHEN c.first_name ILIKE '%' || search_term || '%' THEN 3
            WHEN c.bio ILIKE '%' || search_term || '%' THEN 2
            ELSE 1
        END as relevance_score
    FROM public.coaches c
    WHERE 
        c.is_active = true
        AND (search_term IS NULL OR 
             c.first_name ILIKE '%' || search_term || '%' OR 
             c.bio ILIKE '%' || search_term || '%')
        AND (specialty_filter IS NULL OR c.specialties && specialty_filter)
        AND (location_filter IS NULL OR c.locations && location_filter)
        AND c.rating >= min_rating
        AND (max_price IS NULL OR c.hourly_rate <= max_price)
    ORDER BY relevance_score DESC, c.rating DESC, c.total_reviews DESC
    LIMIT limit_count;
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

-- Create triggers for automatic timestamp updates
CREATE TRIGGER handle_coaches_updated_at
    BEFORE UPDATE ON public.coaches
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to update coach stats when review is added/updated
CREATE OR REPLACE FUNCTION trigger_update_coach_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats for the coach
    PERFORM update_coach_stats(COALESCE(NEW.coach_id, OLD.coach_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coach_stats_on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION trigger_update_coach_stats();

-- Create trigger to update coach stats when booking is completed
CREATE OR REPLACE FUNCTION trigger_update_coach_stats_on_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update when status changes to completed
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        PERFORM update_coach_stats(NEW.coach_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coach_stats_on_booking_completion
    AFTER UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION trigger_update_coach_stats_on_booking();

-- Insert sample data for testing

-- Enhanced sample coaches
INSERT INTO public.coaches (
    email, first_name, phone, bio, specialties, certifications, 
    experience_years, hourly_rate, availability, locations, languages,
    rating, total_sessions, response_time_hours, is_verified
) VALUES 
    (
        'marie.coach@example.com', 'Marie', '+33 6 12 34 56 78',
        'Coach certifiée en développement personnel avec 8 ans d''expérience. Spécialisée dans l''accompagnement des professionnels en transition de carrière et le leadership.',
        ARRAY['Développement personnel', 'Transition de carrière', 'Confiance en soi', 'Leadership'],
        ARRAY['ICF Certified Coach', 'Certification en PNL', 'Master en Psychologie'],
        8, 75.00,
        ARRAY['Lundi matin', 'Mercredi après-midi', 'Vendredi matin'],
        ARRAY['Paris', 'En ligne'],
        ARRAY['Français', 'Anglais'],
        4.8, 156, 2.5, true
    ),
    (
        'pierre.wellness@example.com', 'Pierre', '+33 6 98 76 54 32',
        'Coach en bien-être et gestion du stress. J''accompagne les entrepreneurs et les cadres vers un meilleur équilibre vie pro/perso avec des techniques de mindfulness.',
        ARRAY['Bien-être', 'Gestion du stress', 'Équilibre vie pro/perso', 'Mindfulness'],
        ARRAY['Certification en méditation', 'Formation en sophrologie', 'Instructeur Yoga'],
        5, 65.00,
        ARRAY['Mardi soir', 'Jeudi matin', 'Samedi matin'],
        ARRAY['Lyon', 'En ligne'],
        ARRAY['Français'],
        4.6, 89, 3.2, true
    ),
    (
        'sophie.business@example.com', 'Sophie', '+33 6 45 67 89 12',
        'Consultante en stratégie d''entreprise et coach pour dirigeants. 12 ans d''expérience dans l''accompagnement des leaders et la transformation organisationnelle.',
        ARRAY['Leadership', 'Stratégie d''entreprise', 'Management', 'Transformation digitale'],
        ARRAY['MBA HEC', 'Certification en coaching exécutif', 'PMP Project Management'],
        12, 120.00,
        ARRAY['Lundi après-midi', 'Mercredi matin', 'Jeudi après-midi'],
        ARRAY['Paris', 'Marseille'],
        ARRAY['Français', 'Anglais', 'Espagnol'],
        4.9, 234, 1.8, true
    );

-- Sample services
INSERT INTO public.services (
    coach_id, name, description, category, subcategory, price, duration_minutes,
    location_type, group_size, is_active, tags, target_audience
) VALUES 
    (
        (SELECT id FROM public.coaches WHERE email = 'marie.coach@example.com'),
        'Coaching de transition de carrière',
        'Accompagnement personnalisé pour réussir votre changement professionnel. Bilan de compétences, définition d''objectifs et plan d''action.',
        'Développement professionnel',
        'Transition de carrière',
        85.00, 60,
        'both', 'individual', true,
        ARRAY['transition', 'carrière', 'bilan', 'compétences'],
        ARRAY['Cadres', 'Managers', 'Professionnels en reconversion']
    ),
    (
        (SELECT id FROM public.coaches WHERE email = 'pierre.wellness@example.com'),
        'Session de gestion du stress',
        'Techniques pratiques pour gérer le stress au quotidien. Respiration, méditation et outils concrets.',
        'Bien-être',
        'Gestion du stress',
        70.00, 45,
        'both', 'individual', true,
        ARRAY['stress', 'méditation', 'relaxation', 'bien-être'],
        ARRAY['Entrepreneurs', 'Cadres', 'Étudiants']
    ),
    (
        (SELECT id FROM public.coaches WHERE email = 'sophie.business@example.com'),
        'Coaching leadership pour dirigeants',
        'Développez votre style de leadership et renforcez votre impact. Stratégies de communication et gestion d''équipe.',
        'Leadership',
        'Management exécutif',
        150.00, 90,
        'in-person', 'individual', true,
        ARRAY['leadership', 'management', 'dirigeant', 'stratégie'],
        ARRAY['CEOs', 'Directeurs', 'Managers seniors']
    );

-- Sample bookings
INSERT INTO public.bookings (
    service_id, coach_id, client_name, client_email, client_phone,
    scheduled_at, duration_minutes, total_amount, status, payment_status,
    notes
) VALUES 
    (
        (SELECT id FROM public.services WHERE name = 'Coaching de transition de carrière'),
        (SELECT id FROM public.coaches WHERE email = 'marie.coach@example.com'),
        'Jean Dupont', 'jean.dupont@email.com', '+33 6 11 22 33 44',
        '2024-02-15 10:00:00+01', 60, 85.00, 'confirmed', 'paid',
        'Premier rdv - bilan initial'
    ),
    (
        (SELECT id FROM public.services WHERE name = 'Session de gestion du stress'),
        (SELECT id FROM public.coaches WHERE email = 'pierre.wellness@example.com'),
        'Claire Martin', 'claire.martin@email.com', '+33 6 55 66 77 88',
        '2024-02-20 14:30:00+01', 45, 70.00, 'pending', 'pending',
        'Session en ligne - Zoom'
    );

-- Sample reviews
INSERT INTO public.reviews (
    booking_id, coach_id, service_id, client_name, client_email,
    rating, title, comment, communication_rating, professionalism_rating,
    expertise_rating, value_rating, is_verified, is_published
) VALUES 
    (
        (SELECT id FROM public.bookings WHERE client_email = 'jean.dupont@email.com'),
        (SELECT id FROM public.coaches WHERE email = 'marie.coach@example.com'),
        (SELECT id FROM public.services WHERE name = 'Coaching de transition de carrière'),
        'Jean D.', 'jean.dupont@email.com',
        5, 'Excellent accompagnement',
        'Marie m''a vraiment aidé à clarifier mes objectifs professionnels. Ses conseils sont très pratiques et elle sait poser les bonnes questions.',
        5, 5, 5, 5, true, true
    );

-- Sample payments
INSERT INTO public.payments (
    booking_id, coach_id, amount, currency, payment_method,
    status, payment_type, platform_fee, payment_processor_fee, coach_earnings,
    transaction_id, processed_at
) VALUES 
    (
        (SELECT id FROM public.bookings WHERE client_email = 'jean.dupont@email.com'),
        (SELECT id FROM public.coaches WHERE email = 'marie.coach@example.com'),
        85.00, 'EUR', 'stripe',
        'completed', 'booking', 8.50, 2.85, 73.65,
        'pi_1234567890', '2024-02-10 14:30:00+01'
    );

-- Sample leads
INSERT INTO public.leads (
    client_name, client_email, client_phone, preferred_coaching,
    goals, experience, availability, budget, location, additional_info,
    status, priority, source
) VALUES 
    (
        'Antoine Moreau', 'antoine.moreau@email.com', '+33 6 77 88 99 00',
        ARRAY['Leadership', 'Management'],
        'Développer mes compétences de manager pour mieux diriger mon équipe de 15 personnes',
        'Nouveau manager, 2 ans d''expérience',
        'Evenings and weekends',
        '100-150€/heure',
        'Paris',
        'Préférence pour du coaching en présentiel',
        'new', 'high', 'web'
    ),
    (
        'Isabelle Leroux', 'isabelle.leroux@email.com', '+33 6 33 44 55 66',
        ARRAY['Bien-être', 'Équilibre vie pro/perso'],
        'Retrouver un équilibre après un burn-out, gérer le stress au travail',
        'Première expérience en coaching',
        'Lunch breaks and early mornings',
        '60-80€/heure',
        'Lyon',
        'Situation délicate, besoin de confidentialité',
        'new', 'urgent', 'referral'
    );

-- Enhanced subscriptions
INSERT INTO public.subscriptions (
    coach_id, plan_type, current_period_start, current_period_end,
    price, features, monthly_lead_limit, monthly_booking_limit,
    stripe_subscription_id, status
) VALUES 
    (
        (SELECT id FROM public.coaches WHERE email = 'marie.coach@example.com'),
        'premium',
        '2024-01-01T00:00:00Z',
        '2024-12-31T23:59:59Z',
        299.00,
        ARRAY['Leads illimités', 'Profil mis en avant', 'Analytics avancées', 'Commission réduite'],
        -1, -1, 'sub_premium_marie', 'active'
    ),
    (
        (SELECT id FROM public.coaches WHERE email = 'pierre.wellness@example.com'),
        'basic',
        '2024-01-01T00:00:00Z',
        '2024-12-31T23:59:59Z',
        99.00,
        ARRAY['10 leads/mois', 'Profil standard', 'Support email'],
        10, 50, 'sub_basic_pierre', 'active'
    );

-- Success message
SELECT 'Full marketplace database schema created successfully! 🎉' as result,
       'New tables: services, bookings, reviews, payments' as new_tables,
       'RLS policies and database functions included' as security;
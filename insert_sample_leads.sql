-- Sample leads data for testing the CoachProposals page
-- Run this in Supabase SQL editor after applying the migration

-- First, let's get a coach ID to test with
DO $$
DECLARE
    test_coach_id uuid;
BEGIN
    -- Get or create a test coach
    SELECT id INTO test_coach_id FROM coaches WHERE email = 'test@coach.com' LIMIT 1;
    
    IF test_coach_id IS NULL THEN
        INSERT INTO coaches (
            email, 
            first_name, 
            subscription_type,
            is_active
        ) VALUES (
            'test@coach.com',
            'Test',
            'free',
            true
        ) RETURNING id INTO test_coach_id;
    END IF;

    -- Insert sample leads with different statuses
    INSERT INTO leads (
        client_name,
        client_email,
        client_phone,
        location,
        preferred_coaching,
        goals,
        experience,
        availability,
        budget,
        additional_info,
        status,
        coach_id,
        source,
        priority,
        current_step,
        completed_steps,
        is_completed
    ) VALUES 
    (
        'Marie Dubois',
        'marie.dubois@email.com',
        '0596123456',
        'Fort-de-France',
        ARRAY['Fitness', 'Nutrition'],
        'Je souhaite perdre du poids et améliorer ma condition physique',
        'debutant',
        'Lundi et mercredi soir, weekends',
        '40-50',
        'Je préfère les séances en groupe',
        'new',
        test_coach_id,
        'web',
        'medium',
        3,
        ARRAY[1,2,3],
        true
    ),
    (
        'Jean Martin',
        'jean.martin@email.com',
        '0596987654',
        'Le Lamentin',
        ARRAY['Musculation', 'Cardio'],
        'Prendre de la masse musculaire et améliorer mon endurance',
        'intermediaire',
        'Mardi et jeudi matin',
        '50-60',
        'Je peux me déplacer en salle',
        'contacted',
        test_coach_id,
        'web',
        'high',
        3,
        ARRAY[1,2,3],
        true
    ),
    (
        'Sophie Laurent',
        'sophie.laurent@email.com',
        NULL,
        'Schoelcher',
        ARRAY['Yoga', 'Pilates'],
        'Réduire le stress et améliorer ma flexibilité',
        'debutant',
        'Weekends uniquement',
        '30-40',
        NULL,
        'converted',
        test_coach_id,
        'web',
        'low',
        3,
        ARRAY[1,2,3],
        true
    ),
    (
        'Paul Moreau',
        'paul.moreau@email.com',
        '0596456789',
        'Saint-Pierre',
        ARRAY['Running', 'Préparation physique'],
        'Me préparer pour un marathon',
        'avance',
        'Tous les matins',
        '60-70',
        'Je cours déjà 3 fois par semaine',
        'assigned',
        test_coach_id,
        'web',
        'urgent',
        3,
        ARRAY[1,2,3],
        true
    ),
    (
        'Client Masqué 1',
        'masked1@email.com',
        '0596111111',
        'Le Robert',
        ARRAY['Fitness'],
        'Objectifs confidentiels pour compte gratuit',
        'intermediaire',
        'Flexible',
        '40-50',
        'Ce lead devrait être masqué pour les comptes gratuits',
        'new',
        test_coach_id,
        'web',
        'medium',
        2,
        ARRAY[1,2],
        false
    ),
    (
        'Client Masqué 2',
        'masked2@email.com',
        '0596222222',
        'Rivière-Salée',
        ARRAY['Nutrition'],
        'Autres objectifs confidentiels',
        'debutant',
        'Soir uniquement',
        '30-40',
        'Ce lead aussi devrait être masqué',
        'new',
        test_coach_id,
        'web',
        'low',
        1,
        ARRAY[1],
        false
    );

    RAISE NOTICE 'Sample leads inserted for coach ID: %', test_coach_id;
END $$;

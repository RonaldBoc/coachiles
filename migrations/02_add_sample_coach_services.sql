-- Add Sample Coach Services
-- Run this after the main coach_services migration to populate some test data

-- Insert sample services for existing coaches
INSERT INTO coach_services (
  coach_id, 
  title, 
  description, 
  category, 
  sub_category,
  can_be_solo, 
  can_be_group, 
  solo_price, 
  group_price, 
  duration,
  can_be_at_home,
  can_be_online,
  can_be_in_public_spaces,
  has_free_trial,
  free_trial_modalities,
  cancellation_policy
) VALUES 
  -- Marie's services (Development coach)
  (
    (SELECT id FROM coaches WHERE email = 'marie.coach@example.com'),
    'Séance de développement personnel',
    'Accompagnement personnalisé pour développer votre confiance en soi et atteindre vos objectifs personnels',
    'Développement personnel',
    'Confiance en soi',
    true, false, 75.00, null, 60,
    false, true, false,
    true, 'Première séance découverte de 30 minutes offerte',
    'flexible'
  ),
  (
    (SELECT id FROM coaches WHERE email = 'marie.coach@example.com'),
    'Atelier transition de carrière',
    'Workshop en groupe pour accompagner votre changement de carrière',
    'Développement personnel',
    'Transition de carrière',
    false, true, null, 45.00, 90,
    false, true, false,
    false, null,
    'strict'
  ),
  
  -- Pierre's services (Wellness coach)
  (
    (SELECT id FROM coaches WHERE email = 'pierre.wellness@example.com'),
    'Séance anti-stress individuelle',
    'Techniques de relaxation et gestion du stress adaptées à votre rythme de vie',
    'Bien-être',
    'Gestion du stress',
    true, false, 65.00, null, 45,
    true, true, true,
    true, 'Séance d''évaluation gratuite de 20 minutes',
    'flexible'
  ),
  (
    (SELECT id FROM coaches WHERE email = 'pierre.wellness@example.com'),
    'Méditation de groupe',
    'Séance de méditation guidée en petit groupe pour retrouver son équilibre',
    'Bien-être',
    'Méditation',
    false, true, null, 25.00, 60,
    false, true, true,
    true, 'Première séance d''essai gratuite',
    'flexible'
  ),
  
  -- Sophie's services (Business coach)
  (
    (SELECT id FROM coaches WHERE email = 'sophie.business@example.com'),
    'Coaching exécutif personnalisé',
    'Accompagnement stratégique pour dirigeants et cadres supérieurs',
    'Leadership',
    'Coaching exécutif',
    true, false, 120.00, null, 90,
    false, true, false,
    false, null,
    'strict'
  ),
  (
    (SELECT id FROM coaches WHERE email = 'sophie.business@example.com'),
    'Formation leadership en équipe',
    'Workshop de formation au leadership pour équipes de direction',
    'Leadership',
    'Management d''équipe',
    false, true, null, 80.00, 120,
    false, false, false,
    true, 'Consultation préalable gratuite de 30 minutes',
    'strict'
  );

-- Add more services for variety
INSERT INTO coach_services (
  coach_id, 
  title, 
  description, 
  category,
  can_be_solo, 
  can_be_group, 
  solo_price, 
  group_price, 
  duration,
  can_be_at_home,
  can_be_online,
  can_be_in_public_spaces,
  has_free_trial,
  cancellation_policy
) VALUES 
  -- Additional services for Marie
  (
    (SELECT id FROM coaches WHERE email = 'marie.coach@example.com'),
    'Coaching de vie en ligne',
    'Séances de coaching de vie par visioconférence, flexibles selon votre emploi du temps',
    'Développement personnel',
    true, true, 70.00, 40.00, 60,
    false, true, false,
    true,
    'flexible'
  ),
  
  -- Additional services for Pierre  
  (
    (SELECT id FROM coaches WHERE email = 'pierre.wellness@example.com'),
    'Sophrologie en entreprise',
    'Interventions de sophrologie sur le lieu de travail pour améliorer le bien-être des équipes',
    'Bien-être',
    false, true, null, 50.00, 75,
    false, false, false,
    false,
    'flexible'
  );

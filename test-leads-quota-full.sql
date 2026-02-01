-- test-leads-quota-full.sql
-- Système complet de test pour le quota de leads
-- À exécuter dans Supabase SQL Editor

-- =====================================================
-- SETUP: Créer des coaches et leads de test
-- =====================================================

BEGIN;

-- 1. Coach GRATUIT avec 2 leads (OK)
WITH new_coach AS (
  INSERT INTO public.coaches (
    email, first_name, last_name, is_active, created_at
  ) VALUES (
    'test.free.ok@example.com',
    'Test',
    'FreeOk',
    true,
    NOW() - INTERVAL '30 days'
  ) RETURNING id
)
INSERT INTO public.leads (
  coach_id, client_name, client_email, client_phone,
  is_hidden, do_not_contact, is_completed, current_step, created_at, status, source, priority
)
SELECT 
  (SELECT id FROM new_coach),
  'Client ' || i,
  'client' || i || '@test.com',
  '+3361234560' || i,
  false, false, false, 3,
  NOW() - INTERVAL (30 - i) || ' days',
  'active', 'marketplace', 'medium'
FROM generate_series(1, 2) AS i;

-- 2. Coach GRATUIT avec 5 leads (dépassement)
WITH new_coach AS (
  INSERT INTO public.coaches (
    email, first_name, last_name, is_active, created_at
  ) VALUES (
    'test.free.over@example.com',
    'Test',
    'FreeOver',
    true,
    NOW() - INTERVAL '30 days'
  ) RETURNING id
)
INSERT INTO public.leads (
  coach_id, client_name, client_email, client_phone,
  is_hidden, do_not_contact, is_completed, current_step, created_at, status, source, priority
)
SELECT 
  (SELECT id FROM new_coach),
  'Client ' || i,
  'client' || i || '@test.com',
  '+3361234560' || i,
  false, false, false, 3,
  NOW() - INTERVAL (30 - i) || ' days',
  'active', 'marketplace', 'medium'
FROM generate_series(1, 5) AS i;

-- 3. Coach PREMIUM avec 10 leads
WITH new_coach AS (
  INSERT INTO public.coaches (
    email, first_name, last_name, is_active, created_at
  ) VALUES (
    'test.premium@example.com',
    'Test',
    'Premium',
    true,
    NOW() - INTERVAL '30 days'
  ) RETURNING id
),
coach_sub AS (
  INSERT INTO public.subscriptions (
    coach_id, plan_id, status, is_active, current_period_start, current_period_end
  )
  SELECT 
    (SELECT id FROM new_coach),
    sp.id,
    'active',
    true,
    NOW() - INTERVAL '10 days',
    NOW() + INTERVAL '20 days'
  FROM public.subscription_plans sp
  WHERE sp.plan_type = 'premium'
  LIMIT 1
  RETURNING coach_id
)
INSERT INTO public.leads (
  coach_id, client_name, client_email, client_phone,
  is_hidden, do_not_contact, is_completed, current_step, created_at, status, source, priority
)
SELECT 
  (SELECT id FROM new_coach),
  'Client ' || i,
  'client' || i || '@test.com',
  '+3361234560' || i,
  false, false, false, 3,
  NOW() - INTERVAL (30 - i) || ' days',
  'active', 'marketplace', 'medium'
FROM generate_series(1, 10) AS i;

COMMIT;

-- =====================================================
-- TEST 1: Vérifier le masquage des leads (gratuit > 2)
-- =====================================================

-- Afficher les résultats du masquage
SELECT 
  'TEST 1: Coach gratuit - Dépassement quota' as test_name,
  clm.coach_id,
  c.email,
  clm.distinct_email_rank as "Rang (ordre)",
  clm.client_name,
  clm.client_email,
  clm.client_phone,
  clm.is_locked,
  clm.max_leads,
  CASE 
    WHEN clm.distinct_email_rank <= clm.max_leads THEN '✅ VISIBLE'
    ELSE '🔒 FLOUTAGE'
  END as expected_status
FROM public.coach_leads_masked clm
JOIN public.coaches c ON c.id = clm.coach_id
WHERE c.email = 'test.free.over@example.com'
ORDER BY clm.distinct_email_rank;

-- =====================================================
-- TEST 2: Vérifier que premium voit tous les leads
-- =====================================================

SELECT 
  'TEST 2: Coach premium - Tous les leads visibles' as test_name,
  clm.coach_id,
  c.email,
  clm.distinct_email_rank as "Rang",
  clm.client_name,
  clm.client_email,
  clm.is_locked,
  clm.max_leads
FROM public.coach_leads_masked clm
JOIN public.coaches c ON c.id = clm.coach_id
WHERE c.email = 'test.premium@example.com'
ORDER BY clm.distinct_email_rank;

-- =====================================================
-- TEST 3: Vérifier le cycle mensuel
-- =====================================================

WITH test_data AS (
  SELECT 
    c.id,
    c.email,
    c.created_at,
    DATE_TRUNC('month', c.created_at) as billing_month_start,
    cs.subscription_type,
    cs.max_leads,
    (
      SELECT COUNT(*)
      FROM public.leads l
      WHERE l.coach_id = c.id
        AND l.is_hidden = false
        AND l.do_not_contact = false
        AND l.created_at >= DATE_TRUNC('month', c.created_at)
    ) as leads_this_month
  FROM public.coaches c
  LEFT JOIN public.coaches_current_subscription cs ON cs.id = c.id
  WHERE c.email LIKE 'test.%'
)
SELECT 
  'TEST 3: Cycle mensuel et quota' as test_name,
  email,
  subscription_type,
  max_leads,
  leads_this_month,
  billing_month_start,
  CASE 
    WHEN leads_this_month <= max_leads THEN 'OK - Dans quota'
    ELSE 'DÉPASSEMENT - Le lead ' || max_leads + 1 || '+ doit être floutés'
  END as status
FROM test_data;

-- =====================================================
-- TEST 4: Vérifier les données sensibles NULL quand locked
-- =====================================================

SELECT 
  'TEST 4: Masquage des données sensibles' as test_name,
  clm.coach_id,
  c.email,
  clm.distinct_email_rank,
  CASE 
    WHEN clm.is_locked THEN 'LOCKÉ'
    ELSE 'VISIBLE'
  END as lock_status,
  CASE 
    WHEN clm.is_locked AND clm.client_name IS NULL THEN '✅ OK'
    WHEN clm.is_locked AND clm.client_name IS NOT NULL THEN '❌ ERREUR - Pas floutée!'
    WHEN NOT clm.is_locked AND clm.client_name IS NOT NULL THEN '✅ OK'
    ELSE '❌ ERREUR - Données manquantes'
  END as client_name_status,
  CASE 
    WHEN clm.is_locked AND clm.client_email IS NULL THEN '✅ OK'
    WHEN clm.is_locked AND clm.client_email IS NOT NULL THEN '❌ ERREUR'
    WHEN NOT clm.is_locked AND clm.client_email IS NOT NULL THEN '✅ OK'
    ELSE '❌ ERREUR'
  END as client_email_status,
  CASE 
    WHEN clm.is_locked AND clm.client_phone IS NULL THEN '✅ OK'
    WHEN clm.is_locked AND clm.client_phone IS NOT NULL THEN '❌ ERREUR'
    WHEN NOT clm.is_locked AND clm.client_phone IS NOT NULL THEN '✅ OK'
    ELSE '❌ ERREUR'
  END as client_phone_status
FROM public.coach_leads_masked clm
JOIN public.coaches c ON c.id = clm.coach_id
WHERE c.email LIKE 'test.%'
ORDER BY c.email, clm.distinct_email_rank;

-- =====================================================
-- CLEANUP: Supprimer les données de test
-- =====================================================

-- DÉCOMMENTER POUR NETTOYER:
/*
DELETE FROM public.leads 
WHERE coach_id IN (
  SELECT id FROM public.coaches 
  WHERE email LIKE 'test.%'
);

DELETE FROM public.subscriptions
WHERE coach_id IN (
  SELECT id FROM public.coaches 
  WHERE email LIKE 'test.%'
);

DELETE FROM public.coaches 
WHERE email LIKE 'test.%';
*/

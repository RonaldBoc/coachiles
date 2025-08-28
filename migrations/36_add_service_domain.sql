-- 36_add_service_domain.sql
-- Adds domain column to coach_services and backfills from existing category using mapping stored inline.

BEGIN;

-- 1. Add domain column if not exists
ALTER TABLE coach_services ADD COLUMN IF NOT EXISTS domain TEXT;

-- 2. Backfill domain using a temporary mapping table (inline VALUES). Adjust mapping if categories evolve.
-- NOTE: This mapping mirrors SPECIALTY_OPTIONS in src/constants/coachOptions.ts
WITH mapping AS (
  SELECT * FROM (VALUES
    ('Remise en forme générale','Fitness & Musculation'),
    ('Perte de poids','Fitness & Musculation'),
    ('Prise de masse musculaire','Fitness & Musculation'),
    ('Musculation & Force','Fitness & Musculation'),
    ('CrossFit','Fitness & Musculation'),
    ('Functional training','Fitness & Musculation'),
    ('HIIT','Fitness & Musculation'),
    ('Circuit training','Fitness & Musculation'),
    ('Course à pied','Cardio & Endurance'),
    ('Trail running','Cardio & Endurance'),
    ('Marathon','Cardio & Endurance'),
    ('Cyclisme','Cardio & Endurance'),
    ('Natation','Cardio & Endurance'),
    ('Triathlon','Cardio & Endurance'),
    ('Endurance cardiovasculaire','Cardio & Endurance'),
    ('Marche sportive','Cardio & Endurance'),
    ('Boxe anglaise','Sports de combat'),
    ('Boxe française','Sports de combat'),
    ('Kickboxing','Sports de combat'),
    ('MMA','Sports de combat'),
    ('Judo','Sports de combat'),
    ('Karaté','Sports de combat'),
    ('Taekwondo','Sports de combat'),
    ('Arts martiaux mixtes','Sports de combat'),
    ('Football','Sports collectifs'),
    ('Basketball','Sports collectifs'),
    ('Volleyball','Sports collectifs'),
    ('Handball','Sports collectifs'),
    ('Rugby','Sports collectifs'),
    ('Tennis de table','Sports collectifs'),
    ('Badminton','Sports collectifs'),
    ('Tennis','Sports collectifs'),
    ('Yoga','Bien-être & Relaxation'),
    ('Pilates','Bien-être & Relaxation'),
    ('Méditation','Bien-être & Relaxation'),
    ('Sophrologie','Bien-être & Relaxation'),
    ('Stretching','Bien-être & Relaxation'),
    ('Relaxation','Bien-être & Relaxation'),
    ('Respiration','Bien-être & Relaxation'),
    ('Gestion du stress','Bien-être & Relaxation'),
    ('Rééducation fonctionnelle','Rééducation & Thérapie'),
    ('Kinésithérapie sportive','Rééducation & Thérapie'),
    ('Ostéopathie','Rééducation & Thérapie'),
    ('Massage thérapeutique','Rééducation & Thérapie'),
    ('Récupération sportive','Rééducation & Thérapie'),
    ('Prévention des blessures','Rééducation & Thérapie'),
    ('Réathlétisation','Rééducation & Thérapie'),
    ('Nutrition sportive','Nutrition & Lifestyle'),
    ('Rééquilibrage alimentaire','Nutrition & Lifestyle'),
    ('Conseil en nutrition','Nutrition & Lifestyle'),
    ('Préparation de repas','Nutrition & Lifestyle'),
    ('Compléments alimentaires','Nutrition & Lifestyle'),
    ('Hydratation','Nutrition & Lifestyle'),
    ('Gestion du poids','Nutrition & Lifestyle'),
    ('Danse contemporaine','Danse'),
    ('Danse classique','Danse'),
    ('Hip-hop','Danse'),
    ('Salsa','Danse'),
    ('Bachata','Danse'),
    ('Kizomba','Danse'),
    ('Zouk','Danse'),
    ('Dancehall','Danse'),
    ('Afrobeat','Danse'),
    ('Danse de salon','Danse'),
    ('Tango','Danse'),
    ('Valse','Danse'),
    ('Jazz','Danse'),
    ('Modern jazz','Danse'),
    ('Danse africaine','Danse'),
    ('Préparation physique','Spécialisations techniques'),
    ('Préparation mentale','Spécialisations techniques'),
    ('Analyse vidéo','Spécialisations techniques'),
    ('Tests physiques','Spécialisations techniques'),
  ('Planification d''entraînement','Spécialisations techniques'),
    ('Coaching de performance','Spécialisations techniques'),
    ('Biomécanique','Spécialisations techniques')
  ) AS m(category, domain)
)
UPDATE coach_services cs
SET domain = m.domain
FROM mapping m
WHERE cs.category = m.category AND cs.domain IS NULL;

-- 3. Optional: create index on domain for filtering
CREATE INDEX IF NOT EXISTS idx_coach_services_domain ON coach_services(domain);

COMMIT;

COMMENT ON COLUMN coach_services.domain IS 'Higher-level domain inferred from category (specialty grouping)';

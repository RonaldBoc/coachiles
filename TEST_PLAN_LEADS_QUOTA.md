# Plan de Test Complet - Système de Quota de Leads

## Vue d'ensemble du système

- **Compte gratuit** : 2 leads visibles/mois (basé sur la date d'inscription)
- **Compte premium** : illimité
- **Règle clé** : Une fois un lead visible → reste visible (ne jamais être floutés à posteriori)
- **Transition** : Premium → Gratuit si pas de renouvellement

---

## 1️⃣ Tests SQL - Préparation des données

### 1.1 Vérifier le quota et le cycle mensuel d'un coach

```sql
-- Identifier un coach gratuit
SELECT
  c.id,
  c.email,
  c.created_at,
  c.is_active,
  cs.subscription_type,
  cs.has_active_subscription,
  cs.max_leads,
  DATE_TRUNC('month', c.created_at) as billing_month_start,
  DATE_TRUNC('month', c.created_at) + INTERVAL '1 month' - INTERVAL '1 day' as billing_month_end
FROM coaches c
LEFT JOIN coaches_current_subscription cs ON cs.id = c.id
WHERE cs.subscription_type = 'free' OR cs.has_active_subscription = false
ORDER BY c.created_at DESC
LIMIT 5;
```

### 1.2 Compter les leads visibles d'un coach pour le mois en cours

```sql
-- Remplacer {COACH_ID} par l'ID du coach à tester
WITH coach_billing AS (
  SELECT
    c.id,
    c.created_at,
    DATE_TRUNC('month', c.created_at) as billing_month_start
  FROM coaches c
  WHERE c.id = '{COACH_ID}'
),
leads_this_month AS (
  SELECT
    l.id,
    l.client_name,
    l.client_email,
    l.created_at,
    l.status,
    ROW_NUMBER() OVER (ORDER BY l.created_at ASC) as lead_order_this_month
  FROM leads l
  CROSS JOIN coach_billing cb
  WHERE l.coach_id = cb.id
    AND l.is_hidden = false
    AND l.do_not_contact = false
    AND l.created_at >= cb.billing_month_start
  ORDER BY l.created_at ASC
)
SELECT
  lead_order_this_month,
  id,
  client_name,
  client_email,
  created_at,
  status,
  CASE
    WHEN lead_order_this_month <= 2 THEN 'VISIBLE (dans quota)'
    ELSE 'FLOUTAGE (dépassement quota)'
  END as expected_display
FROM leads_this_month;
```

### 1.3 Vérifier l'état de la vue `coach_leads_masked`

```sql
-- Tester si la vue masque correctement les leads au-delà du quota
SELECT
  id,
  coach_id,
  client_name,
  client_email,
  client_phone,
  is_locked,
  distinct_email_rank,
  max_leads,
  subscription_type
FROM coach_leads_masked
WHERE coach_id = '{COACH_ID}'
ORDER BY distinct_email_rank ASC
LIMIT 10;
```

---

## 2️⃣ Tests Manuels - Interface Utilisateur

### Scénario 1: Coach Gratuit - Moins de 2 leads

**Setup:**

1. Créer un nouveau coach A (gratuit, date inscription = aujourd'hui)
2. Lui assigner 1 lead

**Vérifications:**

- ✅ Le lead affiche : nom, email, téléphone, tous les détails
- ✅ Pas de message "lead floué"

```bash
# Script de setup (voir section 3)
npm run test:scenario-1
```

---

### Scénario 2: Coach Gratuit - Exactement 2 leads

**Setup:**

1. Coach A (gratuit) = 2 leads assignés ce mois

**Vérifications:**

- ✅ Lead 1 : données visibles
- ✅ Lead 2 : données visibles
- ✅ Compteur affiche "2/2"

```bash
npm run test:scenario-2
```

---

### Scénario 3: Coach Gratuit - Dépassement du quota

**Setup:**

1. Coach A (gratuit) = 3+ leads assignés ce mois
2. Leads 1 & 2 = déjà consultés
3. Lead 3 = nouveau

**Vérifications:**

- ✅ Lead 1 & 2 : données visibles (historique conservé)
- ✅ Lead 3 : FLOUÉ
  - client_name = NULL
  - client_email = NULL
  - client_phone = NULL
  - message d'info "Ce lead est disponible en premium"
- ✅ Compteur affiche "2/2 - Premium pour plus"

```bash
npm run test:scenario-3
```

---

### Scénario 4: Renouvellement mensuel - Passage du mois

**Setup:**

1. Coach A = 2 leads consommés en janvier
2. On simule le passage à février (nouveau mois)

**Vérifications:**

- ✅ Février : Coach retrouve 2 nouvelles places
- ✅ Les leads de janvier restent visibles même s'ils sont au-delà de 2
- ✅ Janvier lead #3 (floué) = reste floué
- ✅ Février lead #1 & #2 = visibles
- ✅ Février lead #3 = floué

**Test SQL:**

```sql
-- Vérifier les cycles mensuels
SELECT
  DATE_TRUNC('month', l.created_at) as month,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE l.client_name IS NOT NULL) as visible_leads,
  COUNT(*) FILTER (WHERE l.client_name IS NULL AND is_hidden = false AND do_not_contact = false) as masked_leads
FROM coach_leads_masked l
WHERE l.coach_id = '{COACH_ID}'
GROUP BY DATE_TRUNC('month', l.created_at)
ORDER BY month DESC;
```

---

### Scénario 5: Upgrade Gratuit → Premium

**Setup:**

1. Coach A (gratuit) = 2 leads visibles, 3+ leads floutés
2. Coach A achète premium
3. Vérifier les changements

**Vérifications:**

- ✅ Immédiatement après upgrade : tous les leads visibles
- ✅ Les leads floutés deviennent visibles
- ✅ max_leads dans `coaches_current_subscription` = -1 (illimité)
- ✅ is_locked = false pour tous

```sql
-- Avant l'upgrade
SELECT COUNT(*) as total, SUM(CASE WHEN is_locked THEN 1 ELSE 0 END) as locked_count
FROM coach_leads_masked
WHERE coach_id = '{COACH_ID}';

-- Après l'upgrade - devrait montrer 0 locked
```

---

### Scénario 6: Downgrade Premium → Gratuit (Expiration)

**Setup:**

1. Coach B (premium) = 10+ leads visibles
2. Abonnement expire (current_period_end < NOW())
3. Système passe à gratuit

**Vérifications:**

- ✅ max_leads revient à 2
- ✅ Les leads 1 & 2 restent visibles
- ✅ Les leads 3+ deviennent floutés
- ✅ Message "Upgrade pour voir plus"

```sql
-- Simuler l'expiration (attention: à faire en dev/test seulement!)
UPDATE subscriptions
SET
  current_period_end = NOW() - INTERVAL '1 day',
  is_active = false
WHERE coach_id = '{COACH_ID}' AND status = 'active';

-- Vérifier les changements
SELECT id, client_name, is_locked, max_leads
FROM coach_leads_masked
WHERE coach_id = '{COACH_ID}'
ORDER BY distinct_email_rank;
```

---

### Scénario 7: Cycle Mensuel - Débordement sur plusieurs mois

**Setup:**

1. Coach A (gratuit) = 2 leads en janvier, 3+ en février, 2+ en mars

**Vérifications:**

- ✅ Janvier : leads 1,2 visibles | lead 3+ floutés
- ✅ Février : leads 1,2 visibles | lead 3+ floutés (nouveau cycle!)
- ✅ Mars : leads 1,2 visibles | lead 3+ floutés
- ✅ Leads visibles restent visibles (jamais "revenir floués")

```sql
-- Requête par mois
SELECT
  DATE_TRUNC('month', l.created_at) as month,
  l.distinct_email_rank,
  l.is_locked,
  l.client_name,
  CASE WHEN l.client_name IS NOT NULL THEN 'VISIBLE' ELSE 'FLOUTAGE' END as status
FROM coach_leads_masked l
WHERE l.coach_id = '{COACH_ID}'
ORDER BY month DESC, l.distinct_email_rank;
```

---

## 3️⃣ Scripts de Test Automatisés

### Créer un fichier de test avec des données

Créer `test-leads-quota.sql`:

```sql
-- =====================================================
-- TEST SETUP: Coach gratuit avec leads progressifs
-- =====================================================

-- 1. Créer un coach de test gratuit
INSERT INTO coaches (
  id, email, first_name, last_name, is_active, created_at
) VALUES (
  gen_random_uuid(),
  'test.quota.free@example.com',
  'Test',
  'QuotaFree',
  true,
  NOW() - INTERVAL '30 days'  -- Créé il y a 30 jours
) RETURNING id as coach_id;

-- 2. Lui assigner 5 leads à différentes dates
-- Lead 1 (jour 0 - VISIBLE)
INSERT INTO leads (
  id, coach_id, client_name, client_email, client_phone,
  is_hidden, do_not_contact, is_completed, current_step,
  created_at
) VALUES (
  gen_random_uuid(),
  '{COACH_ID_FROM_ABOVE}',
  'Lead 1 - Should be visible',
  'lead1@example.com',
  '+33612345601',
  false, false, false, 3,
  NOW() - INTERVAL '25 days'
) RETURNING id;

-- Lead 2 (jour 1 - VISIBLE)
INSERT INTO leads (
  id, coach_id, client_name, client_email, client_phone,
  is_hidden, do_not_contact, is_completed, current_step,
  created_at
) VALUES (
  gen_random_uuid(),
  '{COACH_ID_FROM_ABOVE}',
  'Lead 2 - Should be visible',
  'lead2@example.com',
  '+33612345602',
  false, false, false, 3,
  NOW() - INTERVAL '24 days'
) RETURNING id;

-- Lead 3 (jour 2 - SHOULD BE MASKED)
INSERT INTO leads (
  id, coach_id, client_name, client_email, client_phone,
  is_hidden, do_not_contact, is_completed, current_step,
  created_at
) VALUES (
  gen_random_uuid(),
  '{COACH_ID_FROM_ABOVE}',
  'Lead 3 - Should be MASKED',
  'lead3@example.com',
  '+33612345603',
  false, false, false, 3,
  NOW() - INTERVAL '23 days'
) RETURNING id;

-- 3. Vérifier le résultat
SELECT
  id,
  client_name,
  client_email,
  client_phone,
  is_locked,
  distinct_email_rank,
  max_leads
FROM coach_leads_masked
WHERE coach_id = '{COACH_ID_FROM_ABOVE}'
ORDER BY distinct_email_rank;
```

---

## 4️⃣ Checklist de Vérification

### Avant le déploiement

- [ ] **Quota gratuit (2 leads)** fonctionne
  - [ ] Leads 1-2 visibles complètement
  - [ ] Lead 3+ floutés
- [ ] **Cycle mensuel** correct
  - [ ] Nouveau mois = reset du quota
  - [ ] Historique conservé
- [ ] **Premium illimité** fonctionne
  - [ ] Tous les leads visibles
  - [ ] Pas de floutage
- [ ] **Transitions premium ↔ gratuit**
  - [ ] Upgrade immédiat
  - [ ] Downgrade après expiration
  - [ ] Conservation de l'historique
- [ ] **Vue `coach_leads_masked`**
  - [ ] RLS fonctionne (coach ne voit que ses leads)
  - [ ] Masquage SQL correct
  - [ ] Performance acceptable
- [ ] **Frontend**
  - [ ] Affiche les bonnes colonnes
  - [ ] Affiche message "floué" si NULL
  - [ ] Buttons "Upgrade" visibles
  - [ ] Compteur quota correct

---

## 5️⃣ Commandes de Test Rapide

```bash
# Lancer tous les tests
npm run test:leads-quota

# Tests spécifiques
npm run test:scenario-1  # Gratuit < 2 leads
npm run test:scenario-2  # Gratuit = 2 leads
npm run test:scenario-3  # Gratuit > 2 leads (floutage)
npm run test:scenario-4  # Renouvellement mensuel
npm run test:scenario-5  # Upgrade vers premium
npm run test:scenario-6  # Downgrade vers gratuit
npm run test:scenario-7  # Multi-mois

# Queries SQL rapides
npm run sql:check-quota -- --coach-id {ID}
npm run sql:check-masking -- --coach-id {ID}
```

---

## 6️⃣ Points Critiques à Surveiller

⚠️ **Bug potentiels à vérifier:**

1. **Leads qui deviennent floutés à posteriori** → ❌ NE DOIT PAS ARRIVER
   - Tester: Lead visible → Attendre renouvellement mois → Doit rester visible
2. **Reset du quota mal calculé** → ❌ NE DOIT PAS ARRIVER
   - Tester: 2 leads janvier → 1er février = doit rester visible
3. **Premium qui ne voit pas ses leads** → ❌ NE DOIT PAS ARRIVER
   - Tester: Upgrade immédiat → tous les leads doivent apparaître
4. **RLS bypass** → ❌ CRITIQUE

   - Tester: Coach A ne doit pas voir les leads de Coach B

5. **Vue qui retourne des NULL au lieu de masquer** → ⚠️
   - Tester: Lead floué doit avoir client_name=NULL mais être présent

---

## 7️⃣ Structure des données clés

```
coaches
├── id (UUID)
├── email
├── created_at ← **CRUCIAL pour calcul du cycle**
├── is_active

coaches_current_subscription
├── id (coach.id)
├── subscription_type ('free', 'premium', ...)
├── max_leads (2 pour gratuit, -1 pour premium)
└── has_active_subscription

leads
├── id
├── coach_id
├── client_name
├── client_email
├── client_phone
├── is_hidden (false = normal)
├── do_not_contact (false = normal)
├── is_completed OR current_step >= 3
└── created_at

coach_leads_masked (VIEW)
├── id
├── coach_id
├── client_name (NULL si locked)
├── client_email (NULL si locked)
├── client_phone (NULL si locked)
├── is_locked (BOOLEAN)
├── distinct_email_rank (ordre par email)
└── max_leads (du subscription)
```

# Guide Visuel - Tests du Système de Quota de Leads

## 🎯 Objectif Global

Valider que le système de quota de leads fonctionne correctement:

- Compte **gratuit** → 2 leads visibles/mois
- Compte **premium** → illimité
- Les leads visibles restent **toujours visibles**
- Les données sensibles sont **correctement floutées**

---

## 📊 Diagrammes de Comportement

### Scénario 1: Coach Gratuit (< 2 leads)

```
Coach A (Gratuit - Inscription: 1er janvier)
│
├─ Lead 1 [1er janvier] ───────────────────► ✅ VISIBLE
│  ├─ client_name: "Alice Martin"
│  ├─ client_email: "alice@example.com"
│  ├─ client_phone: "+33612345678"
│  └─ is_locked: false
│
└─ Lead 2 [2 janvier] ─────────────────────► ✅ VISIBLE
   ├─ client_name: "Bob Dupont"
   ├─ client_email: "bob@example.com"
   ├─ client_phone: "+33687654321"
   └─ is_locked: false

Quota: 2/2 ✅ Dans les limites
```

### Scénario 2: Coach Gratuit (> 2 leads)

```
Coach B (Gratuit - Inscription: 1er janvier)
│
├─ Lead 1 [1er janvier] ────────────────────► ✅ VISIBLE (Historique conservé)
│  └─ is_locked: false
│
├─ Lead 2 [2 janvier] ──────────────────────► ✅ VISIBLE (Historique conservé)
│  └─ is_locked: false
│
├─ Lead 3 [3 janvier] ─────────────────────► 🔒 MASQUÉ (Dépassement quota)
│  ├─ client_name: NULL
│  ├─ client_email: NULL
│  ├─ client_phone: NULL
│  ├─ goals: NULL
│  ├─ budget: NULL
│  └─ is_locked: true
│
├─ Lead 4 [4 janvier] ─────────────────────► 🔒 MASQUÉ
│  └─ Même comportement que Lead 3
│
└─ Lead 5 [5 janvier] ─────────────────────► 🔒 MASQUÉ
   └─ Même comportement que Lead 3

Quota: 2/2 ⚠️ Dépassement! (3 leads au-delà du quota)
```

### Scénario 3: Coach Premium (Illimité)

```
Coach C (Premium - Actif jusqu'au 1er mars)
│
├─ Lead 1 ─────────────────────────────────► ✅ VISIBLE
├─ Lead 2 ─────────────────────────────────► ✅ VISIBLE
├─ Lead 3 ─────────────────────────────────► ✅ VISIBLE ← Serait masqué en gratuit!
├─ Lead 4 ─────────────────────────────────► ✅ VISIBLE ← Idem
├─ Lead 5 ─────────────────────────────────► ✅ VISIBLE ← Idem
├─ Lead 6 ─────────────────────────────────► ✅ VISIBLE
├─ Lead 7 ─────────────────────────────────► ✅ VISIBLE
├─ Lead 8 ─────────────────────────────────► ✅ VISIBLE
├─ Lead 9 ─────────────────────────────────► ✅ VISIBLE
└─ Lead 10 ────────────────────────────────► ✅ VISIBLE

max_leads: -1 (illimité)
is_locked: false (pour tous)
Quota: ∞/∞ ✅ Illimité
```

### Scénario 4: Renouvellement Mensuel

```
═══════════════════════════════════════════════════════════
JANVIER
═══════════════════════════════════════════════════════════
Coach D (Gratuit - Inscription: 1er janvier)

1-3 janvier:
├─ Lead A [1er] ──────────────────────────► ✅ VISIBLE
└─ Lead B [2] ────────────────────────────► ✅ VISIBLE
Lead C [3] ──────────────────────────────► 🔒 MASQUÉ (Dépassement)

Quota Janvier: 2/2

═══════════════════════════════════════════════════════════
FÉVRIER (1er février = nouveau cycle!)
═══════════════════════════════════════════════════════════

Cycle réinitialisé ✅
├─ Lead D [1er fév] ──────────────────────► ✅ VISIBLE (Lead #1 du mois)
├─ Lead E [2 fév] ────────────────────────► ✅ VISIBLE (Lead #2 du mois)
├─ Lead F [3 fév] ────────────────────────► 🔒 MASQUÉ (Dépassement)

Ancien Lead C [du 3 jan] ─────────────────► 🔒 RESTE MASQUÉ ✅
                        (Jamais revisible, comme avant)

Quota Février: 2/2 (nouveau cycle)
```

---

## 🧪 Résultats Attendus des Tests

### Test 1: Quota Exact (2 leads gratuit)

```
┌─────────────────────────────────────────────────────┐
│ TEST 1: Coach gratuit - Quota exact (2 leads)       │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ✅ Coach créé: 123e4567-e89b-12d3-a456-426614174000│
│ ✅ 2 leads créés                                    │
│                                                      │
│ ── RÉSULTATS ──────────────────────────────────────│
│ Lead 1: ✅ VISIBLE - "Lead 1" (locked: false)     │
│ Lead 2: ✅ VISIBLE - "Lead 2" (locked: false)     │
│                                                      │
│ ✅ Tous les leads sont visibles (2/2) ◀─ OK!      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Test 2: Dépassement Quota (5 leads gratuit)

```
┌─────────────────────────────────────────────────────┐
│ TEST 2: Coach gratuit - Dépassement (5 leads)       │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ✅ Coach créé: 123e4567-e89b-12d3-a456-426614174001│
│ ✅ 5 leads créés                                    │
│                                                      │
│ ── RÉSULTATS ──────────────────────────────────────│
│ Rang 1: ✅ VISIBLE - "Lead 1"                      │
│ Rang 2: ✅ VISIBLE - "Lead 2"                      │
│ Rang 3: 🔒 MASQUÉ - "[CLIENT MASQUÉ]"             │
│ Rang 4: 🔒 MASQUÉ - "[CLIENT MASQUÉ]"             │
│ Rang 5: 🔒 MASQUÉ - "[CLIENT MASQUÉ]"             │
│                                                      │
│ ✅ Quota respecté: 2 visibles, 3 masqués ◀─ OK!  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Test 3: Premium Illimité

```
┌─────────────────────────────────────────────────────┐
│ TEST 3: Coach premium - Illimité (10 leads)         │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ✅ Coach créé: 123e4567-e89b-12d3-a456-426614174002│
│ ✅ Abonnement premium créé                          │
│ ✅ 10 leads créés                                   │
│                                                      │
│ ── RÉSULTATS ──────────────────────────────────────│
│ Total leads: 10                                      │
│ Leads masqués: 0                                     │
│ Leads visibles: 10                                   │
│                                                      │
│ ✅ Premium voit tous les leads ◀─ OK!              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Test 4: Masquage des Données

```
┌─────────────────────────────────────────────────────┐
│ TEST 4: Vérifier le masquage des données sensibles │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Lead 1:                                              │
│ ✅ Toutes les données sont présentes                │
│    - client_name: "Client 1" ✓                      │
│    - client_email: "client1@example.com" ✓          │
│    - client_phone: "+33612345601" ✓                 │
│                                                      │
│ Lead 2:                                              │
│ ✅ Toutes les données sont présentes                │
│    - client_name: "Client 2" ✓                      │
│    - client_email: "client2@example.com" ✓          │
│    - client_phone: "+33612345602" ✓                 │
│                                                      │
│ Lead 3: 🔒 MASQUÉ                                   │
│ ✅ Toutes les données sensibles sont NULL           │
│    - client_name: NULL ✓                            │
│    - client_email: NULL ✓                           │
│    - client_phone: NULL ✓                           │
│    - goals: NULL ✓                                  │
│    - budget: NULL ✓                                 │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Validation Complète

### Base de Données

- [ ] **RLS activée** sur `coach_leads_masked`
- [ ] **RLS activée** sur `subscription_plans` (avec politique SELECT ALL)
- [ ] **RLS activée** sur `coach_subscription_overrides`
- [ ] Vue `coach_leads_masked` utilise **SECURITY INVOKER** (pas DEFINER)
- [ ] Vue `coaches_current_subscription` utilise **SECURITY INVOKER**
- [ ] Les colonnes sensibles retournent **NULL quand is_locked=true**

### Logique de Quota

- [ ] Lead #1-2 (gratuit) = TOUJOURS visibles
- [ ] Lead #3+ (gratuit) = TOUJOURS masqués
- [ ] Premium = Tous visibles
- [ ] Nouveau mois = Reset du compteur
- [ ] Leads historiques = JAMAIS revenir masqués

### Transitions Subscription

- [ ] Gratuit → Premium = Débloquer tous les leads immédiatement
- [ ] Premium → Gratuit (expiration) = Remasquer les leads dépassant quota
- [ ] max_leads: 2 (gratuit), -1 (premium)

### Frontend

- [ ] Afficher "Upgrade premium" sur leads masqués
- [ ] Compteur quota correct (2/2, 3/2 dépassement, illimité)
- [ ] Leads masqués montrent un message "Débloquez avec premium"
- [ ] Pas d'affichage de données NULL pour les leads masqués

### Sécurité

- [ ] Coach A ne voit PAS les leads de Coach B
- [ ] Données sensibles masquées côté DB (pas côté app)
- [ ] Service role peut administrer les données

---

## 🚀 Comment Lancer les Tests

### Option 1: Tests SQL (Supabase SQL Editor)

```sql
-- Copier-coller le contenu de test-leads-quota-full.sql
-- dans Supabase SQL Editor
-- Exécuter chaque section
```

### Option 2: Tests Programmés (Node.js)

```bash
# Configurer les variables d'env
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Lancer les tests
node test-leads-quota.mjs
```

### Option 3: Tests Manuels (Interface)

1. Créer un coach gratuit
2. Lui assigner 5 leads manuellement
3. Vérifier:
   - Leads 1-2 affichent toutes les données ✅
   - Leads 3-5 affichent un message "floué" ✅
   - Cliquer upgrade → tous les leads deviennent visibles ✅

---

## 📋 Tableau de Vérification Rapide

| Cas                        | Attendu                     | Réel | Status |
| -------------------------- | --------------------------- | ---- | ------ |
| Gratuit 1-2 leads          | Visibles                    | ?    | ⬜     |
| Gratuit 3+ leads           | Masqués                     | ?    | ⬜     |
| Premium tous leads         | Visibles                    | ?    | ⬜     |
| Données sensibles masquées | NULL                        | ?    | ⬜     |
| Historique conservé        | Toujours visible            | ?    | ⬜     |
| Renouvellement mensuel     | Reset quota                 | ?    | ⬜     |
| Upgrade → Premium          | Immédiat                    | ?    | ⬜     |
| Downgrade → Gratuit        | Remasquer                   | ?    | ⬜     |
| RLS correcte               | Coach ne voit que ses leads | ?    | ⬜     |
| Performance acceptable     | < 1s                        | ?    | ⬜     |

---

## 🐛 Bugs Potentiels à Surveiller

| Bug                                           | Symptôme                                          | Comment Tester        |
| --------------------------------------------- | ------------------------------------------------- | --------------------- |
| Leads masqués deviennent visibles après cycle | Lead #3 visible → nouveau mois → devient visible? | Test cycle mensuel    |
| Premium ne déverrouille pas les leads         | Upgrade premium → leads #3+ restent masqués       | Test upgrade          |
| Downgrade ne remasque pas                     | Downgrade → leads #3+ restent visibles            | Test downgrade        |
| RLS bypass                                    | Coach A voit leads de Coach B                     | Tenter accès croisé   |
| Données NULL partiellement                    | client_name=NULL mais email présent               | Test masquage complet |
| Compteur incorrect                            | Affiche 3/2 au lieu de 2/2                        | Vérifier affichage    |

---

## 📈 Résultats Cibles

```
════════════════════════════════════════════════════════════
📊 RÉSULTATS: 4/4 tests réussis
════════════════════════════════════════════════════════════

✅ Test 1: Quota exact (2 leads)
✅ Test 2: Dépassement quota (5 leads)
✅ Test 3: Premium illimité (10 leads)
✅ Test 4: Masquage données sensibles

TOUS LES TESTS RÉUSSIS ✨
```

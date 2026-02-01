// test-leads-quota.mjs
// Tests E2E pour le système de quota de leads
// Usage: node test-leads-quota.mjs

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// =====================================================
// Utilitaires
// =====================================================

const log = {
  test: (name) => console.log(`\n${'═'.repeat(60)}\n📋 ${name}\n${'═'.repeat(60)}`),
  section: (name) => console.log(`\n${'─'.repeat(60)}\n📌 ${name}\n${'─'.repeat(60)}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
  result: (obj) => console.log(JSON.stringify(obj, null, 2)),
}

// =====================================================
// TEST 1: Coach gratuit avec quota exact (2 leads)
// =====================================================

async function testFreeCoachWithinQuota() {
  log.test('TEST 1: Coach gratuit - Quota exact (2 leads)')

  try {
    // Créer un coach gratuit
    const { data: coach, error: coachError } = await supabase
      .from('coaches')
      .insert({
        email: `test.free.quota.exact.${Date.now()}@example.com`,
        first_name: 'Test',
        last_name: 'Quota',
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (coachError) throw coachError
    log.success(`Coach créé: ${coach.id}`)

    // Ajouter 2 leads
    const leads = []
    for (let i = 1; i <= 2; i++) {
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert({
          coach_id: coach.id,
          client_name: `Lead ${i}`,
          client_email: `lead${i}@example.com`,
          client_phone: `+3361234560${i}`,
          is_hidden: false,
          do_not_contact: false,
          is_completed: false,
          current_step: 3,
          status: 'active',
          source: 'marketplace',
          priority: 'medium',
          created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single()

      if (leadError) throw leadError
      leads.push(lead)
    }
    log.success(`${leads.length} leads créés`)

    // Vérifier la vue masquée
    const { data: maskedLeads, error: maskError } = await supabase
      .from('coach_leads_masked')
      .select('*')
      .eq('coach_id', coach.id)

    if (maskError) throw maskError

    log.section('Résultats:')
    maskedLeads.forEach((lead) => {
      const visible = lead.client_name !== null ? '✅ VISIBLE' : '🔒 MASQUÉ'
      log.info(
        `Lead ${lead.distinct_email_rank}: ${visible} - "${lead.client_name}" (locked: ${lead.is_locked})`,
      )
    })

    // Assertions
    const visibleCount = maskedLeads.filter((l) => l.client_name !== null).length
    if (visibleCount === 2) {
      log.success(`✅ Tous les leads sont visibles (2/2)`)
      return { pass: true, coachId: coach.id }
    } else {
      log.error(`❌ Attendu 2 visibles, trouvé ${visibleCount}`)
      return { pass: false, coachId: coach.id }
    }
  } catch (error) {
    log.error(`${error.message}`)
    return { pass: false }
  }
}

// =====================================================
// TEST 2: Coach gratuit avec dépassement (5 leads)
// =====================================================

async function testFreeCoachExceedQuota() {
  log.test('TEST 2: Coach gratuit - Dépassement quota (5 leads)')

  try {
    // Créer un coach gratuit
    const { data: coach, error: coachError } = await supabase
      .from('coaches')
      .insert({
        email: `test.free.exceed.${Date.now()}@example.com`,
        first_name: 'Test',
        last_name: 'Exceed',
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (coachError) throw coachError
    log.success(`Coach créé: ${coach.id}`)

    // Ajouter 5 leads
    for (let i = 1; i <= 5; i++) {
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert({
          coach_id: coach.id,
          client_name: `Lead ${i}`,
          client_email: `lead${i}@example.com`,
          client_phone: `+3361234560${i}`,
          is_hidden: false,
          do_not_contact: false,
          is_completed: false,
          current_step: 3,
          status: 'active',
          source: 'marketplace',
          priority: 'medium',
          created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single()

      if (leadError) throw leadError
    }
    log.success('5 leads créés')

    // Vérifier la vue masquée
    const { data: maskedLeads, error: maskError } = await supabase
      .from('coach_leads_masked')
      .select('*')
      .eq('coach_id', coach.id)
      .order('distinct_email_rank', { ascending: true })

    if (maskError) throw maskError

    log.section('Résultats:')
    maskedLeads.forEach((lead) => {
      const status = lead.is_locked ? '🔒 MASQUÉ' : '✅ VISIBLE'
      const name = lead.client_name || '[CLIENT MASQUÉ]'
      log.info(`Rang ${lead.distinct_email_rank}: ${status} - "${name}"`)
    })

    // Assertions
    const maskedCount = maskedLeads.filter((l) => l.is_locked).length
    const visibleCount = maskedLeads.filter((l) => !l.is_locked).length

    if (visibleCount === 2 && maskedCount === 3) {
      log.success(`✅ Quota respecté: 2 visibles, 3 masqués`)
      return { pass: true, coachId: coach.id }
    } else {
      log.error(`❌ Attendu 2 visibles + 3 masqués, trouvé ${visibleCount} + ${maskedCount}`)
      return { pass: false, coachId: coach.id }
    }
  } catch (error) {
    log.error(`${error.message}`)
    return { pass: false }
  }
}

// =====================================================
// TEST 3: Coach premium - Tous les leads visibles
// =====================================================

async function testPremiumCoachUnlimited() {
  log.test('TEST 3: Coach premium - Illimité (10 leads)')

  try {
    // Créer un coach
    const { data: coach, error: coachError } = await supabase
      .from('coaches')
      .insert({
        email: `test.premium.${Date.now()}@example.com`,
        first_name: 'Test',
        last_name: 'Premium',
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (coachError) throw coachError
    log.success(`Coach créé: ${coach.id}`)

    // Créer une souscription premium
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('plan_type', 'premium')
      .single()

    if (plansError) throw plansError

    const { error: subError } = await supabase.from('subscriptions').insert({
      coach_id: coach.id,
      plan_id: plans.id,
      status: 'active',
      is_active: true,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

    if (subError) throw subError
    log.success('Abonnement premium créé')

    // Ajouter 10 leads
    for (let i = 1; i <= 10; i++) {
      await supabase.from('leads').insert({
        coach_id: coach.id,
        client_name: `Lead ${i}`,
        client_email: `lead${i}@example.com`,
        client_phone: `+3361234560${i}`,
        is_hidden: false,
        do_not_contact: false,
        is_completed: false,
        current_step: 3,
        status: 'active',
        source: 'marketplace',
        priority: 'medium',
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      })
    }
    log.success('10 leads créés')

    // Vérifier la vue masquée
    const { data: maskedLeads, error: maskError } = await supabase
      .from('coach_leads_masked')
      .select('*')
      .eq('coach_id', coach.id)

    if (maskError) throw maskError

    const maskedCount = maskedLeads.filter((l) => l.is_locked).length

    log.section('Résultats:')
    log.info(`Total leads: ${maskedLeads.length}`)
    log.info(`Leads masqués: ${maskedCount}`)
    log.info(`Leads visibles: ${maskedLeads.length - maskedCount}`)

    if (maskedCount === 0) {
      log.success(`✅ Premium voit tous les leads (aucun masqué)`)
      return { pass: true, coachId: coach.id }
    } else {
      log.error(`❌ Premium ne doit avoir aucun lead masqué, trouvé ${maskedCount}`)
      return { pass: false, coachId: coach.id }
    }
  } catch (error) {
    log.error(`${error.message}`)
    return { pass: false }
  }
}

// =====================================================
// TEST 4: Vérifier les données sensibles NULL quand masquées
// =====================================================

async function testDataMasking() {
  log.test('TEST 4: Vérifier le masquage des données sensibles')

  try {
    // Créer un coach gratuit avec 3 leads
    const { data: coach, error: coachError } = await supabase
      .from('coaches')
      .insert({
        email: `test.masking.${Date.now()}@example.com`,
        first_name: 'Test',
        last_name: 'Masking',
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (coachError) throw coachError

    // Ajouter 3 leads
    for (let i = 1; i <= 3; i++) {
      await supabase.from('leads').insert({
        coach_id: coach.id,
        client_name: `Client ${i}`,
        client_email: `client${i}@example.com`,
        client_phone: `+3361234560${i}`,
        is_hidden: false,
        do_not_contact: false,
        is_completed: false,
        current_step: 3,
        status: 'active',
        source: 'marketplace',
        priority: 'medium',
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    // Vérifier la vue masquée
    const { data: maskedLeads, error: maskError } = await supabase
      .from('coach_leads_masked')
      .select('*')
      .eq('coach_id', coach.id)
      .order('distinct_email_rank', { ascending: true })

    if (maskError) throw maskError

    log.section('Vérification du masquage:')
    let allCorrect = true

    maskedLeads.forEach((lead) => {
      const rank = lead.distinct_email_rank
      const shouldBeMasked = rank > 2

      if (shouldBeMasked) {
        const allNull =
          lead.client_name === null &&
          lead.client_email === null &&
          lead.client_phone === null &&
          lead.goals === null &&
          lead.budget === null

        if (allNull) {
          log.success(`Lead ${rank}: ✅ Toutes les données sensibles sont NULL`)
        } else {
          log.error(`Lead ${rank}: ❌ Les données ne sont pas masquées!`)
          allCorrect = false
        }
      } else {
        const allPresent =
          lead.client_name !== null && lead.client_email !== null && lead.client_phone !== null

        if (allPresent) {
          log.success(`Lead ${rank}: ✅ Toutes les données sont présentes`)
        } else {
          log.error(`Lead ${rank}: ❌ Des données manquent!`)
          allCorrect = false
        }
      }
    })

    return { pass: allCorrect, coachId: coach.id }
  } catch (error) {
    log.error(`${error.message}`)
    return { pass: false }
  }
}

// =====================================================
// Main: Exécuter tous les tests
// =====================================================

async function runAllTests() {
  console.log('\n🧪 SUITE DE TESTS - SYSTÈME DE QUOTA DE LEADS\n')

  const results = []

  // Test 1
  const test1 = await testFreeCoachWithinQuota()
  results.push({ test: 'Test 1: Quota exact (2 leads)', pass: test1.pass })

  // Test 2
  const test2 = await testFreeCoachExceedQuota()
  results.push({ test: 'Test 2: Dépassement quota', pass: test2.pass })

  // Test 3
  const test3 = await testPremiumCoachUnlimited()
  results.push({ test: 'Test 3: Premium illimité', pass: test3.pass })

  // Test 4
  const test4 = await testDataMasking()
  results.push({ test: 'Test 4: Masquage données', pass: test4.pass })

  // Résumé
  log.test('RÉSUMÉ DES TESTS')
  console.log('')
  results.forEach((r) => {
    const icon = r.pass ? '✅' : '❌'
    console.log(`${icon} ${r.test}`)
  })

  const passCount = results.filter((r) => r.pass).length
  const totalCount = results.length

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`📊 RÉSULTAT: ${passCount}/${totalCount} tests réussis`)
  console.log(`${'═'.repeat(60)}\n`)

  process.exit(passCount === totalCount ? 0 : 1)
}

// Lancer les tests
runAllTests()

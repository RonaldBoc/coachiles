import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hthdhkyyiymlrlvmpnhy.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0aGRoa3l5aXltbHJsdm1wbmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTA2MjEsImV4cCI6MjA2Nzg2NjYyMX0.BpIr2awtwm4XlJ00ZhcLaKiVOBPBBzymTHZzSFE2Guc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSpecificCoach() {
  try {
    const coachId = '3c8f0bbc-b09a-45a5-8f6d-a4311123912c' // Ronald's coach ID

    console.log('🔍 Testing specific coach with ID:', coachId)

    // Test 1: Get coach from coaches table
    console.log('\n📋 Step 1: Getting coach from coaches table...')
    const { data: coachData, error: coachError } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', coachId)
      .single()

    if (coachError) {
      console.error('❌ Error fetching coach:', coachError)
      return
    }

    console.log('✅ Coach data found:')
    console.log('- ID:', coachData.id)
    console.log('- Name:', coachData.first_name)
    console.log('- Email:', coachData.email)
    console.log('- Hourly Rate:', coachData.hourly_rate)
    console.log('- Is Active:', coachData.is_active)

    // Test 2: Get subscription status
    console.log('\n🔔 Step 2: Getting subscription status...')
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('coaches_current_subscription')
      .select('*')
      .eq('id', coachId)
      .single()

    if (subscriptionError) {
      console.error('❌ Error fetching subscription:', subscriptionError)
      console.log('ℹ️ This might mean the coach has no subscription record (inactive)')
    } else {
      console.log('✅ Subscription data found:')
      console.log('- Has Active Subscription:', subscriptionData.has_active_subscription)
      console.log('- Subscription Type:', subscriptionData.subscription_type)
      console.log('- Status:', subscriptionData.subscription_status)
    }

    // Test 3: Check coaches_current_subscription view structure
    console.log('\n📊 Step 3: Testing view with small sample...')
    const { data: viewSample, error: viewError } = await supabase
      .from('coaches_current_subscription')
      .select('*')
      .limit(3)

    if (viewError) {
      console.error('❌ Error fetching view sample:', viewError)
    } else {
      console.log('✅ Sample subscription data:')
      viewSample?.forEach((sub, index) => {
        console.log(
          `  ${index + 1}. Coach ${sub.id} - Active: ${sub.has_active_subscription} - Type: ${sub.subscription_type}`,
        )
      })
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSpecificCoach()

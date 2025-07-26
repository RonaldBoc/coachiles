import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hthdhkyyiymlrlvmpnhy.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0aGRoa3l5aXltbHJsdm1wbmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTA2MjEsImV4cCI6MjA2Nzg2NjYyMX0.BpIr2awtwm4XlJ00ZhcLaKiVOBPBBzymTHZzSFE2Guc'

const supabase = createClient(supabaseUrl, supabaseKey)

// Reproduce the mapping function from the coach API
function mapSupabaseToCoach(supabaseData) {
  return {
    id: supabaseData.id,
    firstName: supabaseData.first_name,
    lastName: '',
    email: supabaseData.email,
    phone: supabaseData.phone || '',
    photo: supabaseData.avatar_url || '',
    bio: supabaseData.bio || '',
    location: supabaseData.locations?.[0] || 'Martinique',
    specialties: supabaseData.specialties || [],
    certifications: supabaseData.certifications || [],
    experience: supabaseData.experience_years || 0,
    availability: supabaseData.availability?.join(', ') || '',
    rating: supabaseData.rating || 0,
    totalClients: supabaseData.total_sessions || 0,
    subscriptionStatus: 'inactive', // Will be updated
    services: [],
    createdAt: new Date(supabaseData.created_at),
    updatedAt: new Date(supabaseData.updated_at),
    isActive: supabaseData.is_active,
    hourlyRate: supabaseData.hourly_rate || 50,
    languages: supabaseData.languages || ['Français'],
  }
}

async function getSubscriptionStatus(coachId) {
  try {
    const { data } = await supabase
      .from('coaches_current_subscription')
      .select('subscription_type, has_active_subscription')
      .eq('id', coachId)
      .single()

    if (data?.has_active_subscription) {
      return data.subscription_type === 'premium' ? 'active' : 'trial'
    }
    return 'inactive'
  } catch (error) {
    console.error('Error fetching subscription status for coach', coachId, ':', error)
    return 'inactive'
  }
}

async function testCoachAPIFixed() {
  try {
    console.log('🔍 Testing fixed Coach API mapping...')

    const coachId = '3c8f0bbc-b09a-45a5-8f6d-a4311123912c'

    console.log('\n📋 Step 1: Get coach from database...')
    const { data, error } = await supabase.from('coaches').select('*').eq('id', coachId).single()

    if (error) throw error

    console.log('✅ Raw coach data:')
    console.log('- hourly_rate:', data.hourly_rate)
    console.log('- first_name:', data.first_name)

    console.log('\n📋 Step 2: Map to Coach object...')
    const coach = mapSupabaseToCoach(data)

    console.log('✅ Mapped coach object:')
    console.log('- hourlyRate:', coach.hourlyRate)
    console.log('- firstName:', coach.firstName)
    console.log('- subscriptionStatus (before):', coach.subscriptionStatus)

    console.log('\n📋 Step 3: Get subscription status...')
    coach.subscriptionStatus = await getSubscriptionStatus(coachId)

    console.log('✅ Final coach object:')
    console.log('- ID:', coach.id)
    console.log('- Name:', coach.firstName)
    console.log('- Hourly Rate:', coach.hourlyRate, '€')
    console.log('- Subscription Status:', coach.subscriptionStatus)
    console.log('- Languages:', coach.languages)
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testCoachAPIFixed()

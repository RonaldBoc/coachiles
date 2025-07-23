import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://hthdhkyyiymlrlvmpnhy.supabase.co'
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0aGRoa3l5aXltbHJsdm1wbmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTA2MjEsImV4cCI6MjA2Nzg2NjYyMX0.BpIr2awtwm4XlJ00ZhcLaKiVOBPBBzymTHZzSFE2Guc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestCoach() {
  const testCoach = {
    email: 'testcoach@example.com',
    password: 'password123',
    firstName: 'Test Coach',
  }

  try {
    console.log('🔄 Creating test coach account...')

    // Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: testCoach.email,
      password: testCoach.password,
      options: {
        data: {
          first_name: testCoach.firstName,
          user_type: 'coach',
        },
      },
    })

    if (signUpError) {
      console.error('❌ Sign up error:', signUpError)
      return
    }

    console.log('✅ User created:', authData.user?.email)

    // Create coach profile
    const { data: coachData, error: profileError } = await supabase
      .from('coaches')
      .insert({
        email: testCoach.email,
        first_name: testCoach.firstName,
        phone: '+1234567890',
        specialties: ['Fitness', 'Nutrition'],
        is_active: true,
        bio: 'Test coach for development',
        experience_years: 5,
        rating: 4.8,
        total_sessions: 100,
        subscription_type: 'active',
      })
      .select()

    if (profileError) {
      console.error('❌ Profile creation error:', profileError)
      return
    }

    console.log('✅ Coach profile created:', coachData)
    console.log('')
    console.log('🎉 Test coach account created successfully!')
    console.log('📧 Email:', testCoach.email)
    console.log('🔐 Password:', testCoach.password)
    console.log('')
    console.log('You can now use these credentials to test login.')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createTestCoach()

import { supabaseCoachApi } from './src/services/supabaseCoachApi.ts'

async function testCoachAPI() {
  try {
    console.log('🔍 Testing updated Coach API...')

    // Test getting a specific coach by ID
    const coachId = '3c8f0bbc-b09a-45a5-8f6d-a4311123912c'
    console.log('\n📋 Testing getCoachById...')

    const coach = await supabaseCoachApi.getCoachById(coachId)

    console.log('✅ Coach retrieved:')
    console.log('- ID:', coach.id)
    console.log('- Name:', coach.firstName)
    console.log('- Email:', coach.email)
    console.log('- Hourly Rate:', coach.hourlyRate)
    console.log('- Subscription Status:', coach.subscriptionStatus)
    console.log('- Languages:', coach.languages)
    console.log('- Is Active:', coach.isActive)

    // Test getting multiple coaches
    console.log('\n📋 Testing getCoaches...')
    const response = await supabaseCoachApi.getCoaches({ limit: 3 })

    console.log(`✅ ${response.data.length} coaches retrieved:`)
    response.data.forEach((coach, index) => {
      console.log(
        `  ${index + 1}. ${coach.firstName} - Rate: ${coach.hourlyRate}€ - Subscription: ${coach.subscriptionStatus}`,
      )
    })
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testCoachAPI()

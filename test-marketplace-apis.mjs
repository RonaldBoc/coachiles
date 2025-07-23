// Test script for the new marketplace API services
import { supabaseServiceApi, supabaseBookingApi, supabaseReviewApi, supabasePaymentApi } from './src/services/index.js'

async function testMarketplaceAPIs() {
  console.log('🧪 Testing Marketplace API Services...\n')

  try {
    // Test Service API
    console.log('📋 Testing Service API...')
    const services = await supabaseServiceApi.getServices({ limit: 5 })
    console.log(`✅ Retrieved ${services.data.length} services`)
    
    if (services.data.length > 0) {
      const service = services.data[0]
      console.log(`   First service: ${service.name} - €${service.price}`)
    }

    // Test Booking API
    console.log('\n📅 Testing Booking API...')
    const bookings = await supabaseBookingApi.getBookings({ limit: 5 })
    console.log(`✅ Retrieved ${bookings.data.length} bookings`)
    
    if (bookings.data.length > 0) {
      const booking = bookings.data[0]
      console.log(`   First booking: ${booking.clientName} - ${booking.status}`)
    }

    // Test Review API
    console.log('\n⭐ Testing Review API...')
    const reviews = await supabaseReviewApi.getReviews({ limit: 5 })
    console.log(`✅ Retrieved ${reviews.data.length} reviews`)
    
    if (reviews.data.length > 0) {
      const review = reviews.data[0]
      console.log(`   First review: ${review.rating}/5 stars - ${review.comment?.substring(0, 50)}...`)
    }

    // Test Payment API
    console.log('\n💳 Testing Payment API...')
    const payments = await supabasePaymentApi.getPayments({ limit: 5 })
    console.log(`✅ Retrieved ${payments.data.length} payments`)
    
    if (payments.data.length > 0) {
      const payment = payments.data[0]
      console.log(`   First payment: €${payment.amount} - ${payment.status}`)
    }

    // Test database functions
    console.log('\n🔍 Testing database functions...')
    const categories = await supabaseServiceApi.getServiceCategories()
    console.log(`✅ Retrieved ${categories.length} service categories:`, categories.join(', '))

    console.log('\n🎉 All marketplace API tests passed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('This is expected if the database schema has not been applied yet.')
    console.log('\n📖 To set up the database:')
    console.log('1. Copy the contents of database-schema-marketplace.sql')
    console.log('2. Paste it into your Supabase SQL Editor')
    console.log('3. Run the script to create all tables and functions')
    console.log('4. Verify your environment variables are set correctly')
  }
}

// Run the test
testMarketplaceAPIs()
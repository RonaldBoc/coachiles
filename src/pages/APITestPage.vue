<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-8">🧪 API Testing Dashboard</h1>

    <!-- Service API Tests -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">📋 Service API</h2>
      <div class="space-y-4">
        <button
          @click="testServices"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Get Services
        </button>
        <button
          @click="testServiceCategories"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-2"
        >
          Test Service Categories
        </button>
        <div v-if="serviceResults" class="mt-4 p-4 bg-gray-100 rounded">
          <pre class="text-sm">{{ JSON.stringify(serviceResults, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Booking API Tests -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">📅 Booking API</h2>
      <div class="space-y-4">
        <button
          @click="testBookings"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Get Bookings
        </button>
        <div v-if="bookingResults" class="mt-4 p-4 bg-gray-100 rounded">
          <pre class="text-sm">{{ JSON.stringify(bookingResults, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Review API Tests -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">⭐ Review API</h2>
      <div class="space-y-4">
        <button
          @click="testReviews"
          class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Test Get Reviews
        </button>
        <div v-if="reviewResults" class="mt-4 p-4 bg-gray-100 rounded">
          <pre class="text-sm">{{ JSON.stringify(reviewResults, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Payment API Tests -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">💳 Payment API</h2>
      <div class="space-y-4">
        <button
          @click="testPayments"
          class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Test Get Payments
        </button>
        <div v-if="paymentResults" class="mt-4 p-4 bg-gray-100 rounded">
          <pre class="text-sm">{{ JSON.stringify(paymentResults, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{{ error }}</span>
      <div class="mt-2 text-sm">
        <p><strong>💡 Troubleshooting:</strong></p>
        <ul class="list-disc list-inside mt-1">
          <li>Make sure you've applied the database schema from database-schema-marketplace.sql</li>
          <li>Check that your Supabase environment variables are correct</li>
          <li>Verify that Row Level Security policies allow your operations</li>
        </ul>
      </div>
    </div>

    <!-- Database Setup Instructions -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-2">📖 Database Setup Required</h3>
      <p class="mb-3">
        If you're seeing errors, you likely need to set up the marketplace database schema:
      </p>
      <ol class="list-decimal list-inside space-y-1 text-sm">
        <li>Open your Supabase dashboard SQL Editor</li>
        <li>
          Copy the contents of
          <code class="bg-gray-200 px-1 rounded">database-schema-marketplace.sql</code>
        </li>
        <li>Paste and run the script to create all tables and functions</li>
        <li>Refresh this page and test again</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { serviceApi, bookingApi, reviewApi, paymentApi } from '@/services'

const serviceResults = ref<object | null>(null)
const bookingResults = ref<object | null>(null)
const reviewResults = ref<object | null>(null)
const paymentResults = ref<object | null>(null)
const error = ref('')

const clearError = () => {
  error.value = ''
}

const testServices = async () => {
  clearError()
  try {
    console.log('🧪 Testing Service API...')
    const result = await serviceApi.getServices({ limit: 5 })
    serviceResults.value = result
    console.log('✅ Service API test result:', result)
  } catch (err: unknown) {
    console.error('❌ Service API test failed:', err)
    error.value = `Service API: ${err instanceof Error ? err.message : String(err)}`
  }
}

const testServiceCategories = async () => {
  clearError()
  try {
    console.log('🧪 Testing Service Categories...')
    const result = await serviceApi.getServiceCategories()
    serviceResults.value = { categories: result }
    console.log('✅ Service Categories test result:', result)
  } catch (err: unknown) {
    console.error('❌ Service Categories test failed:', err)
    error.value = `Service Categories: ${err instanceof Error ? err.message : String(err)}`
  }
}

const testBookings = async () => {
  clearError()
  try {
    console.log('🧪 Testing Booking API...')
    const result = await bookingApi.getBookings({ limit: 5 })
    bookingResults.value = result
    console.log('✅ Booking API test result:', result)
  } catch (err: unknown) {
    console.error('❌ Booking API test failed:', err)
    error.value = `Booking API: ${err instanceof Error ? err.message : String(err)}`
  }
}

const testReviews = async () => {
  clearError()
  try {
    console.log('🧪 Testing Review API...')
    const result = await reviewApi.getReviews({ limit: 5 })
    reviewResults.value = result
    console.log('✅ Review API test result:', result)
  } catch (err: unknown) {
    console.error('❌ Review API test failed:', err)
    error.value = `Review API: ${err instanceof Error ? err.message : String(err)}`
  }
}

const testPayments = async () => {
  clearError()
  try {
    console.log('🧪 Testing Payment API...')
    const result = await paymentApi.getPayments({ limit: 5 })
    paymentResults.value = result
    console.log('✅ Payment API test result:', result)
  } catch (err: unknown) {
    console.error('❌ Payment API test failed:', err)
    error.value = `Payment API: ${err instanceof Error ? err.message : String(err)}`
  }
}
</script>

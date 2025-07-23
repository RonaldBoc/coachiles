<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Reservations - Debug Version</h1>

        <div class="bg-white shadow rounded-lg p-6">
          <div v-if="loading">
            <p>Loading bookings...</p>
          </div>

          <div v-else-if="error">
            <p class="text-red-600">Error: {{ error }}</p>
          </div>

          <div v-else-if="bookings.length === 0">
            <p class="text-gray-500">No bookings found. This is normal for a new coach account.</p>
            <button
              @click="createTestBooking"
              class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Test Booking
            </button>
          </div>

          <div v-else>
            <p class="text-green-600">Found {{ bookings.length }} bookings</p>
            <div class="mt-4 space-y-4">
              <div v-for="booking in bookings" :key="booking.id" class="border p-4 rounded">
                <h3 class="font-medium">{{ booking.clientName }}</h3>
                <p class="text-gray-600">{{ booking.totalAmount }}€ - {{ booking.status }}</p>
                <p class="text-sm text-gray-500">{{ booking.scheduledAt }}</p>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <h3 class="font-medium mb-2">Debug Info:</h3>
            <div class="text-sm text-gray-600 space-y-1">
              <p>Loading: {{ loading }}</p>
              <p>Error: {{ error || 'None' }}</p>
              <p>Bookings count: {{ bookings.length }}</p>
              <p>Component mounted: {{ mounted }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const bookings = ref<
  Array<{
    id: number
    clientName: string
    totalAmount: number
    status: string
    scheduledAt: string
  }>
>([])
const loading = ref(true)
const error = ref('')
const mounted = ref(false)

const createTestBooking = async () => {
  // Simple test booking creation
  bookings.value.push({
    id: Date.now(),
    clientName: 'Test Client',
    totalAmount: 75,
    status: 'confirmed',
    scheduledAt: new Date().toISOString(),
  })
}

const fetchBookings = async () => {
  try {
    loading.value = true
    error.value = ''

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // For now, just return empty array to test the empty state
    bookings.value = []

    console.log('✅ Debug bookings loaded successfully')
  } catch (err) {
    console.error('❌ Error in debug bookings:', err)
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  mounted.value = true
  console.log('🔧 Debug bookings component mounted')
  await fetchBookings()
})
</script>

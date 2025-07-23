<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Marketplace - Debug Version</h1>

        <div class="bg-white shadow rounded-lg p-6">
          <div v-if="loading">
            <p>Loading services...</p>
          </div>

          <div v-else-if="error">
            <p class="text-red-600">Error: {{ error }}</p>
          </div>

          <div v-else-if="services.length === 0">
            <p class="text-gray-500">No services found. This is normal for a new coach account.</p>
            <button
              @click="createTestService"
              class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Test Service
            </button>
          </div>

          <div v-else>
            <p class="text-green-600">Found {{ services.length }} services</p>
            <div class="mt-4 space-y-4">
              <div v-for="service in services" :key="service.id" class="border p-4 rounded">
                <h3 class="font-medium">{{ service.name }}</h3>
                <p class="text-gray-600">{{ service.price }}€ - {{ service.duration }} min</p>
                <p class="text-sm text-gray-500">{{ service.description }}</p>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <h3 class="font-medium mb-2">Debug Info:</h3>
            <div class="text-sm text-gray-600 space-y-1">
              <p>Loading: {{ loading }}</p>
              <p>Error: {{ error || 'None' }}</p>
              <p>Services count: {{ services.length }}</p>
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

const services = ref<
  Array<{
    id: number
    name: string
    price: number
    duration: number
    description: string
  }>
>([])
const loading = ref(true)
const error = ref('')
const mounted = ref(false)

const createTestService = async () => {
  // Simple test service creation
  services.value.push({
    id: Date.now(),
    name: 'Test Service',
    price: 50,
    duration: 60,
    description: 'This is a test service',
  })
}

const fetchServices = async () => {
  try {
    loading.value = true
    error.value = ''

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // For now, just return empty array to test the empty state
    services.value = []

    console.log('✅ Debug marketplace loaded successfully')
  } catch (err) {
    console.error('❌ Error in debug marketplace:', err)
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  mounted.value = true
  console.log('🔧 Debug marketplace component mounted')
  await fetchServices()
})
</script>

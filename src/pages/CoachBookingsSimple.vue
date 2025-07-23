<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Header Section -->
        <div class="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Mes Réservations</h1>
            <p class="mt-2 text-sm text-gray-700">Gérez vos rendez-vous et suivez vos revenus</p>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg
                    class="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Réservations</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ bookings.length }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg
                    class="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    ></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Revenus Total</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ totalRevenue }}€</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg
                    class="h-6 w-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">En Attente</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ pendingBookings }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg
                    class="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Confirmées</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ confirmedBookings }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex flex-wrap gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Filtrer par statut</label>
                <select
                  v-model="statusFilter"
                  @change="filterBookings"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmé</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                  <option value="no_show">Absent</option>
                </select>
              </div>

              <div class="flex items-end">
                <button
                  @click="resetFilters"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bookings List -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="error" class="text-center py-12">
          <div class="text-red-600">{{ error }}</div>
          <button @click="fetchBookings" class="mt-4 text-blue-600 hover:text-blue-800">
            Réessayer
          </button>
        </div>

        <div v-else-if="filteredBookings.length === 0" class="text-center py-12">
          <div
            class="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4"
          >
            <svg
              class="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune réservation</h3>
          <p class="text-gray-500">Vos futures réservations apparaîtront ici</p>
        </div>

        <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul class="divide-y divide-gray-200">
            <li v-for="booking in filteredBookings" :key="booking.id">
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div
                        class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center"
                      >
                        <span class="text-sm font-medium text-gray-700">
                          {{ booking.clientName.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ booking.clientName }}</div>
                      <div class="text-sm text-gray-500">{{ booking.clientEmail }}</div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-4">
                    <div class="text-right">
                      <div class="text-sm font-medium text-gray-900">
                        {{ booking.totalAmount }}€
                      </div>
                      <div class="text-sm text-gray-500">{{ formatDate(booking.scheduledAt) }}</div>
                    </div>
                    <span
                      :class="getStatusClass(booking.status)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ getStatusLabel(booking.status) }}
                    </span>
                    <div class="flex space-x-2">
                      <button
                        v-if="booking.status === 'pending'"
                        @click="updateBookingStatus(booking, 'confirmed')"
                        class="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Confirmer
                      </button>
                      <button
                        v-if="['pending', 'confirmed'].includes(booking.status)"
                        @click="updateBookingStatus(booking, 'cancelled')"
                        class="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Annuler
                      </button>
                      <button
                        v-if="booking.status === 'confirmed'"
                        @click="updateBookingStatus(booking, 'completed')"
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Terminer
                      </button>
                    </div>
                  </div>
                </div>
                <div v-if="booking.notes" class="mt-2">
                  <p class="text-sm text-gray-600">{{ booking.notes }}</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Types
interface Booking {
  id: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  scheduledAt: string
  durationMinutes: number
  totalAmount: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  serviceId: string
  coachId: string
}

// State
const bookings = ref<Booking[]>([])
const loading = ref(true)
const error = ref('')
const statusFilter = ref('')

// Computed
const filteredBookings = computed(() => {
  if (!statusFilter.value) {
    return bookings.value
  }
  return bookings.value.filter((booking) => booking.status === statusFilter.value)
})

const totalRevenue = computed(() => {
  return bookings.value
    .filter((b) => ['confirmed', 'completed'].includes(b.status))
    .reduce((sum, booking) => sum + booking.totalAmount, 0)
})

const pendingBookings = computed(() => {
  return bookings.value.filter((b) => b.status === 'pending').length
})

const confirmedBookings = computed(() => {
  return bookings.value.filter((b) => b.status === 'confirmed').length
})

// Methods
const fetchBookings = async () => {
  try {
    loading.value = true
    error.value = ''

    // Simulate API call for now
    await new Promise((resolve) => setTimeout(resolve, 500))

    // For now, return empty array - in real implementation this would call the API
    bookings.value = []

    console.log('✅ Bookings loaded')
  } catch (err) {
    console.error('❌ Error fetching bookings:', err)
    error.value = 'Erreur lors du chargement des réservations'
  } finally {
    loading.value = false
  }
}

const updateBookingStatus = async (booking: Booking, newStatus: Booking['status']) => {
  try {
    booking.status = newStatus
    console.log('✅ Booking status updated')
  } catch (err) {
    console.error('❌ Error updating booking:', err)
    error.value = 'Erreur lors de la mise à jour'
  }
}

const filterBookings = () => {
  // Filtering is handled by computed property
}

const resetFilters = () => {
  statusFilter.value = ''
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusClass = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800',
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
    no_show: 'Absent',
  }
  return labels[status as keyof typeof labels] || status
}

onMounted(() => {
  fetchBookings()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Services de Coaching</h1>
            <p class="mt-1 text-sm text-gray-500">
              Découvrez nos coachs certifiés et leurs services personnalisés
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filters -->
      <div class="bg-white p-6 rounded-lg shadow mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Filtres</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              id="category"
              v-model="filters.category"
              @change="applyFilters"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Toutes les catégories</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <div>
            <label for="locationType" class="block text-sm font-medium text-gray-700 mb-1">
              Type de lieu
            </label>
            <select
              id="locationType"
              v-model="filters.locationType"
              @change="applyFilters"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="online">En ligne</option>
              <option value="in-person">Présentiel</option>
              <option value="both">Hybride</option>
            </select>
          </div>

          <div>
            <label for="maxPrice" class="block text-sm font-medium text-gray-700 mb-1">
              Prix maximum (€)
            </label>
            <input
              id="maxPrice"
              v-model.number="filters.maxPrice"
              @input="applyFilters"
              type="number"
              min="0"
              step="10"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="150"
            />
          </div>

          <div>
            <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
              Recherche
            </label>
            <input
              id="search"
              v-model="filters.search"
              @input="applyFilters"
              type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="coaching, stress..."
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="text-red-800">{{ error }}</div>
      </div>

      <!-- Services Grid -->
      <div
        v-else-if="services.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="service in services"
          :key="service.id"
          class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
        >
          <!-- Service Header -->
          <div class="p-6">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ service.name }}</h3>
                <p class="text-sm text-blue-600 font-medium">{{ service.category }}</p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-gray-900">{{ formatPrice(service.price) }}</p>
                <p class="text-xs text-gray-500">{{ service.durationMinutes }}min</p>
              </div>
            </div>

            <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ service.description }}</p>

            <!-- Service Details -->
            <div class="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-4">
              <div class="flex items-center">
                <MapPinIcon class="w-3 h-3 mr-1" />
                {{ formatLocationType(service.locationType) }}
              </div>
              <div class="flex items-center">
                <UsersIcon class="w-3 h-3 mr-1" />
                {{ formatGroupSize(service.groupSize) }}
              </div>
              <div class="flex items-center">
                <ClockIcon class="w-3 h-3 mr-1" />
                {{ service.durationMinutes }} minutes
              </div>
              <div class="flex items-center">
                <CalendarIcon class="w-3 h-3 mr-1" />
                {{ service.advanceBookingHours }}h à l'avance
              </div>
            </div>

            <!-- Tags -->
            <div v-if="service.tags.length > 0" class="mb-4">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="tag in service.tags.slice(0, 3)"
                  :key="tag"
                  class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {{ tag }}
                </span>
                <span
                  v-if="service.tags.length > 3"
                  class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                >
                  +{{ service.tags.length - 3 }}
                </span>
              </div>
            </div>

            <!-- Coach Info (if we had coach data) -->
            <div class="border-t pt-4">
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500">
                  Coach: <span class="font-medium text-gray-900">{{ service.coachId }}</span>
                </div>
                <div class="flex items-center text-yellow-400">
                  <StarIcon class="w-4 h-4 fill-current" />
                  <span class="text-sm text-gray-600 ml-1">4.8</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <div class="bg-gray-50 px-6 py-4">
            <button
              @click="bookService(service)"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Réserver ce service
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div
          class="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4"
        >
          <MagnifyingGlassIcon class="w-12 h-12 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun service trouvé</h3>
        <p class="text-gray-500">Essayez de modifier vos critères de recherche</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <nav class="flex items-center space-x-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          <span
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-md cursor-pointer',
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50',
            ]"
          >
            {{ page }}
          </span>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </nav>
      </div>
    </div>

    <!-- Booking Modal (placeholder) -->
    <BookingModal
      v-if="showBookingModal"
      :service="selectedService"
      @close="closeBookingModal"
      @booked="handleBookingConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  MapPinIcon,
  UsersIcon,
  ClockIcon,
  CalendarIcon,
  StarIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline'
import { serviceApi } from '@/services'
import BookingModal from '@/components/BookingModal.vue'
import type { Service, ServiceFilters } from '@/types'

const services = ref<Service[]>([])
const loading = ref(true)
const error = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalServices = ref(0)
const pageSize = 12

const showBookingModal = ref(false)
const selectedService = ref<Service | null>(null)

const filters = ref<ServiceFilters>({
  category: '',
  locationType: undefined,
  maxPrice: undefined,
  search: '',
})

const categories = ref<string[]>([])

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const fetchServices = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await serviceApi.getServices({
      page: currentPage.value,
      limit: pageSize,
      ...filters.value,
    })

    services.value = response.data
    totalServices.value = response.total
    totalPages.value = Math.ceil(response.total / pageSize)
  } catch (err) {
    console.error('Error fetching services:', err)
    error.value = 'Erreur lors du chargement des services'
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const cats = await serviceApi.getServiceCategories()
    categories.value = cats
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

const applyFilters = () => {
  currentPage.value = 1
  fetchServices()
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchServices()
  }
}

const bookService = (service: Service) => {
  selectedService.value = service
  showBookingModal.value = true
}

const closeBookingModal = () => {
  showBookingModal.value = false
  selectedService.value = null
}

const handleBookingConfirmed = () => {
  closeBookingModal()
  // Could show success message or redirect
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

const formatLocationType = (type: Service['locationType']) => {
  const types: Record<Service['locationType'], string> = {
    online: 'En ligne',
    'in-person': 'Présentiel',
    both: 'Hybride',
  }
  return types[type]
}

const formatGroupSize = (size: Service['groupSize']) => {
  const sizes: Record<Service['groupSize'], string> = {
    individual: 'Individuel',
    small_group: 'Petit groupe',
    large_group: 'Grand groupe',
  }
  return sizes[size]
}

onMounted(() => {
  fetchServices()
  fetchCategories()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

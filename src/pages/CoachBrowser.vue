<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <!-- Logo -->
          <div class="flex items-center">
            <h1
              class="text-3xl font-black text-transparent bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text"
            >
              Coachiles
            </h1>
          </div>
          <!-- Become Coach Button -->
          <router-link
            to="/auth"
            class="bg-gradient-to-r from-orange-500 to-blue-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Espace Coach
          </router-link>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Main Title -->
      <div class="text-center mb-12">
        <h1 class="text-6xl md:text-7xl font-black text-gray-900 mb-4 tracking-tight">
          Trouvez le coach
          <span class="text-transparent bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text">
            parfait
          </span>
        </h1>
        <p class="text-xl text-gray-600 font-medium">
          Atteignez vos objectifs avec les meilleurs coachs de Martinique
        </p>
      </div>

      <!-- Search Bar -->
      <div class="max-w-2xl mx-auto mb-12">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <svg
              v-if="!isLoading"
              class="h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <!-- Loading spinner when searching -->
            <svg
              v-else
              class="animate-spin h-6 w-6 text-orange-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Recherchez par nom, spécialité, ou ville..."
            class="w-full pl-14 pr-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400 bg-white shadow-lg placeholder-gray-400 font-medium"
          />
        </div>
      </div>

      <!-- Category Stickers Bar -->
      <div class="mb-16">
        <div class="overflow-x-auto scrollbar-hide">
          <div class="flex space-x-4 pb-4 w-max min-w-full pt-4">
            <button
              @click="selectedSpecialty = ''"
              :class="[
                'flex-shrink-0 px-6 py-3 rounded-full font-bold text-sm transition-all duration-200 transform hover:scale-105',
                selectedSpecialty === ''
                  ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300',
              ]"
            >
              🎯 Tous
            </button>
            <button
              v-for="specialty in coachCategories"
              :key="specialty.name"
              @click="selectedSpecialty = specialty.name"
              :class="[
                'flex-shrink-0 px-6 py-3 rounded-full font-bold text-sm transition-all duration-200 transform hover:scale-105 whitespace-nowrap',
                selectedSpecialty === specialty.name
                  ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300',
              ]"
            >
              {{ specialty.emoji }} {{ specialty.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Results Count -->
      <div class="flex justify-between items-center mb-8">
        <p class="text-lg text-gray-600 font-medium">
          <template v-if="isLoading && coaches.length === 0">
            <span class="animate-pulse bg-gray-200 rounded w-40 h-6 inline-block"></span>
          </template>
          <template v-else>
            {{ filteredCoaches.length }} coach{{ filteredCoaches.length > 1 ? 'es' : '' }}
            {{ selectedSpecialty ? `en ${selectedSpecialty}` : 'disponibles' }}
          </template>
        </p>
        <div class="flex items-center space-x-3">
          <span class="text-sm text-gray-500 font-medium">Trier par:</span>
          <select
            v-model="sortBy"
            class="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
          >
            <option value="rating">⭐ Note</option>
            <option value="experience">🎯 Expérience</option>
            <option value="name">📝 Nom</option>
          </select>
        </div>
      </div>

      <!-- Coach Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Loading skeleton cards -->
        <template v-if="isLoading && coaches.length === 0">
          <div
            v-for="n in 9"
            :key="'skeleton-' + n"
            class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
          >
            <div class="animate-pulse">
              <!-- Photo skeleton -->
              <div
                class="aspect-square bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 shimmer"
              ></div>
              <!-- Content skeleton -->
              <div class="p-5">
                <!-- Rating skeleton -->
                <div class="flex items-center mb-3">
                  <div class="flex items-center space-x-1">
                    <div class="w-4 h-4 bg-gray-200 rounded shimmer"></div>
                    <div class="h-3 bg-gray-200 rounded w-8 shimmer"></div>
                  </div>
                  <div class="mx-2 w-1 h-1 bg-gray-200 rounded-full"></div>
                  <div class="h-3 bg-gray-200 rounded w-16 shimmer"></div>
                </div>
                <!-- Description skeleton -->
                <div class="mb-4">
                  <div class="h-3 bg-gray-200 rounded w-full mb-2 shimmer"></div>
                  <div class="h-3 bg-gray-200 rounded w-4/5 shimmer"></div>
                </div>
                <!-- Specialties skeleton -->
                <div class="mb-4 flex gap-1">
                  <div class="h-6 bg-gray-200 rounded-full w-20 shimmer"></div>
                  <div class="h-6 bg-gray-200 rounded-full w-16 shimmer"></div>
                </div>
                <!-- Price and button skeleton -->
                <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                  <div>
                    <div class="h-5 bg-gray-200 rounded w-12 mb-1 shimmer"></div>
                    <div class="h-3 bg-gray-200 rounded w-16 shimmer"></div>
                  </div>
                  <div class="h-8 bg-gray-200 rounded-full w-20 shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Coach cards -->
        <template v-if="coaches.length > 0">
          <div
            v-for="coach in filteredCoaches"
            :key="coach.id"
            class="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-102 group border border-transparent hover:border-orange-200"
            @click="navigateToCoachProfile(coach)"
          >
            <!-- Photo with overlay -->
            <div class="relative aspect-square overflow-hidden rounded-t-2xl">
              <img
                :src="coach.photo || '/default-avatar.png'"
                :alt="`${coach.firstName}`"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <!-- Dark gradient overlay -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
              ></div>

              <!-- Coach name and location overlay -->
              <div class="absolute bottom-4 right-4 text-right">
                <h3
                  class="text-lg font-bold text-white drop-shadow-lg group-hover:text-orange-200 transition-colors duration-300"
                >
                  {{ coach.firstName }}
                </h3>
                <p class="text-sm text-white/90 drop-shadow-md">{{ coach.location }}</p>
              </div>

              <!-- Availability badge -->
              <div class="absolute top-4 left-4">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  Disponible
                </span>
              </div>
            </div>

            <!-- Card content -->
            <div class="p-5">
              <!-- Rating and reviews -->
              <div class="flex items-center mb-3">
                <div class="flex items-center">
                  <StarIcon class="w-4 h-4 text-yellow-400 fill-current" />
                  <span class="ml-1 text-sm font-semibold text-gray-900">{{ coach.rating }}</span>
                </div>
                <span class="mx-2 text-gray-300">•</span>
                <span class="text-sm text-gray-600">{{ coach.totalClients }} avis</span>
              </div>

              <!-- Description -->
              <div class="mb-4">
                <p class="text-sm text-gray-700 line-clamp-2 leading-relaxed">{{ coach.bio }}</p>
              </div>

              <!-- Specialties -->
              <div class="mb-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="specialty in coach.specialties.slice(0, 2)"
                    :key="specialty"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                  >
                    {{ specialty }}
                  </span>
                  <span
                    v-if="coach.specialties.length > 2"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                  >
                    +{{ coach.specialties.length - 2 }}
                  </span>
                </div>
              </div>

              <!-- Price and contact -->
              <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                <div class="text-left">
                  <p class="text-lg font-bold text-gray-900">{{ getCoachPrice(coach) }}€</p>
                  <p class="text-xs text-gray-500">par séance</p>
                </div>
                <button
                  @click.stop="requestCoach(coach)"
                  class="bg-white border-2 border-orange-400 text-orange-600 px-4 py-2 rounded-full font-medium hover:bg-orange-50 hover:border-orange-500 hover:text-orange-700 transition-all duration-200 text-sm"
                >
                  Contacter
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore && coaches.length > 0" class="text-center mt-12">
        <button
          @click="loadMoreCoaches"
          :disabled="isLoading"
          class="bg-gradient-to-r from-orange-500 to-blue-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span v-if="isLoading" class="flex items-center">
            <svg
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Chargement...
          </span>
          <span v-else>Voir plus de coachs</span>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="filteredCoaches.length === 0 && !isLoading" class="text-center py-12">
        <p class="text-gray-500">Aucun coach trouvé avec ces critères.</p>
        <button @click="clearFilters" class="mt-4 text-indigo-600 hover:text-indigo-800 text-sm">
          Effacer les filtres
        </button>
      </div>
    </div>

    <!-- Request Modal -->
    <RequestModal
      v-if="showRequestModal"
      :selectedCoach="selectedCoachForRequest"
      @close="showRequestModal = false"
      @submit="submitRequest"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { StarIcon } from '@heroicons/vue/24/solid'
import type { Coach } from '@/types/coach'
import type { ClientRequest } from '@/types/Lead'
import RequestModal from '@/components/RequestModal.vue'
import { useCoachStore } from '@/stores/coach'

// Router
const router = useRouter()

// Coach Store
const coachStore = useCoachStore()

// State
const coaches = ref<Coach[]>([])
const searchQuery = ref('')
const selectedSpecialty = ref('')
const sortBy = ref('rating')
const showRequestModal = ref(false)
const selectedCoachForRequest = ref<Coach | null>(null)
const isLoading = ref(false)
const searchDebounceTimer = ref<number | null>(null)

// Pagination for database approach
const currentPage = ref(1)
const pageSize = ref(12)
const totalCoaches = ref(0)
const hasMore = ref(true)

// Coach categories with emojis
const coachCategories = [
  { name: 'Fitness', emoji: '💪' },
  { name: 'Musculation', emoji: '🏋️' },
  { name: 'Yoga', emoji: '🧘' },
  { name: 'Méditation', emoji: '🧠' },
  { name: 'Nutrition', emoji: '🥗' },
  { name: 'Perte de poids', emoji: '⚖️' },
  { name: 'Remise en forme', emoji: '🎯' },
  { name: 'Relaxation', emoji: '😌' },
  { name: 'Bien-être', emoji: '✨' },
  { name: 'Course à pied', emoji: '🏃' },
  { name: 'Préparation physique', emoji: '🏆' },
]
// Helper function to get coach pricing
const getCoachPrice = (coach: Coach): number => {
  // Base price calculation based on experience and rating
  const basePrice = 35 // Base price in euros
  const experienceMultiplier = Math.min(coach.experience * 2, 20) // Max 20€ bonus for experience
  const ratingBonus = (coach.rating - 4.0) * 10 // Rating bonus
  const specialtyBonus = coach.specialties.some((s) =>
    ['Nutrition', 'Préparation physique', 'Powerlifting', 'Tennis'].includes(s),
  )
    ? 10
    : 0 // Premium specialties

  return Math.round(basePrice + experienceMultiplier + ratingBonus + specialtyBonus)
}

// Computed - simply return coaches from store (filtering is done on server)
const filteredCoaches = computed(() => {
  return coaches.value
})

// Search coaches using the coach store (which uses Supabase)
const searchCoaches = async (query: string, specialty: string, sort: string, page: number = 1) => {
  console.log('🔍 searchCoaches called with:', { query, specialty, sort, page })
  isLoading.value = true

  try {
    console.log('🔍 Searching coaches with:', { query, specialty, sort, page })

    // Prepare filters object
    const filters: {
      page: number
      limit: number
      search?: string
      specialties?: string[]
    } = {
      page,
      limit: pageSize.value,
    }

    // Add search query if provided
    if (query && query.trim()) {
      filters.search = query.trim()
      console.log('🔍 Added search filter:', filters.search)
    }

    // Add specialty filter if selected
    if (specialty) {
      filters.specialties = [specialty]
      console.log('🔍 Added specialty filter:', filters.specialties)
    }

    console.log('📡 Calling coachStore.fetchCoaches with filters:', filters)

    // Fetch coaches using the store
    await coachStore.fetchCoaches(filters)

    console.log('📡 Store state after fetch:', {
      coaches: coachStore.coaches.length,
      total: coachStore.total,
      loading: coachStore.loading,
      error: coachStore.error,
    })

    // Update local state from store
    if (page === 1) {
      coaches.value = coachStore.coaches
    } else {
      coaches.value = [...coaches.value, ...coachStore.coaches]
    }

    totalCoaches.value = coachStore.total
    hasMore.value = coachStore.coaches.length === pageSize.value // Has more if we got a full page
    currentPage.value = page

    console.log('✅ Search completed:', {
      totalResults: coaches.value.length,
      hasMore: hasMore.value,
      localCoaches: coaches.value,
    })
  } catch (error) {
    console.error('❌ Search error:', error)
    // Handle error - could show a toast notification here
  } finally {
    isLoading.value = false
  }
}

// Debounced search function
const debouncedSearch = (query: string, specialty: string, sort: string) => {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }

  searchDebounceTimer.value = window.setTimeout(() => {
    searchCoaches(query, specialty, sort, 1)
  }, 300) // 300ms delay
}

// Load more coaches for pagination
const loadMoreCoaches = () => {
  if (hasMore.value && !isLoading.value) {
    searchCoaches(searchQuery.value, selectedSpecialty.value, sortBy.value, currentPage.value + 1)
  }
}

// Methods
const navigateToCoachProfile = (coach: Coach) => {
  // Navigate to coach profile page using first name (lowercase for URL)
  const firstName = coach.firstName.toLowerCase()
  router.push(`/coach/${firstName}`)
}

const requestCoach = (coach: Coach) => {
  selectedCoachForRequest.value = coach
  showRequestModal.value = true
}

const submitRequest = (requestData: Partial<ClientRequest>) => {
  // Handle request submission
  console.log('Request submitted:', requestData)
  showRequestModal.value = false
  selectedCoachForRequest.value = null
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedSpecialty.value = ''
}

// Watchers
watch([searchQuery, selectedSpecialty, sortBy], ([query, specialty, sort]) => {
  debouncedSearch(query, specialty, sort)
})

// Lifecycle
onMounted(async () => {
  console.log('🏗️ CoachBrowser: Component mounted, loading coaches...')
  console.log('🔧 Current state:', {
    searchQuery: searchQuery.value,
    selectedSpecialty: selectedSpecialty.value,
    sortBy: sortBy.value,
  })

  // Initialize with the first load of coaches
  await searchCoaches(searchQuery.value, selectedSpecialty.value, sortBy.value, 1)
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Custom font for coach energy */
h1 {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-weight: 900;
  letter-spacing: -0.025em;
}

/* Hover scale effect */
.hover\:scale-102:hover {
  transform: scale(1.02);
}

/* Aspect ratio for square images */
.aspect-square {
  aspect-ratio: 1 / 1;
}

/* Text shadow for better readability on images */
.drop-shadow-lg {
  filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));
}

.drop-shadow-md {
  filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));
}

/* Shimmer animation for skeleton loading */
.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>

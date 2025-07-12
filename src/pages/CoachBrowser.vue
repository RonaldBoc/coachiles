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
          <button
            class="bg-gradient-to-r from-orange-500 to-blue-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Espace Coach
          </button>
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
          {{ filteredCoaches.length }} coach{{ filteredCoaches.length > 1 ? 'es' : '' }}
          {{ selectedSpecialty ? `en ${selectedSpecialty}` : 'disponibles' }}
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
            v-for="n in 6"
            :key="'skeleton-' + n"
            class="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <div class="animate-pulse">
              <!-- Photo skeleton -->
              <div class="aspect-square bg-gray-200"></div>
              <!-- Content skeleton -->
              <div class="p-4">
                <div class="flex items-center mb-2">
                  <div class="flex items-center space-x-1">
                    <div class="w-4 h-4 bg-gray-200 rounded"></div>
                    <div class="h-3 bg-gray-200 rounded w-8"></div>
                  </div>
                  <div class="mx-2 w-1 h-1 bg-gray-200 rounded-full"></div>
                  <div class="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div class="mb-3">
                  <div class="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div class="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div class="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        </template>

        <!-- Coach cards -->
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
              :alt="`${coach.firstName} ${coach.lastName}`"
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
                {{ coach.firstName }} {{ coach.lastName }}
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

// Router
const router = useRouter()

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

// Mock data for development
const mockCoaches: Coach[] = [
  {
    id: '1',
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie@example.com',
    phone: '0596123456',
    photo:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop&crop=face',
    bio: 'Coach fitness spécialisée dans la remise en forme et la perte de poids. Passionnée par le sport depuis 10 ans.',
    location: 'Fort-de-France',
    specialties: ['Fitness', 'Musculation', 'Perte de poids', 'Remise en forme'],
    certifications: ['BPJEPS', 'CQP Fitness'],
    experience: 5,
    availability: 'Lun-Ven 9h-18h',
    rating: 4.8,
    totalClients: 45,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '2',
    firstName: 'Pierre',
    lastName: 'Martin',
    email: 'pierre@example.com',
    phone: '0596234567',
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=face',
    bio: 'Coach yoga et méditation. Formé en Inde, je vous accompagne vers un bien-être physique et mental.',
    location: 'Schoelcher',
    specialties: ['Yoga', 'Méditation', 'Relaxation', 'Bien-être'],
    certifications: ['RYT 200', 'Instructeur Méditation'],
    experience: 8,
    availability: 'Lun-Sam 8h-20h',
    rating: 4.9,
    totalClients: 67,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '3',
    firstName: 'Sophie',
    lastName: 'Laurent',
    email: 'sophie@example.com',
    phone: '0596345678',
    photo:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop&crop=face',
    bio: 'Nutritionniste et coach bien-être. Je vous accompagne vers une alimentation saine et équilibrée.',
    location: 'Le Lamentin',
    specialties: ['Nutrition', 'Bien-être', 'Perte de poids'],
    certifications: ['Diplôme de Nutritionniste', 'Formation Coach Bien-être'],
    experience: 6,
    availability: 'Mar-Sam 10h-19h',
    rating: 4.7,
    totalClients: 38,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '4',
    firstName: 'Alexandre',
    lastName: 'Rousseau',
    email: 'alex@example.com',
    phone: '0596456789',
    photo:
      'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=600&h=600&fit=crop&crop=face',
    bio: 'Coach en course à pied et préparation physique. Ancien athlète, je vous aide à dépasser vos limites.',
    location: 'Saint-Pierre',
    specialties: ['Course à pied', 'Préparation physique', 'Remise en forme'],
    certifications: ['Entraîneur Athlétisme', 'BEES'],
    experience: 12,
    availability: 'Lun-Ven 6h-12h, 16h-20h',
    rating: 4.9,
    totalClients: 89,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '5',
    firstName: 'Camille',
    lastName: 'Bernard',
    email: 'camille@example.com',
    phone: '0596567890',
    photo:
      'https://images.unsplash.com/photo-1594736797933-d0f31ba2fe65?w=600&h=600&fit=crop&crop=face',
    bio: 'Spécialiste en relaxation et gestion du stress. Techniques de respiration et méditation guidée.',
    location: 'Le Robert',
    specialties: ['Relaxation', 'Méditation', 'Bien-être'],
    certifications: ['Sophrologue', 'Instructeur Méditation'],
    experience: 4,
    availability: 'Lun-Ven 14h-20h',
    rating: 4.6,
    totalClients: 32,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '6',
    firstName: 'David',
    lastName: 'Moreau',
    email: 'david@example.com',
    phone: '0596678901',
    photo:
      'https://images.unsplash.com/photo-1583468982228-19f19164aee2?w=600&h=600&fit=crop&crop=face',
    bio: "Coach musculation et force athlétique. 15 ans d'expérience dans la préparation physique.",
    location: 'Fort-de-France',
    specialties: ['Musculation', 'Préparation physique'],
    certifications: ['BPJEPS', 'Haltérophilie'],
    experience: 15,
    availability: 'Lun-Sam 8h-22h',
    rating: 4.8,
    totalClients: 156,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '7',
    firstName: 'Isabelle',
    lastName: 'Petit',
    email: 'isabelle@example.com',
    phone: '0596789012',
    photo: 'https://ui-avatars.com/api/?name=Isabelle+Petit&background=f59e0b&color=fff&size=128',
    bio: 'Coach fitness pour seniors. Programme adapté aux besoins spécifiques des personnes âgées.',
    location: 'Trinité',
    specialties: ['Fitness', 'Remise en forme'],
    certifications: ['Sport Santé Senior', 'BPJEPS'],
    experience: 9,
    availability: 'Lun-Ven 9h-17h',
    rating: 4.7,
    totalClients: 43,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '8',
    firstName: 'Thomas',
    lastName: 'Garcia',
    email: 'thomas@example.com',
    phone: '0596890123',
    photo: 'https://ui-avatars.com/api/?name=Thomas+Garcia&background=059669&color=fff&size=128',
    bio: 'Coach aquafitness et natation. Spécialiste des sports aquatiques et rééducation en piscine.',
    location: 'Le François',
    specialties: ['Fitness', 'Remise en forme'],
    certifications: ['MNS', 'Aquafitness'],
    experience: 7,
    availability: 'Mar-Dim 10h-18h',
    rating: 4.5,
    totalClients: 52,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '9',
    firstName: 'Nathalie',
    lastName: 'Durand',
    email: 'nathalie@example.com',
    phone: '0596901234',
    photo: 'https://ui-avatars.com/api/?name=Nathalie+Durand&background=be185d&color=fff&size=128',
    bio: "Coach pilates et yoga. Méthodes douces pour renforcer le corps et l'esprit en harmonie.",
    location: 'Sainte-Anne',
    specialties: ['Yoga', 'Relaxation', 'Bien-être'],
    certifications: ['Instructeur Pilates', 'RYT 500'],
    experience: 6,
    availability: 'Lun-Ven 7h-19h',
    rating: 4.8,
    totalClients: 78,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '10',
    firstName: 'Julien',
    lastName: 'Roux',
    email: 'julien@example.com',
    phone: '0596012345',
    photo: 'https://ui-avatars.com/api/?name=Julien+Roux&background=7c2d12&color=fff&size=128',
    bio: 'Coach crossfit et fonctionnel. Entraînements intensifs pour développer force et endurance.',
    location: 'Ducos',
    specialties: ['Fitness', 'Musculation', 'Préparation physique'],
    certifications: ['CrossFit Level 2', 'BPJEPS'],
    experience: 8,
    availability: 'Lun-Sam 6h-21h',
    rating: 4.9,
    totalClients: 94,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '11',
    firstName: 'Émilie',
    lastName: 'Leroy',
    email: 'emilie@example.com',
    phone: '0596123450',
    photo: 'https://ui-avatars.com/api/?name=Emilie+Leroy&background=2563eb&color=fff&size=128',
    bio: 'Coach en rééducation fonctionnelle. Spécialisée dans la récupération après blessure.',
    location: 'Case-Pilote',
    specialties: ['Remise en forme', 'Préparation physique'],
    certifications: ['Kinésithérapeute', 'Sport Santé'],
    experience: 11,
    availability: 'Lun-Ven 8h-18h',
    rating: 4.7,
    totalClients: 65,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '12',
    firstName: 'Antoine',
    lastName: 'Blanc',
    email: 'antoine@example.com',
    phone: '0596234561',
    photo: 'https://ui-avatars.com/api/?name=Antoine+Blanc&background=059669&color=fff&size=128',
    bio: 'Coach personnel et nutrition sportive. Programmes sur-mesure pour athlètes et sportifs.',
    location: 'Le Marin',
    specialties: ['Nutrition', 'Préparation physique', 'Musculation'],
    certifications: ['Coach Sportif', 'Nutrition Sport'],
    experience: 10,
    availability: 'Lun-Sam 7h-20h',
    rating: 4.8,
    totalClients: 87,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '13',
    firstName: 'Céline',
    lastName: 'Moreau',
    email: 'celine@example.com',
    phone: '0596345672',
    photo: 'https://ui-avatars.com/api/?name=Celine+Moreau&background=7c3aed&color=fff&size=128',
    bio: 'Coach en danse fitness et zumba. Mélange parfait entre fitness et plaisir de danser.',
    location: 'Rivière-Pilote',
    specialties: ['Fitness', 'Bien-être'],
    certifications: ['Zumba Instructor', 'Danse Fitness'],
    experience: 5,
    availability: 'Lun-Ven 18h-21h, Sam 10h-16h',
    rating: 4.6,
    totalClients: 41,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '14',
    firstName: 'Maxime',
    lastName: 'Vincent',
    email: 'maxime@example.com',
    phone: '0596456783',
    photo: 'https://ui-avatars.com/api/?name=Maxime+Vincent&background=dc2626&color=fff&size=128',
    bio: 'Coach en sports de combat et self-défense. Techniques de boxe, krav-maga et préparation mentale.',
    location: 'Saint-Joseph',
    specialties: ['Préparation physique', 'Fitness'],
    certifications: ['Boxe Française', 'Krav Maga'],
    experience: 13,
    availability: 'Mar-Sam 17h-22h',
    rating: 4.9,
    totalClients: 76,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '15',
    firstName: 'Laura',
    lastName: 'Simon',
    email: 'laura@example.com',
    phone: '0596567894',
    photo: 'https://ui-avatars.com/api/?name=Laura+Simon&background=ec4899&color=fff&size=128',
    bio: 'Coach post-natal et remise en forme après grossesse. Accompagnement bienveillant des jeunes mamans.',
    location: 'Bellefontaine',
    specialties: ['Remise en forme', 'Bien-être'],
    certifications: ['Post-natal', 'BPJEPS'],
    experience: 7,
    availability: 'Lun-Ven 9h-15h',
    rating: 4.8,
    totalClients: 29,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '16',
    firstName: 'Nicolas',
    lastName: 'Faure',
    email: 'nicolas@example.com',
    phone: '0596678905',
    photo: 'https://ui-avatars.com/api/?name=Nicolas+Faure&background=0891b2&color=fff&size=128',
    bio: "Coach en escalade et sports outdoor. Découvrez les joies de l'escalade dans un cadre naturel exceptionnel.",
    location: 'Le Prêcheur',
    specialties: ['Préparation physique', 'Remise en forme'],
    certifications: ['Escalade', 'Montagne'],
    experience: 9,
    availability: 'Mer-Dim 8h-17h',
    rating: 4.7,
    totalClients: 33,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '17',
    firstName: 'Valérie',
    lastName: 'Lefebvre',
    email: 'valerie@example.com',
    phone: '0596789016',
    photo: 'https://ui-avatars.com/api/?name=Valerie+Lefebvre&background=be185d&color=fff&size=128',
    bio: 'Coach en aqua-gym et hydrothérapie. Rééducation et fitness en milieu aquatique.',
    location: 'Les Trois-Îlets',
    specialties: ['Fitness', 'Relaxation'],
    certifications: ['Aqua-gym', 'Hydrothérapie'],
    experience: 8,
    availability: 'Lun-Sam 9h-17h',
    rating: 4.6,
    totalClients: 55,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '18',
    firstName: 'Fabien',
    lastName: 'Girard',
    email: 'fabien@example.com',
    phone: '0596890127',
    photo: 'https://ui-avatars.com/api/?name=Fabien+Girard&background=f59e0b&color=fff&size=128',
    bio: 'Coach en tennis et préparation raquette. Technique, tactique et condition physique spécifique.',
    location: 'Fort-de-France',
    specialties: ['Préparation physique'],
    certifications: ['Moniteur Tennis', 'Préparateur Physique'],
    experience: 14,
    availability: 'Lun-Ven 15h-21h, Sam-Dim 8h-18h',
    rating: 4.8,
    totalClients: 68,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '19',
    firstName: 'Sandrine',
    lastName: 'Mercier',
    email: 'sandrine@example.com',
    phone: '0596901238',
    photo: 'https://ui-avatars.com/api/?name=Sandrine+Mercier&background=7c2d12&color=fff&size=128',
    bio: "Coach en stretching et souplesse. Techniques d'assouplissement et prévention des blessures.",
    location: 'Gros-Morne',
    specialties: ['Relaxation', 'Bien-être', 'Remise en forme'],
    certifications: ['Stretching', 'Posturologie'],
    experience: 6,
    availability: 'Mar-Sam 10h-19h',
    rating: 4.5,
    totalClients: 37,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '20',
    firstName: 'Olivier',
    lastName: 'Lecomte',
    email: 'olivier@example.com',
    phone: '0596012349',
    photo: 'https://ui-avatars.com/api/?name=Olivier+Lecomte&background=2563eb&color=fff&size=128',
    bio: 'Coach en cyclisme et vélo de route. Entraînement spécifique et sorties en groupe dans les mornes.',
    location: 'Saint-Esprit',
    specialties: ['Préparation physique', 'Course à pied'],
    certifications: ['Cyclisme', 'Entraîneur FFC'],
    experience: 11,
    availability: 'Mer-Dim 6h-12h, 16h-19h',
    rating: 4.7,
    totalClients: 44,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '21',
    firstName: 'Aurélie',
    lastName: 'Robin',
    email: 'aurelie@example.com',
    phone: '0596123460',
    photo: 'https://ui-avatars.com/api/?name=Aurelie+Robin&background=059669&color=fff&size=128',
    bio: 'Coach en marche nordique et randonnée fitness. Découvrez les sentiers de Martinique en vous remettant en forme.',
    location: 'Basse-Pointe',
    specialties: ['Course à pied', 'Remise en forme'],
    certifications: ['Marche Nordique', 'Randonnée'],
    experience: 5,
    availability: 'Jeu-Lun 7h-11h, 16h-18h',
    rating: 4.6,
    totalClients: 28,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '22',
    firstName: 'Christophe',
    lastName: 'André',
    email: 'christophe@example.com',
    phone: '0596234571',
    photo: 'https://ui-avatars.com/api/?name=Christophe+Andre&background=7c3aed&color=fff&size=128',
    bio: 'Coach en preparation mentale et motivation. Développez votre mental de champion et dépassez vos limites.',
    location: 'Schœlcher',
    specialties: ['Bien-être', 'Méditation'],
    certifications: ['Préparation Mentale', 'PNL'],
    experience: 12,
    availability: 'Lun-Ven 14h-20h',
    rating: 4.9,
    totalClients: 83,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '3',
    firstName: 'Sophie',
    lastName: 'Leroy',
    email: 'sophie@example.com',
    phone: '0596345678',
    photo: 'https://ui-avatars.com/api/?name=Sophie+Leroy&background=dc2626&color=fff&size=128',
    bio: 'Nutritionniste et coach en perte de poids. Spécialiste des régimes adaptés au climat tropical.',
    location: 'Le Lamentin',
    specialties: ['Nutrition', 'Perte de poids', 'Bien-être', 'Remise en forme'],
    certifications: ['Diplôme de Nutritionniste', 'Coach Certifié'],
    experience: 6,
    availability: 'Mar-Sam 10h-17h',
    rating: 4.7,
    totalClients: 38,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Moreau',
    email: 'david@example.com',
    phone: '0596456789',
    photo: 'https://ui-avatars.com/api/?name=David+Moreau&background=7c3aed&color=fff&size=128',
    bio: 'Préparateur physique pour sportifs de haut niveau. Ancien athlète international en sprint.',
    location: 'Fort-de-France',
    specialties: ['Préparation physique', 'Course à pied', 'Musculation', 'Fitness'],
    certifications: ['BEES 2ème degré', 'Préparateur Physique'],
    experience: 12,
    availability: 'Lun-Ven 6h-19h',
    rating: 4.9,
    totalClients: 89,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '5',
    firstName: 'Camille',
    lastName: 'Fernandez',
    email: 'camille@example.com',
    phone: '0596567890',
    photo:
      'https://ui-avatars.com/api/?name=Camille+Fernandez&background=059669&color=fff&size=128',
    bio: 'Coach yoga et pilates. Formée en France et aux États-Unis, je privilégie une approche douce.',
    location: 'Trois-Îlets',
    specialties: ['Yoga', 'Pilates', 'Relaxation', 'Bien-être'],
    certifications: ['Professeur de Yoga 500h', 'Pilates Mat'],
    experience: 7,
    availability: 'Lun-Dim 7h-21h',
    rating: 4.8,
    totalClients: 52,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '6',
    firstName: 'Anthony',
    lastName: 'Durand',
    email: 'anthony@example.com',
    phone: '0596678901',
    photo: 'https://ui-avatars.com/api/?name=Anthony+Durand&background=ea580c&color=fff&size=128',
    bio: 'Coach crossfit et functional training. Ancien militaire, je vous pousse vers vos limites.',
    location: 'Robert',
    specialties: ['Crossfit', 'Functional Training', 'Musculation', 'Préparation physique'],
    certifications: ['CrossFit Level 2', 'BPJEPS'],
    experience: 9,
    availability: 'Mar-Sam 5h-20h',
    rating: 4.6,
    totalClients: 73,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '7',
    firstName: 'Isabelle',
    lastName: 'Bonnet',
    email: 'isabelle@example.com',
    phone: '0596789012',
    photo: 'https://ui-avatars.com/api/?name=Isabelle+Bonnet&background=be185d&color=fff&size=128',
    bio: 'Coach bien-être et relaxation. Spécialiste du stress et de la gestion des émotions.',
    location: 'Sainte-Marie',
    specialties: ['Bien-être', 'Relaxation', 'Méditation', 'Yoga'],
    certifications: ['Praticienne en Sophrologie', 'Coach Certifiée'],
    experience: 4,
    availability: 'Lun-Ven 9h-17h',
    rating: 4.7,
    totalClients: 29,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '8',
    firstName: 'Julien',
    lastName: 'Petit',
    email: 'julien@example.com',
    phone: '0596890123',
    photo: 'https://ui-avatars.com/api/?name=Julien+Petit&background=0891b2&color=fff&size=128',
    bio: "Coach natation et sports aquatiques. Maître-nageur sauveteur avec 15 ans d'expérience.",
    location: 'Rivière-Salée',
    specialties: ['Natation', 'Aqua-fitness', 'Remise en forme', 'Fitness'],
    certifications: ['BEESAN', 'Maître-nageur sauveteur'],
    experience: 15,
    availability: 'Lun-Dim 8h-18h',
    rating: 4.8,
    totalClients: 94,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '9',
    firstName: 'Nathalie',
    lastName: 'Rousseau',
    email: 'nathalie@example.com',
    phone: '0596901234',
    photo:
      'https://ui-avatars.com/api/?name=Nathalie+Rousseau&background=7c2d12&color=fff&size=128',
    bio: 'Coach fitness pour seniors. Spécialisée dans la remise en forme après 50 ans.',
    location: 'Ducos',
    specialties: ['Fitness', 'Remise en forme', 'Bien-être', 'Relaxation'],
    certifications: ['CQP Fitness', 'Spécialisation Seniors'],
    experience: 8,
    availability: 'Lun-Ven 9h-16h',
    rating: 4.9,
    totalClients: 41,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '10',
    firstName: 'Maxime',
    lastName: 'Girard',
    email: 'maxime@example.com',
    phone: '0596012345',
    photo: 'https://ui-avatars.com/api/?name=Maxime+Girard&background=16a34a&color=fff&size=128',
    bio: 'Coach trail et course en montagne. Passionné par la nature martiniquaise.',
    location: 'Le Morne-Rouge',
    specialties: ['Course à pied', 'Trail', 'Préparation physique', 'Fitness'],
    certifications: ['Entraîneur FFA', 'Guide Nature'],
    experience: 6,
    availability: 'Mer-Dim 6h-18h',
    rating: 4.7,
    totalClients: 35,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '11',
    firstName: 'Laura',
    lastName: 'Michel',
    email: 'laura@example.com',
    phone: '0596123450',
    photo: 'https://ui-avatars.com/api/?name=Laura+Michel&background=db2777&color=fff&size=128',
    bio: 'Coach danse fitness et zumba. Apportez de la joie dans votre remise en forme !',
    location: 'Case-Pilote',
    specialties: ['Danse', 'Fitness', 'Zumba', 'Remise en forme'],
    certifications: ['Instructeur Zumba', 'BPJEPS Danse'],
    experience: 5,
    availability: 'Mar-Sam 10h-20h',
    rating: 4.8,
    totalClients: 62,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '12',
    firstName: 'Thomas',
    lastName: 'Bernard',
    email: 'thomas@example.com',
    phone: '0596234501',
    photo: 'https://ui-avatars.com/api/?name=Thomas+Bernard&background=374151&color=fff&size=128',
    bio: 'Coach boxe et sports de combat. Ancien champion de Martinique, je forme la nouvelle génération.',
    location: 'Fort-de-France',
    specialties: ['Boxe', 'Sports de combat', 'Préparation physique', 'Musculation'],
    certifications: ['Prévôt Fédéral Boxe', 'BPJEPS'],
    experience: 11,
    availability: 'Lun-Ven 17h-21h',
    rating: 4.9,
    totalClients: 78,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '13',
    firstName: 'Céline',
    lastName: 'Dupont',
    email: 'celine@example.com',
    phone: '0596345612',
    photo: 'https://ui-avatars.com/api/?name=Celine+Dupont&background=0d9488&color=fff&size=128',
    bio: 'Coach nutrition et cuisine saine. Diététicienne passionnée par la gastronomie créole équilibrée.',
    location: 'Trinité',
    specialties: ['Nutrition', 'Cuisine saine', 'Perte de poids', 'Bien-être'],
    certifications: ['Diététicienne DE', 'Coach Nutrition'],
    experience: 7,
    availability: 'Lun-Ven 8h-18h',
    rating: 4.8,
    totalClients: 56,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '14',
    firstName: 'Kevin',
    lastName: 'Roux',
    email: 'kevin@example.com',
    phone: '0596456723',
    photo: 'https://ui-avatars.com/api/?name=Kevin+Roux&background=b91c1c&color=fff&size=128',
    bio: 'Coach calisthenics et street workout. Maîtrisez votre corps avec des exercices au poids du corps.',
    location: 'Schœlcher',
    specialties: ['Calisthenics', 'Street workout', 'Musculation', 'Fitness'],
    certifications: ['Instructeur Calisthenics', 'BPJEPS'],
    experience: 4,
    availability: 'Lun-Sam 7h-19h',
    rating: 4.6,
    totalClients: 33,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '15',
    firstName: 'Morgane',
    lastName: 'Fabre',
    email: 'morgane@example.com',
    phone: '0596567834',
    photo: 'https://ui-avatars.com/api/?name=Morgane+Fabre&background=c2410c&color=fff&size=128',
    bio: 'Coach maman-bébé et post-grossesse. Accompagnement spécialisé pour les jeunes mamans.',
    location: 'Bellefontaine',
    specialties: ['Post-grossesse', 'Remise en forme', 'Bien-être', 'Relaxation'],
    certifications: ['Spécialiste Post-natal', 'Coach Certifiée'],
    experience: 6,
    availability: 'Lun-Ven 9h-15h',
    rating: 4.9,
    totalClients: 47,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '16',
    firstName: 'Sébastien',
    lastName: 'Lemoine',
    email: 'sebastien@example.com',
    phone: '0596678945',
    photo:
      'https://ui-avatars.com/api/?name=Sebastien+Lemoine&background=6366f1&color=fff&size=128',
    bio: 'Coach powerlifting et force athlétique. Spécialiste des mouvements de base et de la force pure.',
    location: 'Le François',
    specialties: ['Powerlifting', 'Musculation', 'Force', 'Préparation physique'],
    certifications: ['Entraîneur Powerlifting', 'BPJEPS'],
    experience: 10,
    availability: 'Mar-Sam 16h-21h',
    rating: 4.7,
    totalClients: 64,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '17',
    firstName: 'Aurélie',
    lastName: 'Garnier',
    email: 'aurelie@example.com',
    phone: '0596789056',
    photo: 'https://ui-avatars.com/api/?name=Aurelie+Garnier&background=059669&color=fff&size=128',
    bio: "Coach aqua-fitness et aqua-bike. Profitez des bienfaits de l'eau pour votre forme.",
    location: 'Sainte-Anne',
    specialties: ['Aqua-fitness', 'Aqua-bike', 'Natation', 'Remise en forme'],
    certifications: ['Aqua-fitness', 'Maître-nageur'],
    experience: 5,
    availability: 'Lun-Dim 8h-19h',
    rating: 4.8,
    totalClients: 43,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '18',
    firstName: 'Fabrice',
    lastName: 'Morel',
    email: 'fabrice@example.com',
    phone: '0596890167',
    photo: 'https://ui-avatars.com/api/?name=Fabrice+Morel&background=1f2937&color=fff&size=128',
    bio: 'Coach tennis et sports de raquette. Ancien joueur professionnel, je partage ma passion.',
    location: 'Le Diamant',
    specialties: ['Tennis', 'Sports de raquette', 'Préparation physique', 'Fitness'],
    certifications: ['Moniteur Tennis', 'BPJEPS Tennis'],
    experience: 13,
    availability: 'Lun-Sam 8h-18h',
    rating: 4.7,
    totalClients: 71,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '19',
    firstName: 'Jessica',
    lastName: 'Blanc',
    email: 'jessica@example.com',
    phone: '0596901278',
    photo: 'https://ui-avatars.com/api/?name=Jessica+Blanc&background=be123c&color=fff&size=128',
    bio: "Coach bien-être et développement personnel. Trouvez l'équilibre entre corps et esprit.",
    location: 'Gros-Morne',
    specialties: ['Bien-être', 'Développement personnel', 'Méditation', 'Relaxation'],
    certifications: ['Coach Certifiée', 'Praticienne PNL'],
    experience: 8,
    availability: 'Mar-Sam 9h-17h',
    rating: 4.9,
    totalClients: 39,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '20',
    firstName: 'Vincent',
    lastName: 'Simon',
    email: 'vincent@example.com',
    phone: '0596012389',
    photo: 'https://ui-avatars.com/api/?name=Vincent+Simon&background=0369a1&color=fff&size=128',
    bio: 'Coach cyclisme et vélo de route. Ancien coureur cycliste, je vous guide vers vos objectifs.',
    location: 'Marigot',
    specialties: ['Cyclisme', 'Vélo de route', 'Préparation physique', 'Fitness'],
    certifications: ['Entraîneur Cyclisme', 'BPJEPS'],
    experience: 9,
    availability: 'Lun-Ven 6h-18h',
    rating: 4.6,
    totalClients: 55,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '21',
    firstName: 'Mélanie',
    lastName: 'Perrin',
    email: 'melanie@example.com',
    phone: '0596123490',
    photo: 'https://ui-avatars.com/api/?name=Melanie+Perrin&background=7c3aed&color=fff&size=128',
    bio: 'Coach pole dance et danse aérienne. Développez votre grâce et votre force en hauteur.',
    location: 'Fort-de-France',
    specialties: ['Pole dance', 'Danse aérienne', 'Fitness', 'Remise en forme'],
    certifications: ['Instructeur Pole Dance', 'Danse Aérienne'],
    experience: 4,
    availability: 'Lun-Ven 18h-22h',
    rating: 4.8,
    totalClients: 28,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '22',
    firstName: 'Alexandre',
    lastName: 'Robert',
    email: 'alexandre@example.com',
    phone: '0596234591',
    photo: 'https://ui-avatars.com/api/?name=Alexandre+Robert&background=059669&color=fff&size=128',
    bio: 'Coach randonnée et trekking. Découvrez la Martinique autrement tout en vous remettant en forme.',
    location: 'Saint-Pierre',
    specialties: ['Randonnée', 'Trekking', 'Préparation physique', 'Bien-être'],
    certifications: ['Guide de Randonnée', 'Accompagnateur Montagne'],
    experience: 7,
    availability: 'Mer-Dim 7h-17h',
    rating: 4.9,
    totalClients: 48,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
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

// Computed - for database approach, this would just return coaches.value
// since filtering/sorting happens on the server
const filteredCoaches = computed(() => {
  // In database mode, filtering is done server-side
  if (import.meta.env.PROD) {
    return coaches.value
  }

  // Keep client-side filtering for development with mock data
  let filtered = coaches.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (coach) =>
        coach.firstName.toLowerCase().includes(query) ||
        coach.location.toLowerCase().includes(query) ||
        coach.specialties.some((specialty) => specialty.toLowerCase().includes(query)) ||
        coach.bio.toLowerCase().includes(query),
    )
  }

  // Specialty filter
  if (selectedSpecialty.value) {
    filtered = filtered.filter((coach) => coach.specialties.includes(selectedSpecialty.value))
  }

  // Sort
  filtered = filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'rating':
        return b.rating - a.rating
      case 'experience':
        return b.experience - a.experience
      case 'name':
        return a.firstName.localeCompare(b.firstName)
      default:
        return 0
    }
  })

  return filtered
})

// Database-driven search methods
const searchCoaches = async (query: string, specialty: string, sort: string, page: number = 1) => {
  isLoading.value = true

  try {
    // This would be your actual API call
    const response = await fetch('/api/coaches/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query.trim(),
        specialty: specialty || null,
        sortBy: sort,
        page,
        limit: pageSize.value,
      }),
    })

    const data = await response.json()

    if (page === 1) {
      coaches.value = data.coaches
    } else {
      coaches.value = [...coaches.value, ...data.coaches]
    }

    totalCoaches.value = data.total
    hasMore.value = data.hasMore
    currentPage.value = page
  } catch (error) {
    console.error('Search error:', error)
    // Handle error - show toast, etc.
  } finally {
    isLoading.value = false
  }
}

// Debounced search function
const debouncedSearch = (query: string, specialty: string, sort: string) => {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }

  searchDebounceTimer.value = setTimeout(() => {
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
  // Navigate to coach profile page
  router.push(`/coach/${coach.id}`)
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
onMounted(() => {
  // Load coaches - in real app, this would be an API call
  if (import.meta.env.PROD) {
    // In production, trigger initial search
    searchCoaches('', '', sortBy.value, 1)
  } else {
    // Development mode - use mock data
    coaches.value = mockCoaches
  }
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
</style>

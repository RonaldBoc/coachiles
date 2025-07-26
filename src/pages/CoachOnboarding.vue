<template>
  <div class="min-h-screen bg-gray-50 py-12 sm:px-6 lg:px-8">
    <!-- Progress Bar -->
    <div class="max-w-3xl mx-auto mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div v-for="(step, index) in steps" :key="step.id" class="flex items-center">
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  currentStep > index
                    ? 'bg-blue-600 text-white'
                    : currentStep === index
                      ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                      : 'bg-gray-200 text-gray-400',
                ]"
              >
                {{ index + 1 }}
              </div>
              <span
                :class="[
                  'ml-2 text-sm font-medium',
                  currentStep >= index ? 'text-gray-900' : 'text-gray-400',
                ]"
              >
                {{ step.title }}
              </span>
              <div
                v-if="index < steps.length - 1"
                :class="['ml-4 w-8 h-0.5', currentStep > index ? 'bg-blue-600' : 'bg-gray-200']"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-lg shadow p-8">
        <!-- Step 1: Basic Information -->
        <div v-if="currentStep === 0">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Informations personnelles</h2>

          <form @submit.prevent="nextStep" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700">
                  Prénom *
                </label>
                <input
                  id="firstName"
                  v-model="formData.firstName"
                  type="text"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">
                  Nom *
                </label>
                <input
                  id="lastName"
                  v-model="formData.lastName"
                  type="text"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700"> Téléphone </label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label for="bio" class="block text-sm font-medium text-gray-700">
                Bio professionnelle *
              </label>
              <textarea
                id="bio"
                v-model="formData.bio"
                rows="4"
                required
                placeholder="Décrivez votre expérience et votre approche en quelques lignes..."
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Suivant
              </button>
            </div>
          </form>
        </div>

        <!-- Step 2: Specialties, Certifications, and Availability -->
        <div v-if="currentStep === 1">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Spécialités et disponibilités</h2>

          <form @submit.prevent="nextStep" class="space-y-6">
            <!-- Specialties with Search -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Spécialisations * (Sélectionnez toutes celles qui s'appliquent)
              </label>

              <!-- Search Bar -->
              <div class="mb-4">
                <input
                  v-model="searchTerm"
                  type="text"
                  placeholder="Rechercher une spécialité..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- Specialties Grid -->
              <div class="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <label
                    v-for="specialty in filteredSpecialties"
                    :key="specialty"
                    class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :value="specialty"
                      v-model="formData.specialties"
                      class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span class="text-sm text-gray-700">{{ specialty }}</span>
                  </label>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                {{ formData.specialties.length }} spécialité(s) sélectionnée(s)
              </p>
            </div>

            <!-- Experience Years -->
            <div>
              <label for="experienceYears" class="block text-sm font-medium text-gray-700">
                Années d'expérience *
              </label>
              <select
                id="experienceYears"
                v-model="formData.experienceYears"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionnez votre expérience</option>
                <option value="1">Moins d'1 an</option>
                <option value="2">1-2 ans</option>
                <option value="3">3-5 ans</option>
                <option value="6">6-10 ans</option>
                <option value="11">Plus de 10 ans</option>
              </select>
            </div>

            <!-- Base Price -->
            <div>
              <label for="basePrice" class="block text-sm font-medium text-gray-700">
                Tarif de base (€/heure) *
              </label>
              <input
                id="basePrice"
                v-model.number="formData.basePrice"
                type="number"
                min="20"
                max="500"
                required
                placeholder="Ex: 60"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p class="text-xs text-gray-500 mt-1">
                Ce sera votre tarif par défaut pour les séances individuelles
              </p>
            </div>

            <!-- Certifications -->
            <div>
              <label for="certifications" class="block text-sm font-medium text-gray-700">
                Diplômes et certifications
              </label>
              <textarea
                id="certifications"
                v-model="formData.certifications"
                rows="3"
                placeholder="Listez vos diplômes, certifications, formations... (un par ligne)"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">
                Ex: Licence STAPS, Certificat de coaching personnel, Formation CrossFit L1
              </p>
            </div>

            <!-- Availability -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3"> Disponibilités </label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label
                  v-for="day in availabilityDays"
                  :key="day"
                  class="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :value="day"
                    v-model="formData.availability"
                    class="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="text-sm font-medium text-gray-700">{{ day }}</span>
                </label>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                Vous pourrez préciser vos créneaux horaires plus tard dans votre profil
              </p>
            </div>

            <div class="flex justify-between">
              <button
                type="button"
                @click="prevStep"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Suivant
              </button>
            </div>
          </form>
        </div>

        <!-- Step 3: Services (Enhanced) -->
        <div v-if="currentStep === 2">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Services proposés</h2>
          <p class="text-gray-600 mb-6">
            Souhaitez-vous ajouter des services spécifiques à votre profil ? Vous pourrez toujours
            les modifier plus tard.
          </p>

          <div class="space-y-6">
            <div class="flex space-x-4">
              <button
                type="button"
                @click="wantsToAddServices = true"
                :class="[
                  'flex-1 p-4 border-2 rounded-lg text-center',
                  wantsToAddServices
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400',
                ]"
              >
                <div class="text-lg font-medium">Oui, ajouter des services</div>
                <div class="text-sm text-gray-600 mt-1">Créez des offres personnalisées</div>
              </button>

              <button
                type="button"
                @click="wantsToAddServices = false"
                :class="[
                  'flex-1 p-4 border-2 rounded-lg text-center',
                  !wantsToAddServices
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400',
                ]"
              >
                <div class="text-lg font-medium">Non, plus tard</div>
                <div class="text-sm text-gray-600 mt-1">Je compléterai mon profil plus tard</div>
              </button>
            </div>

            <!-- Enhanced Service Form -->
            <div v-if="wantsToAddServices" class="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Créer des services</h3>

              <!-- Existing Services List -->
              <div v-if="services.length > 0" class="mb-6">
                <h4 class="text-sm font-medium text-gray-700 mb-3">
                  Services ajoutés ({{ services.length }})
                </h4>
                <div class="space-y-3">
                  <div
                    v-for="(service, index) in services"
                    :key="index"
                    class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
                  >
                    <div>
                      <div class="font-medium text-sm">{{ service.title }}</div>
                      <div class="text-xs text-gray-500">{{ service.category }}</div>
                    </div>
                    <button
                      @click="removeService(index)"
                      class="text-red-600 hover:text-red-800 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>

              <!-- Service Creation Form -->
              <div class="space-y-4">
                <!-- Service Title -->
                <div>
                  <label for="serviceTitle" class="block text-sm font-medium text-gray-700">
                    Titre du service *
                  </label>
                  <input
                    id="serviceTitle"
                    v-model="serviceForm.title"
                    type="text"
                    placeholder="Ex: Coaching de remise en forme personnalisé"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <!-- Category -->
                <div>
                  <label for="serviceCategory" class="block text-sm font-medium text-gray-700">
                    Catégorie *
                  </label>
                  <select
                    id="serviceCategory"
                    v-model="serviceForm.category"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option
                      v-for="specialty in formData.specialties"
                      :key="specialty"
                      :value="specialty"
                    >
                      {{ specialty }}
                    </option>
                  </select>
                </div>

                <!-- Sub-category -->
                <div>
                  <label for="serviceSubCategory" class="block text-sm font-medium text-gray-700">
                    Sous-catégorie (optionnel)
                  </label>
                  <input
                    id="serviceSubCategory"
                    v-model="serviceForm.subCategory"
                    type="text"
                    placeholder="Ex: Débutants, Performance, Rééducation..."
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <!-- Description -->
                <div>
                  <label for="serviceDescription" class="block text-sm font-medium text-gray-700">
                    Description du service
                  </label>
                  <textarea
                    id="serviceDescription"
                    v-model="serviceForm.description"
                    rows="3"
                    placeholder="Décrivez votre service, les objectifs, le matériel inclus..."
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <!-- Service Types & Pricing -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3"
                    >Type de service *</label
                  >
                  <div class="space-y-3">
                    <label class="flex items-center">
                      <input
                        v-model="serviceForm.individualAvailable"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-700">Cours particulier</span>
                    </label>
                    <div v-if="serviceForm.individualAvailable" class="ml-6">
                      <input
                        v-model.number="serviceForm.individualPrice"
                        type="number"
                        placeholder="Prix en €"
                        class="w-32 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span class="ml-2 text-sm text-gray-500">€ / séance</span>
                    </div>

                    <label class="flex items-center">
                      <input
                        v-model="serviceForm.groupAvailable"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-700">Cours en groupe</span>
                    </label>
                    <div v-if="serviceForm.groupAvailable" class="ml-6">
                      <input
                        v-model.number="serviceForm.groupPrice"
                        type="number"
                        placeholder="Prix en €"
                        class="w-32 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span class="ml-2 text-sm text-gray-500">€ / personne</span>
                    </div>
                  </div>
                </div>

                <!-- Duration -->
                <div>
                  <label for="serviceDuration" class="block text-sm font-medium text-gray-700">
                    Durée de la séance (minutes)
                  </label>
                  <select
                    id="serviceDuration"
                    v-model="serviceForm.duration"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 heure</option>
                    <option value="90">1h30</option>
                    <option value="120">2 heures</option>
                  </select>
                </div>

                <!-- Max Group Size -->
                <div v-if="serviceForm.groupAvailable">
                  <label for="maxGroupSize" class="block text-sm font-medium text-gray-700">
                    Nombre maximum de participants (groupe)
                  </label>
                  <input
                    id="maxGroupSize"
                    v-model.number="serviceForm.maxGroupSize"
                    type="number"
                    min="2"
                    max="20"
                    placeholder="8"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <!-- Add Service Button -->
                <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    @click="resetServiceForm"
                    type="button"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Effacer
                  </button>
                  <button
                    @click="addService"
                    type="button"
                    :disabled="
                      !serviceForm.title ||
                      !serviceForm.category ||
                      (!serviceForm.individualAvailable && !serviceForm.groupAvailable)
                    "
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ajouter ce service
                  </button>
                </div>
              </div>
            </div>

            <div class="flex justify-between">
              <button
                type="button"
                @click="prevStep"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                type="button"
                @click="completeOnboarding"
                :disabled="loading"
                class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {{ loading ? 'Finalisation...' : 'Terminer' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="mt-6 rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-700">{{ error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/utils/supabase'
import { COACH_SERVICES } from '@/constants/services'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const currentStep = ref(0)
const wantsToAddServices = ref(false)

const steps = [
  { id: 'basic', title: 'Informations' },
  { id: 'specialties', title: 'Spécialités' },
  { id: 'services', title: 'Services' },
]

// Get all categories and subcategories from COACH_SERVICES for searchable specialties
const allSpecialties = computed(() => {
  const specialties: string[] = []

  COACH_SERVICES.forEach((service) => {
    specialties.push(service.category)
    specialties.push(...service.subcategories)
  })

  return [...new Set(specialties)] // Remove duplicates
})

const searchTerm = ref('')
const filteredSpecialties = computed(() => {
  if (!searchTerm.value) {
    return allSpecialties.value
  }
  return allSpecialties.value.filter((specialty) =>
    specialty.toLowerCase().includes(searchTerm.value.toLowerCase()),
  )
})

const availabilityDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

// Form data for multiple services
const formData = ref({
  firstName: '',
  lastName: '',
  phone: '',
  bio: '',
  specialties: [] as string[],
  experienceYears: '',
  basePrice: null as number | null,
  certifications: '',
  availability: [] as string[],
})

const services = ref<
  Array<{
    title: string
    description: string
    category: string
    subCategory: string
    // Marketplace-compatible fields
    canBeSolo?: boolean
    soloPrice?: number | null
    canBeGroup?: boolean
    groupPrice?: number | null
    // Original fields for backward compatibility
    individualAvailable: boolean
    groupAvailable: boolean
    individualPrice: number | null
    duration: number
    maxGroupSize: number | null
  }>
>([])

const serviceForm = ref({
  title: '',
  description: '',
  category: '',
  subCategory: '',
  individualAvailable: true,
  groupAvailable: false,
  individualPrice: null as number | null,
  groupPrice: null as number | null,
  duration: 60,
  maxGroupSize: 8,
})

// Service management methods
const addService = () => {
  if (!serviceForm.value.title || !serviceForm.value.category) {
    return
  }

  if (!serviceForm.value.individualAvailable && !serviceForm.value.groupAvailable) {
    return
  }

  const newService = {
    title: serviceForm.value.title,
    description: serviceForm.value.description,
    category: serviceForm.value.category,
    subCategory: serviceForm.value.subCategory,
    // Map to marketplace-compatible field names
    canBeSolo: serviceForm.value.individualAvailable,
    soloPrice: serviceForm.value.individualAvailable ? serviceForm.value.individualPrice : null,
    canBeGroup: serviceForm.value.groupAvailable,
    groupPrice: serviceForm.value.groupAvailable ? serviceForm.value.groupPrice : null,
    duration: serviceForm.value.duration,
    maxGroupSize: serviceForm.value.groupAvailable ? serviceForm.value.maxGroupSize : null,
    // Keep both formats for compatibility
    individualAvailable: serviceForm.value.individualAvailable,
    groupAvailable: serviceForm.value.groupAvailable,
    individualPrice: serviceForm.value.individualPrice,
  }

  services.value.push(newService)
  resetServiceForm()
}

const removeService = (index: number) => {
  services.value.splice(index, 1)
}

const resetServiceForm = () => {
  serviceForm.value = {
    title: '',
    description: '',
    category: '',
    subCategory: '',
    individualAvailable: true,
    groupAvailable: false,
    individualPrice: null,
    groupPrice: null,
    duration: 60,
    maxGroupSize: 8,
  }
}

onMounted(async () => {
  // Check if user is authenticated
  if (!authStore.user) {
    router.push('/auth')
    return
  }

  // Wait for auth store to finish loading coach profile if still loading
  if (authStore.loading) {
    console.log('⏳ Waiting for auth store to finish loading...')
    // Wait for loading to complete
    const checkLoading = () => {
      return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (!authStore.loading) {
            clearInterval(interval)
            resolve()
          }
        }, 50)
      })
    }
    await checkLoading()
  }

  // Check if user already has a coach profile
  if (authStore.isCoach) {
    console.log('ℹ️ User already has coach profile, redirecting to profile')
    router.push('/coach/profile')
    return
  }

  console.log('👋 Welcome to onboarding! User needs to complete profile setup.')
})

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const completeOnboarding = async () => {
  if (!authStore.user) {
    error.value = 'Vous devez être connecté'
    return
  }

  loading.value = true
  error.value = ''

  try {
    console.log('🏗️ Creating coach profile for:', authStore.user.email)

    // Parse certifications from textarea (one per line)
    const certificationsArray = formData.value.certifications
      .split('\n')
      .map((cert: string) => cert.trim())
      .filter((cert: string) => cert.length > 0)

    // Create the coach profile
    const { data: coachData, error: coachError } = await supabase
      .from('coaches')
      .insert([
        {
          email: authStore.user.email,
          first_name: formData.value.firstName,
          last_name: formData.value.lastName,
          phone: formData.value.phone,
          bio: formData.value.bio,
          specialties: formData.value.specialties,
          certifications: certificationsArray,
          experience_years: parseInt(formData.value.experienceYears),
          hourly_rate: formData.value.basePrice,
          availability: formData.value.availability,
          locations: ['Martinique'],
          rating: 0,
          total_sessions: 0,
          is_active: true,
        },
      ])
      .select()
      .single()

    if (coachError) {
      throw coachError
    }

    console.log('✅ Coach profile created:', coachData)

    // Create all services from the services array
    if (services.value.length > 0) {
      console.log(`🛠️ Creating ${services.value.length} services...`)

      const servicesToCreate = services.value.map((service) => ({
        coach_id: coachData.id,
        title: service.title,
        description: service.description || '',
        category: service.category,
        sub_category: service.subCategory || null,
        // Use correct database field names
        can_be_solo: service.canBeSolo || service.individualAvailable,
        solo_price: service.soloPrice || service.individualPrice,
        can_be_group: service.canBeGroup || service.groupAvailable,
        group_price: service.groupPrice,
        duration: service.duration,
        // Default values for required fields
        can_be_at_home: true,
        can_be_online: true,
        can_be_in_public_spaces: true,
        has_free_trial: false,
        free_trial_modalities: null,
        cancellation_policy: "Annulation possible jusqu'à 24h avant le cours",
        use_profile_availability: true,
        custom_availability: null,
        is_active: true,
      }))

      const { error: serviceError } = await supabase.from('coach_services').insert(servicesToCreate)

      if (serviceError) {
        console.error('⚠️ Error creating services:', serviceError)
        // Don't throw here, profile creation succeeded
      } else {
        console.log(`✅ ${services.value.length} services created`)
      }
    }

    // Also create service from serviceForm if it has data (backward compatibility)
    if (
      wantsToAddServices.value &&
      serviceForm.value.title &&
      serviceForm.value.category &&
      services.value.length === 0
    ) {
      console.log('🛠️ Creating service from form...')

      const { error: serviceError } = await supabase.from('coach_services').insert([
        {
          coach_id: coachData.id,
          title: serviceForm.value.title,
          description: serviceForm.value.description || '',
          category: serviceForm.value.category,
          sub_category: serviceForm.value.subCategory || null,
          can_be_solo: serviceForm.value.individualAvailable,
          solo_price: serviceForm.value.individualPrice,
          can_be_group: serviceForm.value.groupAvailable,
          group_price: serviceForm.value.groupPrice,
          duration: serviceForm.value.duration,
          // Default values for required fields
          can_be_at_home: true,
          can_be_online: true,
          can_be_in_public_spaces: true,
          has_free_trial: false,
          free_trial_modalities: null,
          cancellation_policy: "Annulation possible jusqu'à 24h avant le cours",
          use_profile_availability: true,
          custom_availability: null,
          is_active: true,
        },
      ])

      if (serviceError) {
        console.error('⚠️ Error creating service:', serviceError)
        // Don't throw here, profile creation succeeded
      } else {
        console.log('✅ Service from form created')
      }
    }

    // Reload auth store to pick up the new coach profile
    await authStore.loadCoachProfile()

    // Redirect to profile page
    router.push('/coach/profile')
  } catch (err: unknown) {
    console.error('❌ Error completing onboarding:', err)
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}
</script>

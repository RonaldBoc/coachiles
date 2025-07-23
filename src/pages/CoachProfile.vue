<template>
  <CoachLayout>
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Profile Header -->
      <div class="mb-8 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div class="px-4 py-6 sm:p-8">
          <div class="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <!-- Profile Photo -->
            <div class="relative group">
              <img
                :src="profileData?.photo || '/default-avatar.svg'"
                :alt="`${profileData?.firstName || 'Coach'}`"
                class="h-24 w-24 rounded-full object-cover bg-gray-200"
                @error="handleImageError"
              />
              <div
                class="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center cursor-pointer"
                @click="photoInput?.click()"
              >
                <CameraIcon
                  class="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <input
                ref="photoInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handlePhotoUpload"
              />
            </div>

            <!-- Profile Info -->
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div>
                  <h1 class="text-2xl font-bold text-gray-900">
                    {{ profileData?.firstName || 'Coach' }}
                  </h1>
                  <p class="text-gray-600 flex items-center mt-1">
                    <MapPinIcon class="w-4 h-4 mr-1" />
                    {{ locationDisplay }}
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="text-right">
                    <div class="text-sm text-gray-500">Note</div>
                    <div class="flex items-center">
                      <StarIcon class="w-4 h-4 text-yellow-400 fill-current" />
                      <span class="ml-1 font-medium">{{ profileData?.rating || '0.0' }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-500">Clients</div>
                    <div class="font-medium">{{ profileData?.totalClients || 0 }}</div>
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <p class="text-gray-700">
                  {{ profileData?.bio || 'Aucune biographie disponible.' }}
                </p>
              </div>

              <div class="mt-4 flex flex-wrap gap-2">
                <span
                  v-for="specialty in profileData?.specialties || []"
                  :key="specialty"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800"
                >
                  {{ specialty }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <TabGroup>
        <TabList class="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab v-for="tab in tabs" :key="tab.id" as="template" v-slot="{ selected }">
            <button
              :class="[
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
              ]"
            >
              <component :is="tab.icon" class="w-4 h-4 inline-block mr-2" />
              {{ tab.name }}
            </button>
          </Tab>
        </TabList>

        <TabPanels class="mt-6">
          <!-- Profile Tab -->
          <TabPanel class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"> Prénom </label>
                <input
                  v-model="profileForm.firstName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"> Email </label>
                <input
                  :value="profileData?.email || ''"
                  type="email"
                  disabled
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"> Téléphone </label>
                <input
                  v-model="profileForm.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1"> Localisation </label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">Territoire</label>
                    <select
                      v-model="profileForm.country"
                      @change="handleCountryChange"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Sélectionner un territoire</option>
                      <option value="martinique">Martinique</option>
                      <option value="guadeloupe">Guadeloupe</option>
                      <option value="guyane">Guyane</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">Ville</label>
                    <select
                      v-model="profileForm.city"
                      :disabled="!profileForm.country"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">{{ profileForm.country ? 'Sélectionner une ville' : 'Choisir d\'abord un territoire' }}</option>
                      <option 
                        v-for="city in availableCities" 
                        :key="city" 
                        :value="city"
                      >
                        {{ city }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1"> Bio </label>
                <textarea
                  v-model="profileForm.bio"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <!-- Save Button -->
              <div class="md:col-span-2 flex justify-end">
                <button
                  @click="updateProfile"
                  :disabled="isLoading"
                  class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {{ isLoading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
                </button>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  </CoachLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import {
  UserCircleIcon,
  MapPinIcon,
  CameraIcon,
  StarIcon,
} from '@heroicons/vue/24/outline'
import CoachLayout from '@/layouts/CoachLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { getCitiesByCountry, type CountryType } from '@/constants/locations'

// Auth Store
const authStore = useAuthStore()

// Template refs
const photoInput = ref<HTMLInputElement | null>(null)

// Reactive data from auth store
const profileData = computed(() => authStore.coach)
const isLoading = computed(() => authStore.loading)

// Form data for editing
const profileForm = ref({
  firstName: '',
  phone: '',
  bio: '',
  country: '' as CountryType | '',
  city: '',
  specialties: [] as string[],
  certifications: [] as string[],
  experience: 0,
  availability: '',
})

// Computed for available cities based on selected country
const availableCities = computed(() => {
  if (!profileForm.value.country) return []
  return getCitiesByCountry(profileForm.value.country as CountryType)
})

// Location display computed
const locationDisplay = computed(() => {
  if (profileForm.value.city && profileForm.value.country) {
    return `${profileForm.value.city}, ${profileForm.value.country.charAt(0).toUpperCase() + profileForm.value.country.slice(1)}`
  }
  return profileData.value?.location || 'Non spécifié'
})

// Initialize form data
const initializeForm = () => {
  if (profileData.value) {
    profileForm.value = {
      firstName: profileData.value.firstName || '',
      phone: profileData.value.phone || '',
      bio: profileData.value.bio || '',
      country: parseLocationCountry(profileData.value.location),
      city: parseLocationCity(profileData.value.location),
      specialties: [...(profileData.value.specialties || [])],
      certifications: [...(profileData.value.certifications || [])],
      experience: profileData.value.experience || 0,
      availability: profileData.value.availability || '',
    }
  }
}

// Parse existing location to extract country and city
const parseLocationCountry = (location?: string): CountryType | '' => {
  if (!location) return ''
  const lowerLocation = location.toLowerCase()
  if (lowerLocation.includes('martinique')) return 'martinique'
  if (lowerLocation.includes('guadeloupe')) return 'guadeloupe'
  if (lowerLocation.includes('guyane')) return 'guyane'
  return ''
}

const parseLocationCity = (location?: string): string => {
  if (!location) return ''
  const parts = location.split(',')
  return parts[0]?.trim() || ''
}

// State - not needed anymore
// const showMobileMenu = ref(false)

// Note: subscriptionStatus might be used for future subscription features
// but currently not displayed since we removed the subscription banner

// Tabs configuration
const tabs = [
  { id: 'profile', name: 'Profil', icon: UserCircleIcon },
]

// Update profile function
const updateProfile = async () => {
  try {
    // Combine country and city into location string
    const location = profileForm.value.city && profileForm.value.country 
      ? `${profileForm.value.city}, ${profileForm.value.country.charAt(0).toUpperCase() + profileForm.value.country.slice(1)}`
      : ''
    
    const updateData = {
      ...profileForm.value,
      location
    }
    
    await authStore.updateCoachProfile(updateData)
    console.log('✅ Profile updated successfully')
  } catch (error) {
    console.error('❌ Error updating profile:', error)
  }
}

// Handle country change - reset city when country changes
const handleCountryChange = () => {
  profileForm.value.city = ''
}

// Handle image error - set to default
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/default-avatar.svg'
}

// Handle photo upload
const handlePhotoUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    // Handle photo upload
    console.log('Photo upload:', file)
  }
}

// Lifecycle
onMounted(async () => {
  // Initialize form with current profile data
  initializeForm()
  console.log('Coach Profile loaded')
})
</script>

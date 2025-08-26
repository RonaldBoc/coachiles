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
                :key="`profile-photo-${profileData?.updatedAt?.getTime() || 'default'}`"
                :src="profileData?.photo || '/default-avatar.svg'"
                :alt="`${profileData?.firstName || 'Coach'}`"
                class="h-24 w-24 rounded-full object-cover bg-gray-200"
                @error="handleImageError"
              />

              <!-- Upload progress overlay -->
              <div
                v-if="uploadingPhoto"
                class="absolute inset-0 rounded-full bg-black bg-opacity-75 flex items-center justify-center"
              >
                <div class="text-center">
                  <div
                    class="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-1"
                  ></div>
                  <div class="text-white text-xs font-medium">
                    {{ Math.round(uploadProgress) }}%
                  </div>
                </div>
              </div>

              <!-- Upload overlay -->
              <div
                v-else
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
                :disabled="uploadingPhoto"
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
                      <option value="">
                        {{
                          profileForm.country
                            ? 'Sélectionner une ville'
                            : "Choisir d'abord un territoire"
                        }}
                      </option>
                      <option v-for="city in availableCities" :key="city" :value="city">
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

              <!-- Experience -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Années d'expérience
                </label>
                <input
                  v-model.number="profileForm.experience"
                  type="number"
                  min="0"
                  max="50"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <!-- Hourly Rate -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Tarif horaire (€)
                </label>
                <input
                  v-model.number="profileForm.hourlyRate"
                  type="number"
                  min="20"
                  max="200"
                  step="5"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <!-- Specialties -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1"> Spécialités </label>
                <div class="flex flex-wrap gap-2 mb-2">
                  <span
                    v-for="specialty in profileForm.specialties"
                    :key="specialty"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {{ specialty }}
                    <button
                      @click="removeSpecialty(specialty)"
                      class="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                </div>
                <select
                  v-model="newSpecialty"
                  @change="addSpecialty"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Ajouter une spécialité</option>
                  <optgroup
                    v-for="category in specialtyOptions"
                    :key="category.category"
                    :label="category.category"
                  >
                    <option
                      v-for="specialty in category.specialties"
                      :key="specialty"
                      :value="specialty"
                      :disabled="profileForm.specialties.includes(specialty)"
                    >
                      {{ specialty }}
                    </option>
                  </optgroup>
                </select>
              </div>

              <!-- Certifications -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Certifications & Diplômes
                </label>
                <div class="flex flex-wrap gap-2 mb-2">
                  <span
                    v-for="cert in profileForm.certifications"
                    :key="cert"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    {{ cert }}
                    <button
                      @click="removeCertification(cert)"
                      class="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                </div>
                <select
                  v-model="newCertification"
                  @change="addCertification"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Ajouter une certification</option>
                  <optgroup
                    v-for="group in CERTIFICATION_OPTIONS"
                    :key="group.category"
                    :label="group.category"
                  >
                    <option
                      v-for="cert in group.certifications"
                      :key="cert"
                      :value="cert"
                      :disabled="profileForm.certifications.includes(cert)"
                    >
                      {{ cert }}
                    </option>
                  </optgroup>
                </select>
              </div>

              <!-- Availability Schedule -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Horaires de disponibilité
                </label>

                <!-- Weekly Schedule Grid -->
                <div class="border border-gray-300 rounded-lg overflow-hidden">
                  <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 class="text-sm font-medium text-gray-900">Planning hebdomadaire</h4>
                  </div>

                  <div class="divide-y divide-gray-200">
                    <div
                      v-for="(dayName, dayIndex) in dayNames"
                      :key="dayIndex"
                      class="flex items-center py-3 px-4 hover:bg-gray-50"
                    >
                      <!-- Day name -->
                      <div class="w-20 flex-shrink-0">
                        <span class="text-sm font-medium text-gray-900">{{ dayName }}</span>
                      </div>

                      <!-- Toggle availability for this day -->
                      <div class="flex-1 flex items-center space-x-4">
                        <label class="flex items-center">
                          <input
                            type="checkbox"
                            :checked="isDayActive(dayIndex)"
                            @change="toggleDay(dayIndex)"
                            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span class="ml-2 text-sm text-gray-600">Disponible</span>
                        </label>

                        <!-- Time slots for active days -->
                        <div
                          v-if="isDayActive(dayIndex)"
                          class="flex items-center space-x-2 flex-1"
                        >
                          <!-- Start time -->
                          <div class="relative inline-block">
                            <select
                              :value="getDayStartTime(dayIndex)"
                              @change="updateDayTime(dayIndex, 'start', $event)"
                              class="custom-time-select text-sm border border-gray-300 rounded pl-2 pr-7 py-1 appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            >
                              <option
                                v-for="time in timeSlots"
                                :key="`start-${time}`"
                                :value="time"
                              >
                                {{ time }}
                              </option>
                            </select>
                            <span
                              class="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-gray-500"
                            >
                              <ChevronDownIcon class="w-4 h-4" />
                            </span>
                          </div>

                          <span class="text-sm text-gray-500">à</span>

                          <!-- End time -->
                          <div class="relative inline-block">
                            <select
                              :value="getDayEndTime(dayIndex)"
                              @change="updateDayTime(dayIndex, 'end', $event)"
                              class="custom-time-select text-sm border border-gray-300 rounded pl-2 pr-7 py-1 appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            >
                              <option v-for="time in timeSlots" :key="`end-${time}`" :value="time">
                                {{ time }}
                              </option>
                            </select>
                            <span
                              class="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-gray-500"
                            >
                              <ChevronDownIcon class="w-4 h-4" />
                            </span>
                          </div>

                          <!-- Add break option -->
                          <button
                            v-if="canAddBreak()"
                            @click="addBreak(dayIndex)"
                            class="text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            + Pause
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Quick Schedule Templates -->
                <div class="mt-3 flex flex-wrap gap-2">
                  <button
                    @click="applyTemplate('business')"
                    class="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200"
                  >
                    Horaires bureau (9h-17h)
                  </button>
                  <button
                    @click="applyTemplate('extended')"
                    class="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200"
                  >
                    Horaires étendus (8h-19h)
                  </button>
                  <button
                    @click="applyTemplate('weekend')"
                    class="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full hover:bg-purple-200"
                  >
                    Week-end uniquement
                  </button>
                  <button
                    @click="clearSchedule"
                    class="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full hover:bg-gray-200"
                  >
                    Effacer tout
                  </button>
                </div>

                <p class="text-sm text-gray-500 mt-2">
                  Définissez vos créneaux de disponibilité par défaut. Vous pourrez ensuite gérer
                  les exceptions et réservations dans le calendrier.
                </p>
              </div>

              <!-- Languages -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Langues parlées
                </label>
                <div class="flex flex-wrap gap-2 mb-2">
                  <span
                    v-for="lang in profileForm.languages"
                    :key="lang"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    {{ lang }}
                    <button
                      @click="removeLanguage(lang)"
                      class="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                </div>
                <select
                  v-model="newLanguage"
                  @change="addLanguage"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Ajouter une langue</option>
                  <option
                    v-for="lang in LANGUAGE_OPTIONS"
                    :key="lang"
                    :value="lang"
                    :disabled="profileForm.languages.includes(lang)"
                  >
                    {{ lang }}
                  </option>
                </select>
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
import { CameraIcon, MapPinIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import CoachLayout from '@/layouts/CoachLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { getCitiesByCountry, type CountryType } from '@/constants/locations'
import {
  CERTIFICATION_OPTIONS,
  LANGUAGE_OPTIONS,
  SPECIALTY_OPTIONS,
} from '@/constants/coachOptions'
import type { AvailabilityTemplate } from '@/types/availability'
import { DAY_NAMES, TIME_SLOTS } from '@/types/availability'
import { supabaseCoachApi } from '@/services/supabaseCoachApi'

// Auth Store
const authStore = useAuthStore()

// Photo upload state
const uploadingPhoto = ref(false)
const uploadProgress = ref(0)

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
  hourlyRate: 50,
  languages: [] as string[],
})

// New item selection
const newSpecialty = ref('')
const newCertification = ref('')
const newLanguage = ref('')

// Enhanced availability management
const dayNames = DAY_NAMES
const timeSlots = TIME_SLOTS
const weeklySchedule = ref<AvailabilityTemplate[]>([])

// Quick access computed properties for availability
const isDayActive = (dayIndex: number) => {
  return weeklySchedule.value.some(
    (template) => template.dayOfWeek === dayIndex && template.isActive,
  )
}

const getDayStartTime = (dayIndex: number) => {
  const template = weeklySchedule.value.find((t) => t.dayOfWeek === dayIndex && t.isActive)
  return template?.startTime || '09:00'
}

const getDayEndTime = (dayIndex: number) => {
  const template = weeklySchedule.value.find((t) => t.dayOfWeek === dayIndex && t.isActive)
  return template?.endTime || '17:00'
}

const canAddBreak = () => {
  // For now, we'll implement break functionality later
  return false
}

// Availability management methods
const toggleDay = (dayIndex: number) => {
  const existingIndex = weeklySchedule.value.findIndex((t) => t.dayOfWeek === dayIndex)

  if (existingIndex >= 0) {
    weeklySchedule.value[existingIndex].isActive = !weeklySchedule.value[existingIndex].isActive
  } else {
    weeklySchedule.value.push({
      id: `temp-${Date.now()}-${dayIndex}`,
      coachId: authStore.user?.id || '',
      dayOfWeek: dayIndex,
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
}

const updateDayTime = (dayIndex: number, timeType: 'start' | 'end', event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  const template = weeklySchedule.value.find((t) => t.dayOfWeek === dayIndex && t.isActive)

  if (template) {
    if (timeType === 'start') {
      template.startTime = value
    } else {
      template.endTime = value
    }
    template.updatedAt = new Date()
  }
}

const addBreak = (dayIndex: number) => {
  // TODO: Implement break functionality
  console.log('Add break for day', dayIndex)
}

// Template management
const applyTemplate = (templateType: string) => {
  weeklySchedule.value = []

  switch (templateType) {
    case 'business':
      // Monday to Friday, 9AM-5PM
      for (let day = 1; day <= 5; day++) {
        weeklySchedule.value.push({
          id: `temp-${Date.now()}-${day}`,
          coachId: authStore.user?.id || '',
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
      break

    case 'extended':
      // Monday to Friday, 8AM-7PM
      for (let day = 1; day <= 5; day++) {
        weeklySchedule.value.push({
          id: `temp-${Date.now()}-${day}`,
          coachId: authStore.user?.id || '',
          dayOfWeek: day,
          startTime: '08:00',
          endTime: '19:00',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
      break

    case 'weekend':
      // Saturday and Sunday, 10AM-4PM
      for (let day = 6; day <= 7; day++) {
        const dayIndex = day === 7 ? 0 : day // Sunday is 0, Saturday is 6
        weeklySchedule.value.push({
          id: `temp-${Date.now()}-${dayIndex}`,
          coachId: authStore.user?.id || '',
          dayOfWeek: dayIndex,
          startTime: '10:00',
          endTime: '16:00',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
      break
  }
}

const clearSchedule = () => {
  weeklySchedule.value = []
}

// Convert weekly schedule to readable availability string
const scheduleToAvailabilityString = () => {
  if (weeklySchedule.value.length === 0) return ''

  const activeSchedules = weeklySchedule.value.filter((s) => s.isActive)
  if (activeSchedules.length === 0) return ''

  // Group consecutive days with same times
  const scheduleGroups: { [key: string]: number[] } = {}

  activeSchedules.forEach((schedule) => {
    const timeKey = `${schedule.startTime}-${schedule.endTime}`
    if (!scheduleGroups[timeKey]) {
      scheduleGroups[timeKey] = []
    }
    scheduleGroups[timeKey].push(schedule.dayOfWeek)
  })

  // Convert to readable format
  const readableSchedules = Object.entries(scheduleGroups).map(([timeKey, days]) => {
    const [startTime, endTime] = timeKey.split('-')
    days.sort((a, b) => a - b)

    // Convert day numbers to names and group consecutive days
    const dayRanges: string[] = []
    let rangeStart = days[0]
    let rangeEnd = days[0]

    for (let i = 1; i <= days.length; i++) {
      if (i < days.length && days[i] === rangeEnd + 1) {
        rangeEnd = days[i]
      } else {
        if (rangeStart === rangeEnd) {
          dayRanges.push(dayNames[rangeStart].slice(0, 3))
        } else if (rangeEnd === rangeStart + 1) {
          dayRanges.push(`${dayNames[rangeStart].slice(0, 3)}-${dayNames[rangeEnd].slice(0, 3)}`)
        } else {
          dayRanges.push(`${dayNames[rangeStart].slice(0, 3)}-${dayNames[rangeEnd].slice(0, 3)}`)
        }

        if (i < days.length) {
          rangeStart = days[i]
          rangeEnd = days[i]
        }
      }
    }

    return `${dayRanges.join(', ')} ${startTime}-${endTime}`
  })

  return readableSchedules.join(' | ')
}

// Parse availability string back to weekly schedule (basic implementation)
const parseAvailabilityString = (availabilityStr: string) => {
  weeklySchedule.value = []

  if (!availabilityStr) return

  // For now, just set a default schedule if there's any availability text
  // Later we can implement more sophisticated parsing
  if (availabilityStr.trim().length > 0) {
    // Default to Monday-Friday 9-17 if any availability is specified
    for (let day = 1; day <= 5; day++) {
      weeklySchedule.value.push({
        id: `parsed-${Date.now()}-${day}`,
        coachId: authStore.user?.id || '',
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }
}

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

// Specialty options from centralized config
const specialtyOptions = SPECIALTY_OPTIONS

// Functions for managing arrays
const addSpecialty = () => {
  if (newSpecialty.value && !profileForm.value.specialties.includes(newSpecialty.value)) {
    profileForm.value.specialties.push(newSpecialty.value)
    newSpecialty.value = ''
  }
}

const removeSpecialty = (specialty: string) => {
  const index = profileForm.value.specialties.indexOf(specialty)
  if (index > -1) {
    profileForm.value.specialties.splice(index, 1)
  }
}

const addCertification = () => {
  if (
    newCertification.value &&
    !profileForm.value.certifications.includes(newCertification.value)
  ) {
    profileForm.value.certifications.push(newCertification.value)
    newCertification.value = ''
  }
}

const removeCertification = (cert: string) => {
  const index = profileForm.value.certifications.indexOf(cert)
  if (index > -1) {
    profileForm.value.certifications.splice(index, 1)
  }
}

const addLanguage = () => {
  if (newLanguage.value && !profileForm.value.languages.includes(newLanguage.value)) {
    profileForm.value.languages.push(newLanguage.value)
    newLanguage.value = ''
  }
}

const removeLanguage = (lang: string) => {
  const index = profileForm.value.languages.indexOf(lang)
  if (index > -1) {
    profileForm.value.languages.splice(index, 1)
  }
}

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
      hourlyRate: profileData.value.hourlyRate || 50,
      languages: [...(profileData.value.languages || ['Français'])],
    }

    // Initialize weekly schedule from availability string
    parseAvailabilityString(profileData.value.availability || '')
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
const tabs = [{ id: 'profile', name: 'Profil', icon: UserCircleIcon }]

// Update profile function
const updateProfile = async () => {
  try {
    // Combine country and city into location string
    const location =
      profileForm.value.city && profileForm.value.country
        ? `${profileForm.value.city}, ${profileForm.value.country.charAt(0).toUpperCase() + profileForm.value.country.slice(1)}`
        : ''

    // Convert weekly schedule to availability string
    const availability = scheduleToAvailabilityString()

    const updateData = {
      ...profileForm.value,
      location,
      availability,
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

// Handle photo upload with enhanced processing
const handlePhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && profileData.value?.id) {
    try {
      // Show loading state
      uploadingPhoto.value = true
      uploadProgress.value = 0

      console.log('📸 Starting photo upload:', file.name)

      // Upload with progress simulation (real upload is too fast to show progress)
      const progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += Math.random() * 20
        }
      }, 200)

      // Upload photo using enhanced API
      const photoUrl = await supabaseCoachApi.uploadAvatar(profileData.value.id, file)

      // Complete progress
      clearInterval(progressInterval)
      uploadProgress.value = 100

      // Reload coach profile to get updated photo
      await authStore.loadCoachProfile()

      console.log('✅ Photo uploaded successfully:', photoUrl)

      // Show success message
      setTimeout(() => {
        uploadingPhoto.value = false
        uploadProgress.value = 0
      }, 500)
    } catch (error) {
      console.error('❌ Photo upload failed:', error)

      // Show error message
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du téléchargement'
      alert(`Erreur: ${errorMessage}`)

      uploadingPhoto.value = false
      uploadProgress.value = 0
    }

    // Reset input
    target.value = ''
  }
}

// Lifecycle
onMounted(async () => {
  initializeForm()
  console.log('Coach Profile loaded')
})
</script>

<style scoped>
/* Hide native arrow so only custom ChevronDownIcon is visible */
.custom-time-select::-ms-expand {
  /* IE 10+ */
  display: none;
}
.custom-time-select {
  -moz-appearance: none; /* Firefox */
  -webkit-appearance: none; /* Safari & Chrome */
  appearance: none; /* Standard */
  background-image: none;
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import {
  UserIcon,
  MapPinIcon,
  AcademicCapIcon,
  TagIcon,
  PhotoIcon,
  CheckIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import type { Coach } from '@/types/coach'

// Profile data (would normally come from store/API)
const profileData = ref<Partial<Coach>>({
  firstName: 'Marie',
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
})

// Auto-save indicator
const showSavedIndicator = ref(false)

// New items being added
const newSpecialty = ref('')
const newCertification = ref('')

// Predefined specialty options
const availableSpecialties = [
  'Fitness',
  'Musculation',
  'Cardio',
  'Yoga',
  'Pilates',
  'Natation',
  'Course à pied',
  'Crossfit',
  'Powerlifting',
  'Stretching',
  'HIIT',
  'Perte de poids',
  'Prise de masse',
  'Remise en forme',
  'Préparation physique',
  'Nutrition',
  'Bien-être',
  'Méditation',
  'Relaxation',
  'Tennis',
  'Football',
]

// Tabs
const tabs = [
  { id: 'profile', name: 'Profil', icon: UserIcon },
  { id: 'specialties', name: 'Spécialités', icon: TagIcon },
  { id: 'credentials', name: 'Certifications', icon: AcademicCapIcon },
  { id: 'photo', name: 'Photo', icon: PhotoIcon },
]

// Auto-save when profile data changes
watch(
  profileData,
  () => {
    saveProfile()
  },
  { deep: true },
)

// Functions
const saveProfile = () => {
  console.log('Auto-saving profile:', profileData.value)

  // Show saved indicator
  showSavedIndicator.value = true
  setTimeout(() => {
    showSavedIndicator.value = false
  }, 2000)

  // TODO: Call API to save profile
}

const addSpecialty = () => {
  if (
    newSpecialty.value.trim() &&
    !profileData.value.specialties?.includes(newSpecialty.value.trim())
  ) {
    if (!profileData.value.specialties) profileData.value.specialties = []
    profileData.value.specialties.push(newSpecialty.value.trim())
    newSpecialty.value = ''
  }
}

const removeSpecialty = (specialty: string) => {
  if (profileData.value.specialties) {
    profileData.value.specialties = profileData.value.specialties.filter((s) => s !== specialty)
  }
}

const addCertification = () => {
  if (
    newCertification.value.trim() &&
    !profileData.value.certifications?.includes(newCertification.value.trim())
  ) {
    if (!profileData.value.certifications) profileData.value.certifications = []
    profileData.value.certifications.push(newCertification.value.trim())
    newCertification.value = ''
  }
}

const removeCertification = (certification: string) => {
  if (profileData.value.certifications) {
    profileData.value.certifications = profileData.value.certifications.filter(
      (c) => c !== certification,
    )
  }
}

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // In a real app, you would upload to a server/cloud storage
    const reader = new FileReader()
    reader.onload = (e) => {
      profileData.value.photo = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-gray-900">Mes services</h1>
            <p class="mt-2 text-sm text-gray-600">
              Gérez vos informations de profil, spécialités et certifications
            </p>
          </div>
          <!-- Auto-save indicator -->
          <div
            v-if="showSavedIndicator"
            class="flex items-center text-sm text-green-600 transition-opacity duration-300"
          >
            <CheckIcon class="mr-1 h-4 w-4" />
            Sauvegardé automatiquement
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <TabGroup>
        <TabList class="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab v-for="tab in tabs" :key="tab.id" as="template" v-slot="{ selected }">
            <button
              class="w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              :class="[
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-700 hover:bg-white/[0.12] hover:text-blue-800',
              ]"
            >
              <div class="flex items-center justify-center space-x-2">
                <component :is="tab.icon" class="h-5 w-5" />
                <span>{{ tab.name }}</span>
              </div>
            </button>
          </Tab>
        </TabList>

        <TabPanels class="mt-8">
          <!-- Profile Tab -->
          <TabPanel class="space-y-8">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <div class="max-w-2xl">
                  <h2 class="text-base font-semibold leading-7 text-gray-900">
                    Informations personnelles
                  </h2>
                  <p class="mt-1 text-sm leading-6 text-gray-600">
                    Ces informations seront visibles sur votre profil public.
                  </p>

                  <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <!-- First Name -->
                    <div class="sm:col-span-6">
                      <label for="firstName" class="block text-sm font-medium text-gray-700">
                        Prénom
                      </label>
                      <div class="mt-1">
                        <input
                          id="firstName"
                          v-model="profileData.firstName"
                          type="text"
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <!-- Email -->
                    <div class="sm:col-span-4">
                      <label for="email" class="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <div class="mt-1">
                        <input
                          id="email"
                          v-model="profileData.email"
                          type="email"
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <!-- Phone -->
                    <div class="sm:col-span-2">
                      <label for="phone" class="block text-sm font-medium text-gray-700">
                        Téléphone
                      </label>
                      <div class="mt-1">
                        <input
                          id="phone"
                          v-model="profileData.phone"
                          type="tel"
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <!-- Location -->
                    <div class="sm:col-span-3">
                      <label for="location" class="block text-sm font-medium text-gray-700">
                        <div class="flex items-center">
                          <MapPinIcon class="h-4 w-4 mr-1" />
                          Localisation
                        </div>
                      </label>
                      <div class="mt-1">
                        <input
                          id="location"
                          v-model="profileData.location"
                          type="text"
                          placeholder="Ex: Fort-de-France"
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <!-- Experience -->
                    <div class="sm:col-span-3">
                      <label for="experience" class="block text-sm font-medium text-gray-700">
                        Années d'expérience
                      </label>
                      <div class="mt-1">
                        <input
                          id="experience"
                          v-model.number="profileData.experience"
                          type="number"
                          min="0"
                          max="50"
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <!-- Availability -->
                    <div class="sm:col-span-6">
                      <label for="availability" class="block text-sm font-medium text-gray-700">
                        Disponibilités
                      </label>
                      <div class="mt-1">
                        <input
                          id="availability"
                          v-model="profileData.availability"
                          type="text"
                          placeholder="Ex: Lun-Ven 9h-18h, Sam 9h-12h"
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <!-- Bio -->
                    <div class="sm:col-span-6">
                      <label for="bio" class="block text-sm font-medium text-gray-700">
                        Biographie
                      </label>
                      <div class="mt-1">
                        <textarea
                          id="bio"
                          v-model="profileData.bio"
                          rows="4"
                          placeholder="Décrivez votre approche, votre philosophie de coaching et ce qui vous motive..."
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <p class="mt-2 text-sm text-gray-500">
                        Cette description sera visible sur votre profil public.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- Specialties Tab -->
          <TabPanel class="space-y-8">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <div class="max-w-2xl">
                  <h2 class="text-base font-semibold leading-7 text-gray-900">
                    Spécialités de coaching
                  </h2>
                  <p class="mt-1 text-sm leading-6 text-gray-600">
                    Ajoutez vos domaines d'expertise pour aider les clients à vous trouver.
                  </p>

                  <!-- Add new specialty -->
                  <div class="mt-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Ajouter une spécialité
                    </label>
                    <div class="flex space-x-2">
                      <select
                        v-model="newSpecialty"
                        class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Choisir une spécialité...</option>
                        <option
                          v-for="specialty in availableSpecialties.filter(
                            (s) => !profileData.specialties?.includes(s),
                          )"
                          :key="specialty"
                          :value="specialty"
                        >
                          {{ specialty }}
                        </option>
                      </select>
                      <button
                        @click="addSpecialty"
                        :disabled="!newSpecialty"
                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusIcon class="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Custom specialty input -->
                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Ou ajouter une spécialité personnalisée
                    </label>
                    <div class="flex space-x-2">
                      <input
                        v-model="newSpecialty"
                        type="text"
                        placeholder="Votre spécialité..."
                        class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        @keyup.enter="addSpecialty"
                      />
                      <button
                        @click="addSpecialty"
                        :disabled="!newSpecialty"
                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusIcon class="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Current specialties -->
                  <div class="mt-6">
                    <label class="block text-sm font-medium text-gray-700 mb-3">
                      Mes spécialités actuelles
                    </label>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="specialty in profileData.specialties"
                        :key="specialty"
                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200"
                      >
                        {{ specialty }}
                        <button
                          @click="removeSpecialty(specialty)"
                          class="ml-2 inline-flex items-center p-0.5 rounded-full text-orange-600 hover:text-orange-800 hover:bg-orange-200"
                        >
                          <XMarkIcon class="h-3 w-3" />
                        </button>
                      </span>
                    </div>
                    <p v-if="!profileData.specialties?.length" class="text-sm text-gray-500 italic">
                      Aucune spécialité ajoutée pour le moment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- Credentials Tab -->
          <TabPanel class="space-y-8">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <div class="max-w-2xl">
                  <h2 class="text-base font-semibold leading-7 text-gray-900">
                    Formations & Certifications
                  </h2>
                  <p class="mt-1 text-sm leading-6 text-gray-600">
                    Ajoutez vos diplômes et certifications pour renforcer votre crédibilité.
                  </p>

                  <!-- Add new certification -->
                  <div class="mt-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Ajouter une certification
                    </label>
                    <div class="flex space-x-2">
                      <input
                        v-model="newCertification"
                        type="text"
                        placeholder="Ex: BPJEPS, CQP Fitness, Formation Nutrition..."
                        class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        @keyup.enter="addCertification"
                      />
                      <button
                        @click="addCertification"
                        :disabled="!newCertification"
                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusIcon class="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Current certifications -->
                  <div class="mt-6">
                    <label class="block text-sm font-medium text-gray-700 mb-3">
                      Mes certifications actuelles
                    </label>
                    <div class="space-y-2">
                      <div
                        v-for="certification in profileData.certifications"
                        :key="certification"
                        class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div class="flex items-center">
                          <AcademicCapIcon class="h-5 w-5 text-green-600 mr-3" />
                          <span class="text-green-800 font-medium">{{ certification }}</span>
                        </div>
                        <button
                          @click="removeCertification(certification)"
                          class="text-green-600 hover:text-green-800"
                        >
                          <XMarkIcon class="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p
                      v-if="!profileData.certifications?.length"
                      class="text-sm text-gray-500 italic"
                    >
                      Aucune certification ajoutée pour le moment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- Photo Tab -->
          <TabPanel class="space-y-8">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <div class="max-w-2xl">
                  <h2 class="text-base font-semibold leading-7 text-gray-900">Photo de profil</h2>
                  <p class="mt-1 text-sm leading-6 text-gray-600">
                    Une photo professionnelle augmente la confiance des clients.
                  </p>

                  <div class="mt-6">
                    <!-- Current photo -->
                    <div class="flex items-center space-x-6">
                      <div class="shrink-0">
                        <img
                          :src="profileData.photo || '/default-avatar.png'"
                          :alt="`${profileData.firstName}`"
                          class="h-32 w-32 rounded-full object-cover border-4 border-gray-200"
                        />
                      </div>
                      <div class="flex-1">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Photo actuelle</h3>
                        <p class="text-sm text-gray-600 mb-4">
                          Choisissez une photo claire où votre visage est bien visible. Format
                          recommandé : carré, minimum 400x400px.
                        </p>
                        <label
                          class="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <PhotoIcon class="h-5 w-5 mr-2" />
                          Changer la photo
                          <input
                            type="file"
                            accept="image/*"
                            class="sr-only"
                            @change="handlePhotoUpload"
                          />
                        </label>
                      </div>
                    </div>

                    <!-- Photo guidelines -->
                    <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 class="text-sm font-medium text-blue-900 mb-2">
                        Conseils pour une bonne photo de profil :
                      </h4>
                      <ul class="text-sm text-blue-800 space-y-1">
                        <li>• Utilisez un éclairage naturel</li>
                        <li>• Regardez directement l'objectif</li>
                        <li>• Souriez naturellement</li>
                        <li>• Portez une tenue professionnelle de coaching</li>
                        <li>• Évitez les arrière-plans distrayants</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  </div>
</template>

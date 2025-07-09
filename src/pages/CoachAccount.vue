<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Tab, TabGroup, TabList, TabPanel, TabPanels, Switch, Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from '@headlessui/vue'
import {
  UserCircleIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CogIcon,
  MapPinIcon,
  GlobeAltIcon,
  PlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
} from '@heroicons/vue/24/outline'
import { CameraIcon } from '@heroicons/vue/24/solid'
import Fuse from 'fuse.js'
import { useUserStore } from '@/stores/user'
import { useSubscriptionStore } from '@/stores/subscription'
import { COACH_SERVICES } from '@/constants/services'
import { getServiceRequirement } from '@/constants/serviceRequirements'
import type { CoachProfile, DiplomaDocument } from '@/types/coach'

const userStore = useUserStore()
const subscriptionStore = useSubscriptionStore()

// Form data
const profile = ref<CoachProfile>({
  id: '',
  firstName: '',
  lastName: '',
  city: '',
  country: '',
  email: '',
  emailVerified: false,
  phoneNumber: '',
  phoneVerified: false,
  services: [],
  photoUrl: '',
  description: '',
  diplomas: [],
  website: '',
  accountStatus: 'pending',
  createdAt: new Date(),
})

// Form state
const isEditing = ref(false)
const isSaving = ref(false)
const newDiploma = ref('')
const selectedServices = ref<string[]>([])
const showServiceWarning = ref(false)
const servicesRequiringDiplomas = ref<string[]>([])

// Service search
const searchQuery = ref('')
const selectedSearchService = ref<{ name: string; category: string } | null>(null)

// Account settings
const emailNotifications = ref(true)
const smsNotifications = ref(false)

// Tabs
const tabs = [
  { id: 'profile', name: 'Profil', icon: UserCircleIcon },
  { id: 'services', name: 'Services', icon: BriefcaseIcon },
  { id: 'credentials', name: 'Diplômes', icon: AcademicCapIcon },
  { id: 'settings', name: 'Paramètres', icon: CogIcon },
  { id: 'subscription', name: 'Abonnement', icon: CreditCardIcon },
]

// Computed
const fullName = computed(() => {
  return `${profile.value.firstName} ${profile.value.lastName}`.trim() || 'Coach'
})

const selectedServicesCount = computed(() => selectedServices.value.length)

const accountStatusInfo = computed(() => {
  switch (profile.value.accountStatus) {
    case 'approved':
      return { color: 'green', text: 'Compte approuvé', icon: CheckCircleIcon }
    case 'pending':
      return { color: 'yellow', text: "En attente d'approbation", icon: ClockIcon }
    case 'suspended':
      return { color: 'red', text: 'Compte suspendu', icon: XCircleIcon }
    case 'rejected':
      return { color: 'red', text: 'Compte rejeté', icon: XCircleIcon }
    default:
      return { color: 'gray', text: 'Statut inconnu', icon: ClockIcon }
  }
})

const pendingDiplomas = computed(() => {
  return profile.value.diplomas?.filter((d) => d.status === 'pending').length || 0
})

const hasActiveSubscription = computed(() => {
  return subscriptionStore.hasActiveSubscription
})

// Service search functionality
const allServices = computed(() => {
  const services: { name: string; category: string }[] = []
  COACH_SERVICES.forEach((category) => {
    category.items.forEach((item) => {
      services.push({ name: item, category: category.category })
    })
  })
  return services
})

const fuse = computed(() => {
  return new Fuse(allServices.value, {
    keys: ['name', 'category'],
    threshold: 0.3, // Adjust for fuzzy matching sensitivity
    includeScore: true,
  })
})

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) {
    return []
  }
  
  const results = fuse.value.search(searchQuery.value)
  return results
    .slice(0, 10) // Limit to 10 results
    .map(result => result.item)
    .filter(service => !selectedServices.value.includes(service.name))
})

// Methods
const loadProfile = () => {
  if (userStore.coach) {
    profile.value = { ...userStore.coach }
    selectedServices.value = [...(userStore.coach.services || [])]
    checkServicesRequirements()
  }
}

const checkServicesRequirements = () => {
  const requiresDiploma = selectedServices.value.filter((service) => {
    const requirement = getServiceRequirement(service)
    return requirement?.requiresDiploma
  })
  servicesRequiringDiplomas.value = requiresDiploma
}

const saveProfile = async () => {
  isSaving.value = true
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    profile.value.services = [...selectedServices.value]
    userStore.login(profile.value)
    isEditing.value = false

    // Show success message (could use a toast library)
    console.log('Profile saved successfully!')
  } catch (error) {
    console.error('Error saving profile:', error)
  } finally {
    isSaving.value = false
  }
}

const addDiploma = () => {
  if (newDiploma.value.trim()) {
    profile.value.diplomas = profile.value.diplomas || []
    const newDiplomaDoc: DiplomaDocument = {
      id: Date.now().toString(),
      name: newDiploma.value.trim(),
      photoUrl: '', // Will be set when photo is uploaded
      status: 'pending',
      submittedAt: new Date(),
    }
    profile.value.diplomas.push(newDiplomaDoc)
    newDiploma.value = ''
  }
}

const removeDiploma = (index: number) => {
  profile.value.diplomas?.splice(index, 1)
}

const toggleService = (service: string) => {
  const index = selectedServices.value.indexOf(service)
  const requirement = getServiceRequirement(service)

  if (index > -1) {
    selectedServices.value.splice(index, 1)
  } else {
    selectedServices.value.push(service)

    // Show warning if service requires diploma
    if (requirement?.requiresDiploma) {
      showServiceWarning.value = true
      // Auto-hide warning after 5 seconds
      setTimeout(() => {
        showServiceWarning.value = false
      }, 5000)
    }
  }

  checkServicesRequirements()
}

const selectServiceFromSearch = (service: { name: string; category: string }) => {
  if (!selectedServices.value.includes(service.name)) {
    toggleService(service.name)
  }
  // Clear search
  searchQuery.value = ''
  selectedSearchService.value = null
}

const handlePhotoUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    // In a real app, you'd upload to a cloud service
    const reader = new FileReader()
    reader.onload = (e) => {
      profile.value.photoUrl = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleDiplomaPhotoUpload = (event: Event, diplomaIndex: number) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file && profile.value.diplomas?.[diplomaIndex]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (profile.value.diplomas?.[diplomaIndex]) {
        profile.value.diplomas[diplomaIndex].photoUrl = e.target?.result as string
      }
    }
    reader.readAsDataURL(file)
  }
}

const sendEmailVerification = async () => {
  try {
    // Simulate API call
    console.log('Sending email verification to:', profile.value.email)
    // In real app, make API call to send verification email
  } catch (error) {
    console.error('Error sending email verification:', error)
  }
}

const sendPhoneVerification = async () => {
  try {
    // Simulate API call
    console.log('Sending SMS verification to:', profile.value.phoneNumber)
    // In real app, make API call to send verification SMS
  } catch (error) {
    console.error('Error sending phone verification:', error)
  }
}

const updatePaymentMethod = () => {
  console.log('Opening payment method update modal')
  // In real app, open Stripe/payment modal
}

const cancelSubscription = () => {
  console.log('Cancelling subscription')
  subscriptionStore.cancelSubscription()
  // In real app, show cancellation confirmation
}

const upgradeSubscription = () => {
  console.log('Opening upgrade flow')
  subscriptionStore.upgradeToPlan('premium')
  // In real app, show upgrade options
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between py-6">
          <div class="flex items-center space-x-4">
            <!-- Profile Photo -->
            <div class="relative">
              <div
                class="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden"
              >
                <img
                  v-if="profile.photoUrl"
                  :src="profile.photoUrl"
                  :alt="fullName"
                  class="h-full w-full object-cover"
                />
                <UserCircleIcon v-else class="h-10 w-10 text-gray-400" />
              </div>
              <label
                v-if="isEditing"
                class="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1.5 cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <CameraIcon class="h-3 w-3 text-white" />
                <input type="file" accept="image/*" class="hidden" @change="handlePhotoUpload" />
              </label>
            </div>

            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ fullName }}</h1>
              <p class="text-gray-600 flex items-center">
                <MapPinIcon class="h-4 w-4 mr-1" />
                {{ profile.city }}, {{ profile.country }}
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <button
              v-if="!isEditing"
              @click="isEditing = true"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier le profil
            </button>
            <template v-else>
              <button
                @click="isEditing = false"
                class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                @click="saveProfile"
                :disabled="isSaving"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Account Status Banner -->
    <div
      v-if="profile.accountStatus !== 'approved'"
      class="bg-yellow-50 border-b border-yellow-200"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center space-x-3">
          <component
            :is="accountStatusInfo.icon"
            :class="`h-6 w-6 text-${accountStatusInfo.color}-600`"
          />
          <div class="flex-1">
            <h3 :class="`text-sm font-medium text-${accountStatusInfo.color}-800`">
              {{ accountStatusInfo.text }}
            </h3>
            <p class="text-sm text-yellow-700 mt-1">
              <span v-if="profile.accountStatus === 'pending'">
                Votre compte est en cours de validation.
                <span v-if="pendingDiplomas > 0">
                  {{ pendingDiplomas }} diplôme(s) en attente de vérification.
                </span>
              </span>
              <span v-if="profile.accountStatus === 'suspended'">
                {{ profile.suspensionReason }}
              </span>
            </p>
          </div>
          <div v-if="servicesRequiringDiplomas.length > 0" class="text-right">
            <p class="text-xs text-yellow-600">
              {{ servicesRequiringDiplomas.length }} service(s) nécessitent des diplômes
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Service Warning Alert -->
    <div v-if="showServiceWarning" class="bg-orange-50 border-b border-orange-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex items-center space-x-3">
          <ExclamationTriangleIcon class="h-5 w-5 text-orange-600" />
          <p class="text-sm text-orange-800">
            <strong>Attention :</strong> Certains services sélectionnés nécessitent des diplômes.
            Votre compte pourrait être suspendu jusqu'à validation des documents requis.
          </p>
          <button @click="showServiceWarning = false" class="text-orange-600 hover:text-orange-800">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TabGroup>
        <!-- Tab Navigation -->
        <TabList class="flex space-x-1 rounded-xl bg-blue-50 p-1 mb-8">
          <Tab v-for="tab in tabs" :key="tab.id" as="template" v-slot="{ selected }">
            <button
              class="w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all focus:outline-none"
              :class="
                selected ? 'bg-white text-blue-700 shadow' : 'text-blue-600 hover:bg-white/50'
              "
            >
              <div class="flex items-center justify-center space-x-2">
                <component :is="tab.icon" class="h-5 w-5" />
                <span class="hidden sm:inline">{{ tab.name }}</span>
              </div>
            </button>
          </Tab>
        </TabList>

        <TabPanels>
          <!-- Profile Tab -->
          <TabPanel class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-6">Informations personnelles</h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input
                    v-model="profile.firstName"
                    :disabled="!isEditing"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    v-model="profile.lastName"
                    :disabled="!isEditing"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                  <input
                    v-model="profile.city"
                    :disabled="!isEditing"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                  <input
                    v-model="profile.country"
                    :disabled="!isEditing"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                  <div class="relative">
                    <GlobeAltIcon
                      class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                    />
                    <input
                      v-model="profile.website"
                      :disabled="!isEditing"
                      type="url"
                      placeholder="https://mon-site.com"
                      class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div class="mt-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  v-model="profile.description"
                  :disabled="!isEditing"
                  rows="4"
                  placeholder="Parlez-nous de votre expérience, votre approche, vos spécialités..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>
          </TabPanel>

          <!-- Services Tab -->
          <TabPanel class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-semibold text-gray-900">Services proposés</h2>
                <span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {{ selectedServicesCount }} service{{
                    selectedServicesCount > 1 ? 's' : ''
                  }}
                  sélectionné{{ selectedServicesCount > 1 ? 's' : '' }}
                </span>
              </div>

              <!-- Service Search Bar (only in edit mode) -->
              <div v-if="isEditing" class="mb-6">
                <div class="relative">
                  <Combobox v-model="selectedSearchService" @update:modelValue="selectServiceFromSearch">
                    <div class="relative">
                      <ComboboxInput
                        v-model="searchQuery"
                        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        placeholder="Rechercher un service... (ex: musculation, yoga, nutrition)"
                        @change="searchQuery = $event.target.value"
                      />
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
                      </div>
                      <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon class="h-5 w-5 text-gray-400" />
                      </ComboboxButton>
                    </div>

                    <ComboboxOptions
                      v-if="searchResults.length > 0"
                      class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                    >
                      <ComboboxOption
                        v-for="service in searchResults"
                        :key="`${service.category}-${service.name}`"
                        :value="service"
                        class="group relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-blue-50"
                      >
                        <div class="flex items-center">
                          <div class="flex-1">
                            <span class="block truncate font-medium text-gray-900">
                              {{ service.name }}
                            </span>
                            <span class="block text-sm text-gray-500">
                              {{ service.category }}
                            </span>
                          </div>
                          <div
                            v-if="getServiceRequirement(service.name)?.requiresDiploma"
                            class="flex items-center space-x-1"
                          >
                            <AcademicCapIcon class="h-4 w-4 text-orange-500" />
                            <span class="text-xs text-orange-600">Diplôme requis</span>
                          </div>
                        </div>
                      </ComboboxOption>
                    </ComboboxOptions>
                  </Combobox>
                </div>
                
                <!-- Search hint -->
                <p class="mt-2 text-sm text-gray-500">
                  Tapez pour rechercher parmi tous les services disponibles. Sélectionnez un service dans la liste pour l'ajouter.
                </p>
              </div>

              <div class="space-y-6">
                <div
                  v-for="category in COACH_SERVICES"
                  :key="category.category"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <h3 class="font-medium text-gray-900 mb-3">{{ category.category }}</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <label
                      v-for="service in category.items"
                      :key="service"
                      class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      :class="{
                        'bg-blue-50': selectedServices.includes(service),
                        'bg-orange-50 border border-orange-200':
                          getServiceRequirement(service)?.requiresDiploma &&
                          !selectedServices.includes(service),
                      }"
                    >
                      <input
                        type="checkbox"
                        :checked="selectedServices.includes(service)"
                        :disabled="!isEditing"
                        @change="toggleService(service)"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <div class="flex-1">
                        <span class="text-sm text-gray-700">{{ service }}</span>
                        <div
                          v-if="getServiceRequirement(service)?.requiresDiploma"
                          class="flex items-center space-x-1 mt-1"
                        >
                          <AcademicCapIcon class="h-3 w-3 text-orange-500" />
                          <span class="text-xs text-orange-600">Diplôme requis</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- Credentials Tab -->
          <TabPanel class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-6">Diplômes et certifications</h2>

              <!-- Add diploma form -->
              <div v-if="isEditing" class="flex space-x-3 mb-6">
                <input
                  v-model="newDiploma"
                  type="text"
                  placeholder="Ajouter un diplôme ou une certification"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  @keydown.enter="addDiploma"
                />
                <button
                  @click="addDiploma"
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon class="h-5 w-5" />
                </button>
              </div>

              <!-- Diplomas list -->
              <div class="space-y-4">
                <div
                  v-for="(diploma, index) in profile.diplomas"
                  :key="diploma.id"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-3 mb-2">
                        <AcademicCapIcon class="h-5 w-5 text-blue-600" />
                        <span class="font-medium text-gray-900">{{ diploma.name }}</span>
                        <span
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="{
                            'bg-green-100 text-green-800': diploma.status === 'approved',
                            'bg-yellow-100 text-yellow-800': diploma.status === 'pending',
                            'bg-red-100 text-red-800': diploma.status === 'rejected',
                          }"
                        >
                          {{
                            diploma.status === 'approved'
                              ? 'Approuvé'
                              : diploma.status === 'pending'
                                ? 'En attente'
                                : 'Rejeté'
                          }}
                        </span>
                      </div>

                      <div class="text-sm text-gray-500 space-y-1">
                        <p>Soumis le {{ diploma.submittedAt.toLocaleDateString('fr-FR') }}</p>
                        <p v-if="diploma.reviewedAt">
                          {{ diploma.status === 'approved' ? 'Approuvé' : 'Rejeté' }} le
                          {{ diploma.reviewedAt.toLocaleDateString('fr-FR') }}
                        </p>
                        <p v-if="diploma.rejectionReason" class="text-red-600">
                          Raison du rejet: {{ diploma.rejectionReason }}
                        </p>
                      </div>

                      <!-- Diploma photo -->
                      <div class="mt-3">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          Photo du diplôme
                          {{ diploma.photoUrl ? '(cliquez pour changer)' : '(requis)' }}
                        </label>
                        <div class="flex items-center space-x-3">
                          <div
                            class="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden"
                          >
                            <img
                              v-if="diploma.photoUrl"
                              :src="diploma.photoUrl"
                              :alt="diploma.name"
                              class="w-full h-full object-cover"
                            />
                            <DocumentIcon v-else class="h-8 w-8 text-gray-400" />
                          </div>
                          <label
                            v-if="isEditing"
                            class="cursor-pointer bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                          >
                            {{ diploma.photoUrl ? 'Changer la photo' : 'Ajouter une photo' }}
                            <input
                              type="file"
                              accept="image/*"
                              class="hidden"
                              @change="handleDiplomaPhotoUpload($event, index)"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <button
                      v-if="isEditing"
                      @click="removeDiploma(index)"
                      class="text-red-600 hover:text-red-800 transition-colors ml-4"
                    >
                      <XMarkIcon class="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div v-if="!profile.diplomas?.length" class="text-center py-8 text-gray-500">
                  <AcademicCapIcon class="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucun diplôme ajouté</p>
                  <p v-if="isEditing" class="text-sm">
                    Utilisez le formulaire ci-dessus pour ajouter vos diplômes
                  </p>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- Settings Tab -->
          <TabPanel class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-6">Paramètres du compte</h2>

              <div class="space-y-6">
                <!-- Contact Information -->
                <div>
                  <h3 class="text-base font-medium text-gray-900 mb-4">Informations de contact</h3>
                  <div class="space-y-4">
                    <!-- Email -->
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div class="flex items-center space-x-3">
                        <EnvelopeIcon class="h-5 w-5 text-gray-600" />
                        <div>
                          <p class="font-medium text-gray-900">Adresse email</p>
                          <p class="text-sm text-gray-600">{{ profile.email }}</p>
                        </div>
                      </div>
                      <div class="flex items-center space-x-3">
                        <div class="flex items-center space-x-2">
                          <component
                            :is="profile.emailVerified ? ShieldCheckIcon : ExclamationCircleIcon"
                            :class="profile.emailVerified ? 'text-green-600' : 'text-orange-600'"
                            class="h-5 w-5"
                          />
                          <span
                            :class="profile.emailVerified ? 'text-green-600' : 'text-orange-600'"
                            class="text-sm font-medium"
                          >
                            {{ profile.emailVerified ? 'Vérifiée' : 'Non vérifiée' }}
                          </span>
                        </div>
                        <button
                          v-if="!profile.emailVerified"
                          @click="sendEmailVerification"
                          class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Vérifier
                        </button>
                      </div>
                    </div>

                    <!-- Phone -->
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div class="flex items-center space-x-3">
                        <PhoneIcon class="h-5 w-5 text-gray-600" />
                        <div>
                          <p class="font-medium text-gray-900">Numéro de téléphone</p>
                          <p class="text-sm text-gray-600">{{ profile.phoneNumber }}</p>
                        </div>
                      </div>
                      <div class="flex items-center space-x-3">
                        <div class="flex items-center space-x-2">
                          <component
                            :is="profile.phoneVerified ? ShieldCheckIcon : ExclamationCircleIcon"
                            :class="profile.phoneVerified ? 'text-green-600' : 'text-orange-600'"
                            class="h-5 w-5"
                          />
                          <span
                            :class="profile.phoneVerified ? 'text-green-600' : 'text-orange-600'"
                            class="text-sm font-medium"
                          >
                            {{ profile.phoneVerified ? 'Vérifié' : 'Non vérifié' }}
                          </span>
                        </div>
                        <button
                          v-if="!profile.phoneVerified"
                          @click="sendPhoneVerification"
                          class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Vérifier
                        </button>
                      </div>
                    </div>

                    <!-- Change contact info -->
                    <div class="pt-4 border-t border-gray-200">
                      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <button class="text-blue-600 hover:text-blue-800 transition-colors text-sm">
                          Changer l'adresse email
                        </button>
                        <span class="hidden sm:inline text-gray-400">•</span>
                        <button class="text-blue-600 hover:text-blue-800 transition-colors text-sm">
                          Changer le numéro de téléphone
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Notifications -->
                <div class="border-t border-gray-200 pt-6">
                  <h3 class="text-base font-medium text-gray-900 mb-4">Notifications</h3>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <label class="text-sm font-medium text-gray-700"
                          >Notifications par email</label
                        >
                        <p class="text-sm text-gray-500">
                          Recevoir les notifications importantes par email
                        </p>
                      </div>
                      <Switch
                        v-model="emailNotifications"
                        :class="emailNotifications ? 'bg-blue-600' : 'bg-gray-200'"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <span
                          :class="emailNotifications ? 'translate-x-6' : 'translate-x-1'"
                          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        />
                      </Switch>
                    </div>

                    <div class="flex items-center justify-between">
                      <div>
                        <label class="text-sm font-medium text-gray-700">Notifications SMS</label>
                        <p class="text-sm text-gray-500">
                          Recevoir les notifications urgentes par SMS
                        </p>
                      </div>
                      <Switch
                        v-model="smsNotifications"
                        :class="smsNotifications ? 'bg-blue-600' : 'bg-gray-200'"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <span
                          :class="smsNotifications ? 'translate-x-6' : 'translate-x-1'"
                          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        />
                      </Switch>
                    </div>
                  </div>
                </div>

                <!-- Account Actions -->
                <div class="border-t border-gray-200 pt-6">
                  <h3 class="text-base font-medium text-gray-900 mb-4">Actions du compte</h3>
                  <div class="space-y-3">
                    <button class="text-blue-600 hover:text-blue-800 transition-colors">
                      Changer le mot de passe
                    </button>
                    <br />
                    <button class="text-red-600 hover:text-red-800 transition-colors">
                      Supprimer le compte
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- Subscription Tab -->
          <TabPanel class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-6">Mon abonnement</h2>

              <!-- Current Plan -->
              <div class="border border-blue-200 bg-blue-50 rounded-lg p-6 mb-6">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="text-xl font-semibold text-blue-900">
                      Plan {{ subscriptionStore.currentPlan?.name || 'Gratuit' }}
                    </h3>
                    <p class="text-blue-700">
                      {{ subscriptionStore.currentPlan?.price || 0
                      }}{{ subscriptionStore.currentPlan?.currency === 'EUR' ? '€' : '$' }}/{{
                        subscriptionStore.currentPlan?.billingCycle === 'monthly' ? 'mois' : 'an'
                      }}
                    </p>
                  </div>
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    :class="{
                      'bg-green-100 text-green-800':
                        subscriptionStore.userSubscription.status === 'active',
                      'bg-yellow-100 text-yellow-800':
                        subscriptionStore.userSubscription.status === 'pending',
                      'bg-red-100 text-red-800':
                        subscriptionStore.userSubscription.status === 'cancelled' ||
                        subscriptionStore.userSubscription.status === 'expired',
                    }"
                  >
                    {{
                      subscriptionStore.userSubscription.status === 'active'
                        ? 'Actif'
                        : subscriptionStore.userSubscription.status === 'pending'
                          ? 'En attente'
                          : subscriptionStore.userSubscription.status === 'expired'
                            ? 'Expiré'
                            : 'Inactif'
                    }}
                  </span>
                </div>

                <div
                  v-if="hasActiveSubscription"
                  class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4"
                >
                  <div class="flex items-center space-x-2">
                    <CalendarDaysIcon class="h-5 w-5 text-blue-600" />
                    <div>
                      <p class="text-sm font-medium text-blue-900">Prochaine facturation</p>
                      <p class="text-sm text-blue-700">
                        {{
                          subscriptionStore.userSubscription.nextBillingDate?.toLocaleDateString(
                            'fr-FR',
                          ) || 'Non définie'
                        }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <BanknotesIcon class="h-5 w-5 text-blue-600" />
                    <div>
                      <p class="text-sm font-medium text-blue-900">Renouvellement automatique</p>
                      <p class="text-sm text-blue-700">
                        {{ subscriptionStore.userSubscription.autoRenew ? 'Activé' : 'Désactivé' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Features -->
                <div>
                  <h4 class="text-sm font-medium text-blue-900 mb-2">Fonctionnalités incluses</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div
                      v-for="feature in subscriptionStore.currentPlan?.features || []"
                      :key="feature"
                      class="flex items-center space-x-2"
                    >
                      <CheckCircleIcon class="h-4 w-4 text-green-600" />
                      <span class="text-sm text-blue-800">{{ feature }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Available Plans (if not subscribed or want to upgrade) -->
              <div v-if="!hasActiveSubscription || subscriptionStore.isAdmin" class="mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Plans disponibles</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div
                    v-for="plan in subscriptionStore.activePlans"
                    :key="plan.id"
                    class="border rounded-lg p-4 relative"
                    :class="{
                      'border-blue-500 bg-blue-50': plan.isPopular,
                      'border-gray-200': !plan.isPopular,
                      'ring-2 ring-green-500':
                        subscriptionStore.userSubscription.planId === plan.id,
                    }"
                  >
                    <div
                      v-if="plan.isPopular"
                      class="absolute -top-3 left-1/2 transform -translate-x-1/2"
                    >
                      <span
                        class="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                        >Populaire</span
                      >
                    </div>
                    <div
                      v-if="subscriptionStore.userSubscription.planId === plan.id"
                      class="absolute -top-3 right-4"
                    >
                      <span
                        class="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                        >Actuel</span
                      >
                    </div>

                    <h4 class="font-semibold text-lg">{{ plan.name }}</h4>
                    <p class="text-gray-600 text-sm mb-2">{{ plan.description }}</p>
                    <p class="text-2xl font-bold text-gray-900 mb-4">
                      {{ plan.price }}{{ plan.currency === 'EUR' ? '€' : '$' }}
                      <span class="text-sm font-normal text-gray-500"
                        >/{{ plan.billingCycle === 'monthly' ? 'mois' : 'an' }}</span
                      >
                    </p>

                    <ul class="space-y-2 mb-4">
                      <li
                        v-for="feature in plan.features.slice(0, 3)"
                        :key="feature"
                        class="flex items-center text-sm"
                      >
                        <CheckCircleIcon class="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {{ feature }}
                      </li>
                      <li v-if="plan.features.length > 3" class="text-sm text-gray-500">
                        +{{ plan.features.length - 3 }} autres fonctionnalités
                      </li>
                    </ul>

                    <button
                      v-if="subscriptionStore.userSubscription.planId !== plan.id"
                      @click="subscriptionStore.subscribeToPlan(plan.id)"
                      class="w-full py-2 px-4 rounded-lg font-medium transition-colors"
                      :class="
                        plan.isPopular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      "
                    >
                      {{ plan.price === 0 ? 'Sélectionner' : 'Souscrire' }}
                    </button>

                    <div
                      v-else
                      class="w-full py-2 px-4 rounded-lg bg-green-100 text-green-800 text-center font-medium"
                    >
                      Plan actuel
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment Methods (Always visible) -->
              <div class="border border-gray-200 rounded-lg p-6 mb-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-medium text-gray-900">Méthodes de paiement</h3>
                  <button
                    @click="updatePaymentMethod"
                    class="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                  >
                    Ajouter une méthode
                  </button>
                </div>

                <div class="space-y-3">
                  <div
                    v-for="paymentMethod in subscriptionStore.paymentMethods"
                    :key="paymentMethod.id"
                    class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <CreditCardIcon class="h-8 w-8 text-gray-600" />
                    <div class="flex-1">
                      <p class="font-medium text-gray-900">
                        {{ paymentMethod.brand }} •••• {{ paymentMethod.last4 }}
                      </p>
                      <p class="text-sm text-gray-600">
                        Expire {{ paymentMethod.expiryMonth.toString().padStart(2, '0') }}/{{
                          paymentMethod.expiryYear
                        }}
                      </p>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span
                        v-if="paymentMethod.isDefault"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        Par défaut
                      </span>
                      <button
                        v-if="!paymentMethod.isDefault"
                        @click="subscriptionStore.setDefaultPaymentMethod(paymentMethod.id)"
                        class="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Définir par défaut
                      </button>
                      <button
                        @click="subscriptionStore.removePaymentMethod(paymentMethod.id)"
                        class="text-red-600 hover:text-red-800 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  <div
                    v-if="subscriptionStore.paymentMethods.length === 0"
                    class="text-center py-8 text-gray-500"
                  >
                    <CreditCardIcon class="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucune méthode de paiement enregistrée</p>
                  </div>
                </div>
              </div>

              <!-- Billing History (Always visible) -->
              <div class="border border-gray-200 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Historique de facturation</h3>
                <div class="space-y-3">
                  <div
                    v-for="bill in subscriptionStore.recentBilling"
                    :key="bill.id"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p class="font-medium text-gray-900">{{ bill.description }}</p>
                      <p class="text-sm text-gray-600">
                        {{ bill.date.toLocaleDateString('fr-FR') }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="font-medium text-gray-900">
                        {{ bill.amount }}{{ bill.currency === 'EUR' ? '€' : '$' }}
                      </p>
                      <div class="flex items-center space-x-2">
                        <span
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          :class="{
                            'bg-green-100 text-green-800': bill.status === 'paid',
                            'bg-yellow-100 text-yellow-800': bill.status === 'pending',
                            'bg-red-100 text-red-800': bill.status === 'failed',
                            'bg-gray-100 text-gray-800': bill.status === 'refunded',
                          }"
                        >
                          {{
                            bill.status === 'paid'
                              ? 'Payé'
                              : bill.status === 'pending'
                                ? 'En attente'
                                : bill.status === 'failed'
                                  ? 'Échec'
                                  : 'Remboursé'
                          }}
                        </span>
                        <button
                          v-if="bill.invoiceUrl"
                          class="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Télécharger
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="subscriptionStore.billingHistory.length === 0"
                    class="text-center py-8 text-gray-500"
                  >
                    <DocumentIcon class="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun historique de facturation</p>
                  </div>

                  <div v-if="subscriptionStore.billingHistory.length > 5" class="text-center pt-3">
                    <button class="text-blue-600 hover:text-blue-800 text-sm">
                      Voir tout l'historique ({{
                        subscriptionStore.billingHistory.length
                      }}
                      factures)
                    </button>
                  </div>
                </div>
              </div>

              <!-- Subscription Actions -->
              <div v-if="hasActiveSubscription" class="border border-gray-200 rounded-lg p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                <div class="space-y-3">
                  <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      v-if="subscriptionStore.userSubscription.planId !== 'premium'"
                      @click="upgradeSubscription"
                      class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Passer au plan Premium
                    </button>
                    <button
                      class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Modifier la fréquence de facturation
                    </button>
                  </div>
                  <div class="pt-3 border-t border-gray-200">
                    <button
                      @click="cancelSubscription"
                      class="text-red-600 hover:text-red-800 transition-colors text-sm"
                    >
                      Annuler l'abonnement
                    </button>
                  </div>
                </div>
              </div>

              <!-- Admin Panel -->
              <div
                v-if="subscriptionStore.isAdmin"
                class="border border-orange-200 bg-orange-50 rounded-lg p-6 mt-6"
              >
                <h3 class="text-lg font-medium text-orange-900 mb-4">
                  🔧 Administration des abonnements
                </h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-orange-800">Mode administrateur</span>
                    <button
                      @click="subscriptionStore.setAdminMode(false)"
                      class="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
                    >
                      Désactiver
                    </button>
                  </div>
                  <div class="text-sm text-orange-700">
                    <p>• Modifier les prix et fonctionnalités des plans</p>
                    <p>• Créer de nouveaux plans d'abonnement</p>
                    <p>• Voir tous les plans (actifs et inactifs)</p>
                  </div>
                </div>
              </div>

              <!-- Admin Toggle for Demo -->
              <div v-else class="text-center mt-6">
                <button
                  @click="subscriptionStore.setAdminMode(true)"
                  class="text-gray-500 hover:text-gray-700 text-sm"
                >
                  🔧 Mode administrateur (demo)
                </button>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  </div>
</template>

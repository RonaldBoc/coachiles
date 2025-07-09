<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Tab, TabGroup, TabList, TabPanel, TabPanels, Switch } from '@headlessui/vue'
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
} from '@heroicons/vue/24/outline'
import { CameraIcon } from '@heroicons/vue/24/solid'
import { useUserStore } from '@/stores/user'
import { COACH_SERVICES } from '@/constants/services'
import { getServiceRequirement } from '@/constants/serviceRequirements'
import type { CoachProfile, DiplomaDocument } from '@/types/coach'

const userStore = useUserStore()

// Form data
const profile = ref<CoachProfile>({
  id: '',
  firstName: '',
  lastName: '',
  city: '',
  country: '',
  services: [],
  photoUrl: '',
  description: '',
  diplomas: [],
  website: '',
  accountStatus: 'pending',
  createdAt: new Date()
})

// Form state
const isEditing = ref(false)
const isSaving = ref(false)
const newDiploma = ref('')
const selectedServices = ref<string[]>([])
const showServiceWarning = ref(false)
const servicesRequiringDiplomas = ref<string[]>([])

// Account settings
const emailNotifications = ref(true)
const smsNotifications = ref(false)
const publicProfile = ref(true)

// Tabs
const tabs = [
  { id: 'profile', name: 'Profil', icon: UserCircleIcon },
  { id: 'services', name: 'Services', icon: BriefcaseIcon },
  { id: 'credentials', name: 'Diplômes', icon: AcademicCapIcon },
  { id: 'settings', name: 'Paramètres', icon: CogIcon },
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
      return { color: 'yellow', text: 'En attente d\'approbation', icon: ClockIcon }
    case 'suspended':
      return { color: 'red', text: 'Compte suspendu', icon: XCircleIcon }
    case 'rejected':
      return { color: 'red', text: 'Compte rejeté', icon: XCircleIcon }
    default:
      return { color: 'gray', text: 'Statut inconnu', icon: ClockIcon }
  }
})

const pendingDiplomas = computed(() => {
  return profile.value.diplomas?.filter(d => d.status === 'pending').length || 0
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
  const requiresDiploma = selectedServices.value.filter(service => {
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
      submittedAt: new Date()
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
    <div v-if="profile.accountStatus !== 'approved'" class="bg-yellow-50 border-b border-yellow-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center space-x-3">
          <component :is="accountStatusInfo.icon" :class="`h-6 w-6 text-${accountStatusInfo.color}-600`" />
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
                        'bg-orange-50 border border-orange-200': getServiceRequirement(service)?.requiresDiploma && !selectedServices.includes(service)
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
                        <div v-if="getServiceRequirement(service)?.requiresDiploma" class="flex items-center space-x-1 mt-1">
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
                            'bg-red-100 text-red-800': diploma.status === 'rejected'
                          }"
                        >
                          {{ diploma.status === 'approved' ? 'Approuvé' : diploma.status === 'pending' ? 'En attente' : 'Rejeté' }}
                        </span>
                      </div>
                      
                      <div class="text-sm text-gray-500 space-y-1">
                        <p>Soumis le {{ diploma.submittedAt.toLocaleDateString('fr-FR') }}</p>
                        <p v-if="diploma.reviewedAt">
                          {{ diploma.status === 'approved' ? 'Approuvé' : 'Rejeté' }} le {{ diploma.reviewedAt.toLocaleDateString('fr-FR') }}
                        </p>
                        <p v-if="diploma.rejectionReason" class="text-red-600">
                          Raison du rejet: {{ diploma.rejectionReason }}
                        </p>
                      </div>
                      
                      <!-- Diploma photo -->
                      <div class="mt-3">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          Photo du diplôme {{ diploma.photoUrl ? '(cliquez pour changer)' : '(requis)' }}
                        </label>
                        <div class="flex items-center space-x-3">
                          <div class="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                            <img 
                              v-if="diploma.photoUrl" 
                              :src="diploma.photoUrl" 
                              :alt="diploma.name"
                              class="w-full h-full object-cover"
                            />
                            <DocumentIcon v-else class="h-8 w-8 text-gray-400" />
                          </div>
                          <label v-if="isEditing" class="cursor-pointer bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
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
                <!-- Notifications -->
                <div>
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

                <!-- Privacy -->
                <div class="border-t border-gray-200 pt-6">
                  <h3 class="text-base font-medium text-gray-900 mb-4">Confidentialité</h3>
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-sm font-medium text-gray-700">Profil public</label>
                      <p class="text-sm text-gray-500">
                        Permettre aux clients de voir votre profil
                      </p>
                    </div>
                    <Switch
                      v-model="publicProfile"
                      :class="publicProfile ? 'bg-blue-600' : 'bg-gray-200'"
                      class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <span
                        :class="publicProfile ? 'translate-x-6' : 'translate-x-1'"
                        class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                      />
                    </Switch>
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
        </TabPanels>
      </TabGroup>
    </div>
  </div>
</template>

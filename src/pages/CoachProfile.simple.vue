<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Subscription Status Banner -->
      <div class="mb-6">
        <div
          v-if="subscriptionStatus === 'active'"
          class="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between"
        >
          <div class="flex items-center">
            <CheckIcon class="w-5 h-5 text-green-600 mr-2" />
            <span class="text-green-800 font-medium">Abonnement actif</span>
            <span class="text-green-600 ml-2">{{ leadsRemaining }} leads restants ce mois</span>
          </div>
          <button
            @click="showSubscriptionModal = true"
            class="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Gérer l'abonnement
          </button>
        </div>

        <div
          v-else-if="subscriptionStatus === 'trial'"
          class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between"
        >
          <div class="flex items-center">
            <InformationCircleIcon class="w-5 h-5 text-blue-600 mr-2" />
            <span class="text-blue-800 font-medium">Période d'essai</span>
            <span class="text-blue-600 ml-2">{{ trialDaysLeft }} jours restants</span>
          </div>
          <button
            @click="showSubscriptionModal = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Choisir un plan
          </button>
        </div>

        <div
          v-else
          class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between"
        >
          <div class="flex items-center">
            <ExclamationTriangleIcon class="w-5 h-5 text-yellow-600 mr-2" />
            <span class="text-yellow-800 font-medium">Aucun abonnement</span>
            <span class="text-yellow-600 ml-2">Vous ne recevez pas de leads</span>
          </div>
          <button
            @click="showSubscriptionModal = true"
            class="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 text-sm font-medium"
          >
            S'abonner maintenant
          </button>
        </div>
      </div>

      <!-- Profile Header -->
      <div class="mb-8 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div class="px-4 py-6 sm:p-8">
          <div class="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <!-- Profile Photo -->
            <div class="relative group">
              <img
                :src="profileData.photo || '/default-avatar.png'"
                :alt="`${profileData.firstName} ${profileData.lastName}`"
                class="h-24 w-24 rounded-full object-cover"
              />
              <div
                class="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center cursor-pointer"
                @click="($refs.photoInput as HTMLInputElement).click()"
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
                    {{ profileData.firstName }} {{ profileData.lastName }}
                  </h1>
                  <p class="text-gray-600 flex items-center mt-1">
                    <MapPinIcon class="w-4 h-4 mr-1" />
                    {{ profileData.location }}
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="text-right">
                    <div class="text-sm text-gray-500">Note</div>
                    <div class="flex items-center">
                      <StarIcon class="w-4 h-4 text-yellow-400 fill-current" />
                      <span class="ml-1 font-medium">{{ profileData.rating }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-500">Clients</div>
                    <div class="font-medium">{{ profileData.totalClients }}</div>
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <p class="text-gray-700">{{ profileData.bio }}</p>
              </div>

              <div class="mt-4 flex flex-wrap gap-2">
                <span
                  v-for="specialty in profileData.specialties"
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
                  v-model="profileData.firstName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"> Nom </label>
                <input
                  v-model="profileData.lastName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"> Email </label>
                <input
                  v-model="profileData.email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"> Téléphone </label>
                <input
                  v-model="profileData.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1"> Localisation </label>
                <input
                  v-model="profileData.location"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1"> Bio </label>
                <textarea
                  v-model="profileData.bio"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </TabPanel>

          <!-- Services Tab -->
          <TabPanel class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Mes services</h3>
              <button
                @click="addService"
                class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon class="w-4 h-4 inline-block mr-1" />
                Ajouter un service
              </button>
            </div>

            <div class="space-y-4">
              <div
                v-for="service in services"
                :key="service.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h4 class="font-medium text-gray-900">{{ service.name }}</h4>
                    <p class="text-sm text-gray-600">{{ service.category }}</p>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      @click="editService(service)"
                      class="text-indigo-600 hover:text-indigo-800"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="deleteService(service.id)"
                      class="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p class="text-sm text-gray-700 mb-2">{{ service.description }}</p>
                <div class="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{{ service.location }}</span>
                  <span>{{ service.levels.join(', ') }}</span>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- Leads Tab -->
          <TabPanel class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Mes leads</h3>
              <div class="text-sm text-gray-600">
                {{ leadsUsed }}/{{ leadsAllowed }} leads utilisés ce mois
              </div>
            </div>

            <div v-if="subscriptionStatus === 'active'" class="space-y-4">
              <div
                v-for="lead in leads"
                :key="lead.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h4 class="font-medium text-gray-900">{{ lead.clientInfo?.name }}</h4>
                    <p class="text-sm text-gray-600">{{ lead.clientInfo?.location }}</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span
                      :class="[
                        'px-2 py-1 rounded-full text-xs',
                        lead.status === 'new'
                          ? 'bg-blue-100 text-blue-800'
                          : lead.status === 'contacted'
                            ? 'bg-yellow-100 text-yellow-800'
                            : lead.status === 'converted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800',
                      ]"
                    >
                      {{ getStatusLabel(lead.status) }}
                    </span>
                  </div>
                </div>
                <p class="text-sm text-gray-700 mb-2">{{ lead.clientInfo?.goals }}</p>
                <div class="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Budget: {{ lead.clientInfo?.budget }}</span>
                  <span>Disponibilité: {{ lead.clientInfo?.availability }}</span>
                </div>
                <div class="mt-3 flex space-x-2">
                  <button
                    v-if="lead.status === 'new'"
                    @click="contactLead(lead)"
                    class="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                  >
                    Contacter
                  </button>
                  <button
                    v-if="lead.status === 'contacted'"
                    @click="markConverted(lead)"
                    class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Marquer comme converti
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8">
              <p class="text-gray-500 mb-4">
                Vous devez avoir un abonnement actif pour voir vos leads.
              </p>
              <button
                @click="showSubscriptionModal = true"
                class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                S'abonner maintenant
              </button>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>

    <!-- Subscription Modal -->
    <SubscriptionModal
      v-if="showSubscriptionModal"
      :currentPlan="currentPlan"
      @close="showSubscriptionModal = false"
      @subscribe="handleSubscription"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import {
  UserCircleIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  MapPinIcon,
  CameraIcon,
  StarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline'
import type { Coach, Service } from '@/types/coach'
import type { Lead } from '@/types/Lead'
import type { SubscriptionPlan } from '@/types/subscription'
import SubscriptionModal from '@/components/SubscriptionModal.vue'

// Mock data for development
const profileData = ref<Partial<Coach>>({
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@example.com',
  phone: '+596 696 12 34 56',
  bio: "Coach sportif passionné avec 5 ans d'expérience dans l'accompagnement personnalisé.",
  location: 'Fort-de-France',
  specialties: ['Fitness & Musculation', 'Nutrition'],
  rating: 4.7,
  totalClients: 23,
  subscriptionStatus: 'active',
  photo: '/avatars/jean.jpg',
})

const services = ref<Service[]>([
  {
    id: '1',
    name: 'Coaching Remise en Forme',
    category: 'Fitness & Musculation',
    subcategory: 'Remise en forme générale',
    description:
      'Programme personnalisé pour retrouver la forme et améliorer sa condition physique.',
    location: 'Fort-de-France',
    duration: 60,
    groupSize: 'individual',
    ageGroups: ['Adultes'],
    levels: ['Débutant', 'Intermédiaire'],
    isActive: true,
  },
])

const leads = ref<Lead[]>([
  {
    id: '1',
    clientRequestId: 'req-1',
    coachId: 'coach-1',
    status: 'new',
    unlockedAt: new Date(),
    clientInfo: {
      name: 'Marie Dubois',
      email: 'marie@example.com',
      phone: '0596123456',
      goals: 'Perte de poids et remise en forme',
      location: 'Fort-de-France',
      budget: '50-70€ par séance',
      availability: 'Lundi et mercredi soir',
      preferences: ['Fitness', 'Cardio'],
    },
  },
])

// State
const showSubscriptionModal = ref(false)
const subscriptionStatus = ref<'active' | 'inactive' | 'trial'>('active')
const leadsUsed = ref(3)
const leadsAllowed = ref(10)
const leadsRemaining = computed(() => leadsAllowed.value - leadsUsed.value)
const trialDaysLeft = ref(7)
const currentPlan = ref<SubscriptionPlan | null>(null)

// Tabs configuration
const tabs = [
  { id: 'profile', name: 'Profil', icon: UserCircleIcon },
  { id: 'services', name: 'Services', icon: BriefcaseIcon },
  { id: 'leads', name: 'Leads', icon: DocumentTextIcon },
]

// Methods
const handlePhotoUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    // Handle photo upload
    console.log('Photo upload:', file)
  }
}

const addService = () => {
  // Add new service
  console.log('Add service')
}

const editService = (service: Service) => {
  // Edit service
  console.log('Edit service:', service)
}

const deleteService = (serviceId: string) => {
  // Delete service
  services.value = services.value.filter((s) => s.id !== serviceId)
}

const contactLead = (lead: Lead) => {
  lead.status = 'contacted'
  lead.contactedAt = new Date()
  console.log('Contact lead:', lead)
}

const markConverted = (lead: Lead) => {
  lead.status = 'converted'
  lead.convertedAt = new Date()
  console.log('Mark converted:', lead)
}

const getStatusLabel = (status: string) => {
  const labels = {
    new: 'Nouveau',
    viewed: 'Vu',
    contacted: 'Contacté',
    converted: 'Converti',
    lost: 'Perdu',
  }
  return labels[status as keyof typeof labels] || status
}

const handleSubscription = (plan: SubscriptionPlan) => {
  // Handle subscription
  console.log('Subscribe to plan:', plan)
  currentPlan.value = plan
  subscriptionStatus.value = 'active'
  showSubscriptionModal.value = false
}

// Lifecycle
onMounted(() => {
  // Load data
  console.log('Coach Profile loaded')
})
</script>

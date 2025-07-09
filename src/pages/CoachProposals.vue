<script setup lang="ts">
import { ref, computed } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  EllipsisVerticalIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  CreditCardIcon,
  ShoppingCartIcon,
} from '@heroicons/vue/24/outline'
import type { Proposal } from '@/types/Proposal'
import { FITNESS_LEVELS } from '@/constants/niveau'
import { COACHING_MODES } from '@/constants/preference'
import { PROPOSAL_STATUS_OPTIONS } from '@/constants/status'
import { useSubscriptionStore } from '@/stores/subscription'

// Store
const subscriptionStore = useSubscriptionStore()

// Mock data - same as before
// Helper function to get client name parts
const getClientNameParts = (clientId: string | number) => {
  // Mock client names - in real app this would come from API
  const mockNames = {
    123: 'Marie',
    456: 'Alexandre',
    789: 'Sophie',
  }
  const name = mockNames[clientId as keyof typeof mockNames] || 'Client'

  // Generate consistent fake characters based on clientId for privacy
  const fakeChars = 'abcdefghijklmnopqrstuvwxyz'
  const seed = typeof clientId === 'number' ? clientId : parseInt(clientId.toString()) || 0

  // Use seed to generate consistent fake name
  let randomGen = seed
  const randomLength = (randomGen % 4) + 4 // 4-7 characters based on ID
  let fakeRestOfName = ''

  for (let i = 0; i < randomLength; i++) {
    randomGen = (randomGen * 16807) % 2147483647 // Simple LCG for consistent randomness
    fakeRestOfName += fakeChars.charAt(randomGen % fakeChars.length)
  }

  return {
    firstLetter: name.charAt(0),
    fakeRestOfName: fakeRestOfName, // Consistent fake characters for privacy
    fullName: name,
  }
}

// Helper function to check if proposal is new (less than 3 hours old)
const isNewProposal = (createdAt: Date) => {
  const now = new Date()
  const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
  return diffHours < 3
}

// Helper function to format creation date (day/month only)
const formatCreationDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

// Helper function to get time ago
const getTimeAgo = (date: Date) => {
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
}

// Helper function to get time until expiration
const getTimeUntilExpiration = (expiresAt: Date) => {
  const now = new Date()
  const diffTime = expiresAt.getTime() - now.getTime()
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))

  if (diffTime <= 0) {
    return 'Expiré'
  }

  if (diffHours > 24) {
    const days = Math.floor(diffHours / 24)
    return `Expire dans ${days}j`
  }

  if (diffHours > 0) {
    return `Expire dans ${diffHours}h${diffMinutes > 0 ? ` ${diffMinutes}m` : ''}`
  }

  return `Expire dans ${diffMinutes}m`
}

// Helper function to get main objectives (max 2)
const getMainObjectives = (services: string[]) => {
  return services.slice(0, 2)
}

// Mock data with additional client info
const proposals = ref<Proposal[]>([
  {
    id: 1,
    client_id: 123,
    created_at: new Date('2025-07-09T08:30:00'), // 2 hours ago - should show "NEW"
    desired_start: 'immediatement',
    location: 'Paris',
    services: ['Perte de poids', 'Remise en forme', 'Cardio training', 'Sommeil'],
    level: 'debutant',
    group_preference: 'solo',
    languages: ['français'],
    availability: 'Lundi, mercredi, vendredi 18h-20h',
    gender_preference: 'peu_importe',
    status: 'pending',
    expires_at: new Date('2025-07-15T23:59:59'),
    is_paid_for: false,
    // Additional mock data
    client_gender: 'femme',
    client_age_group: '25-35 ans',
  },
  {
    id: 2,
    client_id: 456,
    created_at: new Date('2025-07-07T14:15:00'),
    desired_start: new Date('2025-07-20'),
    location: 'Lyon',
    services: ['Préparation physique', 'Nutrition sportive', 'Mental sportif'],
    level: 'intermediaire',
    group_preference: 'group',
    languages: ['français', 'anglais'],
    availability: 'Mardi, jeudi 19h-21h',
    gender_preference: 'homme',
    status: 'accepted',
    expires_at: new Date('2025-07-20T23:59:59'),
    is_paid_for: true,
    // Additional mock data
    client_gender: 'homme',
    client_age_group: '35-45 ans',
  },
  {
    id: 3,
    client_id: 789,
    created_at: new Date('2025-07-06T16:45:00'),
    desired_start: new Date('2025-07-25'),
    location: 'Marseille',
    services: ['Yoga', 'Méditation', 'Gestion du stress'],
    level: 'debutant',
    group_preference: 'solo',
    languages: ['français'],
    availability: 'Weekend 10h-12h',
    gender_preference: 'femme',
    status: 'pending',
    expires_at: new Date('2025-07-25T23:59:59'),
    is_paid_for: false,
    // Additional mock data
    client_gender: 'femme',
    client_age_group: '45-55 ans',
  },
])

const loading = ref(false)

// Helper functions
const toggleSubscription = () => {
  subscriptionStore.toggleSubscription()
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'text-amber-700 bg-amber-50 border-amber-200'
    case 'accepted':
    case 'confirmed':
      return 'text-green-700 bg-green-50 border-green-200'
    case 'rejected':
    case 'expired':
      return 'text-red-700 bg-red-50 border-red-200'
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200'
  }
}

const getLevelLabel = (level: string) => {
  switch (level) {
    case 'debutant':
      return FITNESS_LEVELS[0]
    case 'intermediaire':
      return FITNESS_LEVELS[1]
    case 'avance':
      return FITNESS_LEVELS[2]
    case 'professionnel':
      return FITNESS_LEVELS[3]
    default:
      return FITNESS_LEVELS[4]
  }
}

const getGroupPreferenceLabel = (preference: string) => {
  const mode = COACHING_MODES.find((mode) => mode.value === preference)
  return mode ? mode.label : preference
}

const getStatusLabel = (status: string) => {
  const statusOption = PROPOSAL_STATUS_OPTIONS.find((option) => option.value === status)
  return statusOption ? statusOption.label : status
}

const canAcceptReject = computed(() => (proposal: Proposal) => {
  return (
    subscriptionStore.hasActiveSubscription &&
    proposal.status === 'pending' &&
    !proposal.is_paid_for
  )
})

const shouldShowPaymentButtons = computed(() => (proposal: Proposal) => {
  return !subscriptionStore.hasActiveSubscription && !proposal.is_paid_for
})

// Action handlers
const handleSubscribe = () => {
  console.log('Redirecting to subscription page...')
}

const handleBuyLead = (proposalId: string | number) => {
  console.log('Buying lead for proposal:', proposalId)
}

const handleView = (proposal: Proposal) => {
  console.log('Viewing proposal:', proposal.id)
}

const handleAccept = (proposal: Proposal) => {
  console.log('Accepting proposal:', proposal.id)
}

const handleReject = (proposal: Proposal) => {
  console.log('Rejecting proposal:', proposal.id)
}

// Helper function for desired start date
const formatDesiredStart = (date: Date | string) => {
  if (typeof date === 'string' && date.toLowerCase() === 'immediatement') {
    return 'Immédiatement'
  }

  if (date instanceof Date) {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }

  return 'Non spécifiée'
}

// Define table columns for desktop
const columns = [
  { key: 'client_name', label: 'Client', class: 'w-[10%]' },
  { key: 'created_at', label: 'Créé', class: 'w-[7%]' },
  { key: 'gender_age', label: 'Genre & Âge', class: 'w-[11%]' },
  { key: 'level', label: 'Niveau', class: 'w-[8%]' },
  { key: 'objectives', label: 'Objectifs', class: 'w-[25%]' },
  { key: 'desired_start', label: 'Début', class: 'w-[8%]' },
  { key: 'format', label: 'Format', class: 'w-[7%]' },
  { key: 'location', label: 'Lieu', class: 'w-[9%]' },
  { key: 'expires_at', label: 'Expiration', class: 'w-[9%]' },
  { key: 'actions', label: 'Actions', class: 'w-[6%]' },
]
</script>

<template>
  <div class="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Demandes de coaching</h1>

      <!-- Debug section - remove in production -->
      <div class="inline-flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
        <button
          @click="toggleSubscription"
          :class="[
            'px-4 py-2 rounded-md font-medium transition-colors',
            subscriptionStore.hasActiveSubscription
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-green-600 text-white hover:bg-green-700',
          ]"
        >
          {{
            subscriptionStore.hasActiveSubscription
              ? '❌ Désactiver abonnement'
              : '✅ Activer abonnement'
          }}
        </button>
        <span class="text-sm text-gray-600">
          Statut: {{ subscriptionStore.hasActiveSubscription ? 'Abonné' : 'Non abonné' }}
          <span v-if="subscriptionStore.currentPlan" class="ml-2 text-blue-600">
            ({{ subscriptionStore.currentPlan.name }})
          </span>
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="text-gray-500 mt-4">Chargement des propositions...</p>
    </div>

    <!-- Desktop Table -->
    <div v-else class="hidden lg:block">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table class="w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                :class="[
                  'px-3 py-2 text-left text-2xs font-semibold text-gray-500 uppercase tracking-wider',
                  column.class,
                ]"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr
              v-for="proposal in proposals"
              :key="proposal.id"
              class="hover:bg-blue-50 transition-colors duration-150"
            >
              <!-- Client Name -->
              <td class="px-3 py-2 whitespace-nowrap">
                <div class="text-2xs font-medium text-gray-900">
                  <template v-if="subscriptionStore.hasActiveSubscription">
                    {{ getClientNameParts(proposal.client_id).fullName }}
                  </template>
                  <template v-else>
                    <span>{{ getClientNameParts(proposal.client_id).firstLetter }}</span
                    ><span class="blur-sm select-none">{{
                      getClientNameParts(proposal.client_id).fakeRestOfName
                    }}</span>
                  </template>
                  <!-- NEW badge for new proposals -->
                  <span
                    v-if="isNewProposal(proposal.created_at)"
                    class="ml-1 inline-flex items-center px-1 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800"
                  >
                    NEW
                  </span>
                </div>
              </td>

              <!-- Created Date -->
              <td class="px-3 py-2 whitespace-nowrap">
                <div class="relative group">
                  <div class="text-2xs text-gray-900 cursor-help">
                    {{ formatCreationDate(proposal.created_at) }}
                  </div>
                  <!-- Time ago tooltip -->
                  <div class="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                    <div
                      class="bg-gray-900 text-white text-[10px] rounded-lg py-1 px-1.5 whitespace-nowrap"
                    >
                      {{ getTimeAgo(proposal.created_at) }}
                      <!-- Arrow -->
                      <div
                        class="absolute top-full left-3 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-gray-900"
                      ></div>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Gender & Age -->
              <td class="px-3 py-2 whitespace-nowrap text-2xs text-gray-900">
                {{
                  proposal.client_gender === 'homme'
                    ? 'Homme'
                    : proposal.client_gender === 'femme'
                      ? 'Femme'
                      : 'Non spécifié'
                }}
                <div class="text-[10px] text-gray-500">
                  {{ proposal.client_age_group || 'Non spécifié' }}
                </div>
              </td>

              <!-- Level -->
              <td class="px-3 py-2 whitespace-nowrap">
                <span class="text-2xs text-gray-900">
                  {{ getLevelLabel(proposal.level) }}
                </span>
              </td>

              <!-- Main Objectives -->
              <td class="px-3 py-2">
                <div class="flex flex-wrap gap-0.5">
                  <span
                    v-for="(objective, index) in getMainObjectives(proposal.services)"
                    :key="index"
                    class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-800 border border-blue-200"
                  >
                    {{ objective }}
                  </span>
                </div>
              </td>

              <!-- Starting Date -->
              <td class="px-3 py-2 whitespace-nowrap">
                <span class="text-2xs text-gray-900">
                  {{ formatDesiredStart(proposal.desired_start) }}
                </span>
              </td>

              <!-- Format -->
              <td class="px-3 py-2 whitespace-nowrap">
                <span class="text-2xs text-gray-900">
                  {{ getGroupPreferenceLabel(proposal.group_preference) }}
                </span>
              </td>

              <!-- Location -->
              <td class="px-3 py-2 whitespace-nowrap">
                <span class="text-2xs text-gray-600"> 📍 {{ proposal.location }} </span>
              </td>

              <!-- Expiration -->
              <td class="px-3 py-2 whitespace-nowrap">
                <span
                  :class="[
                    'text-2xs font-medium',
                    getTimeUntilExpiration(proposal.expires_at) === 'Expiré'
                      ? 'text-red-600'
                      : getTimeUntilExpiration(proposal.expires_at).includes('h') ||
                          getTimeUntilExpiration(proposal.expires_at).includes('m')
                        ? 'text-amber-600'
                        : 'text-gray-600',
                  ]"
                >
                  {{ getTimeUntilExpiration(proposal.expires_at) }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-3 py-2 whitespace-nowrap text-center">
                <Menu as="div" class="relative inline-block text-left">
                  <MenuButton
                    class="inline-flex items-center justify-center w-6 h-6 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  >
                    <EllipsisVerticalIcon class="w-4 h-4 text-gray-600" />
                  </MenuButton>

                  <transition
                    enter-active-class="transition duration-100 ease-out"
                    enter-from-class="transform scale-95 opacity-0"
                    enter-to-class="transform scale-100 opacity-1"
                    leave-active-class="transition duration-75 ease-in"
                    leave-from-class="transform scale-100 opacity-100"
                    leave-to-class="transform scale-95 opacity-0"
                  >
                    <MenuItems
                      class="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <div class="py-1">
                        <!-- View -->
                        <MenuItem v-slot="{ active }">
                          <button
                            @click="handleView(proposal)"
                            :class="[
                              'group flex items-center w-full px-3 py-1.5 text-2xs transition-colors',
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            ]"
                          >
                            <EyeIcon class="mr-2 h-3 w-3" />
                            Voir
                          </button>
                        </MenuItem>

                        <!-- Accept/Reject (if subscription) -->
                        <template v-if="canAcceptReject(proposal)">
                          <MenuItem v-slot="{ active }">
                            <button
                              @click="handleAccept(proposal)"
                              :class="[
                                'group flex items-center w-full px-3 py-1.5 text-2xs transition-colors',
                                active ? 'bg-green-50 text-green-900' : 'text-green-700',
                              ]"
                            >
                              <CheckIcon class="mr-2 h-3 w-3" />
                              Accepter
                            </button>
                          </MenuItem>
                          <MenuItem v-slot="{ active }">
                            <button
                              @click="handleReject(proposal)"
                              :class="[
                                'group flex items-center w-full px-3 py-1.5 text-2xs transition-colors',
                                active ? 'bg-red-50 text-red-900' : 'text-red-700',
                              ]"
                            >
                              <XMarkIcon class="mr-2 h-3 w-3" />
                              Refuser
                            </button>
                          </MenuItem>
                        </template>

                        <!-- Payment options (if no subscription) -->
                        <template v-if="shouldShowPaymentButtons(proposal)">
                          <hr class="my-1 border-gray-200" />
                          <MenuItem v-slot="{ active }">
                            <button
                              @click="handleSubscribe()"
                              :class="[
                                'group flex items-center w-full px-3 py-1.5 text-2xs transition-colors',
                                active ? 'bg-blue-50 text-blue-900' : 'text-blue-700',
                              ]"
                            >
                              <CreditCardIcon class="mr-2 h-3 w-3" />
                              S'abonner
                            </button>
                          </MenuItem>
                          <MenuItem v-slot="{ active }">
                            <button
                              @click="handleBuyLead(proposal.id)"
                              :class="[
                                'group flex items-center w-full px-3 py-1.5 text-2xs transition-colors',
                                active ? 'bg-amber-50 text-amber-900' : 'text-amber-700',
                              ]"
                            >
                              <ShoppingCartIcon class="mr-2 h-3 w-3" />
                              Acheter ce lead
                            </button>
                          </MenuItem>
                        </template>
                      </div>
                    </MenuItems>
                  </transition>
                </Menu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div class="lg:hidden space-y-4">
      <div
        v-for="proposal in proposals"
        :key="proposal.id"
        class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        <!-- Card Header -->
        <div
          class="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-100"
        >
          <div class="flex-1">
            <h3 class="text-base font-semibold text-gray-900 mb-1">
              <template v-if="subscriptionStore.hasActiveSubscription">
                {{ getClientNameParts(proposal.client_id).fullName }}
              </template>
              <template v-else>
                <span>{{ getClientNameParts(proposal.client_id).firstLetter }}</span
                ><span class="blur-sm select-none">{{
                  getClientNameParts(proposal.client_id).fakeRestOfName
                }}</span>
              </template>
            </h3>
            <div class="flex items-center gap-3">
              <!-- Creation Date (clickable for time ago tooltip) -->
              <div class="relative group">
                <button
                  class="text-2xs text-gray-500 font-medium hover:text-gray-700 transition-colors"
                  type="button"
                >
                  {{ formatCreationDate(proposal.created_at) }}
                </button>
                <!-- Time ago tooltip -->
                <div class="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                  <div
                    class="bg-gray-900 text-white text-2xs rounded-lg py-1.5 px-2 whitespace-nowrap"
                  >
                    {{ getTimeAgo(proposal.created_at) }}
                    <!-- Arrow -->
                    <div
                      class="absolute top-full left-3 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-gray-900"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Status Badge -->
              <span
                v-if="isNewProposal(proposal.created_at)"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-green-100 text-green-800"
              >
                NEW
              </span>
              <span
                v-else
                :class="[
                  'inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium',
                  getStatusColor(proposal.status),
                ]"
              >
                {{ getStatusLabel(proposal.status) }}
              </span>
            </div>
          </div>

          <!-- Actions Menu -->
          <Menu as="div" class="relative ml-3">
            <MenuButton
              class="inline-flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <EllipsisVerticalIcon class="w-4 h-4 text-gray-600" />
            </MenuButton>

            <transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-1"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <MenuItems
                class="absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <div class="py-1">
                  <MenuItem v-slot="{ active }">
                    <button
                      @click="handleView(proposal)"
                      :class="[
                        'group flex items-center w-full px-3 py-2 text-sm transition-colors',
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      ]"
                    >
                      <EyeIcon class="mr-2 h-4 w-4" />
                      Voir
                    </button>
                  </MenuItem>

                  <template v-if="canAcceptReject(proposal)">
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="handleAccept(proposal)"
                        :class="[
                          'group flex items-center w-full px-3 py-2 text-sm transition-colors',
                          active ? 'bg-green-50 text-green-900' : 'text-green-700',
                        ]"
                      >
                        <CheckIcon class="mr-2 h-4 w-4" />
                        Accepter
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="handleReject(proposal)"
                        :class="[
                          'group flex items-center w-full px-3 py-2 text-sm transition-colors',
                          active ? 'bg-red-50 text-red-900' : 'text-red-700',
                        ]"
                      >
                        <XMarkIcon class="mr-2 h-4 w-4" />
                        Refuser
                      </button>
                    </MenuItem>
                  </template>

                  <template v-if="shouldShowPaymentButtons(proposal)">
                    <hr class="my-1 border-gray-200" />
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="handleSubscribe()"
                        :class="[
                          'group flex items-center w-full px-3 py-2 text-sm transition-colors',
                          active ? 'bg-blue-50 text-blue-900' : 'text-blue-700',
                        ]"
                      >
                        <CreditCardIcon class="mr-2 h-4 w-4" />
                        S'abonner
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="handleBuyLead(proposal.id)"
                        :class="[
                          'group flex items-center w-full px-3 py-2 text-sm transition-colors',
                          active ? 'bg-amber-50 text-amber-900' : 'text-amber-700',
                        ]"
                      >
                        <ShoppingCartIcon class="mr-2 h-4 w-4" />
                        Acheter ce lead
                      </button>
                    </MenuItem>
                  </template>
                </div>
              </MenuItems>
            </transition>
          </Menu>
        </div>

        <!-- Card Body -->
        <div class="px-4 py-3">
          <ul class="space-y-2 text-sm">
            <!-- Gender & Age -->
            <li class="flex justify-between">
              <span class="text-gray-600">Genre & Âge:</span>
              <span class="font-medium text-gray-900">
                {{
                  proposal.client_gender === 'homme'
                    ? 'Homme'
                    : proposal.client_gender === 'femme'
                      ? 'Femme'
                      : 'Non spécifié'
                }}
                {{ proposal.client_age_group ? ` | ${proposal.client_age_group}` : '' }}
              </span>
            </li>

            <!-- Level -->
            <li class="flex justify-between">
              <span class="text-gray-600">Niveau:</span>
              <span class="font-medium text-gray-900">{{ getLevelLabel(proposal.level) }}</span>
            </li>

            <!-- Main Objectives -->
            <li class="flex justify-between">
              <span class="text-gray-600">Objectifs:</span>
              <span class="font-medium text-gray-900 text-right">
                {{ getMainObjectives(proposal.services).join(', ') }}
              </span>
            </li>

            <!-- Starting Date -->
            <li class="flex justify-between">
              <span class="text-gray-600">Début:</span>
              <span class="font-medium text-gray-900">{{
                formatDesiredStart(proposal.desired_start)
              }}</span>
            </li>

            <!-- Coaching Preference -->
            <li class="flex justify-between">
              <span class="text-gray-600">Format:</span>
              <span class="font-medium text-gray-900">{{
                getGroupPreferenceLabel(proposal.group_preference)
              }}</span>
            </li>
          </ul>
        </div>

        <!-- Card Footer -->
        <div class="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <div class="flex justify-between items-center">
            <span class="text-2xs text-gray-500">📍 {{ proposal.location }}</span>
            <span
              :class="[
                'text-2xs font-medium',
                getTimeUntilExpiration(proposal.expires_at) === 'Expiré'
                  ? 'text-red-600'
                  : getTimeUntilExpiration(proposal.expires_at).includes('h') ||
                      getTimeUntilExpiration(proposal.expires_at).includes('m')
                    ? 'text-amber-600'
                    : 'text-gray-600',
              ]"
            >
              {{ getTimeUntilExpiration(proposal.expires_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!loading && proposals.length === 0"
      class="text-center py-16 bg-white rounded-xl border border-gray-200"
    >
      <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A9.971 9.971 0 0124 34c4.75 0 8.971 1.79 12.287 4.286"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune proposition en attente</h3>
      <p class="text-gray-500 max-w-sm mx-auto">
        Les nouvelles propositions de clients apparaîtront ici une fois qu'elles seront disponibles.
      </p>
    </div>
  </div>
</template>

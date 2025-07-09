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

// Mock data - same as before
const proposals = ref<Proposal[]>([
  {
    id: 1,
    client_id: 123,
    created_at: new Date('2025-07-08T10:30:00'),
    desired_start: new Date('2025-07-15'),
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
  },
])

const coachHasSubscription = ref(false)
const loading = ref(false)

// Helper functions
const toggleSubscription = () => {
  coachHasSubscription.value = !coachHasSubscription.value
}

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
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

const getLevelColor = (level: string) => {
  switch (level) {
    case 'debutant':
      return 'text-blue-700 bg-blue-50 border-blue-200'
    case 'intermediaire':
      return 'text-purple-700 bg-purple-50 border-purple-200'
    case 'avance':
      return 'text-red-700 bg-red-50 border-red-200'
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200'
  }
}

const getPreferenceColor = (preference: string) => {
  // Could customize colors based on preference type in the future
  return preference
    ? 'text-purple-700 bg-purple-50 border-purple-200'
    : 'text-gray-700 bg-gray-50 border-gray-200'
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
  return coachHasSubscription.value && proposal.status === 'pending' && !proposal.is_paid_for
})

const shouldShowPaymentButtons = computed(() => (proposal: Proposal) => {
  return !coachHasSubscription.value && !proposal.is_paid_for
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

// Define table columns for desktop
const columns = [
  { key: 'created_at', label: 'Créé', class: 'w-[15%]' },
  { key: 'services', label: 'Services Recherchés', class: 'w-[35%]' },
  { key: 'level', label: 'Niveau', class: 'w-[12%]' },
  { key: 'group_preference', label: 'Préférence', class: 'w-[15%]' },
  { key: 'status', label: 'Statut', class: 'w-[13%]' },
  { key: 'actions', label: 'Actions', class: 'w-[10%]' },
]
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Propositions en attente</h1>

      <!-- Debug section - remove in production -->
      <div class="inline-flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
        <button
          @click="toggleSubscription"
          :class="[
            'px-4 py-2 rounded-md font-medium transition-colors',
            coachHasSubscription
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-green-600 text-white hover:bg-green-700',
          ]"
        >
          {{ coachHasSubscription ? '❌ Désactiver abonnement' : '✅ Activer abonnement' }}
        </button>
        <span class="text-sm text-gray-600">
          Statut: {{ coachHasSubscription ? 'Abonné' : 'Non abonné' }}
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
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                :class="[
                  'px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
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
              <!-- Created Date -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDateTime(proposal.created_at) }}
              </td>

              <!-- Services -->
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="(service, index) in proposal.services.slice(0, 2)"
                    :key="index"
                    class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                  >
                    {{ service }}
                  </span>
                  <span
                    v-if="proposal.services.length > 2"
                    class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-600 border border-gray-300"
                  >
                    +{{ proposal.services.length - 2 }}
                  </span>
                </div>
              </td>

              <!-- Level -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
                    getLevelColor(proposal.level),
                  ]"
                >
                  {{ getLevelLabel(proposal.level) }}
                </span>
              </td>

              <!-- Preference -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
                    getPreferenceColor(proposal.group_preference),
                  ]"
                >
                  {{ getGroupPreferenceLabel(proposal.group_preference) }}
                </span>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
                    getStatusColor(proposal.status),
                  ]"
                >
                  {{ getStatusLabel(proposal.status) }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <Menu as="div" class="relative inline-block text-left">
                  <MenuButton
                    class="inline-flex items-center justify-center w-8 h-8 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  >
                    <EllipsisVerticalIcon class="w-5 h-5 text-gray-600" />
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
                      class="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <div class="py-1">
                        <!-- View -->
                        <MenuItem v-slot="{ active }">
                          <button
                            @click="handleView(proposal)"
                            :class="[
                              'group flex items-center w-full px-4 py-2 text-sm transition-colors',
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            ]"
                          >
                            <EyeIcon class="mr-3 h-4 w-4" />
                            Voir
                          </button>
                        </MenuItem>

                        <!-- Accept/Reject (if subscription) -->
                        <template v-if="canAcceptReject(proposal)">
                          <MenuItem v-slot="{ active }">
                            <button
                              @click="handleAccept(proposal)"
                              :class="[
                                'group flex items-center w-full px-4 py-2 text-sm transition-colors',
                                active ? 'bg-green-50 text-green-900' : 'text-green-700',
                              ]"
                            >
                              <CheckIcon class="mr-3 h-4 w-4" />
                              Accepter
                            </button>
                          </MenuItem>
                          <MenuItem v-slot="{ active }">
                            <button
                              @click="handleReject(proposal)"
                              :class="[
                                'group flex items-center w-full px-4 py-2 text-sm transition-colors',
                                active ? 'bg-red-50 text-red-900' : 'text-red-700',
                              ]"
                            >
                              <XMarkIcon class="mr-3 h-4 w-4" />
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
                                'group flex items-center w-full px-4 py-2 text-sm transition-colors',
                                active ? 'bg-blue-50 text-blue-900' : 'text-blue-700',
                              ]"
                            >
                              <CreditCardIcon class="mr-3 h-4 w-4" />
                              S'abonner
                            </button>
                          </MenuItem>
                          <MenuItem v-slot="{ active }">
                            <button
                              @click="handleBuyLead(proposal.id)"
                              :class="[
                                'group flex items-center w-full px-4 py-2 text-sm transition-colors',
                                active ? 'bg-amber-50 text-amber-900' : 'text-amber-700',
                              ]"
                            >
                              <ShoppingCartIcon class="mr-3 h-4 w-4" />
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
        class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in"
      >
        <div class="p-5">
          <!-- Card Header -->
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-sm text-gray-500 mb-1">Créé le</p>
              <p class="text-sm font-medium text-gray-900">
                {{ formatDateTime(proposal.created_at) }}
              </p>
            </div>
            <Menu as="div" class="relative">
              <MenuButton
                class="inline-flex items-center justify-center w-8 h-8 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                <EllipsisVerticalIcon class="w-5 h-5 text-gray-600" />
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
                  class="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  <div class="py-1">
                    <!-- Same menu items as desktop -->
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="handleView(proposal)"
                        :class="[
                          'group flex items-center w-full px-4 py-2 text-sm transition-colors',
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        ]"
                      >
                        <EyeIcon class="mr-3 h-4 w-4" />
                        Voir
                      </button>
                    </MenuItem>

                    <template v-if="canAcceptReject(proposal)">
                      <MenuItem v-slot="{ active }">
                        <button
                          @click="handleAccept(proposal)"
                          :class="[
                            'group flex items-center w-full px-4 py-2 text-sm transition-colors',
                            active ? 'bg-green-50 text-green-900' : 'text-green-700',
                          ]"
                        >
                          <CheckIcon class="mr-3 h-4 w-4" />
                          Accepter
                        </button>
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                        <button
                          @click="handleReject(proposal)"
                          :class="[
                            'group flex items-center w-full px-4 py-2 text-sm transition-colors',
                            active ? 'bg-red-50 text-red-900' : 'text-red-700',
                          ]"
                        >
                          <XMarkIcon class="mr-3 h-4 w-4" />
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
                            'group flex items-center w-full px-4 py-2 text-sm transition-colors',
                            active ? 'bg-blue-50 text-blue-900' : 'text-blue-700',
                          ]"
                        >
                          <CreditCardIcon class="mr-3 h-4 w-4" />
                          S'abonner
                        </button>
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                        <button
                          @click="handleBuyLead(proposal.id)"
                          :class="[
                            'group flex items-center w-full px-4 py-2 text-sm transition-colors',
                            active ? 'bg-amber-50 text-amber-900' : 'text-amber-700',
                          ]"
                        >
                          <ShoppingCartIcon class="mr-3 h-4 w-4" />
                          Acheter ce lead
                        </button>
                      </MenuItem>
                    </template>
                  </div>
                </MenuItems>
              </transition>
            </Menu>
          </div>

          <!-- Services -->
          <div class="mb-4">
            <p class="text-sm font-medium text-gray-700 mb-2">Services</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(service, index) in proposal.services"
                :key="index"
                class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200"
              >
                {{ service }}
              </span>
            </div>
          </div>

          <!-- Badges Row -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-sm font-medium text-gray-700 mb-1">Niveau</p>
              <span
                :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
                  getLevelColor(proposal.level),
                ]"
              >
                {{ getLevelLabel(proposal.level) }}
              </span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700 mb-1">Préférence</p>
              <span
                :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
                  getPreferenceColor(proposal.group_preference),
                ]"
              >
                {{ getGroupPreferenceLabel(proposal.group_preference) }}
              </span>
            </div>
          </div>

          <!-- Status -->
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm font-medium text-gray-700 mb-1">Statut</p>
              <span
                :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
                  getStatusColor(proposal.status),
                ]"
              >
                {{ getStatusLabel(proposal.status) }}
              </span>
            </div>
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

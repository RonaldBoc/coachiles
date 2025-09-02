<template>
  <CoachLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900">Mes Leads</h1>
              <p class="mt-1 text-sm text-gray-600">
                Gérez vos opportunités clients et suivez vos conversions
              </p>
            </div>
          </div>

          <!-- TESTING: Subscription Toggle Button (REMOVE IN PRODUCTION) -->
          <!-- <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-red-800">🧪 TESTING MODE</h3>
                <p class="text-sm text-red-700">
                  Current subscription: <strong>{{ coachSubscriptionType }}</strong>
                </p>
              </div>
              <button
                @click="toggleSubscriptionForTesting"
                class="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                :disabled="isLoading"
              >
                <span v-if="!isLoading">
                  {{
                    coachSubscriptionType === 'free'
                      ? '🧪 Activate Premium (DB)'
                      : '🧪 Cancel to Free (DB)'
                  }}
                </span>
                <span v-else>🔄 Updating...</span>
              </button>
            </div>
          </div> -->

          <!-- Subscription Notice -->
          <div
            v-if="isSubscriptionLimited"
            class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">Compte Gratuit - Accès Limité</h3>
                <div class="mt-2 text-sm text-yellow-700">
                  <p>
                    Vous avez débloqué {{ unlockedLeadsCount }} sur {{ maxUnlockedLeads }} leads
                    gratuits. Les autres leads sont masqués jusqu'à ce que vous passiez à un compte
                    premium.
                  </p>
                </div>
                <div class="mt-4">
                  <div class="-mx-2 -my-1.5 flex">
                    <button
                      type="button"
                      class="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                      @click="upgradeAccount"
                    >
                      Passer à Premium
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex flex-col sm:flex-row gap-4">
            <!-- Search -->
            <div class="flex-1">
              <label for="search" class="sr-only">Rechercher</label>
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher par objectifs, lieu..."
                class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Status Filter -->
            <div class="sm:w-48">
              <select
                v-model="selectedStatus"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }} ({{ getStatusCount(option.value) }})
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="bg-white rounded-lg shadow-sm p-8">
          <div class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-2 text-gray-600">Chargement des leads...</span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!filteredLeads.length" class="bg-white rounded-lg shadow-sm p-8">
          <div class="text-center">
            <div class="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0-4l4 4"
                />
              </svg>
            </div>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun lead trouvé</h3>
            <p class="mt-1 text-sm text-gray-500">
              {{
                selectedStatus === 'all'
                  ? "Vous n'avez pas encore de leads."
                  : 'Aucun lead ne correspond aux filtres sélectionnés.'
              }}
            </p>
          </div>
        </div>

        <!-- Leads Table -->
        <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Client
                  </th>
                  <th
                    class="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    class="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Objectifs
                  </th>
                  <th
                    class="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Lieu
                  </th>
                  <th
                    class="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Créé le
                  </th>
                  <th
                    class="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="lead in filteredLeads" :key="lead.id" class="hover:bg-gray-50">
                  <!-- Client -->
                  <td class="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                        <div
                          class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-500 flex items-center justify-center"
                        >
                          <span class="text-sm font-medium text-white">
                            {{ getLeadInitial(lead) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-3 sm:ml-4">
                        <div class="text-xs sm:text-sm font-medium text-gray-900 leading-tight">
                          {{ getLeadName(lead) }}
                        </div>
                        <div
                          class="text-[11px] sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-none"
                        >
                          {{ getLeadEmail(lead) }}
                        </div>
                      </div>
                      <div v-if="isNewLead(lead)" class="ml-2">
                        <span
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                        >
                          NEW
                        </span>
                      </div>
                    </div>
                  </td>

                  <!-- Status -->
                  <td class="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(lead.status),
                      ]"
                    >
                      {{ getStatusLabel(lead.status) }}
                    </span>
                  </td>

                  <!-- Objectifs (hidden on mobile) -->
                  <td class="hidden sm:table-cell px-6 py-4">
                    <div class="text-sm text-gray-900">
                      {{ getLeadGoals(lead) }}
                    </div>
                    <div v-if="lead.chosen_services?.length" class="text-sm text-gray-500">
                      {{ normalizeChosenServices(lead.chosen_services).slice(0, 2).join(', ') }}
                      <span v-if="normalizeChosenServices(lead.chosen_services).length > 2">
                        +{{ normalizeChosenServices(lead.chosen_services).length - 2 }}
                      </span>
                    </div>
                  </td>

                  <!-- Lieu -->
                  <td
                    class="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900"
                  >
                    {{ formatLocation(lead.location) }}
                  </td>

                  <!-- Créé le -->
                  <td
                    class="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-[11px] sm:text-sm text-gray-500"
                  >
                    <div class="leading-tight">{{ formatDate(lead.created_at) }}</div>
                    <div class="text-[10px] sm:text-xs">{{ getTimeAgo(lead.created_at) }}</div>
                  </td>

                  <!-- Actions -->
                  <td
                    class="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium"
                  >
                    <Menu as="div" class="relative inline-block text-left">
                      <div>
                        <MenuButton
                          class="flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          <EllipsisVerticalIcon class="h-5 w-5" />
                        </MenuButton>
                      </div>

                      <transition
                        enter-active-class="transition ease-out duration-100"
                        enter-from-class="transform opacity-0 scale-95"
                        enter-to-class="transform opacity-100 scale-100"
                        leave-active-class="transition ease-in duration-75"
                        leave-from-class="transform opacity-100 scale-100"
                        leave-to-class="transform opacity-0 scale-95"
                      >
                        <MenuItems
                          class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                          <MenuItem v-slot="{ active }">
                            <button
                              @click="viewLead(lead)"
                              :class="[
                                active ? 'bg-gray-100' : '',
                                'flex w-full items-center px-4 py-2 text-sm text-gray-700',
                              ]"
                            >
                              <EyeIcon class="mr-3 h-4 w-4" />
                              {{
                                canAccessLeadDetails(lead)
                                  ? 'Voir les détails'
                                  : 'Débloquer (Premium)'
                              }}
                            </button>
                          </MenuItem>

                          <!-- (Additional status actions could be added here) -->
                        </MenuItems>
                      </transition>
                    </Menu>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <!-- Lead Details Modal -->
      <div
        v-if="selectedLead"
        class="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
        @click.self="selectedLead = null"
      >
        <div class="w-full max-w-lg bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b">
            <h2 class="text-lg font-semibold text-gray-900">Détails du Lead</h2>
            <button @click="selectedLead = null" class="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <div class="p-4 space-y-4 text-sm">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-gray-500">Nom</div>
                <div class="font-medium text-gray-900">{{ getLeadName(selectedLead!) }}</div>
              </div>
              <div>
                <div class="text-gray-500">Email</div>
                <div class="font-medium text-gray-900">{{ getLeadEmail(selectedLead!) }}</div>
              </div>
              <div>
                <div class="text-gray-500">Lieu</div>
                <div class="font-medium text-gray-900">{{ selectedLead!.location || '—' }}</div>
              </div>
              <div v-if="selectedLead?.chosen_services?.length">
                <div class="text-gray-500">Services choisis</div>
                <div class="font-medium text-gray-900 text-xs">
                  {{ normalizeChosenServices(selectedLead!.chosen_services).join(', ') }}
                </div>
              </div>
              <div>
                <div class="text-gray-500">Créé le</div>
                <div class="font-medium text-gray-900">
                  {{ formatDate(selectedLead!.created_at) }}
                </div>
              </div>
            </div>
            <div>
              <div class="text-gray-500 mb-1">Objectifs</div>
              <div class="text-gray-900 whitespace-pre-wrap">{{ getLeadGoals(selectedLead!) }}</div>
            </div>
            <div v-if="canAccessLeadDetails(selectedLead!)">
              <div class="text-gray-500 mb-1">Données complètes</div>
              <div class="space-y-1">
                <div v-if="selectedLead!.client_phone">
                  <span class="font-medium">Téléphone:</span> {{ selectedLead!.client_phone }}
                </div>
                <div v-if="selectedLead!.goals">
                  <span class="font-medium">Objectifs:</span> {{ selectedLead!.goals }}
                </div>
                <div v-if="selectedLead!.additional_info">
                  <span class="font-medium">Infos sup.:</span> {{ selectedLead!.additional_info }}
                </div>
              </div>
              <!-- Chosen services already shown above; removed coach offered services block -->

              <!-- Coach Note -->
              <div class="mt-4">
                <label class="text-gray-500 mb-1 block text-sm">Note coach (privée)</label>
                <textarea
                  v-model="coachNoteDraft"
                  rows="3"
                  class="w-full text-sm rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-y"
                  placeholder="Vos notes sur ce lead..."
                />
                <div class="mt-2 flex items-center gap-2">
                  <button
                    @click="saveCoachNote"
                    :disabled="isSavingNote"
                    class="px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {{ isSavingNote ? 'Sauvegarde...' : 'Sauvegarder' }}
                  </button>
                  <span v-if="noteError" class="text-xs text-red-600">{{ noteError }}</span>
                </div>
              </div>
            </div>
            <div v-else class="p-3 rounded bg-yellow-50 text-yellow-800 text-xs">
              Plus de détails disponibles avec un compte Premium.
            </div>
            <div class="pt-2 flex justify-end">
              <button
                @click="selectedLead = null"
                class="px-4 py-2 rounded bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
            <div class="pt-4 border-t">
              <h3 class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Mettre à jour le statut
              </h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="status in availableStatusUpdates"
                  :key="status.value"
                  @click="changeLeadStatus(status.value)"
                  :disabled="isUpdatingStatus || status.value === selectedLead!.status"
                  :class="[
                    'px-3 py-1 rounded text-xs font-medium border transition',
                    status.value === selectedLead!.status
                      ? 'bg-gray-200 text-gray-600 cursor-default'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
                  ]"
                >
                  {{ status.label }}
                </button>
              </div>
              <div v-if="statusError" class="mt-2 text-xs text-red-600">{{ statusError }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CoachLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { EllipsisVerticalIcon, EyeIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import type { Lead } from '@/types/Lead'
import CoachLayout from '@/layouts/CoachLayout.vue'
import LeadService from '@/services/leadService'
import supabaseLeadApi from '@/services/supabaseLeadApi'
import { supabaseCoachServicesApi } from '@/services/supabaseCoachServicesApi'
import type { CoachService } from '@/types/service'

// Router
const route = useRoute()
const router = useRouter()

// Stores
const authStore = useAuthStore()

// State
const leads = ref<Lead[]>([])
const isLoading = ref(false)
const selectedLead = ref<Lead | null>(null)
const coachServices = ref<CoachService[]>([])
const isLoadingServices = ref(false)
const coachNoteDraft = ref('')
const isSavingNote = ref(false)
const noteError = ref<string | null>(null)
const selectedStatus = ref('all')
const searchQuery = ref('')
const coachSubscriptionType = ref<string>('free') // Track actual subscription status

// Computed
const currentCoach = computed(() => authStore.coach)
const isSubscriptionLimited = computed(() => coachSubscriptionType.value === 'free')
const maxUnlockedLeads = computed(() => (isSubscriptionLimited.value ? 2 : Infinity))

// Reactive unlocked leads based on subscription
const unlockedLeads = computed(() => {
  const unlockedSet = new Set<string>()
  // consider only non-hidden leads
  const visibleLeads = leads.value.filter((l) => !l.is_hidden)
  if (coachSubscriptionType.value !== 'free') {
    visibleLeads.forEach((lead) => unlockedSet.add(lead.id))
  } else {
    const sortedLeads = [...visibleLeads].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
    sortedLeads.slice(0, 2).forEach((lead) => unlockedSet.add(lead.id))
  }

  return unlockedSet
})

const unlockedLeadsCount = computed(() => unlockedLeads.value.size)

// Filtered leads
const filteredLeads = computed(() => {
  let filtered = leads.value.filter((l) => !l.is_hidden)

  // Filter by status
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter((lead) => lead.status === selectedStatus.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter((lead) => {
      return (
        lead.goals?.toLowerCase().includes(query) ||
        lead.location?.toLowerCase().includes(query) ||
        (canAccessLeadDetails(lead) &&
          (lead.client_name?.toLowerCase().includes(query) ||
            lead.client_email?.toLowerCase().includes(query)))
      )
    })
  }

  return filtered
})

// Status options
const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'new', label: 'Nouvelles' },
  { value: 'assigned', label: 'Assignées' },
  { value: 'contacted', label: 'Contactées' },
  { value: 'converted', label: 'Converties' },
  { value: 'closed', label: 'Fermées' },
]

// Helper functions
const canAccessLeadDetails = (lead: Lead): boolean => {
  if (coachSubscriptionType.value !== 'free') return true
  return unlockedLeads.value.has(lead.id)
}

// Normalize chosen_services which may be an array of strings (legacy) or array of objects
// Returns array of service title strings for display
function normalizeChosenServices(raw: Lead['chosen_services'] | undefined | null): string[] {
  if (!raw) return []
  const arr = raw as unknown[]
  if (!Array.isArray(arr)) return []
  if (arr.length === 0) return []
  if (typeof arr[0] === 'string') return arr as string[]
  return (arr as { title?: string }[])
    .map((o) => (o && typeof o.title === 'string' ? o.title : null))
    .filter((v): v is string => !!v)
}

const getLeadName = (lead: Lead): string => {
  if (canAccessLeadDetails(lead)) {
    return lead.client_name || 'Client inconnu'
  }
  return 'Client masqué'
}

const getLeadEmail = (lead: Lead): string => {
  if (canAccessLeadDetails(lead)) {
    return lead.client_email || ''
  }
  return '***@***.***'
}

const getLeadInitial = (lead: Lead): string => {
  if (canAccessLeadDetails(lead)) {
    return lead.client_name?.charAt(0)?.toUpperCase() || '?'
  }
  return '?'
}

const getLeadGoals = (lead: Lead): string => {
  if (canAccessLeadDetails(lead)) {
    return lead.goals || '-'
  }
  return 'Objectifs masqués (Premium requis)'
}

const getStatusCount = (status: string): number => {
  const visible = leads.value.filter((l) => !l.is_hidden)
  if (status === 'all') return visible.length
  return visible.filter((lead) => lead.status === status).length
}

const isNewLead = (lead: Lead): boolean => {
  const now = new Date()
  const createdAt = new Date(lead.created_at)
  const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
  return diffHours < 24 && lead.status === 'new'
}

const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(new Date(date))
}

const getTimeAgo = (date: string): string => {
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60))

  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes}min`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `Il y a ${diffHours}h`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `Il y a ${diffDays}j`
}

const getStatusColor = (status: string): string => {
  const colors = {
    new: 'bg-green-100 text-green-800',
    assigned: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    converted: 'bg-purple-100 text-purple-800',
    closed: 'bg-gray-100 text-gray-800',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string): string => {
  const labels = {
    new: 'Nouvelle',
    assigned: 'Assignée',
    contacted: 'Contactée',
    converted: 'Convertie',
    closed: 'Fermée',
  }
  return labels[status as keyof typeof labels] || status
}

// Normalization helper (lowercase, remove diacritics & apostrophes, compress whitespace)
const normalizeCity = (raw: string) =>
  raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/'/g, '')
    .replace(/\s+/g, ' ')
    .trim()

// Complete commune lists for MQ (Martinique, 34), GP (Guadeloupe incl. dependencies, 32), GY (Guyane, 22)
// Source: INSEE commune lists (normalized at runtime)
const CITY_ISLAND_CODE: Record<string, string> = (() => {
  const groups: Record<string, string[]> = {
    MQ: [
      'Fort-de-France',
      'Le Lamentin',
      'Le Robert',
      'Le François',
      'Ducos',
      'Saint-Joseph',
      'La Trinité',
      'Le Marin',
      'Sainte-Anne',
      'Le Vauclin',
      'Le Diamant',
      'Sainte-Luce',
      'Rivière-Salée',
      'Les Trois-Îlets',
      'Le Carbet',
      'Case-Pilote',
      'Bellefontaine',
      'Prêcheur',
      'Saint-Pierre',
      'Morne-Rouge',
      'Le Morne-Vert',
      'Fonds-Saint-Denis',
      'Schoelcher',
      'Gros-Morne',
      'Saint-Esprit',
      "Anses-d'Arlet",
      'Marigot',
      'Lorrain',
      'Ajoupa-Bouillon',
      'Macouba',
      "Grand'Rivière",
      'Basse-Pointe',
      'Sainte-Marie',
    ],
    GP: [
      'Basse-Terre',
      'Saint-Claude',
      'Baillif',
      'Vieux-Habitants',
      'Bouillante',
      'Pointe-Noire',
      'Deshaies',
      'Sainte-Rose',
      'Lamentin',
      'Petit-Bourg',
      'Goyave',
      'Capesterre-Belle-Eau',
      'Trois-Rivières',
      'Vieux-Fort',
      'Gourbeyre',
      'Baie-Mahault',
      'Les Abymes',
      'Pointe-à-Pitre',
      'Le Gosier',
      'Sainte-Anne',
      'Saint-François',
      'Petit-Canal',
      'Port-Louis',
      'Anse-Bertrand',
      "Morne-à-l'Eau",
      'Le Moule',
      'Saint-Louis',
      'Grand-Bourg',
      'Capesterre-de-Marie-Galante',
      'Terre-de-Bas',
      'Terre-de-Haut',
      'La Désirade',
    ],
    GY: [
      'Cayenne',
      'Matoury',
      'Remire-Montjoly',
      'Macouria',
      'Montsinéry-Tonnegrande',
      'Roura',
      'Kourou',
      'Sinnamary',
      'Iracoubo',
      'Saint-Laurent-du-Maroni',
      'Mana',
      'Awala-Yalimapo',
      'Saint-Georges', // Saint-Georges-de-l'Oyapock (short form)
      'Ouanary',
      'Régina',
      'Camopi',
      'Saul',
      'Maripasoula',
      'Papaïchton',
      'Grand-Santi',
      'Apatou',
      'Saint-Élie',
    ],
  }
  const map: Record<string, string> = {}
  Object.entries(groups).forEach(([code, cities]) => {
    cities.forEach((c) => {
      map[normalizeCity(c)] = code
    })
  })
  return map
})()

const getIslandCodeByCity = (city?: string | null): string | null => {
  if (!city) return null
  const norm = normalizeCity(city)
  return CITY_ISLAND_CODE[norm] || null
}

const formatLocation = (location?: string | null): string => {
  if (!location) return '-'
  const code = getIslandCodeByCity(location)
  if (code && !location.toUpperCase().includes(`, ${code}`)) return `${location}, ${code}`
  return location
}

// Actions
const loadLeads = async () => {
  if (!currentCoach.value?.id) return

  try {
    isLoading.value = true

    console.log('📋 Loading coach subscription status from Supabase...')
    console.log('🔍 Coach ID:', currentCoach.value.id)

    // Load subscription info and leads in parallel
    const [subscriptionInfo, data] = await Promise.all([
      LeadService.getCoachSubscriptionInfo(currentCoach.value.id),
      LeadService.getCoachLeads(currentCoach.value.id),
    ])

    // Log detailed subscription information
    console.log('📊 Subscription Status Loaded:', {
      subscriptionType: subscriptionInfo.subscriptionType,
      maxUnlockedLeads: subscriptionInfo.maxUnlockedLeads,
      unlockedLeadsCount: subscriptionInfo.unlockedLeadsCount,
      isSubscriptionLimited: subscriptionInfo.subscriptionType === 'free',
    })

    // Update reactive subscription status
    coachSubscriptionType.value = subscriptionInfo.subscriptionType
    leads.value = data

    console.log('✅ Page loaded with subscription status:', coachSubscriptionType.value)
    console.log('📈 Total leads loaded:', data.length)
  } catch (error) {
    console.error('❌ Failed to load leads or subscription status:', error)
  } finally {
    isLoading.value = false
  }
}

const viewLead = (lead: Lead) => {
  // If lead is locked (not accessible), trigger upgrade instead of viewing details
  if (!canAccessLeadDetails(lead)) {
    upgradeAccount()
    return
  }

  selectedLead.value = lead
  // Initialize note draft
  coachNoteDraft.value = lead.coach_note || ''
  // Lazy-load services if not already
  if (!coachServices.value.length) {
    loadCoachServices()
  }
}

// Status update logic
const isUpdatingStatus = ref(false)
const statusError = ref<string | null>(null)
const availableStatusUpdates = [
  { value: 'new', label: 'Nouvelle' },
  { value: 'assigned', label: 'Assignée' },
  { value: 'contacted', label: 'Contactée' },
  { value: 'converted', label: 'Convertie' },
  { value: 'closed', label: 'Fermée' },
]

const changeLeadStatus = async (newStatus: string) => {
  if (!selectedLead.value) return
  if (selectedLead.value.status === newStatus) return
  statusError.value = null
  try {
    isUpdatingStatus.value = true
    const updated = await supabaseLeadApi.updateLeadStatus(selectedLead.value.id, newStatus)
    // Update local leads array
    const idx = leads.value.findIndex((l) => l.id === updated.id)
    if (idx !== -1) {
      leads.value[idx] = { ...leads.value[idx], ...updated }
    }
    selectedLead.value = { ...selectedLead.value, ...updated }
  } catch (e: unknown) {
    console.error('Failed to update status', e)
    statusError.value =
      e && typeof e === 'object' && 'message' in e
        ? String((e as { message?: unknown }).message || 'Erreur lors de la mise à jour.')
        : 'Erreur lors de la mise à jour.'
  } finally {
    isUpdatingStatus.value = false
  }
}

const loadCoachServices = async () => {
  try {
    isLoadingServices.value = true
    coachServices.value = await supabaseCoachServicesApi.getCoachServices()
  } catch (e) {
    console.error('Failed to load coach services', e)
  } finally {
    isLoadingServices.value = false
  }
}

const saveCoachNote = async () => {
  if (!selectedLead.value) return
  noteError.value = null
  try {
    isSavingNote.value = true
    const updated = await supabaseLeadApi.addNote(selectedLead.value.id, coachNoteDraft.value)
    const idx = leads.value.findIndex((l) => l.id === updated.id)
    if (idx !== -1) leads.value[idx] = { ...leads.value[idx], ...updated }
    selectedLead.value = { ...selectedLead.value, ...updated }
  } catch {
    noteError.value = 'Erreur lors de la sauvegarde.'
  } finally {
    isSavingNote.value = false
  }
}

const upgradeAccount = () => {
  // Navigate to subscription upgrade page
  console.log('Navigate to upgrade page')
}

// Lifecycle
onMounted(() => {
  if (currentCoach.value?.id) {
    loadLeads()
  }
})

// Ensure leads load when auth store finishes initializing
watch(
  () => currentCoach.value?.id,
  (id) => {
    if (id && leads.value.length === 0 && !isLoading.value) {
      loadLeads()
    }
  },
)

// After leads load, auto-open if query leadId matches
watch(
  () => leads.value.length,
  () => {
    const leadId = route.query.leadId as string | undefined
    if (leadId) {
      const lead = leads.value.find((l) => l.id === leadId)
      if (lead) {
        viewLead(lead)
        // remove the query param silently
        router.replace({ query: { ...route.query, leadId: undefined } })
      }
    }
  },
)

// React immediately to route query changes (navigation from notification)
watch(
  () => route.query.leadId,
  (leadId) => {
    if (!leadId) return
    const lead = leads.value.find((l) => l.id === leadId)
    if (lead) {
      viewLead(lead)
      router.replace({ query: { ...route.query, leadId: undefined } })
    }
  },
)
</script>

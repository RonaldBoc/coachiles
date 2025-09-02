<template>
  <CoachLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900">Mes Leads</h1>
              <p class="mt-1 text-sm text-gray-600">
                Gérez vos opportunités clients et suivez vos conversions.
              </p>
            </div>
          </div>

          <!-- Subscription Notice (free plan limit) -->
          <div
            v-if="subscriptionLoaded && isSubscriptionLimited"
            class="mt-5 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div class="flex items-start gap-3">
              <svg
                class="h-5 w-5 text-yellow-400 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="flex-1">
                <h3 class="text-sm font-medium text-yellow-800">Compte Gratuit - Accès Limité</h3>
                <p class="mt-1 text-xs sm:text-sm text-yellow-700 leading-relaxed">
                  Vous avez débloqué {{ unlockedLeadsCount }} sur {{ maxUnlockedLeads }} leads
                  gratuits. Les autres leads sont masqués jusqu'à ce que vous passiez à un compte
                  premium.
                </p>
                <div class="mt-3">
                  <button
                    type="button"
                    class="bg-yellow-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-600"
                    @click="upgradeAccount"
                  >
                    Passer à Premium
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="mt-6 bg-white rounded-lg shadow-sm p-5">
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
          <div
            v-if="isLoading"
            class="mt-6 bg-white rounded-lg shadow-sm p-8 text-center text-sm text-gray-600"
          >
            <div class="flex items-center justify-center gap-2">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Chargement des leads...</span>
            </div>
          </div>
          <!-- Empty State -->
          <div
            v-else-if="!filteredLeads.length"
            class="mt-6 bg-white rounded-lg shadow-sm p-8 text-center"
          >
            <div class="mx-auto h-10 w-10 text-gray-400 mb-2">
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
          <!-- Leads Table -->
          <div v-else class="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
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
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr
                    v-for="lead in filteredLeads"
                    :key="lead.id"
                    class="hover:bg-blue-50 cursor-pointer transition-colors"
                    @click="viewLead(lead)"
                    tabindex="0"
                    @keydown.enter.prevent="viewLead(lead)"
                    @keydown.space.prevent="viewLead(lead)"
                    aria-label="Voir le lead"
                  >
                    <td class="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div>
                        <div class="text-xs sm:text-sm font-medium text-gray-900 leading-tight">
                          {{ getLeadName(lead) }}
                        </div>
                        <div
                          class="text-[11px] sm:text-sm text-gray-500 truncate max-w-[160px] sm:max-w-none"
                        >
                          {{ getLeadEmail(lead) }}
                        </div>
                      </div>
                    </td>
                    <td class="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <span
                        :class="[
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getStatusColor(lead.status),
                        ]"
                        >{{ getStatusLabel(lead.status) }}</span
                      >
                    </td>
                    <td class="hidden sm:table-cell px-6 py-4">
                      <!-- Show services if any were chosen, otherwise show goals -->
                      <div v-if="lead.chosen_services?.length" class="text-sm text-gray-900">
                        {{ getLeadServiceTitles(lead).slice(0, 2).join(', ') }}
                        <span v-if="getLeadServiceTitles(lead).length > 2" class="text-gray-500"
                          >+{{ getLeadServiceTitles(lead).length - 2 }}</span
                        >
                      </div>
                      <div v-else class="text-sm text-gray-900">
                        {{ getLeadGoals(lead) }}
                      </div>
                    </td>
                    <td
                      class="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900"
                    >
                      {{ formatLocation(lead.location) }}
                    </td>
                    <td
                      class="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-[11px] sm:text-sm text-gray-500"
                    >
                      <div class="leading-tight">{{ formatDate(lead.created_at) }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- Revamped Lead Details Modal -->
          <div
            v-if="selectedLead"
            class="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
            @click.self="selectedLead = null"
          >
            <div
              class="w-full max-w-lg max-h-[90vh] bg-white rounded-lg shadow-lg flex flex-col overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Détails du lead"
            >
              <div class="flex items-center justify-between px-4 py-3 border-b shrink-0">
                <h2 class="text-lg font-semibold text-gray-900">Détails du Lead</h2>
                <button @click="selectedLead = null" class="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              <div class="p-4 space-y-6 text-sm overflow-y-auto flex-1 min-h-0">
                <section>
                  <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Profil
                  </h3>
                  <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <div class="text-gray-500">Nom</div>
                      <div class="font-medium text-gray-900">{{ getLeadName(selectedLead!) }}</div>
                    </div>
                    <div
                      v-if="
                        selectedLead!.client_age !== null && selectedLead!.client_age !== undefined
                      "
                    >
                      <div class="text-gray-500">Âge</div>
                      <div class="font-medium text-gray-900">
                        {{ selectedLead!.client_age }} ans
                      </div>
                    </div>
                    <div v-if="selectedLead!.client_gender">
                      <div class="text-gray-500">Genre</div>
                      <div class="font-medium text-gray-900">
                        {{ formatGender((selectedLead as any).client_gender) }}
                      </div>
                    </div>
                    <div v-if="(selectedLead as any).experience">
                      <div class="text-gray-500">Expérience</div>
                      <div class="font-medium text-gray-900">
                        {{ formatExperience((selectedLead as any).experience) }}
                      </div>
                    </div>
                    <div v-if="availabilityDaysLabel !== '-'" class="col-span-2">
                      <div class="text-gray-500">Disponibilités</div>
                      <div class="font-medium text-gray-900">{{ availabilityDaysLabel }}</div>
                    </div>
                    <div class="col-span-2">
                      <div class="text-gray-500">Objectifs</div>
                      <div class="font-medium text-gray-900 whitespace-pre-wrap">
                        {{ getLeadGoals(selectedLead!) }}
                      </div>
                    </div>
                    <div v-if="(selectedLead as any).start_timeframe" class="col-span-2">
                      <div class="text-gray-500">Démarrage</div>
                      <div class="font-medium text-gray-900">
                        {{ (selectedLead as any).start_timeframe }}
                      </div>
                    </div>
                  </div>
                </section>
                <section v-if="selectedLead!.additional_info">
                  <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Message du client
                  </h3>
                  <div class="p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap text-gray-700">
                    {{ selectedLead!.additional_info }}
                  </div>
                </section>
                <section>
                  <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Contact
                  </h3>
                  <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <div class="text-gray-500">Email</div>
                      <div class="font-medium text-gray-900 break-all">
                        {{ getLeadEmail(selectedLead!) }}
                      </div>
                    </div>
                    <div>
                      <div class="text-gray-500">Téléphone</div>
                      <div class="font-medium text-gray-900">
                        {{ selectedLead!.client_phone || '—' }}
                      </div>
                    </div>
                    <div class="col-span-2">
                      <div class="text-gray-500">Lieu</div>
                      <div class="font-medium text-gray-900">
                        {{ formatLocation(selectedLead!.location as any) }}
                      </div>
                    </div>
                    <div class="col-span-2">
                      <div class="text-gray-500">Créé le</div>
                      <div class="font-medium text-gray-900">
                        {{ formatDate(selectedLead!.created_at) }}
                      </div>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Services sélectionnés par ce lead
                  </h3>
                  <div v-if="detailedChosenServices.length" class="space-y-2">
                    <div
                      v-for="(svc, i) in detailedChosenServices"
                      :key="i"
                      class="border rounded p-2 bg-gray-50"
                    >
                      <div class="text-[11px] font-semibold text-gray-800 truncate">
                        {{ svc.title }}
                      </div>
                      <div
                        class="text-[11px] text-gray-600 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5"
                      >
                        <span><span class="text-gray-400">Jours:</span> {{ svc.daysLabel }}</span>
                        <span v-if="svc.modalitiesLabel !== '-'"
                          ><span class="text-gray-400">Modalités:</span>
                          {{ svc.modalitiesLabel }}</span
                        >
                        <span v-if="svc.locationsLabel !== '-'"
                          ><span class="text-gray-400">Lieux:</span> {{ svc.locationsLabel }}</span
                        >
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-xs text-gray-500 italic">Aucun service sélectionné</div>
                </section>
                <section>
                  <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Note coach
                  </h3>
                  <div>
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
                </section>
                <section class="pt-2 border-t">
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
                </section>
                <div class="flex justify-end">
                  <button
                    @click="selectedLead = null"
                    class="px-4 py-2 rounded bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300"
                  >
                    Fermer
                  </button>
                </div>
              </div>
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
// Removed dropdown actions menu imports
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
const subscriptionLoaded = ref(false)

// Subscription limits (constants for free tier)
const maxUnlockedLeads = 2 // free tier lead unlock limit
const unlockedLeadsCount = computed(() => unlockedLeads.value.size)
const isSubscriptionLimited = computed(() => coachSubscriptionType.value === 'free')

// Computed
const currentCoach = computed(() => authStore.coach)

// Reactive unlocked leads based on subscription
const unlockedLeads = computed(() => {
  const unlockedSet = new Set<string>()
  // consider only non-hidden, non do_not_contact leads
  const visibleLeads = leads.value.filter((l) => !l.is_hidden && !l.do_not_contact)
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

// Filtered leads
const filteredLeads = computed(() => {
  let filtered = leads.value.filter((l) => !l.is_hidden && !l.do_not_contact)

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

// Helper functions
const canAccessLeadDetails = (lead: Lead): boolean => {
  if (coachSubscriptionType.value !== 'free') return true
  return unlockedLeads.value.has(lead.id)
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

const getLeadGoals = (lead: Lead): string => {
  if (canAccessLeadDetails(lead)) {
    return lead.goals || '-'
  }
  return 'Objectifs masqués (Premium requis)'
}

// Return array of service titles (chosen services) for a lead – empty if none or not accessible
const getLeadServiceTitles = (lead: Lead): string[] => {
  if (!canAccessLeadDetails(lead)) return []
  try {
    return parseChosenServicesDetailed(lead.chosen_services)
      .map((s) => s.title)
      .filter(Boolean)
  } catch {
    return []
  }
}

const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(new Date(date))
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

// Status filter options for UI
const statusOptions = [
  { value: 'all', label: 'Tous' },
  { value: 'new', label: 'Nouveaux' },
  { value: 'assigned', label: 'Assignés' },
  { value: 'contacted', label: 'Contactés' },
  { value: 'converted', label: 'Convertis' },
  { value: 'closed', label: 'Fermés' },
]
const getStatusCount = (status: string) => {
  if (status === 'all') return leads.value.filter((l) => !l.is_hidden && !l.do_not_contact).length
  return leads.value.filter((l) => l.status === status && !l.is_hidden && !l.do_not_contact).length
}

// Formatting helpers for extended details
const formatGender = (gender?: string | null): string => {
  if (!gender) return '-'
  const map: Record<string, string> = {
    male: 'Homme',
    female: 'Femme',
    other: 'Autre',
  }
  return map[gender.toLowerCase()] || capitalizeFirst(gender)
}

const formatExperience = (exp?: string | null): string => {
  if (!exp) return '-'
  const map: Record<string, string> = {
    debutant: 'Débutant',
    intermediaire: 'Intermédiaire',
    avance: 'Avancé',
    expert: 'Expert',
  }
  return map[exp.toLowerCase()] || capitalizeFirst(exp)
}

// Chosen services detailed parsing
interface ChosenServiceDetailed {
  title: string
  days?: number[]
  locations?: string[]
  modalities?: string[]
  daysLabel?: string
  locationsLabel?: string
  modalitiesLabel?: string
}

function parseChosenServicesDetailed(
  raw: Lead['chosen_services'] | undefined | null,
): ChosenServiceDetailed[] {
  if (!raw) return []
  let data: unknown
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      return []
    }
  } else {
    data = raw
  }
  if (!Array.isArray(data)) return []
  return (data as unknown[])
    .map((item) => {
      if (!item) return null
      if (typeof item === 'string') {
        return { title: item } as ChosenServiceDetailed
      }
      if (typeof item === 'object') {
        const obj = item as Record<string, unknown>
        const days = Array.isArray(obj.days)
          ? (obj.days.filter((d): d is number => typeof d === 'number') as number[])
          : undefined
        const locations = Array.isArray(obj.locations)
          ? (obj.locations.filter((l): l is string => typeof l === 'string') as string[])
          : undefined
        const modalities = Array.isArray(obj.modalities)
          ? (obj.modalities.filter((m): m is string => typeof m === 'string') as string[])
          : undefined
        return {
          title: typeof obj.title === 'string' ? (obj.title as string) : '(Service)',
          days,
          locations,
          modalities,
        } as ChosenServiceDetailed
      }
      return null
    })
    .filter((v): v is ChosenServiceDetailed => !!v)
}

const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const formatServiceDays = (days?: number[]) => {
  if (!days || !days.length) return '-'
  return days.map((d) => (d >= 0 && d < dayLabels.length ? dayLabels[d] : String(d))).join(', ')
}

const formatServiceLocations = (locs?: string[]) => {
  if (!locs || !locs.length) return '-'
  const map: Record<string, string> = {
    public_spaces: 'Espaces publics',
    home: 'Domicile',
    gym: 'Salle',
    online: 'En ligne',
  }
  return locs.map((l) => map[l] || capitalizeFirst(l.replace(/_/g, ' '))).join(', ')
}

const formatServiceModalities = (mods?: string[]) => {
  if (!mods || !mods.length) return '-'
  const map: Record<string, string> = {
    group: 'Groupe',
    individual: 'Individuel',
    duo: 'Duo',
  }
  return mods.map((m) => map[m] || capitalizeFirst(m)).join(', ')
}

// Computed enriched chosen services for the selected lead
const detailedChosenServices = computed(() => {
  if (!selectedLead.value) return [] as ChosenServiceDetailed[]
  return parseChosenServicesDetailed(selectedLead.value.chosen_services).map((svc) => ({
    ...svc,
    daysLabel: formatServiceDays(svc.days),
    locationsLabel: formatServiceLocations(svc.locations),
    modalitiesLabel: formatServiceModalities(svc.modalities),
  }))
})

// Aggregate availability days across chosen services (unique) or fallback to textual availability
const availabilityDaysLabel = computed(() => {
  if (!selectedLead.value) return '-'
  const services = parseChosenServicesDetailed(selectedLead.value.chosen_services)
  const daySet = new Set<number>()
  services.forEach((s) => s.days?.forEach((d) => typeof d === 'number' && daySet.add(d)))
  if (daySet.size === 0) {
    return selectedLead.value.availability || '-'
  }
  return Array.from(daySet)
    .sort((a, b) => a - b)
    .map((d) => (d >= 0 && d < dayLabels.length ? dayLabels[d] : String(d)))
    .join(', ')
})

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

// Accept legacy plain string, JSON string, or object { city, country }
const formatLocation = (
  location?: string | { city?: string | null; country?: string | null } | null,
): string => {
  if (!location) return '-'

  let city: string | undefined
  let country: string | undefined

  if (typeof location === 'string') {
    const trimmed = location.trim()
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed && typeof parsed === 'object') {
          city = typeof parsed.city === 'string' ? parsed.city : undefined
          country = typeof parsed.country === 'string' ? parsed.country : undefined
        }
      } catch {
        // not JSON, treat as plain city string
        city = location
      }
    } else {
      city = location
    }
  } else if (typeof location === 'object') {
    city = location.city || undefined
    country = location.country || undefined
  }

  if (!city && !country) return '-'

  // Derive island code from city if possible
  const code = city ? getIslandCodeByCity(city) : null

  // Map backend country identifiers to display labels
  const countryDisplayMap: Record<string, string> = {
    martinique: 'Martinique',
    guadeloupe: 'Guadeloupe',
    guyane: 'Guyane',
    'guyane française': 'Guyane',
  }
  const countryLabel = country
    ? countryDisplayMap[country.toLowerCase()] || capitalizeFirst(country)
    : code || undefined

  if (city && countryLabel) return `${city}, ${countryLabel}`
  if (city) return code ? `${city}, ${code}` : city
  return countryLabel || '-'
}

function capitalizeFirst(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
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
    subscriptionLoaded.value = true
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

// If a selected lead becomes do_not_contact or hidden, close the modal
watch(
  () => leads.value.map((l) => ({ id: l.id, hidden: l.is_hidden, dnc: l.do_not_contact })),
  () => {
    if (selectedLead.value) {
      const latest = leads.value.find((l) => l.id === selectedLead.value!.id)
      if (!latest || latest.is_hidden || latest.do_not_contact) {
        selectedLead.value = null
      }
    }
  },
  { deep: true },
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

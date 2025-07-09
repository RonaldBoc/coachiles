<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/vue'
import {
  EyeIcon,
  ChevronDownIcon,
  StarIcon,
  CalendarIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  UserIcon,
  FlagIcon,
  ChatBubbleLeftEllipsisIcon,
  EllipsisVerticalIcon,
} from '@heroicons/vue/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/vue/24/solid'
import { useUserStore } from '@/stores/user'
import type { Lead } from '@/types/Lead'
import { getMeetingLocationLabel } from '@/constants/meetingLocations'

const userStore = useUserStore()

// State
const selectedLead = ref<Lead | null>(null)
const isViewModalOpen = ref(false)
const isReportModalOpen = ref(false)
const isFeedbackModalOpen = ref(false)
const reportReason = ref('')
const reportDetails = ref('')
const feedbackRating = ref(0)
const feedbackComment = ref('')
const showFilters = ref(false)

// Filters
const statusFilter = ref<string>('all')
const priorityFilter = ref<string>('all')
const acquisitionFilter = ref<string>('all')
const sortBy = ref<string>('acquiredAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Computed
const leads = computed(() => userStore.leads || [])

const filteredAndSortedLeads = computed(() => {
  let filtered = [...leads.value]

  // Apply filters
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter((lead) => lead.leadStatus === statusFilter.value)
  }
  if (priorityFilter.value !== 'all') {
    filtered = filtered.filter((lead) => lead.priority === priorityFilter.value)
  }
  if (acquisitionFilter.value !== 'all') {
    filtered = filtered.filter((lead) => lead.acquisitionType === acquisitionFilter.value)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue: unknown = a[sortBy.value as keyof Lead]
    let bValue: unknown = b[sortBy.value as keyof Lead]

    if (aValue instanceof Date) aValue = aValue.getTime()
    if (bValue instanceof Date) bValue = bValue.getTime()

    // Handle undefined/null values
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1

    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  return filtered
})

const statusCounts = computed(() => {
  const counts = leads.value.reduce(
    (acc, lead) => {
      acc[lead.leadStatus] = (acc[lead.leadStatus] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    total: leads.value.length,
    new: counts.new || 0,
    contacted: counts.contacted || 0,
    in_progress: counts.in_progress || 0,
    converted: counts.converted || 0,
    lost: counts.lost || 0,
    inactive: counts.inactive || 0,
  }
})

// Helper functions
const getStatusColor = (status: string) => {
  const colors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-purple-100 text-purple-800',
    converted: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
    inactive: 'bg-gray-100 text-gray-800',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'text-gray-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
  }
  return colors[priority as keyof typeof colors] || 'text-gray-400'
}

const formatDate = (date: Date | string) => {
  if (!date) return 'Non défini'
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatDateTime = (date: Date | string) => {
  if (!date) return 'Non défini'
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getDaysAgo = (date: Date | string) => {
  if (!date) return 0
  const d = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - d.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// No need to blur names for leads since coach has already accepted/paid for them

// Helper function for availability display
const getAvailabilityIcon = (available: boolean) => {
  return available ? '✓' : '✗'
}

// Helper to get a quick summary of availability (how many days/time slots available)
const getAvailabilitySummary = (
  weeklyAvailability: { morning: boolean; afternoon: boolean; evening: boolean }[],
) => {
  const totalSlots = weeklyAvailability.length * 3 // 7 days * 3 time slots each
  const availableSlots = weeklyAvailability.reduce((count, day) => {
    return count + (day.morning ? 1 : 0) + (day.afternoon ? 1 : 0) + (day.evening ? 1 : 0)
  }, 0)

  return `${availableSlots}/${totalSlots} créneaux`
}

// Helper function to determine dropdown position based on row index
const getDropdownClasses = (index: number, totalRows: number) => {
  // If it's one of the last 2 rows, position above
  const isNearBottom = index >= totalRows - 2

  if (isNearBottom) {
    return 'absolute right-0 bottom-full mb-2 w-56 origin-bottom-right bg-white border border-gray-200 rounded-md shadow-xl focus:outline-none z-[9999] max-h-60 overflow-y-auto'
  } else {
    return 'absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-md shadow-xl focus:outline-none z-[9999] max-h-60 overflow-y-auto'
  }
}

// Actions
const openViewModal = (lead: Lead) => {
  selectedLead.value = lead
  isViewModalOpen.value = true
}

const openReportModal = (lead: Lead) => {
  selectedLead.value = lead
  reportReason.value = ''
  reportDetails.value = ''
  isReportModalOpen.value = true
}

const openFeedbackModal = (lead: Lead) => {
  selectedLead.value = lead
  feedbackRating.value = lead.clientRating || 0
  feedbackComment.value = lead.coachFeedback || ''
  isFeedbackModalOpen.value = true
}

const submitReport = () => {
  if (selectedLead.value && reportReason.value) {
    // Here you would typically send to API
    console.log('Reporting lead:', selectedLead.value.id, reportReason.value, reportDetails.value)
    isReportModalOpen.value = false
  }
}

const submitFeedback = () => {
  if (selectedLead.value) {
    // Here you would typically send to API
    console.log(
      'Feedback for lead:',
      selectedLead.value.id,
      feedbackRating.value,
      feedbackComment.value,
    )
    isFeedbackModalOpen.value = false
  }
}

const contactClient = (lead: Lead) => {
  // Here you would typically open email client or phone app
  console.log('Contacting client:', lead.clientEmail, lead.clientPhone)
  // Example: window.location.href = `mailto:${lead.clientEmail}`
  // Example: window.location.href = `tel:${lead.clientPhone}`
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mes leads</h1>
        <p class="text-gray-600">Gérez vos leads acceptés et achetés</p>
      </div>

      <!-- Stats overview -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-blue-50 p-3 rounded-lg">
          <p class="text-sm text-blue-600 font-medium">Total</p>
          <p class="text-xl font-bold text-blue-900">{{ statusCounts.total }}</p>
        </div>
        <div class="bg-green-50 p-3 rounded-lg">
          <p class="text-sm text-green-600 font-medium">Convertis</p>
          <p class="text-xl font-bold text-green-900">{{ statusCounts.converted }}</p>
        </div>
        <div class="bg-purple-50 p-3 rounded-lg">
          <p class="text-sm text-purple-600 font-medium">En cours</p>
          <p class="text-xl font-bold text-purple-900">{{ statusCounts.in_progress }}</p>
        </div>
        <div class="bg-yellow-50 p-3 rounded-lg">
          <p class="text-sm text-yellow-600 font-medium">Nouveaux</p>
          <p class="text-xl font-bold text-yellow-900">{{ statusCounts.new }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg border border-gray-200">
      <Disclosure v-slot="{ open }">
        <DisclosureButton
          class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
          @click="showFilters = !showFilters"
        >
          <span class="text-sm font-medium text-gray-900">Filtres et tri</span>
          <ChevronDownIcon
            :class="[open ? 'rotate-180' : '', 'h-5 w-5 text-gray-500 transition-transform']"
          />
        </DisclosureButton>
        <DisclosurePanel class="px-4 pb-4 border-t border-gray-100">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                v-model="statusFilter"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="new">Nouveaux</option>
                <option value="contacted">Contactés</option>
                <option value="in_progress">En cours</option>
                <option value="converted">Convertis</option>
                <option value="lost">Perdus</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
              <select
                v-model="priorityFilter"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">Toutes les priorités</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Acquisition</label>
              <select
                v-model="acquisitionFilter"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">Tous types</option>
                <option value="accepted">Acceptés</option>
                <option value="purchased">Achetés</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
              <div class="flex gap-2">
                <select
                  v-model="sortBy"
                  class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="acquiredAt">Date d'acquisition</option>
                  <option value="priority">Priorité</option>
                  <option value="leadStatus">Statut</option>
                  <option value="lastContactDate">Dernier contact</option>
                </select>
                <select
                  v-model="sortOrder"
                  class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="desc">↓</option>
                  <option value="asc">↑</option>
                </select>
              </div>
            </div>
          </div>
        </DisclosurePanel>
      </Disclosure>
    </div>

    <!-- Mobile view -->
    <div class="lg:hidden space-y-4">
      <div
        v-for="(lead, index) in filteredAndSortedLeads"
        :key="lead.id"
        class="bg-white rounded-lg border border-gray-200 p-4"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-medium text-gray-900">{{ lead.clientName }}</h3>
            <div class="flex items-center gap-2 mt-1">
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  getStatusColor(lead.leadStatus),
                ]"
              >
                {{ lead.leadStatus.replace('_', ' ') }}
              </span>
              <div class="flex items-center">
                <StarIcon :class="['h-4 w-4', getPriorityColor(lead.priority)]" />
                <span class="text-xs text-gray-500 ml-1">{{ lead.priority }}</span>
              </div>
            </div>
          </div>
          <Menu as="div" class="relative">
            <MenuButton class="p-2 rounded-md hover:bg-gray-100">
              <EllipsisVerticalIcon class="h-5 w-5 text-gray-400" />
            </MenuButton>
            <MenuItems :class="getDropdownClasses(index, filteredAndSortedLeads.length)">
              <MenuItem v-slot="{ active }">
                <button
                  @click="openViewModal(lead)"
                  :class="[
                    active ? 'bg-gray-50' : '',
                    'flex items-center w-full px-4 py-2 text-sm text-gray-700',
                  ]"
                >
                  <EyeIcon class="h-4 w-4 mr-3" />
                  Voir les détails
                </button>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <button
                  @click="contactClient(lead)"
                  :class="[
                    active ? 'bg-gray-50' : '',
                    'flex items-center w-full px-4 py-2 text-sm text-gray-700',
                  ]"
                >
                  <EnvelopeIcon class="h-4 w-4 mr-3" />
                  Contacter
                </button>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <button
                  @click="openFeedbackModal(lead)"
                  :class="[
                    active ? 'bg-gray-50' : '',
                    'flex items-center w-full px-4 py-2 text-sm text-gray-700',
                  ]"
                >
                  <ChatBubbleLeftEllipsisIcon class="h-4 w-4 mr-3" />
                  Feedback
                </button>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <button
                  @click="openReportModal(lead)"
                  :class="[
                    active ? 'bg-gray-50' : '',
                    'flex items-center w-full px-4 py-2 text-sm text-gray-700',
                  ]"
                >
                  <FlagIcon class="h-4 w-4 mr-3" />
                  Signaler
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>

        <div class="space-y-2 text-sm text-gray-600">
          <div class="flex items-center gap-2">
            <UserIcon class="h-4 w-4" />
            <span>{{ lead.clientGender }} • {{ lead.clientAgeGroup }} ans • {{ lead.level }}</span>
          </div>
          <div class="flex items-center gap-2">
            <MapPinIcon class="h-4 w-4" />
            <span>{{ lead.location }}</span>
          </div>
          <div class="flex items-center gap-2">
            <MapPinIcon class="h-4 w-4" />
            <span
              >Lieu souhaité: {{ getMeetingLocationLabel(lead.meetingLocationPreference) }}</span
            >
          </div>
          <div class="flex items-center gap-2">
            <CalendarIcon class="h-4 w-4" />
            <span>Début souhaité: {{ formatDate(lead.desiredStart) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <CalendarIcon class="h-4 w-4" />
            <span
              >{{ lead.sessionsPerWeek }} séances/semaine -
              {{ getAvailabilitySummary(lead.weeklyAvailability) }}</span
            >
          </div>
          <div class="flex items-center gap-2">
            <CurrencyEuroIcon class="h-4 w-4" />
            <span>{{ lead.budget || 'Budget non précisé' }}</span>
          </div>
          <div class="text-xs text-gray-500">
            <span>Acquis {{ getDaysAgo(lead.acquiredAt) }}j • {{ lead.acquisitionType }}</span>
            <span v-if="lead.amountPaid"> • {{ lead.amountPaid }}€</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop table -->
    <div
      class="hidden lg:block bg-white rounded-lg border border-gray-200"
      style="overflow: visible; isolation: auto"
    >
      <div class="overflow-x-auto" style="isolation: auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Client
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Services
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Statut
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Contact
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acquisition
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Priorité
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(lead, index) in filteredAndSortedLeads"
              :key="lead.id"
              class="hover:bg-gray-50 relative"
              style="z-index: auto"
            >
              <td class="px-4 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ lead.clientName }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ lead.clientGender }} • {{ lead.clientAgeGroup }} ans • {{ lead.level }}
                  </div>
                  <div class="text-xs text-gray-400">{{ lead.location }}</div>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm text-gray-900">
                  {{ lead.services.slice(0, 2).join(', ') }}
                  <span v-if="lead.services.length > 2" class="text-gray-500">
                    +{{ lead.services.length - 2 }}
                  </span>
                </div>
                <div class="text-xs text-gray-500">
                  {{ lead.groupPreference }} • {{ lead.budget }}
                </div>
                <div class="text-xs text-gray-400">
                  {{ getMeetingLocationLabel(lead.meetingLocationPreference) }}
                </div>
                <div class="text-xs text-gray-400">
                  {{ lead.sessionsPerWeek }} séances/sem •
                  {{ getAvailabilitySummary(lead.weeklyAvailability) }} disponibles
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(lead.leadStatus),
                  ]"
                >
                  {{ lead.leadStatus.replace('_', ' ') }}
                </span>
                <div class="text-xs text-gray-500 mt-1">{{ lead.contactAttempts }} tentatives</div>
              </td>
              <td class="px-4 py-4 text-sm text-gray-500">
                <div v-if="lead.lastContactDate">
                  {{ formatDate(lead.lastContactDate) }}
                </div>
                <div v-if="lead.nextFollowUpDate" class="text-xs">
                  Suivi: {{ formatDate(lead.nextFollowUpDate) }}
                </div>
                <div v-if="!lead.lastContactDate" class="text-gray-400">Pas encore contacté</div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>{{ lead.acquisitionType }}</div>
                <div class="text-xs">{{ formatDate(lead.acquiredAt) }}</div>
                <div v-if="lead.amountPaid" class="text-xs font-medium text-green-600">
                  {{ lead.amountPaid }}€
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <StarIcon :class="['h-4 w-4', getPriorityColor(lead.priority)]" />
                  <span class="ml-1 text-sm text-gray-900">{{ lead.priority }}</span>
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Menu as="div" class="relative inline-block text-left">
                  <MenuButton class="p-2 rounded-md hover:bg-gray-100">
                    <EllipsisVerticalIcon class="h-5 w-5 text-gray-400" />
                  </MenuButton>
                  <MenuItems :class="getDropdownClasses(index, filteredAndSortedLeads.length)">
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="openViewModal(lead)"
                        :class="[
                          active ? 'bg-gray-50' : '',
                          'flex items-center w-full px-4 py-2 text-sm text-gray-700',
                        ]"
                      >
                        <EyeIcon class="h-4 w-4 mr-3" />
                        Voir les détails
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="contactClient(lead)"
                        :class="[
                          active ? 'bg-gray-50' : '',
                          'flex items-center w-full px-4 py-2 text-sm text-gray-700',
                        ]"
                      >
                        <EnvelopeIcon class="h-4 w-4 mr-3" />
                        Contacter
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="openFeedbackModal(lead)"
                        :class="[
                          active ? 'bg-gray-50' : '',
                          'flex items-center w-full px-4 py-2 text-sm text-gray-700',
                        ]"
                      >
                        <ChatBubbleLeftEllipsisIcon class="h-4 w-4 mr-3" />
                        Feedback
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="openReportModal(lead)"
                        :class="[
                          active ? 'bg-gray-50' : '',
                          'flex items-center w-full px-4 py-2 text-sm text-gray-700',
                        ]"
                      >
                        <FlagIcon class="h-4 w-4 mr-3" />
                        Signaler
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filteredAndSortedLeads.length === 0" class="text-center py-12">
      <UserIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun lead trouvé</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{
          leads.length === 0
            ? "Vous n'avez pas encore de leads."
            : 'Aucun lead ne correspond à vos filtres.'
        }}
      </p>
    </div>

    <!-- View Modal -->
    <TransitionRoot appear :show="isViewModalOpen" as="template">
      <Dialog @close="isViewModalOpen = false" class="relative z-50">
        <TransitionChild
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-2xl bg-white rounded-lg shadow-xl">
                <div class="px-6 py-4 border-b border-gray-200">
                  <DialogTitle class="text-lg font-medium text-gray-900">
                    Détails du lead
                  </DialogTitle>
                </div>

                <div v-if="selectedLead" class="px-6 py-4 space-y-6">
                  <!-- Client info -->
                  <div>
                    <h3 class="text-sm font-medium text-gray-900 mb-3">Informations client</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="text-xs text-gray-500">Nom</label>
                        <p class="text-sm font-medium">
                          {{ selectedLead.clientName }}
                        </p>
                      </div>
                      <div>
                        <label class="text-xs text-gray-500">Email</label>
                        <p class="text-sm">{{ selectedLead.clientEmail }}</p>
                      </div>
                      <div>
                        <label class="text-xs text-gray-500">Téléphone</label>
                        <p class="text-sm">{{ selectedLead.clientPhone }}</p>
                      </div>
                      <div>
                        <label class="text-xs text-gray-500">Profil</label>
                        <p class="text-sm">
                          {{ selectedLead.clientGender }} • {{ selectedLead.clientAgeGroup }} ans
                        </p>
                      </div>
                      <div>
                        <label class="text-xs text-gray-500">Localisation</label>
                        <p class="text-sm">{{ selectedLead.location }}</p>
                      </div>
                      <div>
                        <label class="text-xs text-gray-500">Niveau</label>
                        <p class="text-sm">{{ selectedLead.level }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Request details -->
                  <div>
                    <h3 class="text-sm font-medium text-gray-900 mb-3">Demande</h3>
                    <div class="space-y-3">
                      <div>
                        <label class="text-xs text-gray-500">Services</label>
                        <p class="text-sm">{{ selectedLead.services.join(', ') }}</p>
                      </div>
                      <div>
                        <label class="text-xs text-gray-500">Préférence de format</label>
                        <p class="text-sm">{{ selectedLead.groupPreference }}</p>
                      </div>
                      <div>
                        <label class="text-xs text-gray-500">Date de début souhaitée</label>
                        <p class="text-sm">{{ formatDate(selectedLead.desiredStart) }}</p>
                      </div>
                      <div>
                        <label class="text-xs text-gray-500">Fréquence souhaitée</label>
                        <p class="text-sm">
                          {{ selectedLead.sessionsPerWeek }} séance{{
                            selectedLead.sessionsPerWeek > 1 ? 's' : ''
                          }}
                          par semaine
                        </p>
                      </div>
                      <div>
                        <label class="text-xs text-gray-500">Lieu de rencontre souhaité</label>
                        <p class="text-sm">
                          {{ getMeetingLocationLabel(selectedLead.meetingLocationPreference) }}
                        </p>
                      </div>
                      <div>
                        <label class="text-xs text-gray-500">Budget</label>
                        <p class="text-sm">{{ selectedLead.budget || 'Non précisé' }}</p>
                      </div>
                      <div v-if="selectedLead.extraInfo">
                        <label class="text-xs text-gray-500">Informations supplémentaires</label>
                        <p class="text-sm">{{ selectedLead.extraInfo }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Detailed Availability Schedule -->
                  <div>
                    <h3 class="text-sm font-medium text-gray-900 mb-3">
                      Disponibilités détaillées
                    </h3>
                    <div class="bg-gray-50 rounded-lg p-4">
                      <div class="grid grid-cols-7 gap-2 text-center">
                        <!-- Header row with day names -->
                        <div class="font-medium text-xs text-gray-600">Lun</div>
                        <div class="font-medium text-xs text-gray-600">Mar</div>
                        <div class="font-medium text-xs text-gray-600">Mer</div>
                        <div class="font-medium text-xs text-gray-600">Jeu</div>
                        <div class="font-medium text-xs text-gray-600">Ven</div>
                        <div class="font-medium text-xs text-gray-600">Sam</div>
                        <div class="font-medium text-xs text-gray-600">Dim</div>

                        <!-- Morning row -->
                        <div
                          v-for="day in selectedLead.weeklyAvailability"
                          :key="`${day.day}-morning`"
                          :class="[
                            'text-xs py-1 px-2 rounded text-center',
                            day.morning
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-400',
                          ]"
                        >
                          <div class="font-medium">{{ getAvailabilityIcon(day.morning) }}</div>
                          <div class="text-2xs">Matin</div>
                        </div>

                        <!-- Afternoon row -->
                        <div
                          v-for="day in selectedLead.weeklyAvailability"
                          :key="`${day.day}-afternoon`"
                          :class="[
                            'text-xs py-1 px-2 rounded text-center',
                            day.afternoon
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-400',
                          ]"
                        >
                          <div class="font-medium">{{ getAvailabilityIcon(day.afternoon) }}</div>
                          <div class="text-2xs">A-midi</div>
                        </div>

                        <!-- Evening row -->
                        <div
                          v-for="day in selectedLead.weeklyAvailability"
                          :key="`${day.day}-evening`"
                          :class="[
                            'text-xs py-1 px-2 rounded text-center',
                            day.evening
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-400',
                          ]"
                        >
                          <div class="font-medium">{{ getAvailabilityIcon(day.evening) }}</div>
                          <div class="text-2xs">Soir</div>
                        </div>
                      </div>
                      <div class="mt-3 text-xs text-gray-600">
                        <p><strong>Résumé:</strong> {{ selectedLead.availability }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Lead status -->
                  <div>
                    <h3 class="text-sm font-medium text-gray-900 mb-3">Statut du lead</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="text-xs text-gray-500">Statut actuel</label>
                        <p class="text-sm">
                          <span
                            :class="[
                              'px-2 py-1 rounded-full text-xs font-medium',
                              getStatusColor(selectedLead.leadStatus),
                            ]"
                          >
                            {{ selectedLead.leadStatus.replace('_', ' ') }}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label class="text-xs text-gray-500">Priorité</label>
                        <p class="text-sm">{{ selectedLead.priority }}</p>
                      </div>
                      <div>
                        <label class="text-xs text-gray-500">Tentatives de contact</label>
                        <p class="text-sm">{{ selectedLead.contactAttempts }}</p>
                      </div>
                      <div v-if="selectedLead.lastContactDate">
                        <label class="text-xs text-gray-500">Dernier contact</label>
                        <p class="text-sm">{{ formatDateTime(selectedLead.lastContactDate) }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Notes -->
                  <div v-if="selectedLead.notes.length > 0">
                    <h3 class="text-sm font-medium text-gray-900 mb-3">Notes</h3>
                    <ul class="space-y-2">
                      <li
                        v-for="(note, index) in selectedLead.notes"
                        :key="index"
                        class="text-sm text-gray-700 bg-gray-50 p-3 rounded-md"
                      >
                        {{ note }}
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    @click="isViewModalOpen = false"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Fermer
                  </button>
                  <button
                    @click="contactClient(selectedLead!)"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    Contacter
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Report Modal -->
    <TransitionRoot appear :show="isReportModalOpen" as="template">
      <Dialog @close="isReportModalOpen = false" class="relative z-50">
        <TransitionChild
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md bg-white rounded-lg shadow-xl">
                <div class="px-6 py-4 border-b border-gray-200">
                  <DialogTitle class="text-lg font-medium text-gray-900">
                    Signaler un problème
                  </DialogTitle>
                </div>

                <div class="px-6 py-4">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Raison du signalement
                      </label>
                      <select
                        v-model="reportReason"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Choisir une raison</option>
                        <option value="fake_contact">Contact factice</option>
                        <option value="no_response">Aucune réponse</option>
                        <option value="inappropriate">Comportement inapproprié</option>
                        <option value="already_taken">Déjà pris par un autre coach</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Détails (optionnel)
                      </label>
                      <textarea
                        v-model="reportDetails"
                        rows="3"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Décrivez le problème..."
                      />
                    </div>
                  </div>
                </div>

                <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    @click="isReportModalOpen = false"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    @click="submitReport"
                    :disabled="!reportReason"
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Signaler
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Feedback Modal -->
    <TransitionRoot appear :show="isFeedbackModalOpen" as="template">
      <Dialog @close="isFeedbackModalOpen = false" class="relative z-50">
        <TransitionChild
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md bg-white rounded-lg shadow-xl">
                <div class="px-6 py-4 border-b border-gray-200">
                  <DialogTitle class="text-lg font-medium text-gray-900">
                    Donner un feedback
                  </DialogTitle>
                </div>

                <div class="px-6 py-4">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Note client (1-5 étoiles)
                      </label>
                      <div class="flex items-center space-x-1">
                        <button
                          v-for="star in 5"
                          :key="star"
                          @click="feedbackRating = star"
                          class="focus:outline-none"
                        >
                          <StarIconSolid
                            :class="[
                              star <= feedbackRating ? 'text-yellow-400' : 'text-gray-300',
                              'h-6 w-6',
                            ]"
                          />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Commentaire
                      </label>
                      <textarea
                        v-model="feedbackComment"
                        rows="4"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Partagez votre expérience avec ce client..."
                      />
                    </div>
                  </div>
                </div>

                <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    @click="isFeedbackModalOpen = false"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    @click="submitFeedback"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    Enregistrer
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

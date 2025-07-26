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

            <!-- Stats Cards -->
            <div class="mt-4 lg:mt-0 lg:ml-6">
              <div class="flex space-x-4">
                <div class="bg-blue-50 px-4 py-3 rounded-lg">
                  <div class="text-sm font-medium text-blue-600">Total</div>
                  <div class="text-2xl font-bold text-blue-900">{{ totalLeads }}</div>
                </div>
                <div class="bg-green-50 px-4 py-3 rounded-lg">
                  <div class="text-sm font-medium text-green-600">Nouvelles</div>
                  <div class="text-2xl font-bold text-green-900">{{ newLeadsCount }}</div>
                </div>
                <div class="bg-orange-50 px-4 py-3 rounded-lg">
                  <div class="text-sm font-medium text-orange-600">Unlocked</div>
                  <div class="text-2xl font-bold text-orange-900">
                    {{ unlockedLeadsCount }}/{{ maxUnlockedLeads }}
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Client
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Objectifs
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Lieu
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Créé le
                  </th>
                  <th
                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="lead in filteredLeads" :key="lead.id" class="hover:bg-gray-50">
                  <!-- Client -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div
                          class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center"
                        >
                          <span class="text-sm font-medium text-white">
                            {{ getLeadInitial(lead) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ getLeadName(lead) }}
                        </div>
                        <div class="text-sm text-gray-500">
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
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(lead.status),
                      ]"
                    >
                      {{ getStatusLabel(lead.status) }}
                    </span>
                  </td>

                  <!-- Objectifs -->
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">
                      {{ getLeadGoals(lead) }}
                    </div>
                    <div v-if="lead.preferred_coaching?.length" class="text-sm text-gray-500">
                      {{ lead.preferred_coaching.slice(0, 2).join(', ') }}
                      <span v-if="lead.preferred_coaching.length > 2">
                        +{{ lead.preferred_coaching.length - 2 }}
                      </span>
                    </div>
                  </td>

                  <!-- Lieu -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ lead.location || '-' }}
                  </td>

                  <!-- Créé le -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{{ formatDate(lead.created_at) }}</div>
                    <div class="text-xs">{{ getTimeAgo(lead.created_at) }}</div>
                  </td>

                  <!-- Actions -->
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

                          <MenuItem
                            v-if="lead.status === 'new' || lead.status === 'assigned'"
                            v-slot="{ active }"
                          >
                            <button
                              @click="markAsContacted(lead)"
                              :class="[
                                active ? 'bg-gray-100' : '',
                                'flex w-full items-center px-4 py-2 text-sm text-gray-700',
                              ]"
                            >
                              <CheckIcon class="mr-3 h-4 w-4" />
                              Marquer comme contacté
                            </button>
                          </MenuItem>

                          <MenuItem v-if="lead.status === 'contacted'" v-slot="{ active }">
                            <button
                              @click="markAsConverted(lead)"
                              :class="[
                                active ? 'bg-gray-100' : '',
                                'flex w-full items-center px-4 py-2 text-sm text-green-700',
                              ]"
                            >
                              <CheckIcon class="mr-3 h-4 w-4" />
                              Marquer comme converti
                            </button>
                          </MenuItem>

                          <MenuItem
                            v-if="lead.status !== 'closed' && lead.status !== 'converted'"
                            v-slot="{ active }"
                          >
                            <button
                              @click="markAsClosed(lead)"
                              :class="[
                                active ? 'bg-gray-100' : '',
                                'flex w-full items-center px-4 py-2 text-sm text-red-700',
                              ]"
                            >
                              <XMarkIcon class="mr-3 h-4 w-4" />
                              Marquer comme fermé
                            </button>
                          </MenuItem>
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
    </div>

    <!-- Lead Details Modal -->
    <LeadDetailsModal
      v-if="selectedLead"
      :lead="selectedLead"
      :can-access-details="canAccessLeadDetails(selectedLead)"
      @close="selectedLead = null"
      @unlock="unlockLead"
      @update-status="updateLeadStatus"
    />
  </CoachLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { EllipsisVerticalIcon, EyeIcon, CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import type { Lead } from '@/types/Lead'
import CoachLayout from '@/layouts/CoachLayout.vue'
import LeadDetailsModal from '../components/LeadDetailsModal.vue'
import LeadService from '@/services/leadService'

// Stores
const authStore = useAuthStore()

// State
const leads = ref<Lead[]>([])
const isLoading = ref(false)
const selectedLead = ref<Lead | null>(null)
const selectedStatus = ref('all')
const searchQuery = ref('')
const unlockedLeads = ref<Set<string>>(new Set())

// Computed
const currentCoach = computed(() => authStore.coach)
const isSubscriptionLimited = computed(() => currentCoach.value?.subscriptionStatus === 'inactive')
const maxUnlockedLeads = computed(() => (isSubscriptionLimited.value ? 2 : Infinity))
const unlockedLeadsCount = computed(() => unlockedLeads.value.size)
const totalLeads = computed(() => leads.value.length)
const newLeadsCount = computed(() => leads.value.filter((l) => l.status === 'new').length)

// Filtered leads
const filteredLeads = computed(() => {
  let filtered = leads.value

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
  if (!isSubscriptionLimited.value) return true
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
  if (status === 'all') return totalLeads.value
  return leads.value.filter((lead) => lead.status === status).length
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

// Actions
const loadLeads = async () => {
  if (!currentCoach.value?.id) return

  try {
    isLoading.value = true

    // Load subscription info and leads
    const [subscriptionInfo, data] = await Promise.all([
      LeadService.getCoachSubscriptionInfo(currentCoach.value.id),
      LeadService.getCoachLeads(currentCoach.value.id),
    ])

    leads.value = data

    // Auto-unlock first 2 leads for free accounts
    if (subscriptionInfo.subscriptionType === 'free') {
      const firstTwoLeads = data.slice(0, subscriptionInfo.maxUnlockedLeads)
      firstTwoLeads.forEach((lead) => unlockedLeads.value.add(lead.id))
    } else {
      // Premium users can access all leads
      data.forEach((lead) => unlockedLeads.value.add(lead.id))
    }
  } catch (error) {
    console.error('Failed to load leads:', error)
  } finally {
    isLoading.value = false
  }
}

const viewLead = (lead: Lead) => {
  selectedLead.value = lead
}

const unlockLead = (lead: Lead) => {
  if (isSubscriptionLimited.value && unlockedLeadsCount.value >= maxUnlockedLeads.value) {
    upgradeAccount()
    return
  }

  unlockedLeads.value.add(lead.id)
}

const updateLeadStatus = async (leadId: string, status: Lead['status']) => {
  try {
    await LeadService.updateLead(leadId, { status })
    const leadIndex = leads.value.findIndex((l) => l.id === leadId)
    if (leadIndex !== -1) {
      leads.value[leadIndex].status = status
    }
  } catch (error) {
    console.error('Failed to update lead status:', error)
  }
}

const markAsContacted = (lead: Lead) => {
  updateLeadStatus(lead.id, 'contacted')
}

const markAsConverted = (lead: Lead) => {
  updateLeadStatus(lead.id, 'converted')
}

const markAsClosed = (lead: Lead) => {
  updateLeadStatus(lead.id, 'closed')
}

const upgradeAccount = () => {
  // Navigate to subscription upgrade page
  console.log('Navigate to upgrade page')
}

// Lifecycle
onMounted(() => {
  loadLeads()
})
</script>

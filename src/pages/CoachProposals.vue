<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { EllipsisVerticalIcon, EyeIcon, CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useLeadStore } from '@/stores/leads'
import CoachLayout from '@/layouts/CoachLayout.vue'

// Define a type that matches the readonly lead from store
type ReadonlyLead = {
  id: string
  status: 'new' | 'viewed' | 'contacted' | 'converted' | 'lost'
  unlockedAt?: Date | string
  clientInfo?: {
    name?: string
    email?: string
    goals?: string
    location?: string
    preferences?: readonly string[]
  }
}

// Stores
const authStore = useAuthStore()
const leadStore = useLeadStore()

// Computed
const currentCoach = computed(() => authStore.coach)
const isLoading = computed(() => authStore.loading || leadStore.isLoading)
const allLeads = computed(() => leadStore.leads)
const totalLeads = computed(() => leadStore.total)
const newLeadsCount = computed(() => leadStore.newLeadsCount)

// Component state
const selectedStatus = ref('all')
const searchQuery = ref('')

// Filtered leads based on search and status
const filteredLeads = computed(() => {
  let filtered = allLeads.value

  // Filter by status
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter((lead) => lead.status === selectedStatus.value)
  }

  // Filter by search query (client info)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter((lead) => {
      const clientInfo = lead.clientInfo
      if (!clientInfo) return false

      return (
        clientInfo.name?.toLowerCase().includes(query) ||
        clientInfo.email?.toLowerCase().includes(query) ||
        clientInfo.goals?.toLowerCase().includes(query) ||
        clientInfo.location?.toLowerCase().includes(query)
      )
    })
  }

  return filtered
})

// Status options
const statusOptions = [
  { value: 'all', label: 'Tous les statuts', count: totalLeads },
  {
    value: 'new',
    label: 'Nouvelles',
    count: computed(() => allLeads.value.filter((l) => l.status === 'new').length),
  },
  {
    value: 'viewed',
    label: 'Vues',
    count: computed(() => allLeads.value.filter((l) => l.status === 'viewed').length),
  },
  {
    value: 'contacted',
    label: 'Contactées',
    count: computed(() => allLeads.value.filter((l) => l.status === 'contacted').length),
  },
  {
    value: 'converted',
    label: 'Converties',
    count: computed(() => allLeads.value.filter((l) => l.status === 'converted').length),
  },
  {
    value: 'lost',
    label: 'Perdues',
    count: computed(() => allLeads.value.filter((l) => l.status === 'lost').length),
  },
]

// Helper functions
const isNewLead = (lead: ReadonlyLead) => {
  if (!lead.unlockedAt) return false
  const now = new Date()
  const diffHours = (now.getTime() - new Date(lead.unlockedAt).getTime()) / (1000 * 60 * 60)
  return diffHours < 3
}

const formatDate = (date: Date | string | undefined) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(date))
}

const getTimeAgo = (date: Date | string | undefined) => {
  if (!date) return '-'
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

const getStatusColor = (status: string) => {
  const colors = {
    new: 'bg-green-100 text-green-800',
    viewed: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    converted: 'bg-purple-100 text-purple-800',
    lost: 'bg-gray-100 text-gray-800',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels = {
    new: 'Nouvelle',
    viewed: 'Vue',
    contacted: 'Contactée',
    converted: 'Convertie',
    lost: 'Perdue',
  }
  return labels[status as keyof typeof labels] || status
}

// Actions
const handleView = async (lead: ReadonlyLead) => {
  if (lead.status === 'new') {
    try {
      await leadStore.updateLeadStatus(lead.id, 'viewed')
    } catch (error) {
      console.error('Failed to update lead status:', error)
    }
  }
  // Navigate to lead detail or open modal
  console.log('Viewing lead:', lead)
}

const handleContact = async (lead: ReadonlyLead) => {
  try {
    await leadStore.updateLeadStatus(lead.id, 'contacted')
    console.log('Lead marked as contacted:', lead)
  } catch (error) {
    console.error('Failed to update lead status:', error)
  }
}

const handleConvert = async (lead: ReadonlyLead) => {
  try {
    await leadStore.updateLeadStatus(lead.id, 'converted')
    console.log('Lead marked as converted:', lead)
  } catch (error) {
    console.error('Failed to update lead status:', error)
  }
}

const handleReject = async (lead: ReadonlyLead) => {
  try {
    await leadStore.updateLeadStatus(lead.id, 'lost')
    console.log('Lead marked as lost:', lead)
  } catch (error) {
    console.error('Failed to update lead status:', error)
  }
}

// Load data on component mount
onMounted(async () => {
  if (currentCoach.value?.id) {
    try {
      await leadStore.fetchLeads(currentCoach.value.id)
    } catch (error) {
      console.error('Failed to load leads:', error)
    }
  }
})
</script>

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
                placeholder="Rechercher par nom, email, objectifs..."
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
                  {{ option.label }} ({{
                    typeof option.count === 'number' ? option.count : option.count.value
                  }})
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

        <!-- Leads List -->
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
                            {{ lead.clientInfo?.name?.charAt(0)?.toUpperCase() || '?' }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ lead.clientInfo?.name || 'Client inconnu' }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ lead.clientInfo?.email || '' }}
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
                      {{ lead.clientInfo?.goals || '-' }}
                    </div>
                    <div v-if="lead.clientInfo?.preferences?.length" class="text-sm text-gray-500">
                      {{ lead.clientInfo.preferences.slice(0, 2).join(', ') }}
                      <span v-if="lead.clientInfo.preferences.length > 2">
                        +{{ lead.clientInfo.preferences.length - 2 }}
                      </span>
                    </div>
                  </td>

                  <!-- Lieu -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ lead.clientInfo?.location || '-' }}
                  </td>

                  <!-- Créé le -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{{ formatDate(lead.unlockedAt) }}</div>
                    <div class="text-xs">{{ getTimeAgo(lead.unlockedAt) }}</div>
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
                              @click="handleView(lead)"
                              :class="[
                                active ? 'bg-gray-100' : '',
                                'flex w-full items-center px-4 py-2 text-sm text-gray-700',
                              ]"
                            >
                              <EyeIcon class="mr-3 h-4 w-4" />
                              Voir les détails
                            </button>
                          </MenuItem>

                          <MenuItem
                            v-if="lead.status === 'new' || lead.status === 'viewed'"
                            v-slot="{ active }"
                          >
                            <button
                              @click="handleContact(lead)"
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
                              @click="handleConvert(lead)"
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
                            v-if="lead.status !== 'lost' && lead.status !== 'converted'"
                            v-slot="{ active }"
                          >
                            <button
                              @click="handleReject(lead)"
                              :class="[
                                active ? 'bg-gray-100' : '',
                                'flex w-full items-center px-4 py-2 text-sm text-red-700',
                              ]"
                            >
                              <XMarkIcon class="mr-3 h-4 w-4" />
                              Marquer comme perdu
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
  </CoachLayout>
</template>
<!-- Header -->

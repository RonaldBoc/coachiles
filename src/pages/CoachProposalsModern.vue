<template>
  <CoachLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Header Section -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Propuestas de Coaching</h1>
                <p class="mt-1 text-sm text-gray-500">
                  Gestiona las solicitudes de coaching de tus clientes potenciales
                </p>
              </div>
              <div class="flex items-center space-x-4">
                <div class="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-blue-800">
                        {{ newLeadsCount }} nuevas propuestas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div class="px-6 py-4">
            <div
              class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
            >
              <!-- Search -->
              <div class="flex-1 max-w-lg">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      class="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Buscar por nombre, objetivos o ubicación..."
                  />
                </div>
              </div>

              <!-- Status Filter -->
              <div class="flex space-x-2">
                <select
                  v-model="selectedStatus"
                  class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                    {{ option.label }} ({{ option.count }})
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading && allLeads.length === 0" class="text-center py-12">
          <div
            class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-500 bg-white transition ease-in-out duration-150"
          >
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Cargando propuestas...
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!isLoading && filteredLeads.length === 0" class="text-center py-12">
          <div class="max-w-md mx-auto">
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">No hay propuestas</h3>
            <p class="mt-2 text-sm text-gray-500">
              {{
                selectedStatus === 'all'
                  ? 'Aún no tienes propuestas de coaching.'
                  : 'No hay propuestas con el estado seleccionado.'
              }}
            </p>
          </div>
        </div>

        <!-- Proposals List -->
        <div v-else class="space-y-4">
          <div
            v-for="lead in filteredLeads"
            :key="lead.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div class="p-6">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <!-- Header -->
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0">
                        <div
                          class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
                        >
                          <span class="text-sm font-medium text-blue-600">
                            {{ getClientNameParts(lead.client_name).firstName.charAt(0) }}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 class="text-lg font-medium text-gray-900">
                          {{ getClientNameParts(lead.client_name).firstName }}
                          {{ getClientNameParts(lead.client_name).fakeRestOfName }}
                        </h3>
                        <p class="text-sm text-gray-500">{{ formatDate(lead.created_at) }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span
                        :class="[
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getStatusColor(lead.status),
                        ]"
                      >
                        {{ getStatusLabel(lead.status) }}
                      </span>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900 mb-2">Objetivos de Coaching</h4>
                      <p class="text-sm text-gray-600">
                        {{ lead.goals || 'No especificado' }}
                      </p>
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-gray-900 mb-2">Detalles</h4>
                      <div class="space-y-1 text-sm text-gray-600">
                        <p>
                          <span class="font-medium">Ubicación:</span>
                          {{ lead.location || 'No especificado' }}
                        </p>
                        <p>
                          <span class="font-medium">Presupuesto:</span>
                          {{ lead.budget ? formatCurrency(lead.budget) : 'No especificado' }}
                        </p>
                        <p>
                          <span class="font-medium">Disponibilidad:</span>
                          {{ lead.availability || 'No especificado' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="mt-6 flex items-center justify-between">
                    <div class="flex space-x-3">
                      <button
                        v-if="lead.status === 'new'"
                        @click="handleView(lead)"
                        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <EyeIcon class="h-4 w-4 mr-2" />
                        Ver
                      </button>
                      <button
                        v-if="lead.status === 'assigned' || lead.status === 'new'"
                        @click="handleContact(lead)"
                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Contactar Cliente
                      </button>
                      <button
                        v-if="lead.status === 'contacted'"
                        @click="handleConvert(lead)"
                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckIcon class="h-4 w-4 mr-2" />
                        Marcar como Convertida
                      </button>
                    </div>
                    <div class="flex space-x-2">
                      <button
                        v-if="lead.status !== 'closed' && lead.status !== 'converted'"
                        @click="handleReject(lead)"
                        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XMarkIcon class="h-4 w-4 mr-2" />
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Modal -->
      <div v-if="showContactModal && selectedLead" class="fixed inset-0 z-50 overflow-y-auto">
        <div
          class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        >
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            @click="showContactModal = false"
          ></div>
          <div
            class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          >
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Información de Contacto
                  </h3>
                  <div class="space-y-3">
                    <div>
                      <p class="text-sm font-medium text-gray-700">Nombre:</p>
                      <p class="text-sm text-gray-900">{{ selectedLead.client_name }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-700">Email:</p>
                      <p class="text-sm text-gray-900">{{ selectedLead.client_email }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-700">Teléfono:</p>
                      <p class="text-sm text-gray-900">{{ selectedLead.client_phone }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-700">Objetivos:</p>
                      <p class="text-sm text-gray-900">{{ selectedLead.goals }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                @click="showContactModal = false"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CoachLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { EyeIcon, CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import type { Lead } from '@/types/Lead'
import { useAuthStore } from '@/stores/auth'
import { useLeadStore } from '@/stores/leads'
import CoachLayout from '@/layouts/CoachLayout.vue'

// Stores
const authStore = useAuthStore()
const leadStore = useLeadStore()

// Computed
// const currentCoach = computed(() => authStore.coach)
const isLoading = computed(() => authStore.loading || leadStore.isLoading)
const allLeads = computed(() => leadStore.leads)
// const totalLeads = computed(() => leadStore.total)
const newLeadsCount = computed(() => leadStore.newLeadsCount)

// Component state
const selectedStatus = ref('all')
const searchQuery = ref('')
const showContactModal = ref(false)
const selectedLead = ref<Lead | null>(null)

// Helper function to get client name parts (for privacy)
const getClientNameParts = (clientName?: string) => {
  if (!clientName) return { firstName: 'Cliente', fakeRestOfName: 'Anónimo' }

  const nameParts = clientName.split(' ')
  const firstName = nameParts[0] || 'Cliente'

  // Generate fake characters for privacy
  const fakeChars = 'abcdefghijklmnopqrstuvwxyz'
  const seed = clientName.length + clientName.charCodeAt(0)
  let randomGen = seed
  const randomLength = (randomGen % 4) + 4
  let fakeRestOfName = ''

  for (let i = 0; i < randomLength; i++) {
    randomGen = (randomGen * 16807) % 2147483647
    fakeRestOfName += fakeChars.charAt(randomGen % fakeChars.length)
  }

  return { firstName, fakeRestOfName }
}

// Filtered leads based on status and search
const filteredLeads = computed(() => {
  let filtered = allLeads.value

  // Filter by status
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter((lead) => lead.status === selectedStatus.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (lead) =>
        lead.client_name?.toLowerCase().includes(query) ||
        lead.goals?.toLowerCase().includes(query) ||
        lead.location?.toLowerCase().includes(query),
    )
  }

  return filtered
})

// Status options for filtering
const statusOptions = computed(() => [
  { value: 'all', label: 'Todas las propuestas', count: allLeads.value.length },
  { value: 'new', label: 'Nuevas', count: allLeads.value.filter((l) => l.status === 'new').length },
  {
    value: 'assigned',
    label: 'Asignadas',
    count: allLeads.value.filter((l) => l.status === 'assigned').length,
  },
  {
    value: 'contacted',
    label: 'Contactadas',
    count: allLeads.value.filter((l) => l.status === 'contacted').length,
  },
  {
    value: 'converted',
    label: 'Convertidas',
    count: allLeads.value.filter((l) => l.status === 'converted').length,
  },
  {
    value: 'closed',
    label: 'Cerradas',
    count: allLeads.value.filter((l) => l.status === 'closed').length,
  },
])

// Load leads data
const loadLeads = async () => {
  if (!authStore.user?.id) return

  try {
    await leadStore.fetchLeads(authStore.user.id)
  } catch (error) {
    console.error('Error loading leads:', error)
  }
}

// Handle lead actions
const handleView = async (lead: Lead) => {
  try {
    await leadStore.updateLeadStatus(lead.id, 'assigned')
  } catch (error) {
    console.error('Error updating lead status:', error)
  }
}

const handleContact = (lead: Lead) => {
  selectedLead.value = lead
  showContactModal.value = true
  // Update status to contacted
  leadStore.updateLeadStatus(lead.id, 'contacted').catch((error) => {
    console.error('Error updating lead status:', error)
  })
}

const handleConvert = async (lead: Lead) => {
  try {
    await leadStore.updateLeadStatus(lead.id, 'converted')
  } catch (error) {
    console.error('Error updating lead status:', error)
  }
}

const handleReject = async (lead: Lead) => {
  try {
    await leadStore.updateLeadStatus(lead.id, 'closed')
  } catch (error) {
    console.error('Error updating lead status:', error)
  }
}

// Utility functions
const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'No disponible'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(parseInt(amount))
}

const getStatusColor = (status: string) => {
  const colors = {
    new: 'bg-blue-100 text-blue-800',
    assigned: 'bg-yellow-100 text-yellow-800',
    contacted: 'bg-purple-100 text-purple-800',
    converted: 'bg-green-100 text-green-800',
    closed: 'bg-red-100 text-red-800',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels = {
    new: 'Nueva',
    assigned: 'Asignada',
    contacted: 'Contactada',
    converted: 'Convertida',
    closed: 'Cerrada',
  }
  return labels[status as keyof typeof labels] || status
}

// Load leads on component mount
onMounted(() => {
  loadLeads()
})
</script>

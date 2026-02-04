<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="$emit('close')"
  >
    <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
      <div class="p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Détails du Lead</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Premium Access Required -->
        <div
          v-if="!canAccessDetails"
          class="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">Accès Premium Requis</h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>
                  Ce lead contient des informations personnelles qui nécessitent un compte premium
                  pour être consultées.
                </p>
              </div>
              <div class="mt-4">
                <button
                  @click="$emit('unlock', lead)"
                  class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-yellow-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Débloquer ce Lead
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Basic Info (Always Visible) -->
        <div class="space-y-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 mb-3">Informations Générales</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Statut</label>
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1',
                    getStatusColor(lead.status),
                  ]"
                >
                  {{ getStatusLabel(lead.status) }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Créé le</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(lead.created_at) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Lieu</label>
                <p class="mt-1 text-sm text-gray-900">{{ lead.location || 'Non spécifié' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Étape</label>
                <p class="mt-1 text-sm text-gray-900">{{ lead.current_step }}/3</p>
              </div>
            </div>
          </div>

          <!-- Client Information (Premium Required) -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 mb-3">Informations Client</h3>
            <div v-if="canAccessDetails" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Nom</label>
                <p class="mt-1 text-sm text-gray-900">{{ lead.client_name || 'Non spécifié' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <p class="mt-1 text-sm text-gray-900">
                  <a
                    :href="`mailto:${lead.client_email}`"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    {{ lead.client_email }}
                  </a>
                </p>
              </div>
              <div v-if="lead.client_phone">
                <label class="block text-sm font-medium text-gray-700">Téléphone</label>
                <p class="mt-1 text-sm text-gray-900">
                  <a :href="`tel:${lead.client_phone}`" class="text-blue-600 hover:text-blue-800">
                    {{ lead.client_phone }}
                  </a>
                </p>
              </div>
              <div v-if="lead.experience">
                <label class="block text-sm font-medium text-gray-700">Niveau d'expérience</label>
                <p class="mt-1 text-sm text-gray-900">{{ lead.experience }}</p>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <div class="text-gray-400">
                <svg
                  class="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 class="mt-2 text-sm font-medium text-gray-900">Informations verrouillées</h3>
              <p class="mt-1 text-sm text-gray-500">
                Passez à Premium pour voir les détails du client
              </p>
            </div>
          </div>

          <!-- Goals and Preferences -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 mb-3">Objectifs et Préférences</h3>
            <div v-if="canAccessDetails" class="space-y-4">
              <div v-if="lead.goals">
                <label class="block text-sm font-medium text-gray-700">Objectifs</label>
                <p class="mt-1 text-sm text-gray-900">{{ lead.goals }}</p>
              </div>
              <div v-if="lead.chosen_services?.length">
                <label class="block text-sm font-medium text-gray-700">Services d'intérêt</label>
                <div class="mt-1 flex flex-wrap gap-2">
                  <span
                    v-for="service in lead.chosen_services"
                    :key="typeof service === 'string' ? service : service.title"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ typeof service === 'string' ? service : service.title }}
                  </span>
                </div>
              </div>
              <div v-if="lead.start_timeframe">
                <label class="block text-sm font-medium text-gray-700">Quand commencer</label>
                <p class="mt-1 text-sm text-gray-900">{{ lead.start_timeframe }}</p>
              </div>
              <div v-if="lead.availability">
                <label class="block text-sm font-medium text-gray-700">Disponibilités</label>
                <p class="mt-1 text-sm text-gray-900">{{ lead.availability }}</p>
              </div>
              <div v-if="lead.additional_info">
                <label class="block text-sm font-medium text-gray-700">Message</label>
                <p class="mt-1 text-sm text-gray-900">{{ lead.additional_info }}</p>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <div class="text-gray-400">
                <svg
                  class="mx-auto h-12 w-12"
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
              </div>
              <h3 class="mt-2 text-sm font-medium text-gray-900">Objectifs verrouillés</h3>
              <p class="mt-1 text-sm text-gray-500">
                Déverrouillez pour voir les objectifs détaillés
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div
            v-if="canAccessDetails"
            class="flex justify-between items-center pt-4 border-t border-gray-200"
          >
            <div class="flex space-x-3">
              <button
                v-if="lead.status === 'new' || lead.status === 'assigned'"
                @click="updateStatus('contacted')"
                class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Marquer comme contacté
              </button>
              <button
                v-if="lead.status === 'contacted'"
                @click="updateStatus('converted')"
                class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Marquer comme converti
              </button>
              <button
                v-if="lead.status !== 'closed' && lead.status !== 'converted'"
                @click="updateStatus('closed')"
                class="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Fermer le lead
              </button>
            </div>
            <button
              @click="$emit('close')"
              class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { onMounted } from 'vue'
import type { Lead } from '@/types/Lead'
import { actionTracker } from '@/utils/actionTracker'

interface Props {
  lead: Lead
  canAccessDetails: boolean
}

interface Emits {
  (event: 'close'): void
  (event: 'unlock', lead: Lead): void
  (event: 'update-status', leadId: string, status: Lead['status']): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Track lead view when modal opens
onMounted(() => {
  actionTracker.trackLeadView(props.lead.id, {
    leadStatus: props.lead.status,
    leadType: props.lead.preferred_coaching?.[0] || 'general',
    canAccessDetails: props.canAccessDetails,
  })
})

// Helper functions
const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

const updateStatus = (status: Lead['status']) => {
  emit('update-status', props.lead.id, status)
}
</script>

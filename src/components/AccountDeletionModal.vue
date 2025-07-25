<template>
  <!-- Account Deletion Modal -->
  <div
    v-if="showModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">
            {{
              currentStep === 'confirm'
                ? 'Supprimer mon compte'
                : currentStep === 'reason'
                  ? 'Dites-nous pourquoi'
                  : currentStep === 'export'
                    ? 'Exporter mes données'
                    : 'Confirmation finale'
            }}
          </h2>
          <button
            @click="closeModal"
            :disabled="processing"
            class="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 py-4">
        <!-- Step 1: Initial Confirmation -->
        <div v-if="currentStep === 'confirm'" class="space-y-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Action irréversible après 30 jours</h3>
                <p class="text-sm text-red-700 mt-1">
                  Cette action supprimera définitivement votre compte coach après 30 jours. Vous
                  pourrez le réactiver pendant cette période.
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <h4 class="font-medium text-gray-900">Ce qui sera supprimé :</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li class="flex items-center">
                <svg class="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                Votre profil public et toutes vos informations
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                Tous vos services et leurs descriptions
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                Vos photos de profil et certifications
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                L'accès à votre tableau de bord
              </li>
            </ul>
          </div>

          <div class="space-y-3">
            <h4 class="font-medium text-gray-900">Ce qui sera préservé :</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li class="flex items-center">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Avis clients (anonymisés)
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Historique des paiements (obligations légales)
              </li>
            </ul>
          </div>
        </div>

        <!-- Step 2: Reason Selection -->
        <div v-else-if="currentStep === 'reason'" class="space-y-4">
          <p class="text-gray-600">
            Aidez-nous à améliorer notre plateforme en nous disant pourquoi vous supprimez votre
            compte :
          </p>

          <div class="space-y-2">
            <label v-for="reason in deletionReasons" :key="reason.value" class="flex items-start">
              <input
                v-model="selectedReason"
                :value="reason.value"
                type="radio"
                class="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
              />
              <div class="ml-3">
                <div class="text-sm font-medium text-gray-900">{{ reason.label }}</div>
                <div class="text-sm text-gray-500">{{ reason.description }}</div>
              </div>
            </label>
          </div>

          <div class="mt-4">
            <label for="customReason" class="block text-sm font-medium text-gray-700 mb-2">
              Commentaire additionnel (optionnel)
            </label>
            <textarea
              id="customReason"
              v-model="customReason"
              rows="3"
              placeholder="Partagez plus de détails si vous le souhaitez..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            ></textarea>
          </div>
        </div>

        <!-- Step 3: Data Export -->
        <div v-else-if="currentStep === 'export'" class="space-y-4">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">Exporter vos données</h3>
                <p class="text-sm text-blue-700 mt-1">
                  Vous pouvez télécharger une copie de toutes vos données avant la suppression.
                </p>
              </div>
            </div>
          </div>

          <div class="text-center py-6">
            <button
              @click="exportUserData"
              :disabled="exporting"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              <svg
                v-if="exporting"
                class="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-700"
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
              <svg
                v-else
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {{ exporting ? 'Exportation...' : 'Télécharger mes données' }}
            </button>
          </div>

          <p class="text-sm text-gray-500 text-center">
            Vous pouvez ignorer cette étape si vous ne souhaitez pas garder une copie de vos
            données.
          </p>
        </div>

        <!-- Step 4: Final Confirmation -->
        <div v-else-if="currentStep === 'final'" class="space-y-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Dernière chance de changer d'avis</h3>
                <p class="text-sm text-red-700 mt-1">
                  Votre compte sera supprimé immédiatement mais vous pourrez le récupérer pendant 30
                  jours.
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <p class="font-medium text-gray-900">Récapitulatif :</p>
            <ul class="text-sm text-gray-600 space-y-1">
              <li><strong>Raison :</strong> {{ getReasonLabel(selectedReason) }}</li>
              <li v-if="customReason"><strong>Commentaire :</strong> {{ customReason }}</li>
              <li><strong>Période de grâce :</strong> 30 jours pour réactiver</li>
            </ul>
          </div>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p class="text-sm text-yellow-800">
              <strong>Important :</strong> Vous recevrez un email avec un lien pour réactiver votre
              compte dans les 30 prochains jours.
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-between">
        <button
          v-if="currentStep !== 'confirm'"
          @click="previousStep"
          :disabled="processing"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
        >
          Retour
        </button>
        <div v-else></div>

        <div class="flex space-x-3">
          <button
            @click="closeModal"
            :disabled="processing"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            @click="nextStep"
            :disabled="processing || (currentStep === 'reason' && !selectedReason)"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="processing"
              class="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
            {{ currentStep === 'final' ? 'Supprimer définitivement' : 'Continuer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { AccountDeletionApi, type DeletionRequest } from '@/services/accountDeletionApi'

// Props
interface Props {
  showModal: boolean
}

defineProps<Props>()

// Emits
interface DeletionResult {
  success: boolean
  reactivationDeadline?: string
  message?: string
}

const emit = defineEmits<{
  close: []
  deleted: [result: DeletionResult]
}>()

// Reactive state
const currentStep = ref<'confirm' | 'reason' | 'export' | 'final'>('confirm')
const processing = ref(false)
const exporting = ref(false)

// Form data
const selectedReason = ref('')
const customReason = ref('')

// Deletion reasons
const deletionReasons = [
  {
    value: 'no_longer_coaching',
    label: 'Je ne suis plus coach',
    description: "J'ai arrêté mon activité de coaching",
  },
  {
    value: 'switching_platform',
    label: 'Je change de plateforme',
    description: "J'utilise maintenant une autre solution",
  },
  {
    value: 'too_complicated',
    label: 'Trop compliqué',
    description: "L'interface est trop complexe pour moi",
  },
  {
    value: 'not_enough_clients',
    label: 'Pas assez de clients',
    description: 'Je ne reçois pas suffisamment de demandes',
  },
  {
    value: 'technical_issues',
    label: 'Problèmes techniques',
    description: 'Je rencontre des bugs ou des dysfonctionnements',
  },
  {
    value: 'privacy_concerns',
    label: 'Préoccupations de confidentialité',
    description: 'Je ne souhaite plus partager mes données',
  },
  {
    value: 'other',
    label: 'Autre raison',
    description: 'Une raison non listée ci-dessus',
  },
]

// Computed
const getReasonLabel = computed(() => {
  return (value: string) => {
    const reason = deletionReasons.find((r) => r.value === value)
    return reason?.label || 'Non spécifié'
  }
})

// Methods
const closeModal = () => {
  if (!processing.value) {
    emit('close')
    resetForm()
  }
}

const resetForm = () => {
  currentStep.value = 'confirm'
  selectedReason.value = ''
  customReason.value = ''
  processing.value = false
  exporting.value = false
}

const nextStep = async () => {
  if (currentStep.value === 'confirm') {
    currentStep.value = 'reason'
  } else if (currentStep.value === 'reason' && selectedReason.value) {
    currentStep.value = 'export'
  } else if (currentStep.value === 'export') {
    currentStep.value = 'final'
  } else if (currentStep.value === 'final') {
    await deleteAccount()
  }
}

const previousStep = () => {
  if (currentStep.value === 'reason') {
    currentStep.value = 'confirm'
  } else if (currentStep.value === 'export') {
    currentStep.value = 'reason'
  } else if (currentStep.value === 'final') {
    currentStep.value = 'export'
  }
}

const exportUserData = async () => {
  try {
    exporting.value = true
    const data = await AccountDeletionApi.exportUserData()
    AccountDeletionApi.downloadUserData(data)
  } catch (error) {
    console.error('Export failed:', error)
    alert("Erreur lors de l'exportation des données. Veuillez réessayer.")
  } finally {
    exporting.value = false
  }
}

const deleteAccount = async () => {
  try {
    processing.value = true

    const deletionReason =
      selectedReason.value === 'other' && customReason.value
        ? customReason.value
        : `${getReasonLabel.value(selectedReason.value)}${customReason.value ? ` - ${customReason.value}` : ''}`

    const request: DeletionRequest = {
      reason: deletionReason,
      type: 'user_requested',
    }

    const result = await AccountDeletionApi.deleteAccount(request)

    if (result.success) {
      emit('deleted', result)
    } else {
      throw new Error(result.error || 'Erreur lors de la suppression')
    }
  } catch (error) {
    console.error('Deletion failed:', error)
    alert('Erreur lors de la suppression du compte. Veuillez réessayer.')
    processing.value = false
  }
}
</script>

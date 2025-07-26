<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50"
    @click="$emit('close')"
  >
    <div class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
          @click.stop
        >
          <div>
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-base font-semibold leading-6 text-gray-900">
                Gérer votre abonnement
              </h3>
              <div class="mt-4 text-left">
                <p class="text-sm text-gray-500 mb-4">
                  Vous pouvez annuler votre abonnement à tout moment. Choisissez quand vous
                  souhaitez que l'annulation prenne effet :
                </p>

                <div class="space-y-3">
                  <!-- Cancel at period end -->
                  <div
                    class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    @click="selectedOption = 'end_of_period'"
                  >
                    <div class="flex items-start">
                      <input
                        id="end_of_period"
                        v-model="selectedOption"
                        value="end_of_period"
                        type="radio"
                        class="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div class="ml-3">
                        <label
                          for="end_of_period"
                          class="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          Annuler à la fin de la période de facturation
                        </label>
                        <p class="text-sm text-gray-500">
                          Gardez l'accès jusqu'au
                          {{ formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) }}, puis
                          passez au plan gratuit.
                        </p>
                        <div class="mt-1 text-xs text-green-600 font-medium">
                          Recommandé - Profitez de votre abonnement payé
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Cancel immediately -->
                  <div
                    class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    @click="selectedOption = 'immediate'"
                  >
                    <div class="flex items-start">
                      <input
                        id="immediate"
                        v-model="selectedOption"
                        value="immediate"
                        type="radio"
                        class="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div class="ml-3">
                        <label
                          for="immediate"
                          class="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          Annuler immédiatement
                        </label>
                        <p class="text-sm text-gray-500">
                          Perdez l'accès tout de suite et passez au plan gratuit.
                        </p>
                        <div class="mt-1 text-xs text-red-600 font-medium">
                          Aucun remboursement pour la période en cours
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Feedback section -->
                <div class="mt-4 border-t border-gray-200 pt-4">
                  <label for="feedback" class="text-sm font-medium text-gray-900">
                    Pourquoi annulez-vous ? (optionnel)
                  </label>
                  <textarea
                    id="feedback"
                    v-model="feedback"
                    rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    placeholder="Aidez-nous à améliorer notre service..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:col-start-2"
              @click="confirmCancel"
              :disabled="!selectedOption || loading"
            >
              <span v-if="!loading">Confirmer l'annulation</span>
              <div v-else class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Traitement...
              </div>
            </button>
            <button
              type="button"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
              @click="$emit('close')"
            >
              Conserver l'abonnement
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

defineProps<{
  show: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [immediate: boolean, feedback?: string]
}>()

const selectedOption = ref<'end_of_period' | 'immediate' | null>(null)
const feedback = ref('')

const formatDate = (date: Date) => {
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const confirmCancel = () => {
  if (!selectedOption.value) return

  const immediate = selectedOption.value === 'immediate'
  emit('confirm', immediate, feedback.value || undefined)
}
</script>

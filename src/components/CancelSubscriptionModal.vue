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
                  Vous pouvez annuler votre abonnement à tout moment. L'annulation prendra effet à
                  la fin de votre période de facturation en cours.
                </p>

                <!-- Single info block: always cancel at period end -->
                <div class="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <p class="text-sm text-gray-800">
                    Vous conserverez l'accès jusqu'à la fin de la période actuelle, puis vous
                    passerez automatiquement au plan gratuit.
                  </p>
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
              :disabled="loading"
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

const feedback = ref('')

const confirmCancel = () => {
  // Always cancel at end of billing period
  const immediate = false
  console.log('[CancelSubscriptionModal] confirm clicked', { immediate, feedback: feedback.value })
  emit('confirm', immediate, feedback.value || undefined)
}
</script>

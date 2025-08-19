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
            <div
              class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M12 8v4m0 4h.01"
                />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-base font-semibold leading-6 text-gray-900">
                Confirmer la réactivation
              </h3>
              <div class="mt-4 text-left text-sm text-gray-700">
                <p class="mb-3">
                  Votre abonnement redeviendra renouvelable automatiquement. Vous serez débité à la
                  date indiquée ci-dessous.
                </p>
                <div class="rounded-md border border-gray-200 p-4 bg-gray-50">
                  <div class="flex items-center justify-between">
                    <div class="text-gray-600">Carte utilisée</div>
                    <div class="font-medium text-gray-900">
                      <template v-if="paymentMethod">
                        <span class="uppercase">{{ paymentMethod.brand || 'carte' }}</span>
                        <span> •••• {{ paymentMethod.last4 || '****' }}</span>
                      </template>
                      <template v-else> Carte par défaut enregistrée </template>
                    </div>
                  </div>
                  <div class="mt-2 flex items-center justify-between">
                    <div class="text-gray-600">Prochaine facturation</div>
                    <div class="font-medium text-gray-900">{{ formatDate(billingDate) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:col-start-2 disabled:opacity-50"
              @click="$emit('confirm')"
              :disabled="loading"
            >
              <span v-if="!loading">Confirmer</span>
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
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaymentMethod } from '@/stores/modernSubscription'

defineProps<{
  show: boolean
  loading?: boolean
  paymentMethod?: Partial<PaymentMethod> | null
  billingDate?: Date | null
}>()

const formatDate = (date?: Date | null) => {
  if (!date) return '—'
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

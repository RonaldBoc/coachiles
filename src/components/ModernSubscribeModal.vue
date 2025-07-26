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
              class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100"
            >
              <CreditCardIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-base font-semibold leading-6 text-gray-900">
                S'abonner à Coachiles Pro
              </h3>
              <div class="mt-4">
                <div class="bg-blue-50 rounded-lg p-6 text-center">
                  <div class="text-3xl font-bold text-gray-900">9€</div>
                  <div class="text-sm text-gray-500">par mois</div>
                  <div class="mt-4 text-left">
                    <h4 class="font-medium text-gray-900 mb-3">Tout ce dont vous avez besoin :</h4>
                    <ul class="space-y-2 text-sm text-gray-600">
                      <li class="flex items-center">
                        <CheckIcon class="h-4 w-4 text-green-500 mr-2" />
                        Leads illimités
                      </li>
                      <li class="flex items-center">
                        <CheckIcon class="h-4 w-4 text-green-500 mr-2" />
                        Services illimités
                      </li>
                      <li class="flex items-center">
                        <CheckIcon class="h-4 w-4 text-green-500 mr-2" />
                        Statistiques avancées
                      </li>
                      <li class="flex items-center">
                        <CheckIcon class="h-4 w-4 text-green-500 mr-2" />
                        Support prioritaire
                      </li>
                      <li class="flex items-center">
                        <CheckIcon class="h-4 w-4 text-green-500 mr-2" />
                        Badge coach vérifié
                      </li>
                      <li class="flex items-center">
                        <CheckIcon class="h-4 w-4 text-green-500 mr-2" />
                        Visibilité maximale
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="mt-4 text-xs text-gray-500 text-center">
                  Annulable à tout moment. Premier mois offert pour les nouveaux coachs.
                </div>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
              @click="$emit('subscribe')"
              :disabled="loading"
            >
              <span v-if="!loading">S'abonner maintenant</span>
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
import { CheckIcon, CreditCardIcon } from '@heroicons/vue/24/outline'

defineProps<{
  show: boolean
  loading?: boolean
}>()

defineEmits<{
  close: []
  subscribe: []
}>()
</script>

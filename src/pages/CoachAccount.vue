<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Tab, TabGroup, TabList, TabPanel, TabPanels, Switch } from '@headlessui/vue'
import {
  CogIcon,
  EnvelopeIcon,
  PhoneIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  CheckIcon,
} from '@heroicons/vue/24/outline'
import { useSubscriptionStore } from '@/stores/subscription'

const subscriptionStore = useSubscriptionStore()

// Account settings
const emailNotifications = ref(true)
const smsNotifications = ref(false)
const marketingEmails = ref(false)
const twoFactorAuth = ref(false)

// Auto-save indicator
const showSavedIndicator = ref(false)

// Auto-save when settings change
watch(
  [emailNotifications, smsNotifications, marketingEmails, twoFactorAuth],
  () => {
    saveSettings()
  },
  { deep: true },
)

// Tabs - Only account settings and subscription
const tabs = [
  { id: 'settings', name: 'Paramètres', icon: CogIcon },
  { id: 'subscription', name: 'Abonnement', icon: CreditCardIcon },
]

const hasActiveSubscription = computed(() => {
  return subscriptionStore.hasActiveSubscription
})

// Settings functions
const saveSettings = () => {
  console.log('Auto-saving settings:', {
    emailNotifications: emailNotifications.value,
    smsNotifications: smsNotifications.value,
    marketingEmails: marketingEmails.value,
    twoFactorAuth: twoFactorAuth.value,
  })

  // Show saved indicator
  showSavedIndicator.value = true
  setTimeout(() => {
    showSavedIndicator.value = false
  }, 2000)

  // TODO: Call API to save settings
}

const deleteAccount = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
    console.log('Deleting account...')
  }
}

// Subscription functions
const manageSubscription = () => {
  subscriptionStore.toggleSubscription()
}

const upgradeSubscription = () => {
  // This will trigger the subscription change
  console.log('Navigating to plans...')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">Mon compte</h1>
        <p class="mt-2 text-sm text-gray-600">Gérez vos paramètres de compte et votre abonnement</p>
      </div>

      <!-- Tabs -->
      <TabGroup>
        <TabList class="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab v-for="tab in tabs" :key="tab.id" as="template" v-slot="{ selected }">
            <button
              class="w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              :class="[
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-700 hover:bg-white/[0.12] hover:text-blue-800',
              ]"
            >
              <div class="flex items-center justify-center space-x-2">
                <component :is="tab.icon" class="h-5 w-5" />
                <span>{{ tab.name }}</span>
              </div>
            </button>
          </Tab>
        </TabList>

        <TabPanels class="mt-8">
          <!-- Settings Tab -->
          <TabPanel class="space-y-8">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <div class="max-w-2xl">
                  <h2 class="text-base font-semibold leading-7 text-gray-900">
                    Préférences de notification
                  </h2>
                  <div class="flex items-center justify-between">
                    <p class="mt-1 text-sm leading-6 text-gray-600">
                      Choisissez comment vous souhaitez être informé des activités importantes.
                    </p>
                    <!-- Auto-save indicator -->
                    <div
                      v-if="showSavedIndicator"
                      class="flex items-center text-sm text-green-600 transition-opacity duration-300"
                    >
                      <CheckIcon class="mr-1 h-4 w-4" />
                      Sauvegardé
                    </div>
                  </div>

                  <div class="mt-6 space-y-6">
                    <!-- Email Notifications -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <EnvelopeIcon class="h-5 w-5 text-gray-400" />
                        <div class="ml-3">
                          <h3 class="text-sm font-medium text-gray-900">Notifications par email</h3>
                          <p class="text-sm text-gray-500">
                            Recevez des notifications pour les nouvelles propositions et messages
                          </p>
                        </div>
                      </div>
                      <Switch
                        v-model="emailNotifications"
                        :class="emailNotifications ? 'bg-blue-600' : 'bg-gray-200'"
                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      >
                        <span
                          :class="emailNotifications ? 'translate-x-5' : 'translate-x-0'"
                          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        />
                      </Switch>
                    </div>

                    <!-- SMS Notifications -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <PhoneIcon class="h-5 w-5 text-gray-400" />
                        <div class="ml-3">
                          <h3 class="text-sm font-medium text-gray-900">Notifications SMS</h3>
                          <p class="text-sm text-gray-500">
                            Recevez des SMS pour les urgences et rappels importants
                          </p>
                        </div>
                      </div>
                      <Switch
                        v-model="smsNotifications"
                        :class="smsNotifications ? 'bg-blue-600' : 'bg-gray-200'"
                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      >
                        <span
                          :class="smsNotifications ? 'translate-x-5' : 'translate-x-0'"
                          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        />
                      </Switch>
                    </div>

                    <!-- Marketing Emails -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <EnvelopeIcon class="h-5 w-5 text-gray-400" />
                        <div class="ml-3">
                          <h3 class="text-sm font-medium text-gray-900">Emails marketing</h3>
                          <p class="text-sm text-gray-500">
                            Recevez nos newsletters et conseils pour développer votre activité
                          </p>
                        </div>
                      </div>
                      <Switch
                        v-model="marketingEmails"
                        :class="marketingEmails ? 'bg-blue-600' : 'bg-gray-200'"
                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      >
                        <span
                          :class="marketingEmails ? 'translate-x-5' : 'translate-x-0'"
                          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        />
                      </Switch>
                    </div>

                    <!-- Two Factor Auth -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <CogIcon class="h-5 w-5 text-gray-400" />
                        <div class="ml-3">
                          <h3 class="text-sm font-medium text-gray-900">
                            Authentification à deux facteurs
                          </h3>
                          <p class="text-sm text-gray-500">
                            Ajoutez une couche de sécurité supplémentaire à votre compte
                          </p>
                        </div>
                      </div>
                      <Switch
                        v-model="twoFactorAuth"
                        :class="twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'"
                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      >
                        <span
                          :class="twoFactorAuth ? 'translate-x-5' : 'translate-x-0'"
                          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        />
                      </Switch>
                    </div>
                  </div>

                  <div class="mt-8 flex justify-end">
                    <button
                      @click="deleteAccount"
                      class="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                    >
                      Supprimer le compte
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- Subscription Tab -->
          <TabPanel class="space-y-8">
            <!-- Current Plan -->
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <div class="max-w-2xl">
                  <h2 class="text-base font-semibold leading-7 text-gray-900">Plan actuel</h2>
                  <p class="mt-1 text-sm leading-6 text-gray-600">
                    Gérez votre abonnement et vos options de facturation.
                  </p>

                  <div class="mt-6">
                    <div
                      class="rounded-lg border border-gray-200 bg-gray-50 p-6"
                      :class="{
                        'border-green-200 bg-green-50': hasActiveSubscription,
                        'border-gray-200 bg-gray-50': !hasActiveSubscription,
                      }"
                    >
                      <div class="flex items-center justify-between">
                        <div>
                          <h3 class="text-lg font-medium text-gray-900">
                            {{ subscriptionStore.currentPlan?.name || 'Aucun abonnement' }}
                          </h3>
                          <p class="text-sm text-gray-600">
                            {{
                              subscriptionStore.currentPlan?.description ||
                              "Vous n'avez pas d'abonnement actif"
                            }}
                          </p>
                          <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <div v-if="subscriptionStore.currentPlan" class="flex items-center">
                              <BanknotesIcon class="mr-1 h-4 w-4" />
                              {{ subscriptionStore.currentPlan.price }}€/mois
                            </div>
                            <div
                              v-if="subscriptionStore.userSubscription.nextBillingDate"
                              class="flex items-center"
                            >
                              <CalendarDaysIcon class="mr-1 h-4 w-4" />
                              Prochaine facture:
                              {{ subscriptionStore.userSubscription.nextBillingDate }}
                            </div>
                          </div>
                        </div>

                        <div class="flex space-x-3">
                          <button
                            v-if="!hasActiveSubscription"
                            @click="upgradeSubscription"
                            class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                          >
                            S'abonner
                          </button>
                          <button
                            v-else
                            @click="manageSubscription"
                            class="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
                          >
                            Gérer
                          </button>
                        </div>
                      </div>

                      <!-- Plan Features -->
                      <div
                        v-if="subscriptionStore.currentPlan?.features"
                        class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"
                      >
                        <div
                          v-for="feature in subscriptionStore.currentPlan.features"
                          :key="feature"
                          class="flex items-center text-sm text-gray-600"
                        >
                          <svg
                            class="mr-2 h-4 w-4 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {{ feature }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Available Plans -->
            <div
              v-if="!hasActiveSubscription"
              class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
            >
              <div class="px-4 py-6 sm:p-8">
                <div class="max-w-2xl">
                  <h2 class="text-base font-semibold leading-7 text-gray-900">Plans disponibles</h2>
                  <p class="mt-1 text-sm leading-6 text-gray-600">
                    Choisissez le plan qui convient le mieux à vos besoins.
                  </p>

                  <div class="mt-6 grid gap-6 sm:grid-cols-2">
                    <div
                      v-for="plan in subscriptionStore.activePlans"
                      :key="plan.id"
                      class="rounded-lg border border-gray-200 p-6 hover:border-blue-300"
                    >
                      <h3 class="text-lg font-medium text-gray-900">{{ plan.name }}</h3>
                      <p class="mt-1 text-sm text-gray-600">{{ plan.description }}</p>
                      <div class="mt-4">
                        <span class="text-2xl font-bold text-gray-900">{{ plan.price }}€</span>
                        <span class="text-sm text-gray-500">/mois</span>
                      </div>
                      <ul class="mt-4 space-y-2">
                        <li
                          v-for="feature in plan.features"
                          :key="feature"
                          class="flex items-center text-sm text-gray-600"
                        >
                          <svg
                            class="mr-2 h-4 w-4 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {{ feature }}
                        </li>
                      </ul>
                      <button
                        @click="subscriptionStore.subscribeToPlan(plan.id)"
                        class="mt-6 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      >
                        Choisir ce plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Billing History -->
            <div
              v-if="hasActiveSubscription && subscriptionStore.billingHistory.length > 0"
              class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
            >
              <div class="px-4 py-6 sm:p-8">
                <div class="max-w-2xl">
                  <h2 class="text-base font-semibold leading-7 text-gray-900">
                    Historique de facturation
                  </h2>
                  <p class="mt-1 text-sm leading-6 text-gray-600">
                    Consultez vos factures précédentes.
                  </p>

                  <div class="mt-6">
                    <div class="overflow-hidden border border-gray-200 sm:rounded-lg">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th
                              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                            >
                              Date
                            </th>
                            <th
                              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                            >
                              Montant
                            </th>
                            <th
                              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                            >
                              Statut
                            </th>
                            <th
                              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                            >
                              Facture
                            </th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white">
                          <tr v-for="invoice in subscriptionStore.billingHistory" :key="invoice.id">
                            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {{ invoice.date }}
                            </td>
                            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {{ invoice.amount }}€
                            </td>
                            <td class="whitespace-nowrap px-6 py-4 text-sm">
                              <span
                                class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
                                :class="{
                                  'bg-green-100 text-green-800': invoice.status === 'paid',
                                  'bg-yellow-100 text-yellow-800': invoice.status === 'pending',
                                  'bg-red-100 text-red-800': invoice.status === 'failed',
                                }"
                              >
                                {{
                                  invoice.status === 'paid'
                                    ? 'Payée'
                                    : invoice.status === 'pending'
                                      ? 'En attente'
                                      : 'Échouée'
                                }}
                              </span>
                            </td>
                            <td class="whitespace-nowrap px-6 py-4 text-sm text-blue-600">
                              <a href="#" class="hover:text-blue-900">Télécharger</a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { Tab, TabGroup, TabList, TabPanel, TabPanels, Switch } from '@headlessui/vue'
import { CogIcon, EnvelopeIcon, CheckIcon } from '@heroicons/vue/24/outline'
import CoachLayout from '@/layouts/CoachLayout.vue'
import AccountDeletionModal from '@/components/AccountDeletionModal.vue'
import { getMyNotificationPrefs, updateMyNotificationPrefs } from '@/services/notificationPrefsApi'
// Subscription management moved to dedicated Abonnement page

const router = useRouter()

// Account settings
// Email notification preferences (DB-backed)
const emailNewLead = ref(true)
const emailNewReview = ref(true)
// Other UI toggles (local only)
const marketingEmails = ref(false)
// const twoFactorAuth = ref(false)

// Auto-save indicator
const showSavedIndicator = ref(false)

// Account deletion modal
const showDeletionModal = ref(false)

// Auto-save when settings change (persist email + marketing prefs)
watch([emailNewLead, emailNewReview, marketingEmails], () => {
  saveSettings()
})

// Tabs - Only account settings and subscription

const tabs = [{ id: 'settings', name: 'Paramètres', icon: CogIcon }]

// Settings functions
const saveSettings = () => {
  // Persist notification preferences to Supabase
  updateMyNotificationPrefs({
    email_new_lead: emailNewLead.value,
    email_new_review: emailNewReview.value,
    email_marketing: marketingEmails.value,
  })
    .then(() => {
      showSavedIndicator.value = true
      setTimeout(() => (showSavedIndicator.value = false), 1500)
    })
    .catch((e) => console.error('Erreur lors de la sauvegarde des préférences:', e))
}

const deleteAccount = () => {
  showDeletionModal.value = true
}

const handleAccountDeleted = () => {
  showDeletionModal.value = false

  // Show success message and redirect
  alert(
    'Votre compte a été programmé pour suppression. Vous avez 30 jours pour le réactiver via le lien envoyé par email.',
  )

  // Redirect to homepage
  router.push('/')
}

const closeDeletionModal = () => {
  showDeletionModal.value = false
}

// Load initial notification preferences
onMounted(async () => {
  try {
    const prefs = await getMyNotificationPrefs()
    emailNewLead.value = !!prefs.email_new_lead
    emailNewReview.value = !!prefs.email_new_review
    marketingEmails.value = !!prefs.email_marketing
  } catch (e) {
    console.error('Erreur lors du chargement des préférences de notification:', e)
  }
})
</script>

<template>
  <CoachLayout>
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">Mon compte</h1>
        <p class="mt-2 text-sm text-gray-600">Gérez vos paramètres de compte et votre abonnement</p>
        <RouterLink
          to="/coach/abonnement"
          class="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Gérer mon abonnement →
        </RouterLink>
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
                    <!-- Email: nouvelles demandes -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <EnvelopeIcon class="h-5 w-5 text-gray-400" />
                        <div class="ml-3">
                          <h3 class="text-sm font-medium text-gray-900">Nouvelles demandes</h3>
                          <p class="text-sm text-gray-500">
                            Recevez un email quand vous recevez une nouvelle demande d’un client.
                          </p>
                        </div>
                      </div>
                      <Switch
                        v-model="emailNewLead"
                        :class="emailNewLead ? 'bg-blue-600' : 'bg-gray-200'"
                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      >
                        <span
                          :class="emailNewLead ? 'translate-x-5' : 'translate-x-0'"
                          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        />
                      </Switch>
                    </div>

                    <!-- Email: nouveaux avis -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <EnvelopeIcon class="h-5 w-5 text-gray-400" />
                        <div class="ml-3">
                          <h3 class="text-sm font-medium text-gray-900">Nouveaux avis</h3>
                          <p class="text-sm text-gray-500">
                            Recevez un email lorsqu’un client publie un avis.
                          </p>
                        </div>
                      </div>
                      <Switch
                        v-model="emailNewReview"
                        :class="emailNewReview ? 'bg-blue-600' : 'bg-gray-200'"
                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      >
                        <span
                          :class="emailNewReview ? 'translate-x-5' : 'translate-x-0'"
                          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        />
                      </Switch>
                    </div>

                    <!-- SMS Notifications -->
                    <!-- <div class="flex items-center justify-between">
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
                    </div> -->

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
                    <!-- <div class="flex items-center justify-between">
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
                    </div> -->
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
        </TabPanels>
      </TabGroup>
    </div>

    <!-- Account Deletion Modal -->
    <AccountDeletionModal
      :showModal="showDeletionModal"
      @close="closeDeletionModal"
      @deleted="handleAccountDeleted"
    />
  </CoachLayout>
</template>

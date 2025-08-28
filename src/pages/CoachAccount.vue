<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { Tab, TabGroup, TabList, TabPanel, TabPanels, Switch } from '@headlessui/vue'
import { CogIcon, EnvelopeIcon, PhoneIcon, CheckIcon } from '@heroicons/vue/24/outline'
import CoachLayout from '@/layouts/CoachLayout.vue'
import AccountDeletionModal from '@/components/AccountDeletionModal.vue'
// Subscription management moved to dedicated Abonnement page

const router = useRouter()

// Account settings
const emailNotifications = ref(true)
const smsNotifications = ref(false)
const marketingEmails = ref(false)
const twoFactorAuth = ref(false)

// Auto-save indicator
const showSavedIndicator = ref(false)

// Account deletion modal
const showDeletionModal = ref(false)

// Auto-save when settings change
watch(
  [emailNotifications, smsNotifications, marketingEmails, twoFactorAuth],
  () => {
    saveSettings()
  },
  { deep: true },
)

// Tabs - Only account settings and subscription
import { supabaseReviewApi } from '@/services/supabaseReviewApi'
import { supabase } from '@/utils/supabase'

const tabs = [
  { id: 'settings', name: 'Paramètres', icon: CogIcon },
  { id: 'reviews', name: 'Avis', icon: CheckIcon },
]

// Reviews state
interface CoachReviewRow {
  id: string
  createdAt: Date
  rating: number
  comment?: string
  clientName: string
  coachResponse?: string
  coachRespondedAt?: Date
  moderationStatus: string
  isPublished: boolean
  coach_response_hidden?: boolean
}
const myReviews = ref<CoachReviewRow[]>([])
const reviewsLoading = ref(false)
const reviewReply = ref<Record<string, string>>({})

async function loadMyReviews() {
  try {
    reviewsLoading.value = true
    const { data: user } = await supabase.auth.getUser()
    let coachId = user.user?.id || null
    // If no direct reviews under auth.uid, try resolving coach id by email (coaches table)
    if (user.user?.email) {
      const { data: coachRow } = await supabase
        .from('coaches')
        .select('id')
        .eq('email', user.user.email)
        .maybeSingle()
      if (coachRow?.id) coachId = coachRow.id
    }
    if (!coachId) return
    const rows = await supabaseReviewApi.getCoachReviews(coachId, {
      includeUnpublished: true,
      limit: 100,
    })
    // Fallback: if no rows and coachId was auth.uid, but email-mapped coach id differs, try again already handled above
    myReviews.value = rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      rating: r.rating,
      comment: r.comment,
      clientName: r.clientName,
      coachResponse: r.coachResponse,
      coachRespondedAt: r.coachRespondedAt,
      moderationStatus: r.moderationStatus,
      isPublished: r.isPublished,
    }))
  } finally {
    reviewsLoading.value = false
  }
}

async function submitResponse(review: CoachReviewRow) {
  const text = (reviewReply.value[review.id] || '').trim()
  if (!text) return
  try {
    const { error } = await supabase
      .from('reviews')
      .update({ coach_response: text, coach_responded_at: new Date().toISOString() })
      .eq('id', review.id)
      .is('coach_response', null)
    if (error) throw error
    await loadMyReviews()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to submit response'
    alert(msg)
  }
}

loadMyReviews()

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

          <!-- Reviews Tab -->
          <TabPanel class="space-y-6">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4">
              <h2 class="text-base font-semibold leading-7 text-gray-900 mb-4">Avis reçus</h2>
              <div v-if="reviewsLoading" class="text-sm text-gray-500">Chargement...</div>
              <div v-else class="space-y-4">
                <div v-if="!myReviews.length" class="text-sm text-gray-500">
                  Aucun avis pour le moment.
                </div>
                <div v-for="r in myReviews" :key="r.id" class="border rounded p-3 bg-gray-50/50">
                  <div class="flex justify-between items-start">
                    <div class="text-sm font-medium">{{ r.clientName }} • {{ r.rating }}★</div>
                    <div class="text-xs text-gray-500">{{ r.moderationStatus }}</div>
                  </div>
                  <div class="mt-1 text-sm whitespace-pre-wrap">{{ r.comment || '—' }}</div>
                  <div
                    v-if="r.coachResponse"
                    class="mt-2 text-xs p-2 bg-blue-50 rounded border border-blue-100"
                  >
                    <div class="font-semibold mb-1">Votre réponse</div>
                    <div class="whitespace-pre-wrap">{{ r.coachResponse }}</div>
                  </div>
                  <div v-else class="mt-2">
                    <textarea
                      v-model="reviewReply[r.id]"
                      rows="2"
                      placeholder="Répondre (une seule réponse possible)"
                      class="w-full text-xs rounded border-gray-300"
                    ></textarea>
                    <div class="mt-1 flex justify-end">
                      <button
                        @click="submitResponse(r)"
                        class="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        :disabled="!(reviewReply[r.id] || '').trim()"
                      >
                        Envoyer
                      </button>
                    </div>
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

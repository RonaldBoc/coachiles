<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <svg
          class="h-12 w-12 text-orange-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Réactivation de compte</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Votre compte coach est en attente de suppression
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Success State -->
        <div v-if="reactivated" class="text-center">
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4"
          >
            <svg
              class="h-6 w-6 text-green-600"
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
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Compte réactivé !</h3>
          <p class="text-sm text-gray-600 mb-6">
            Votre compte coach a été réactivé avec succès. Vous pouvez maintenant accéder à votre
            tableau de bord.
          </p>
          <button
            @click="goToDashboard"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Accéder au tableau de bord
          </button>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center">
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"
          >
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Erreur de réactivation</h3>
          <p class="text-sm text-gray-600 mb-6">{{ error }}</p>
          <div class="space-y-3">
            <button
              @click="retryReactivation"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Réessayer
            </button>
            <button
              @click="goToSupport"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Contacter le support
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="loading" class="text-center">
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4"
          >
            <svg
              class="animate-spin h-6 w-6 text-orange-600"
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
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Réactivation en cours...</h3>
          <p class="text-sm text-gray-600">
            Veuillez patienter pendant que nous restaurons votre compte.
          </p>
        </div>

        <!-- Confirmation State -->
        <div v-else class="space-y-6">
          <!-- Account Info -->
          <div v-if="accountInfo" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">Informations du compte</h4>
            <dl class="text-sm space-y-1">
              <div class="flex justify-between">
                <dt class="text-gray-600">Email :</dt>
                <dd class="text-gray-900">{{ accountInfo.email }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600">Nom :</dt>
                <dd class="text-gray-900">
                  {{ accountInfo.firstName }} {{ accountInfo.lastName }}
                </dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600">Supprimé le :</dt>
                <dd class="text-gray-900">{{ formatDate(accountInfo.deletedAt) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600">Suppression définitive :</dt>
                <dd class="text-red-600 font-medium">
                  {{ formatDate(accountInfo.permanentDeletionAt) }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Time remaining -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">Temps restant</h3>
                <p class="text-sm text-yellow-700 mt-1">
                  Vous avez encore <strong>{{ timeRemaining }}</strong> pour réactiver votre compte.
                  Après cette date, toutes vos données seront définitivement supprimées.
                </p>
              </div>
            </div>
          </div>

          <!-- Confirmation -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900">Que va-t-il se passer ?</h4>
            <ul class="text-sm text-gray-600 space-y-2">
              <li class="flex items-start">
                <svg
                  class="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Votre profil public sera immédiatement restauré
              </li>
              <li class="flex items-start">
                <svg
                  class="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Tous vos services redeviendront visibles
              </li>
              <li class="flex items-start">
                <svg
                  class="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Vous retrouverez l'accès à votre tableau de bord
              </li>
              <li class="flex items-start">
                <svg
                  class="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Vos photos et certifications seront restaurées
              </li>
            </ul>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <button
              @click="confirmReactivation"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Oui, réactiver mon compte
            </button>

            <button
              @click="goToHomepage"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Retourner à l'accueil
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-6 text-center">
        <p class="text-xs text-gray-500">
          Besoin d'aide ?
          <a href="/support" class="font-medium text-orange-600 hover:text-orange-500">
            Contactez notre support
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AccountDeletionApi, type ReactivationInfo } from '@/services/accountDeletionApi'

// Router
const route = useRoute()
const router = useRouter()

// Reactive state
const loading = ref(true)
const reactivated = ref(false)
const error = ref('')
const accountInfo = ref<ReactivationInfo | null>(null)

// Computed
const timeRemaining = computed(() => {
  if (!accountInfo.value?.permanentDeletionAt) return ''

  const deletionDate = new Date(accountInfo.value.permanentDeletionAt)
  const now = new Date()
  const diffTime = deletionDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'expiré'
  if (diffDays === 1) return '1 jour'
  return `${diffDays} jours`
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const loadAccountInfo = async () => {
  try {
    loading.value = true
    error.value = ''

    const token = route.query.token as string
    if (!token) {
      throw new Error('Token de réactivation manquant ou invalide')
    }

    // Check if account can be reactivated and get info
    const info = await AccountDeletionApi.getReactivationInfo(token)

    if (!info) {
      throw new Error('Compte introuvable ou délai de réactivation expiré')
    }

    accountInfo.value = info
  } catch (err: unknown) {
    error.value =
      err instanceof Error ? err.message : 'Erreur lors du chargement des informations du compte'
    console.error('Failed to load account info:', err)
  } finally {
    loading.value = false
  }
}

const confirmReactivation = async () => {
  try {
    loading.value = true
    error.value = ''

    const token = route.query.token as string
    const result = await AccountDeletionApi.reactivateAccount(token)

    if (result.success) {
      reactivated.value = true
    } else {
      throw new Error(result.error || 'Erreur lors de la réactivation')
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Erreur lors de la réactivation du compte'
    console.error('Reactivation failed:', err)
    loading.value = false
  }
}

const retryReactivation = () => {
  error.value = ''
  confirmReactivation()
}

const goToDashboard = () => {
  router.push('/coach/dashboard')
}

const goToHomepage = () => {
  router.push('/')
}

const goToSupport = () => {
  router.push('/support')
}

// Lifecycle
onMounted(() => {
  loadAccountInfo()
})
</script>

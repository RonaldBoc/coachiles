<template>
  <div
    class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <div
          class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-blue-600"
        >
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion Espace Coach
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">Accédez à votre espace coach</p>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Success Alert -->
      <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex">
          <CheckCircleIcon class="h-5 w-5 text-green-400" />
          <div class="ml-3">
            <p class="text-sm text-green-800">{{ successMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700"> Email * </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              placeholder="votre.email@exemple.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Mot de passe *
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              placeholder="Votre mot de passe"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center">
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              {{ loading ? 'Connexion...' : 'Se connecter' }}
            </span>
            <span v-else> Se connecter </span>
          </button>
        </div>

        <!-- Links -->
        <div class="flex flex-col space-y-3">
          <div class="flex items-center justify-between">
            <router-link
              to="/signup"
              class="text-sm text-orange-600 hover:text-orange-500 font-medium"
            >
              Créer un nouveau compte coach
            </router-link>

            <button
              type="button"
              @click="showForgotPassword = true"
              class="text-sm text-gray-600 hover:text-gray-500"
            >
              Mot de passe oublié ?
            </button>
          </div>
        </div>
      </form>

      <!-- Back to Home -->
      <div class="text-center">
        <router-link to="/" class="text-sm text-gray-500 hover:text-gray-700">
          ← Retour à l'accueil
        </router-link>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div
      v-if="showForgotPassword"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center"
      @click="showForgotPassword = false"
    >
      <div class="relative p-8 bg-white w-full max-w-md mx-4 rounded-lg shadow-lg" @click.stop>
        <h3 class="text-lg font-medium text-gray-900 mb-4">Réinitialiser le mot de passe</h3>
        <p class="text-sm text-gray-600 mb-4">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>

        <form @submit.prevent="handleForgotPassword">
          <input
            v-model="resetEmail"
            type="email"
            required
            placeholder="votre.email@exemple.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 mb-4"
          />

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showForgotPassword = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {{ loading ? 'Envoi...' : 'Envoyer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

// Router
const router = useRouter()
const route = useRoute()

// Auth Store
const authStore = useAuthStore()

// Component State
const showForgotPassword = ref(false)
const resetEmail = ref('')
const successMessage = ref('')

// Form Data
const formData = ref({
  email: '',
  password: '',
})

// Computed
const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

// Check if user came from email confirmation
onMounted(() => {
  if (route.query.confirmed === 'true') {
    successMessage.value =
      'Email confirmé avec succès ! Connectez-vous pour compléter votre profil.'
  }
})

const handleSubmit = async () => {
  try {
    authStore.clearError()
    successMessage.value = ''

    console.log('📝 Form submission - signin:', formData.value.email)

    await authStore.signIn(formData.value.email, formData.value.password)

    // Check if user has completed onboarding (coach profile loaded in signIn)
    if (authStore.isCoach) {
      console.log('✅ User is an existing coach, redirecting to profile')
      router.push('/coach/profile')
    } else {
      console.log('ℹ️ User needs to complete onboarding')
      router.push('/coach/onboarding')
    }
  } catch (err) {
    console.error('Auth error:', err)
    // Error is handled by the store
  }
}

const handleForgotPassword = async () => {
  try {
    authStore.clearError()
    await authStore.resetPassword(resetEmail.value)

    successMessage.value = 'Email de réinitialisation envoyé ! Vérifiez votre boîte mail.'
    showForgotPassword.value = false
    resetEmail.value = ''
  } catch (err) {
    console.error('Reset password error:', err)
    // Error is handled by the store
  }
}
</script>

<template>
  <div
    class="min-h-screen w-full bg-gradient-to-br from-gray-50 via-indigo-50 to-white relative overflow-hidden"
  >
    <!-- Decorative blobs -->
    <div
      class="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-200 to-purple-100 rounded-full blur-3xl opacity-40"
    ></div>
    <div
      class="pointer-events-none absolute -bottom-24 -left-24 w-[28rem] h-[28rem] bg-gradient-to-tr from-pink-100 to-indigo-100 rounded-full blur-3xl opacity-40"
    ></div>

    <div class="relative z-10 flex flex-col lg:flex-row min-h-screen">
      <!-- Left illustration / photo -->
      <div class="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div class="max-w-md">
          <div
            class="aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5 bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 flex items-end"
          >
            <div class="p-6 bg-gradient-to-t from-black/60 via-black/20 to-transparent w-full">
              <h2 class="text-white text-2xl font-semibold tracking-tight">
                Reprenez le contrôle de votre activité
              </h2>
              <p class="mt-2 text-indigo-100 text-sm leading-snug">
                Gérez vos clients, vos offres et vos sessions depuis une interface moderne et
                simple.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column auth form -->
      <div class="flex-1 flex flex-col justify-center py-10 px-6 sm:px-8 lg:px-12">
        <div class="mx-auto w-full max-w-md">
          <!-- Branding -->
          <div class="text-center">
            <div class="flex flex-col items-center space-y-2">
              <router-link to="/" class="text-indigo-600 font-bold text-xl tracking-tight"
                >Coachiles</router-link
              >
              <h1 class="mt-2 text-3xl font-extrabold text-gray-900">Connexion Espace Coach</h1>
              <p class="mt-1 text-sm text-gray-500">Accédez à votre espace coach</p>
            </div>
          </div>

          <div
            class="mt-10 bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg rounded-xl p-8 space-y-6"
          >
            <!-- Alerts -->
            <transition name="fade">
              <div
                v-if="error"
                class="rounded-md border border-red-200 bg-red-50/80 p-4 text-sm text-red-700 flex items-start gap-2"
              >
                <ExclamationCircleIcon class="h-5 w-5 text-red-500 mt-0.5" />
                <p>{{ error }}</p>
              </div>
            </transition>
            <transition name="fade">
              <div
                v-if="successMessage"
                class="rounded-md border border-green-200 bg-green-50/80 p-4 text-sm text-green-700 flex items-start gap-2"
              >
                <CheckCircleIcon class="h-5 w-5 text-green-500 mt-0.5" />
                <p>{{ successMessage }}</p>
              </div>
            </transition>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div class="space-y-5">
                <!-- Email -->
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1"
                    >Email *</label
                  >
                  <div class="relative">
                    <span
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <EnvelopeIcon class="h-5 w-5 text-gray-400" />
                    </span>
                    <input
                      id="email"
                      v-model="formData.email"
                      type="email"
                      required
                      autocomplete="email"
                      class="block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur-sm py-2.5 pl-11 pr-4 text-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                      placeholder="votre.email@exemple.com"
                    />
                  </div>
                </div>

                <!-- Password -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label for="password" class="block text-sm font-medium text-gray-700"
                      >Mot de passe *</label
                    >
                    <button
                      type="button"
                      @click="showForgotPassword = true"
                      class="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div class="relative">
                    <span
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <LockClosedIcon class="h-5 w-5 text-gray-400" />
                    </span>
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      id="password"
                      v-model="formData.password"
                      required
                      autocomplete="current-password"
                      class="block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur-sm py-2.5 pl-11 pr-12 text-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                      placeholder="Votre mot de passe"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                      :aria-label="
                        showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                      "
                    >
                      <component :is="showPassword ? EyeSlashIcon : EyeIcon" class="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <button
                  type="submit"
                  :disabled="loading"
                  class="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <span v-if="loading" class="flex items-center gap-2">
                    <svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V1a11 11 0 00-8.485 3.515A11 11 0 004 12h0z"
                      />
                    </svg>
                    Connexion...
                  </span>
                  <span v-else>Se connecter</span>
                </button>

                <!-- Divider -->
                <div
                  class="flex items-center text-xs text-gray-400 my-4 select-none"
                  aria-hidden="true"
                >
                  <div class="flex-grow h-px bg-gray-200"></div>
                  <span class="px-3">ou</span>
                  <div class="flex-grow h-px bg-gray-200"></div>
                </div>

                <!-- Google button -->
                <button
                  type="button"
                  @click="signInWithGoogle"
                  :disabled="loading"
                  class="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#EA4335"
                      d="M12 10.8v3.6h5.1c-.2 1.2-.9 2.2-2 2.9l3.3 2.6c1.9-1.8 3-4.3 3-7.2 0-.7-.1-1.5-.2-2.1H12Z"
                    />
                    <path
                      fill="#34A853"
                      d="M6.6 14.3 5.9 14l-2.6 2c1.7 3.3 5 5.5 8.7 5.5 2.6 0 4.8-.9 6.4-2.4l-3.3-2.6c-.9.6-2 .9-3.1.9-2.7 0-5-1.8-5.8-4.3Z"
                    />
                    <path
                      fill="#4A90E2"
                      d="M19.1 5.7 15.9 8.3c.9.5 1.7 1.3 2.2 2.2l3.4-2.6c-.9-1.7-2.2-3-3.9-3.9Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M12 4.5c1.5 0 2.8.5 3.9 1.4l3.1-2.6C17.9 1.9 15.7 1 12 1 8.3 1 5 3.2 3.3 6.5l3.3 2.6c.8-2.5 3.1-4.6 5.4-4.6Z"
                    />
                    <path
                      fill="#4285F4"
                      d="M21.3 10.5H12v3.6h5.1c-.2 1.2-.9 2.2-2 2.9l3.3 2.6c1.9-1.8 3-4.3 3-7.2 0-.7-.1-1.5-.1-1.9Z"
                    />
                    <path fill="none" d="M1 1h22v22H1Z" />
                  </svg>
                  Continuer avec Google
                </button>
              </div>

              <div class="pt-3 text-center">
                <p class="text-xs text-gray-500">
                  Pas encore de compte ?
                  <router-link
                    to="/signup"
                    class="font-medium text-gray-600 underline underline-offset-4 hover:text-indigo-600"
                    >Créer un compte</router-link
                  >
                </p>
                <p class="mt-3 text-xs">
                  <router-link to="/" class="text-gray-400 hover:text-gray-600"
                    >← Retour à l'accueil</router-link
                  >
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <transition name="fade">
      <div
        v-if="showForgotPassword"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="showForgotPassword = false"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div
          class="relative w-full max-w-md mx-auto bg-white rounded-xl shadow-xl border border-white/60 p-6 space-y-5"
          @click.stop
        >
          <div class="flex items-start justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Réinitialiser le mot de passe</h3>
            <button
              @click="showForgotPassword = false"
              class="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              ✕
            </button>
          </div>
          <p class="text-sm text-gray-600 leading-relaxed">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>
          <form @submit.prevent="handleForgotPassword" class="space-y-4">
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon class="h-5 w-5 text-gray-400" />
              </span>
              <input
                v-model="resetEmail"
                type="email"
                required
                placeholder="votre.email@exemple.com"
                class="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-11 pr-4 text-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                @click="showForgotPassword = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Envoi...' : 'Envoyer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

// Router & Store
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// UI State
const showForgotPassword = ref(false)
const showPassword = ref(false)
const resetEmail = ref('')
const successMessage = ref('')

// Form Data
const formData = ref({ email: '', password: '' })

// Computed
const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

// Email confirmation success
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
    await authStore.signIn(formData.value.email.trim(), formData.value.password)

    if (authStore.isCoach) {
      router.push('/coach/dashboard')
    } else {
      router.push('/coach/onboarding')
    }
  } catch {
    // Store handles error state
  }
}

const signInWithGoogle = async () => {
  try {
    await authStore.signInWithProvider('google')
  } catch {}
}

const handleForgotPassword = async () => {
  try {
    authStore.clearError()
    await authStore.resetPassword(resetEmail.value.trim())
    successMessage.value = 'Email de réinitialisation envoyé ! Vérifiez votre boîte mail.'
    showForgotPassword.value = false
    resetEmail.value = ''
  } catch {
    // Store handles error
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

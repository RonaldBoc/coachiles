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
                Bienvenue sur la plus grande communauté de coachs aux Antilles-Guyane.
              </h2>
              <p class="mt-2 text-indigo-100 text-sm leading-snug">
                Sports, Musique, Loisirs, aidez les clients à trouver votre activité facilement.<br /><br />
                Étudiants, enseignants, autodidactes, passionnés, diplômés, professionnels...<br />
                Inscrivez-vous sur CoachIles et commencez dès aujourd'hui !
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column form -->
      <div class="flex-1 flex flex-col justify-center py-10 px-6 sm:px-8 lg:px-12">
        <div class="mx-auto w-full max-w-md">
          <!-- Branding -->
          <div class="text-center">
            <div class="flex flex-col items-center space-y-2">
              <router-link to="/" class="text-indigo-600 font-bold text-xl tracking-tight"
                >Coachiles</router-link
              >
              <h1 class="mt-2 text-3xl font-extrabold text-gray-900">Créer votre compte coach</h1>
              <p class="mt-1 text-sm text-gray-500">
                Rejoignez notre plateforme de coaching professionnel
              </p>
            </div>
          </div>

          <div
            class="mt-10 bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg rounded-xl p-8"
          >
            <!-- Loading state -->
            <div v-if="loading" class="text-center py-10">
              <div
                class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"
              ></div>
              <p class="mt-6 text-gray-600 font-medium">Création de votre compte...</p>
            </div>

            <!-- Success state -->
            <div v-else-if="success" class="text-center py-8">
              <div
                class="rounded-full bg-green-100 p-3 mx-auto w-14 h-14 flex items-center justify-center shadow-inner"
              >
                <svg
                  class="w-7 h-7 text-green-600"
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
              <h3 class="mt-6 text-lg font-semibold text-gray-900">Compte créé avec succès !</h3>
              <p class="mt-3 text-sm text-gray-600 leading-relaxed">
                Un email de confirmation a été envoyé à <strong>{{ form.email }}</strong
                >.<br />Cliquez sur le lien dans l'email pour valider votre compte et compléter
                votre profil.
              </p>
              <div class="mt-8">
                <router-link
                  to="/auth"
                  class="text-indigo-600 hover:text-indigo-500 text-sm font-medium underline underline-offset-4"
                >
                  Déjà validé votre email ? Connectez-vous
                </router-link>
              </div>
            </div>

            <!-- Form -->
            <form v-else @submit.prevent="createAccount" class="space-y-6">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1"
                  >Email professionnel</label
                >
                <div class="relative">
                  <span
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  >
                    <EnvelopeIcon class="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    v-model="form.email"
                    required
                    autocomplete="email"
                    class="block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur-sm py-2.5 pl-11 pr-4 text-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    placeholder="nom@entreprise.com"
                  />
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label for="password" class="block text-sm font-medium text-gray-700"
                    >Mot de passe</label
                  >
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
                    name="password"
                    v-model="form.password"
                    required
                    minlength="8"
                    class="block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur-sm py-2.5 pl-11 pr-12 text-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    placeholder="••••••••"
                    autocomplete="new-password"
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
                <p class="mt-1 text-xs text-gray-500">
                  8 caractères minimum, inclure chiffres et lettres.
                </p>
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1"
                  >Confirmer le mot de passe</label
                >
                <div class="relative">
                  <span
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  >
                    <LockClosedIcon class="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    id="confirmPassword"
                    name="confirmPassword"
                    v-model="form.confirmPassword"
                    required
                    class="block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur-sm py-2.5 pl-11 pr-12 text-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    placeholder="Répétez votre mot de passe"
                    autocomplete="new-password"
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    :aria-label="
                      showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                    "
                  >
                    <component :is="showConfirmPassword ? EyeSlashIcon : EyeIcon" class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <transition name="fade">
                <div
                  v-if="error"
                  class="rounded-md border border-red-200 bg-red-50/80 p-4 text-sm text-red-700"
                >
                  <strong class="font-medium">Erreur :</strong> {{ error }}
                </div>
              </transition>

              <div class="space-y-3">
                <button
                  type="submit"
                  :disabled="loading || !isFormValid"
                  class="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Créer mon compte
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
                  Déjà un compte ?
                  <router-link
                    to="/auth"
                    class="font-medium text-gray-600 underline underline-offset-4 hover:text-indigo-600"
                    >Connectez-vous ici</router-link
                  >
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const loading = ref(false)
const success = ref(false)
const error = ref('')

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
})

const passwordPolicy = (pwd: string) => pwd.length >= 8

const isFormValid = computed(() => {
  return (
    form.value.email &&
    form.value.password &&
    form.value.confirmPassword &&
    form.value.password === form.value.confirmPassword &&
    passwordPolicy(form.value.password)
  )
})

const createAccount = async () => {
  if (!isFormValid.value) {
    error.value = 'Veuillez remplir tous les champs correctement'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.value.email.trim(),
      password: form.value.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth?confirmed=true`,
        data: {
          account_type: 'coach',
          signup_completed: false,
        },
      },
    })

    if (signUpError) throw signUpError

    success.value = true
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'Une erreur est survenue lors de la création du compte'
    }
  } finally {
    loading.value = false
  }
}

const signInWithGoogle = async () => {
  loading.value = true
  error.value = ''
  try {
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth?provider=google`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (oauthError) throw oauthError
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message
    } else {
      error.value = 'Impossible de démarrer la connexion Google'
    }
  } finally {
    // Note: Supabase will redirect away; loading state is mostly for quick feedback.
    setTimeout(() => (loading.value = false), 1200)
  }
}
</script>

<style scoped>
/* Simple fade transition for error box */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

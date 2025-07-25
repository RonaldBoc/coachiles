<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Créer votre compte coach</h2>
        <p class="mt-2 text-sm text-gray-600">
          Rejoignez notre plateforme de coaching professionnel
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div v-if="loading" class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Création de votre compte...</p>
        </div>

        <div v-else-if="success" class="text-center">
          <div
            class="rounded-full bg-green-100 p-3 mx-auto w-12 h-12 flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Compte créé avec succès!</h3>
          <p class="mt-2 text-sm text-gray-600">
            Un email de confirmation a été envoyé à <strong>{{ form.email }}</strong>
          </p>
          <p class="mt-2 text-sm text-gray-500">
            Cliquez sur le lien dans l'email pour valider votre compte et compléter votre profil.
          </p>
          <div class="mt-6">
            <router-link to="/auth" class="text-blue-600 hover:text-blue-500 text-sm font-medium">
              Déjà validé votre email ? Connectez-vous ici
            </router-link>
          </div>
        </div>

        <form v-else @submit.prevent="createAccount" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email professionnel
            </label>
            <div class="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                v-model="form.email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <div class="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                v-model="form.password"
                required
                minlength="6"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Minimum 6 caractères"
              />
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <div class="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                v-model="form.confirmPassword"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Répétez votre mot de passe"
              />
            </div>
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Erreur lors de la création du compte
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Créer mon compte
            </button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Déjà un compte ?
              <router-link to="/auth" class="font-medium text-blue-600 hover:text-blue-500">
                Connectez-vous ici
              </router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'

const loading = ref(false)
const success = ref(false)
const error = ref('')

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
})

const isFormValid = computed(() => {
  return (
    form.value.email &&
    form.value.password &&
    form.value.confirmPassword &&
    form.value.password === form.value.confirmPassword &&
    form.value.password.length >= 6
  )
})

const createAccount = async () => {
  if (!isFormValid.value) {
    error.value = 'Veuillez remplir tous les champs correctement'
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  loading.value = true
  error.value = ''

  try {
    console.log('🔐 Creating account for:', form.value.email)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.value.email,
      password: form.value.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth?confirmed=true`,
        data: {
          // We can add metadata here that will be available after email confirmation
          account_type: 'coach',
          signup_completed: false,
        },
      },
    })

    if (signUpError) {
      throw signUpError
    }

    console.log('✅ Account created successfully:', data)
    success.value = true
  } catch (err: unknown) {
    console.error('❌ Error creating account:', err)
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'Une erreur est survenue lors de la création du compte'
    }
  } finally {
    loading.value = false
  }
}
</script>

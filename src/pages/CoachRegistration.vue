<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Créer votre profil coach</h2>
        <p class="mt-2 text-sm text-gray-600">
          Finaliser votre inscription en tant que coach professionnel
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div v-if="loading" class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Création de votre profil...</p>
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
          <h3 class="mt-4 text-lg font-medium text-gray-900">Profil créé avec succès!</h3>
          <p class="mt-2 text-sm text-gray-600">
            Vous pouvez maintenant accéder à votre dashboard coach.
          </p>
          <button
            @click="goToDashboard"
            class="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Accéder au dashboard
          </button>
        </div>

        <form v-else @submit.prevent="createProfile" class="space-y-6">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700"> Prénom </label>
            <div class="mt-1">
              <input
                id="firstName"
                name="firstName"
                type="text"
                v-model="form.firstName"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700"> Téléphone </label>
            <div class="mt-1">
              <input
                id="phone"
                name="phone"
                type="tel"
                v-model="form.phone"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="bio" class="block text-sm font-medium text-gray-700">
              Bio professionnelle
            </label>
            <div class="mt-1">
              <textarea
                id="bio"
                name="bio"
                rows="4"
                v-model="form.bio"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Décrivez votre expérience et votre approche..."
              ></textarea>
            </div>
          </div>

          <div>
            <label for="specialties" class="block text-sm font-medium text-gray-700">
              Spécialisations
            </label>
            <div class="mt-1">
              <select
                multiple
                v-model="form.specialties"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Life Coaching">Life Coaching</option>
                <option value="Business Coaching">Business Coaching</option>
                <option value="Career Coaching">Career Coaching</option>
                <option value="Executive Coaching">Executive Coaching</option>
                <option value="Health Coaching">Health Coaching</option>
                <option value="Relationship Coaching">Relationship Coaching</option>
              </select>
            </div>
          </div>

          <div>
            <label for="experience" class="block text-sm font-medium text-gray-700">
              Années d'expérience
            </label>
            <div class="mt-1">
              <input
                id="experience"
                name="experience"
                type="number"
                min="0"
                max="50"
                v-model.number="form.experienceYears"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Erreur lors de la création du profil
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
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Créer mon profil coach
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/utils/supabase'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const success = ref(false)
const error = ref('')

const form = ref({
  firstName: '',
  phone: '',
  bio: '',
  specialties: [] as string[],
  experienceYears: 1,
})

onMounted(async () => {
  // Check if user is authenticated
  if (!authStore.user) {
    router.push('/auth')
    return
  }

  // Check if user already has a coach profile
  if (authStore.isCoach) {
    console.log('ℹ️ User already has coach profile, redirecting to dashboard')
    router.push('/coach/proposals')
    return
  }

  // Pre-fill with user email
  if (authStore.user.email) {
    // You can extract first name from email if needed
    const emailName = authStore.user.email.split('@')[0]
    form.value.firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1)
  }
})

const createProfile = async () => {
  if (!authStore.user) {
    error.value = 'Vous devez être connecté pour créer un profil'
    return
  }

  loading.value = true
  error.value = ''

  try {
    console.log('🏗️ Creating coach profile for user:', authStore.user.id)

    // First check if a coach profile already exists
    const { data: existingCoach, error: checkError } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', authStore.user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is what we expect
      throw checkError
    }

    if (existingCoach) {
      console.log('ℹ️ Coach profile already exists, reloading...')
      // Profile already exists, just reload it
      await authStore.loadCoachProfile()
      success.value = true
      return
    }

    // Create new coach profile
    const { data, error: createError } = await supabase
      .from('coaches')
      .insert([
        {
          id: authStore.user.id, // Use the authenticated user's ID
          email: authStore.user.email,
          first_name: form.value.firstName,
          phone: form.value.phone,
          bio: form.value.bio,
          locations: ['Martinique'],
          specialties: form.value.specialties,
          certifications: [],
          experience_years: form.value.experienceYears,
          availability: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
          rating: 0,
          total_sessions: 0,
          subscription_type: 'premium',
          is_active: true,
        },
      ])
      .select()

    if (createError) {
      throw createError
    }

    console.log('✅ Coach profile created:', data)

    // Reload the auth store to pick up the new coach profile
    await authStore.loadCoachProfile()

    success.value = true
  } catch (err: unknown) {
    console.error('❌ Error creating coach profile:', err)
    error.value =
      err instanceof Error ? err.message : 'Une erreur est survenue lors de la création du profil'
  } finally {
    loading.value = false
  }
}

const goToDashboard = () => {
  router.push('/coach/proposals')
}
</script>

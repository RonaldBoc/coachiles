<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Demander un coach</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div v-if="selectedCoach" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center">
            <img
              :src="selectedCoach.photo || '/default-avatar.png'"
              :alt="selectedCoach.firstName"
              class="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div>
              <h3 class="font-semibold text-gray-900">{{ selectedCoach.firstName }}</h3>
              <p class="text-sm text-gray-600">{{ selectedCoach.location }}</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="submitForm">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"> Votre nom * </label>
              <input
                v-model="form.clientName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Votre nom complet"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"> Email * </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"> Téléphone * </label>
              <input
                v-model="form.phone"
                type="tel"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0596123456"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Vos objectifs de coaching *
              </label>
              <textarea
                v-model="form.coachingGoals"
                required
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Décrivez vos objectifs et attentes..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Localisation préférée
              </label>
              <select
                v-model="form.preferredLocation"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Choisir une localisation</option>
                <option value="domicile">À domicile</option>
                <option value="salle">En salle de sport</option>
                <option value="exterieur">En extérieur</option>
                <option value="en_ligne">En ligne</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Budget approximatif
              </label>
              <select
                v-model="form.budget"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Choisir un budget</option>
                <option value="30-50">30-50€ par séance</option>
                <option value="50-70">50-70€ par séance</option>
                <option value="70-100">70-100€ par séance</option>
                <option value="100+">100€+ par séance</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Vos disponibilités
              </label>
              <textarea
                v-model="form.availabilityNotes"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Lundi et mercredi soir, weekend matin..."
              ></textarea>
            </div>

            <div v-if="selectedCoach">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Spécialités qui vous intéressent
              </label>
              <div class="space-y-2">
                <label
                  v-for="specialty in selectedCoach.specialties"
                  :key="specialty"
                  class="flex items-center"
                >
                  <input
                    v-model="form.specialtyPreferences"
                    type="checkbox"
                    :value="specialty"
                    class="mr-2 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span class="text-sm text-gray-700">{{ specialty }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="!isFormValid"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Envoyer ma demande
            </button>
          </div>
        </form>

        <div class="mt-4 p-3 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            <strong>Gratuit :</strong> Votre demande est entièrement gratuite. Le coach vous
            contactera directement pour discuter de ses tarifs et disponibilités.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import type { Coach } from '@/types/coach'
import type { ClientRequest } from '@/types/Lead'

interface Props {
  selectedCoach?: Coach | null
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', data: Partial<ClientRequest>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Form state
const form = ref({
  clientName: '',
  email: '',
  phone: '',
  coachingGoals: '',
  preferredLocation: '',
  budget: '',
  availabilityNotes: '',
  specialtyPreferences: [] as string[],
})

// Computed
const isFormValid = computed(() => {
  return (
    form.value.clientName.trim() !== '' &&
    form.value.email.trim() !== '' &&
    form.value.phone.trim() !== '' &&
    form.value.coachingGoals.trim() !== ''
  )
})

// Methods
const submitForm = () => {
  if (!isFormValid.value) return

  const requestData: Partial<ClientRequest> = {
    clientName: form.value.clientName,
    email: form.value.email,
    phone: form.value.phone,
    coachingGoals: form.value.coachingGoals,
    preferredLocation: form.value.preferredLocation,
    budget: form.value.budget,
    availabilityNotes: form.value.availabilityNotes,
    specialtyPreferences: form.value.specialtyPreferences,
    targetCoaches: props.selectedCoach ? [props.selectedCoach.id] : [],
    priority: 'medium',
    source: 'web',
    status: 'pending',
    createdAt: new Date(),
  }

  emit('submit', requestData)
}
</script>

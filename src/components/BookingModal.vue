<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div
      class="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b">
        <h3 class="text-lg font-medium text-gray-900">Réserver: {{ service?.name }}</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Service Info -->
      <div v-if="service" class="mt-6 bg-gray-50 p-4 rounded-lg">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Catégorie:</span>
            <span class="ml-1 font-medium">{{ service.category }}</span>
          </div>
          <div>
            <span class="text-gray-500">Prix:</span>
            <span class="ml-1 font-medium">{{ formatPrice(service.price) }}</span>
          </div>
          <div>
            <span class="text-gray-500">Durée:</span>
            <span class="ml-1 font-medium">{{ service.durationMinutes }} minutes</span>
          </div>
          <div>
            <span class="text-gray-500">Type:</span>
            <span class="ml-1 font-medium">{{ formatLocationType(service.locationType) }}</span>
          </div>
        </div>
        <p v-if="service.description" class="mt-3 text-sm text-gray-600">
          {{ service.description }}
        </p>
      </div>

      <!-- Booking Form -->
      <form @submit.prevent="handleSubmit" class="mt-6">
        <div class="space-y-4">
          <!-- Client Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="clientName" class="block text-sm font-medium text-gray-700">
                Nom complet *
              </label>
              <input
                id="clientName"
                v-model="form.clientName"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <label for="clientEmail" class="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="clientEmail"
                v-model="form.clientEmail"
                type="email"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="jean.dupont@email.com"
              />
            </div>
          </div>

          <div>
            <label for="clientPhone" class="block text-sm font-medium text-gray-700">
              Téléphone *
            </label>
            <input
              id="clientPhone"
              v-model="form.clientPhone"
              type="tel"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <!-- Preferred Date & Time -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="preferredDate" class="block text-sm font-medium text-gray-700">
                Date souhaitée *
              </label>
              <input
                id="preferredDate"
                v-model="form.preferredDate"
                type="date"
                required
                :min="minDate"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label for="preferredTime" class="block text-sm font-medium text-gray-700">
                Heure souhaitée *
              </label>
              <select
                id="preferredTime"
                v-model="form.preferredTime"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionner une heure</option>
                <option v-for="time in availableTimes" :key="time" :value="time">
                  {{ time }}
                </option>
              </select>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700">
              Notes ou demandes spéciales
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Décrivez vos objectifs ou toute information utile..."
            ></textarea>
          </div>

          <!-- Location Preference (if service supports both) -->
          <div v-if="service?.locationType === 'both'">
            <label class="block text-sm font-medium text-gray-700 mb-2"> Préférence de lieu </label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input
                  v-model="form.locationPreference"
                  type="radio"
                  value="online"
                  class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <span class="ml-2 text-sm text-gray-900">En ligne</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.locationPreference"
                  type="radio"
                  value="in-person"
                  class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <span class="ml-2 text-sm text-gray-900">Présentiel</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Total and Terms -->
        <div class="mt-6 bg-blue-50 p-4 rounded-lg">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-600">Total à payer</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatPrice(service?.price || 0) }}</p>
            </div>
            <div class="text-sm text-gray-500">
              <p>{{ service?.durationMinutes }} minutes</p>
              <p>Paiement à la réservation</p>
            </div>
          </div>
        </div>

        <!-- Terms acceptance -->
        <div class="mt-4">
          <label class="flex items-center">
            <input
              v-model="form.acceptTerms"
              type="checkbox"
              required
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-900">
              J'accepte les
              <a href="#" class="text-blue-600 hover:text-blue-500">conditions d'utilisation</a>
            </span>
          </label>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end pt-6 space-x-2">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <span v-if="loading">Réservation...</span>
            <span v-else>Confirmer la réservation</span>
          </button>
        </div>
      </form>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
        <div class="text-red-800 text-sm">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { bookingApi } from '@/services'
import type { Service } from '@/types'

interface Props {
  service: Service | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  booked: []
}>()

const loading = ref(false)
const error = ref('')

const form = ref({
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  preferredDate: '',
  preferredTime: '',
  notes: '',
  locationPreference: 'online',
  acceptTerms: false,
})

const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const availableTimes = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
]

const handleSubmit = async () => {
  if (!props.service) return

  try {
    loading.value = true
    error.value = ''

    // Combine date and time
    const scheduledAt = new Date(`${form.value.preferredDate}T${form.value.preferredTime}:00`)

    const bookingData = {
      serviceId: props.service.id,
      clientName: form.value.clientName,
      clientEmail: form.value.clientEmail,
      clientPhone: form.value.clientPhone,
      scheduledAt: scheduledAt,
      durationMinutes: props.service.durationMinutes,
      totalAmount: props.service.price,
      notes: form.value.notes || undefined,
      // Add location preference to notes if applicable
      ...(props.service.locationType === 'both' && {
        notes:
          `${form.value.notes || ''}\nPréférence de lieu: ${form.value.locationPreference === 'online' ? 'En ligne' : 'Présentiel'}`.trim(),
      }),
    }

    await bookingApi.createBooking(bookingData)
    emit('booked')
  } catch (err) {
    console.error('Error creating booking:', err)
    error.value = 'Erreur lors de la réservation. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

const formatLocationType = (type: Service['locationType']) => {
  const types: Record<Service['locationType'], string> = {
    online: 'En ligne',
    'in-person': 'Présentiel',
    both: 'Hybride',
  }
  return types[type]
}

onMounted(() => {
  // Set default location preference based on service
  if (props.service) {
    if (props.service.locationType === 'online') {
      form.value.locationPreference = 'online'
    } else if (props.service.locationType === 'in-person') {
      form.value.locationPreference = 'in-person'
    }
  }
})
</script>

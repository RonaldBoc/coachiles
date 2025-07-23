<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div
      class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b">
        <h3 class="text-lg font-medium text-gray-900">
          {{ isEditing ? 'Modifier le service' : 'Créer un nouveau service' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Modal Body -->
      <form @submit.prevent="handleSubmit" class="mt-6">
        <div class="space-y-6">
          <!-- Service Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Nom du service *
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: Coaching personnalisé en développement personnel"
            />
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Décrivez votre service en détail..."
            ></textarea>
          </div>

          <!-- Category and Price -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700">
                Catégorie *
              </label>
              <select
                id="category"
                v-model="form.category"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionner une catégorie</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>

            <div>
              <label for="price" class="block text-sm font-medium text-gray-700">
                Prix (EUR) *
              </label>
              <input
                id="price"
                v-model.number="form.price"
                type="number"
                step="0.01"
                min="0"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="75.00"
              />
            </div>
          </div>

          <!-- Duration and Location Type -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label for="duration" class="block text-sm font-medium text-gray-700">
                Durée (minutes) *
              </label>
              <select
                id="duration"
                v-model.number="form.durationMinutes"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionner une durée</option>
                <option :value="30">30 minutes</option>
                <option :value="45">45 minutes</option>
                <option :value="60">1 heure</option>
                <option :value="90">1h30</option>
                <option :value="120">2 heures</option>
              </select>
            </div>

            <div>
              <label for="locationType" class="block text-sm font-medium text-gray-700">
                Type de lieu
              </label>
              <select
                id="locationType"
                v-model="form.locationType"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="both">Hybride (en ligne et présentiel)</option>
                <option value="online">En ligne uniquement</option>
                <option value="in-person">Présentiel uniquement</option>
              </select>
            </div>
          </div>

          <!-- Group Size and Max Participants -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label for="groupSize" class="block text-sm font-medium text-gray-700">
                Taille de groupe
              </label>
              <select
                id="groupSize"
                v-model="form.groupSize"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="individual">Individuel</option>
                <option value="small_group">Petit groupe (2-5 personnes)</option>
                <option value="large_group">Grand groupe (6+ personnes)</option>
              </select>
            </div>

            <div v-if="form.groupSize !== 'individual'">
              <label for="maxParticipants" class="block text-sm font-medium text-gray-700">
                Nombre max de participants
              </label>
              <input
                id="maxParticipants"
                v-model.number="form.maxParticipants"
                type="number"
                min="2"
                max="20"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="5"
              />
            </div>
          </div>

          <!-- Tags -->
          <div>
            <label for="tags" class="block text-sm font-medium text-gray-700">
              Tags (séparés par des virgules)
            </label>
            <input
              id="tags"
              v-model="tagsInput"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="coaching, développement personnel, motivation"
            />
          </div>

          <!-- Advanced Options -->
          <div class="space-y-4">
            <h4 class="text-sm font-medium text-gray-900">Options avancées</h4>

            <div class="flex items-center">
              <input
                id="requiresApproval"
                v-model="form.requiresApproval"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="requiresApproval" class="ml-2 block text-sm text-gray-900">
                Nécessite une approbation manuelle
              </label>
            </div>

            <div>
              <label for="advanceBooking" class="block text-sm font-medium text-gray-700">
                Réservation à l'avance (heures)
              </label>
              <input
                id="advanceBooking"
                v-model.number="form.advanceBookingHours"
                type="number"
                min="1"
                max="168"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="24"
              />
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end pt-6 space-x-2">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <span v-if="loading">Sauvegarde...</span>
            <span v-else>{{ isEditing ? 'Modifier' : 'Créer' }}</span>
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
import { ref, computed, watch, onMounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { serviceApi } from '@/services'
import type { Service, CreateServiceData, UpdateServiceData } from '@/types'

interface Props {
  service?: Service | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  saved: []
}>()

const loading = ref(false)
const error = ref('')
const tagsInput = ref('')

const categories = [
  'Développement personnel',
  'Coaching professionnel',
  'Bien-être',
  'Leadership',
  'Gestion du stress',
  'Communication',
  'Motivation',
  'Transition de carrière',
  'Équilibre vie pro/perso',
  'Confiance en soi',
]

const form = ref<CreateServiceData>({
  name: '',
  description: '',
  category: '',
  subcategory: '',
  price: 0,
  durationMinutes: 60,
  locationType: 'both',
  groupSize: 'individual',
  maxParticipants: 1,
  requiresApproval: false,
  advanceBookingHours: 24,
  tags: [],
  targetAudience: [],
  prerequisites: '',
  materialsIncluded: '',
  cancellationPolicy: '',
})

const isEditing = computed(() => !!props.service)

// Watch for changes in tagsInput to update form.tags
watch(tagsInput, (newValue) => {
  form.value.tags = newValue
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
})

// Watch for prop changes to populate form
watch(
  () => props.service,
  (service) => {
    if (service) {
      form.value = {
        name: service.name,
        description: service.description || '',
        category: service.category,
        subcategory: service.subcategory || '',
        price: service.price,
        durationMinutes: service.durationMinutes,
        locationType: service.locationType,
        groupSize: service.groupSize,
        maxParticipants: service.maxParticipants,
        requiresApproval: service.requiresApproval,
        advanceBookingHours: service.advanceBookingHours,
        tags: [...service.tags],
        targetAudience: [...service.targetAudience],
        prerequisites: service.prerequisites || '',
        materialsIncluded: service.materialsIncluded || '',
        cancellationPolicy: service.cancellationPolicy || '',
      }
      tagsInput.value = service.tags.join(', ')
    }
  },
  { immediate: true },
)

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    if (isEditing.value && props.service) {
      // Update existing service
      const updateData: UpdateServiceData = {
        ...form.value,
      }
      await serviceApi.updateService(props.service.id, updateData)
    } else {
      // Create new service
      await serviceApi.createService('current', form.value)
    }

    emit('saved')
  } catch (err) {
    console.error('Error saving service:', err)
    error.value = 'Erreur lors de la sauvegarde du service'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Focus on name field when modal opens
  setTimeout(() => {
    const nameInput = document.getElementById('name')
    if (nameInput) {
      nameInput.focus()
    }
  }, 100)
})
</script>

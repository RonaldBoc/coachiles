<template>
  <CoachLayout>
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div class="px-4 py-6 sm:p-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Marketplace - Mes Services</h1>
              <p class="text-gray-600 mt-2">
                Gérez vos offres de coaching et services personnalisés sur la marketplace
              </p>
            </div>
            <button
              v-if="!isEditingService"
              @click="addNewService"
              class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              + Ajouter un service
            </button>
          </div>
        </div>
      </div>

      <!-- Service Form (Add/Edit) -->
      <div
        v-if="isEditingService"
        class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl mb-8"
      >
        <div class="px-4 py-6 sm:p-8">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-gray-900">
              {{ editingServiceId ? 'Modifier le service' : 'Nouveau service' }}
            </h3>
            <button @click="cancelServiceEdit" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Service Title -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom du service *</label>
              <input
                v-model="serviceForm.title"
                type="text"
                placeholder="Ex: Coaching personnalisé, Préparation physique..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <!-- Service Type & Pricing -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Type de service *</label>
              <div class="space-y-3">
                <label class="flex items-center">
                  <input
                    v-model="serviceForm.canBeSolo"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">Cours particulier</span>
                </label>
                <div v-if="serviceForm.canBeSolo" class="ml-6">
                  <input
                    v-model.number="serviceForm.soloPrice"
                    type="number"
                    placeholder="Prix en €"
                    class="w-32 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span class="ml-2 text-sm text-gray-500">€ / séance</span>
                </div>

                <label class="flex items-center">
                  <input
                    v-model="serviceForm.canBeGroup"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">Cours en groupe</span>
                </label>
                <div v-if="serviceForm.canBeGroup" class="ml-6">
                  <input
                    v-model.number="serviceForm.groupPrice"
                    type="number"
                    placeholder="Prix en €"
                    class="w-32 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span class="ml-2 text-sm text-gray-500">€ / personne</span>
                </div>
              </div>
            </div>

            <!-- Category & Duration -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
              <select
                v-model="serviceForm.category"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                <option v-for="category in availableCategories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>

              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Durée de la séance *</label
                >
                <select
                  v-model.number="serviceForm.duration"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option
                    v-for="option in DURATION_OPTIONS"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Location Options -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Lieux de cours *</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="serviceForm.canBeAtHome"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">À domicile</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="serviceForm.canBeOnline"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">En ligne (visio)</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="serviceForm.canBeInPublicSpaces"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">Espaces publics</span>
                </label>
              </div>
            </div>

            <!-- Free Trial & Cancellation -->
            <div>
              <label class="flex items-center mb-3">
                <input
                  v-model="serviceForm.hasFreeTrial"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm font-medium text-gray-700">Premier cours gratuit</span>
              </label>

              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Politique d'annulation *</label
                >
                <select
                  v-model="serviceForm.cancellationPolicy"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option v-for="policy in CANCELLATION_POLICIES" :key="policy" :value="policy">
                    {{ policy }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Description -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Description du service</label
              >
              <textarea
                v-model="serviceForm.description"
                rows="3"
                placeholder="Décrivez votre service, les objectifs, le matériel inclus..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>

            <!-- Form Actions -->
            <div class="md:col-span-2 flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                @click="cancelServiceEdit"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Annuler
              </button>
              <button
                @click="saveService"
                :disabled="
                  !serviceForm.title ||
                  !serviceForm.category ||
                  (!serviceForm.canBeSolo && !serviceForm.canBeGroup)
                "
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ editingServiceId ? 'Mettre à jour' : 'Créer le service' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Services List -->
      <div v-if="!isEditingService" class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div class="px-4 py-6 sm:p-8">
          <div v-if="coachServices.length === 0" class="text-center py-12">
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM8 14v.01M12 14v.01M16 14v.01"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun service créé</h3>
            <p class="mt-1 text-sm text-gray-500">Commencez par créer votre premier service.</p>
            <div class="mt-6">
              <button
                @click="addNewService"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg class="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                Créer mon premier service
              </button>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="service in coachServices"
              :key="service.id"
              class="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="text-lg font-medium text-gray-900">{{ service.title }}</h3>
                    <span
                      :class="
                        service.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      "
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ service.isActive ? 'Actif' : 'Inactif' }}
                    </span>
                  </div>

                  <p class="text-gray-600 mb-3">
                    {{ service.description || 'Aucune description' }}
                  </p>

                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span class="text-gray-500">Catégorie:</span>
                      <div class="font-medium">{{ service.category }}</div>
                    </div>
                    <div>
                      <span class="text-gray-500">Durée:</span>
                      <div class="font-medium">{{ service.duration }} min</div>
                    </div>
                    <div v-if="service.canBeSolo">
                      <span class="text-gray-500">Prix solo:</span>
                      <div class="font-medium">{{ service.soloPrice }}€</div>
                    </div>
                    <div v-if="service.canBeGroup">
                      <span class="text-gray-500">Prix groupe:</span>
                      <div class="font-medium">{{ service.groupPrice }}€</div>
                    </div>
                  </div>

                  <div class="mt-3 flex flex-wrap gap-2">
                    <span
                      v-if="service.canBeSolo"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      Cours particulier
                    </span>
                    <span
                      v-if="service.canBeGroup"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      Cours en groupe
                    </span>
                    <span
                      v-if="service.hasFreeTrial"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      Cours d'essai gratuit
                    </span>
                  </div>
                </div>

                <div class="flex space-x-2 ml-4">
                  <button
                    @click="editService(service)"
                    class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Modifier
                  </button>
                  <button
                    @click="deleteService(service.id)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CoachLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CoachLayout from '@/layouts/CoachLayout.vue'
import type { CoachService, ServiceFormData } from '@/types/service'
import { DURATION_OPTIONS, CANCELLATION_POLICIES } from '@/types/service'
import { supabaseCoachServicesApi } from '@/services/supabaseCoachServicesApi'

// State
const coachServices = ref<CoachService[]>([])
const isEditingService = ref(false)
const editingServiceId = ref<string | null>(null)

// Form data
const serviceForm = ref<ServiceFormData>({
  title: '',
  description: '',
  canBeSolo: false,
  canBeGroup: false,
  soloPrice: null,
  groupPrice: null,
  category: '',
  subCategory: '',
  duration: 60,
  canBeAtHome: false,
  canBeOnline: false,
  canBeInPublicSpaces: false,
  hasFreeTrial: false,
  freeTrialModalities: '',
  cancellationPolicy: 'flexible',
  useProfileAvailability: true,
  customAvailability: [],
})

// Available categories (you can expand this)
const availableCategories = [
  'Développement personnel',
  'Bien-être',
  'Leadership',
  'Fitness',
  'Nutrition',
  'Sport',
  'Business',
  'Autre',
]

// Methods
const addNewService = () => {
  isEditingService.value = true
  editingServiceId.value = null
  resetServiceForm()
}

const editService = (service: CoachService) => {
  isEditingService.value = true
  editingServiceId.value = service.id

  // Populate form with service data
  serviceForm.value = {
    title: service.title,
    description: service.description,
    canBeSolo: service.canBeSolo,
    canBeGroup: service.canBeGroup,
    soloPrice: service.soloPrice,
    groupPrice: service.groupPrice,
    category: service.category,
    subCategory: service.subCategory || '',
    duration: service.duration,
    canBeAtHome: service.canBeAtHome,
    canBeOnline: service.canBeOnline,
    canBeInPublicSpaces: service.canBeInPublicSpaces,
    hasFreeTrial: service.hasFreeTrial,
    freeTrialModalities: service.freeTrialModalities || '',
    cancellationPolicy: service.cancellationPolicy,
    useProfileAvailability: service.useProfileAvailability,
    customAvailability: service.customAvailability || [],
  }
}

const cancelServiceEdit = () => {
  isEditingService.value = false
  editingServiceId.value = null
  resetServiceForm()
}

const resetServiceForm = () => {
  serviceForm.value = {
    title: '',
    description: '',
    canBeSolo: false,
    canBeGroup: false,
    soloPrice: null,
    groupPrice: null,
    category: '',
    subCategory: '',
    duration: 60,
    canBeAtHome: false,
    canBeOnline: false,
    canBeInPublicSpaces: false,
    hasFreeTrial: false,
    freeTrialModalities: '',
    cancellationPolicy: 'flexible',
    useProfileAvailability: true,
    customAvailability: [],
  }
}

const saveService = async () => {
  try {
    if (editingServiceId.value) {
      // Update existing service
      const updatedService = await supabaseCoachServicesApi.updateService(
        editingServiceId.value,
        serviceForm.value,
      )

      const index = coachServices.value.findIndex((s) => s.id === editingServiceId.value)
      if (index >= 0) {
        coachServices.value[index] = updatedService
      }
      console.log('✅ Service updated successfully')
    } else {
      // Create new service
      const newService = await supabaseCoachServicesApi.createService(serviceForm.value)
      coachServices.value.push(newService)
      console.log('✅ Service created successfully')
    }

    cancelServiceEdit()
  } catch (error) {
    console.error('❌ Error saving service:', error)
    // You could show a toast notification here
  }
}

const deleteService = async (serviceId: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
    try {
      await supabaseCoachServicesApi.deleteService(serviceId)

      const index = coachServices.value.findIndex((s) => s.id === serviceId)
      if (index >= 0) {
        coachServices.value.splice(index, 1)
        console.log('✅ Service deleted successfully')
      }
    } catch (error) {
      console.error('❌ Error deleting service:', error)
    }
  }
}

// Load services when component mounts
const loadCoachServices = async () => {
  try {
    const services = await supabaseCoachServicesApi.getCoachServices()
    coachServices.value = services
    console.log('✅ Loaded', services.length, 'services')
  } catch (error) {
    console.error('❌ Error loading services:', error)
  }
}

onMounted(async () => {
  await loadCoachServices()
})
</script>

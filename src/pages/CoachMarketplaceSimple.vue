<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Header Section -->
        <div class="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Marketplace - Mes Services</h1>
            <p class="mt-2 text-sm text-gray-700">
              Gérez vos offres de coaching et services personnalisés sur la marketplace
            </p>
          </div>
          <div class="mt-4 sm:mt-0">
            <button
              @click="openCreateModal"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              Nouveau Service
            </button>
          </div>
        </div>

        <!-- Services Grid -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="error" class="text-center py-12">
          <div class="text-red-600">{{ error }}</div>
          <button @click="fetchServices" class="mt-4 text-blue-600 hover:text-blue-800">
            Réessayer
          </button>
        </div>

        <div v-else-if="services.length === 0" class="text-center py-12">
          <div
            class="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4"
          >
            <svg
              class="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2M7 7h10"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun service créé</h3>
          <p class="text-gray-500 mb-6">Commencez par créer votre premier service de coaching</p>
          <button
            @click="openCreateModal"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Créer mon premier service
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="service in services"
            :key="service.id"
            class="bg-white overflow-hidden shadow rounded-lg border hover:shadow-md transition-shadow"
          >
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900 truncate">{{ service.name }}</h3>
                <span
                  :class="
                    service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  "
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ service.isActive ? 'Actif' : 'Inactif' }}
                </span>
              </div>

              <p class="mt-1 text-sm text-gray-500 line-clamp-2">
                {{ service.description || 'Aucune description' }}
              </p>

              <div class="mt-4">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Prix</span>
                  <span class="font-medium text-gray-900">{{ service.price }}€</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Durée</span>
                  <span class="font-medium text-gray-900">{{ service.durationMinutes }} min</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Catégorie</span>
                  <span class="font-medium text-gray-900">{{ service.category }}</span>
                </div>
              </div>

              <div class="mt-4 flex justify-between">
                <button
                  @click="editService(service)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Modifier
                </button>
                <button
                  @click="toggleServiceStatus(service)"
                  class="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  {{ service.isActive ? 'Désactiver' : 'Activer' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Simple Modal -->
        <div
          v-if="showModal"
          class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        >
          <div
            class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white"
          >
            <div class="mt-3">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                {{ editingService ? 'Modifier le service' : 'Créer un nouveau service' }}
              </h3>

              <form @submit.prevent="saveService" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Nom du service</label>
                  <input
                    v-model="serviceForm.name"
                    type="text"
                    required
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: Coaching personnel 1h"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    v-model="serviceForm.description"
                    rows="3"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Décrivez votre service..."
                  ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Prix (€)</label>
                    <input
                      v-model.number="serviceForm.price"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Durée (min)</label>
                    <input
                      v-model.number="serviceForm.durationMinutes"
                      type="number"
                      min="15"
                      step="15"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Catégorie</label>
                  <select
                    v-model="serviceForm.category"
                    required
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="Life Coaching">Life Coaching</option>
                    <option value="Business Coaching">Business Coaching</option>
                    <option value="Career Coaching">Career Coaching</option>
                    <option value="Health Coaching">Health Coaching</option>
                    <option value="Relationship Coaching">Relationship Coaching</option>
                  </select>
                </div>

                <div class="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    :disabled="saving"
                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {{ saving ? 'Sauvegarde...' : editingService ? 'Modifier' : 'Créer' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

// Types
interface Service {
  id: string
  name: string
  description: string
  price: number
  durationMinutes: number
  category: string
  isActive: boolean
  coachId: string
}

// Store
const authStore = useAuthStore()

// State
const services = ref<Service[]>([])
const loading = ref(true)
const error = ref('')
const showModal = ref(false)
const saving = ref(false)
const editingService = ref<Service | null>(null)

// Form
const serviceForm = ref({
  name: '',
  description: '',
  price: 0,
  durationMinutes: 60,
  category: '',
})

// Methods
const fetchServices = async () => {
  try {
    loading.value = true
    error.value = ''

    // Simulate API call for now
    await new Promise((resolve) => setTimeout(resolve, 500))

    // For now, return empty array - in real implementation this would call the API
    services.value = []

    console.log('✅ Services loaded')
  } catch (err) {
    console.error('❌ Error fetching services:', err)
    error.value = 'Erreur lors du chargement des services'
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingService.value = null
  serviceForm.value = {
    name: '',
    description: '',
    price: 0,
    durationMinutes: 60,
    category: '',
  }
  showModal.value = true
}

const editService = (service: Service) => {
  editingService.value = service
  serviceForm.value = {
    name: service.name,
    description: service.description,
    price: service.price,
    durationMinutes: service.durationMinutes,
    category: service.category,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingService.value = null
}

const saveService = async () => {
  try {
    saving.value = true

    if (editingService.value) {
      // Update existing service
      const index = services.value.findIndex((s) => s.id === editingService.value!.id)
      if (index !== -1) {
        services.value[index] = {
          ...services.value[index],
          ...serviceForm.value,
        }
      }
    } else {
      // Create new service
      const newService: Service = {
        id: Date.now().toString(),
        ...serviceForm.value,
        isActive: true,
        coachId: authStore.user?.id || '',
      }
      services.value.push(newService)
    }

    closeModal()
    console.log('✅ Service saved')
  } catch (err) {
    console.error('❌ Error saving service:', err)
    error.value = 'Erreur lors de la sauvegarde'
  } finally {
    saving.value = false
  }
}

const toggleServiceStatus = async (service: Service) => {
  try {
    service.isActive = !service.isActive
    console.log('✅ Service status updated')
  } catch (err) {
    console.error('❌ Error updating service:', err)
    error.value = 'Erreur lors de la mise à jour'
  }
}

onMounted(() => {
  fetchServices()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

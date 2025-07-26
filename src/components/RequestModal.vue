<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="handleBackdropClick"
  >
    <div class="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
      <div class="p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Demander un coach</h2>
            <div class="flex items-center mt-2 space-x-2">
              <div
                v-for="stepNum in 3"
                :key="stepNum"
                :class="[
                  'w-8 h-1 rounded-full transition-colors',
                  stepNum <= currentStep ? 'bg-orange-500' : 'bg-gray-200',
                ]"
              ></div>
              <span class="text-sm text-gray-500 ml-2">{{ currentStep }}/3</span>
            </div>
          </div>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Coach Info -->
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

        <!-- Step Content -->
        <form @submit.prevent="handleNext">
          <!-- Step 1: Basic Information -->
          <div v-if="currentStep === 1" class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations de base</h3>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input
                  v-model="form.firstName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  v-model="form.lastName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="votre@email.com"
              />
            </div>

            <div class="flex justify-end pt-4">
              <button
                type="submit"
                :disabled="!isStep1Valid"
                class="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>

          <!-- Step 2: Location Information -->
          <div v-if="currentStep === 2" class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Votre localisation</h3>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                v-model="form.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="0596123456"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
              <select
                v-model="form.location"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Sélectionnez votre ville</option>
                <option v-for="city in martiniqueCities" :key="city" :value="city">
                  {{ city }}
                </option>
              </select>
            </div>

            <div class="flex justify-between pt-4">
              <button
                type="button"
                @click="goToPreviousStep"
                class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Retour
              </button>
              <button
                type="submit"
                :disabled="!isStep2Valid"
                class="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>

          <!-- Step 3: Coaching Preferences -->
          <div v-if="currentStep === 3" class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Préférences de coaching</h3>

            <!-- Coach Services -->
            <div v-if="coachServices.length > 0">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Services qui vous intéressent
              </label>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <label
                  v-for="service in coachServices"
                  :key="service.id"
                  class="flex items-center p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :value="service.title"
                    v-model="form.preferredCoaching"
                    class="mr-3 text-orange-500 focus:ring-orange-500"
                  />
                  <div class="flex-1">
                    <div class="font-medium">{{ service.title }}</div>
                    <div class="text-sm text-gray-500">{{ service.duration }} min</div>
                  </div>
                  <div class="text-sm font-medium text-gray-700">
                    {{ service.soloPrice || service.groupPrice }}€
                  </div>
                </label>
              </div>
            </div>

            <!-- Experience Level -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Votre niveau</label>
              <select
                v-model="form.experience"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Sélectionnez votre niveau</option>
                <option value="debutant">Débutant</option>
                <option value="intermediaire">Intermédiaire</option>
                <option value="avance">Avancé</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <!-- Goals -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"> Vos objectifs * </label>
              <textarea
                v-model="form.goals"
                required
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Décrivez vos objectifs et attentes..."
              ></textarea>
            </div>

            <!-- Availability -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Disponibilités</label>
              <textarea
                v-model="form.availability"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ex: Lundi et mercredi soir, weekends..."
              ></textarea>
            </div>

            <!-- Budget -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Budget par séance</label>
              <select
                v-model="form.budget"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Sélectionnez votre budget</option>
                <option value="30-40">30-40€</option>
                <option value="40-50">40-50€</option>
                <option value="50-60">50-60€</option>
                <option value="60-70">60-70€</option>
                <option value="70+">70€+</option>
                <option value="a_negocier">À négocier</option>
              </select>
            </div>

            <!-- Additional Message -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Message pour le coach
              </label>
              <textarea
                v-model="form.additionalInfo"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Partagez toute information supplémentaire..."
              ></textarea>
            </div>

            <div class="flex justify-between pt-4">
              <button
                type="button"
                @click="goToPreviousStep"
                class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Retour
              </button>
              <button
                type="submit"
                :disabled="!isStep3Valid || isSubmitting"
                class="bg-gradient-to-r from-orange-500 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isSubmitting">Envoi...</span>
                <span v-else>Envoyer la demande</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import type { Coach } from '@/types/coach'
import type { CoachService } from '@/types/service'
import type { ClientRequest } from '@/types/Lead'
import { CITIES } from '@/constants/locations'
import { supabaseCoachServicesApi } from '@/services/supabaseCoachServicesApi'
import LeadService from '@/services/leadService'

// Lead data interface
interface LeadData {
  id: string
  client_name: string
  client_email: string
  client_phone?: string
  coach_id?: string
  location?: string
  preferred_coaching?: string[]
  experience?: string
  goals?: string
  availability?: string
  budget?: string
  additional_info?: string
  current_step: number
  created_at: string
  updated_at: string
}

// Props & Emits
interface Props {
  selectedCoach?: Coach | null
}

interface Emits {
  (event: 'close'): void
  (event: 'submit', data: Partial<ClientRequest>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const currentStep = ref(1)
const currentLead = ref<LeadData | null>(null)
const coachServices = ref<CoachService[]>([])
const isSubmitting = ref(false)

// Form data
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  preferredCoaching: [] as string[],
  experience: '',
  goals: '',
  availability: '',
  budget: '',
  additionalInfo: '',
})

// Constants
const martiniqueCities = CITIES.martinique

// Computed
const isStep1Valid = computed(() => {
  return (
    form.value.firstName.trim() !== '' &&
    form.value.lastName.trim() !== '' &&
    form.value.email.trim() !== ''
  )
})

const isStep2Valid = computed(() => {
  return form.value.location !== ''
})

const isStep3Valid = computed(() => {
  return form.value.goals.trim() !== ''
})

// Methods
const handleNext = async () => {
  if (currentStep.value === 1) {
    await saveStep1()
  } else if (currentStep.value === 2) {
    await saveStep2()
  } else if (currentStep.value === 3) {
    await saveStep3()
  }
}

const saveStep1 = async () => {
  try {
    const leadData = {
      client_name: `${form.value.firstName} ${form.value.lastName}`,
      client_email: form.value.email,
      coach_id: props.selectedCoach?.id,
    }

    const lead = await LeadService.createLead(leadData)
    if (lead) {
      // Convert Lead to LeadData format
      currentLead.value = {
        id: lead.id,
        client_name: lead.client_name,
        client_email: lead.client_email,
        client_phone: lead.client_phone,
        coach_id: lead.coach_id,
        location: lead.location,
        preferred_coaching: lead.preferred_coaching ? [...lead.preferred_coaching] : undefined,
        experience: lead.experience,
        goals: lead.goals,
        availability: lead.availability,
        budget: lead.budget,
        additional_info: lead.additional_info,
        current_step: lead.current_step,
        created_at: lead.created_at,
        updated_at: lead.updated_at,
      }
      currentStep.value = 2
      console.log('✅ Step 1 saved, lead created:', lead.id)
    } else {
      console.error('❌ Failed to create lead')
    }
  } catch (error) {
    console.error('❌ Error saving step 1:', error)
  }
}

const saveStep2 = async () => {
  if (!currentLead.value) return

  try {
    const updateData = {
      client_phone: form.value.phone,
      location: form.value.location,
    }

    const updatedLead = await LeadService.updateLeadStep(currentLead.value.id, 2, updateData)

    if (updatedLead) {
      // Convert Lead to LeadData format
      currentLead.value = {
        id: updatedLead.id,
        client_name: updatedLead.client_name,
        client_email: updatedLead.client_email,
        client_phone: updatedLead.client_phone,
        coach_id: updatedLead.coach_id,
        location: updatedLead.location,
        preferred_coaching: updatedLead.preferred_coaching
          ? [...updatedLead.preferred_coaching]
          : undefined,
        experience: updatedLead.experience,
        goals: updatedLead.goals,
        availability: updatedLead.availability,
        budget: updatedLead.budget,
        additional_info: updatedLead.additional_info,
        current_step: updatedLead.current_step,
        created_at: updatedLead.created_at,
        updated_at: updatedLead.updated_at,
      }
      currentStep.value = 3
      console.log('✅ Step 2 saved')
    } else {
      console.error('❌ Failed to update lead for step 2')
    }
  } catch (error) {
    console.error('❌ Error saving step 2:', error)
  }
}

const saveStep3 = async () => {
  if (!currentLead.value) return

  try {
    isSubmitting.value = true

    const updateData = {
      preferred_coaching: form.value.preferredCoaching,
      experience: form.value.experience,
      goals: form.value.goals,
      availability: form.value.availability,
      budget: form.value.budget,
      additional_info: form.value.additionalInfo,
    }

    const finalLead = await LeadService.updateLeadStep(currentLead.value.id, 3, updateData)

    if (finalLead) {
      console.log('✅ Lead completed successfully:', finalLead.id)

      // Emit the final data
      const requestData: Partial<ClientRequest> = {
        id: finalLead.id,
        clientName: finalLead.client_name,
        email: finalLead.client_email,
        phone: finalLead.client_phone,
        location: finalLead.location,
        preferredCoaching: finalLead.preferred_coaching
          ? [...finalLead.preferred_coaching]
          : undefined,
        experience: finalLead.experience,
        coachingGoals: finalLead.goals,
        availability: finalLead.availability,
        budget: finalLead.budget,
        additionalInfo: finalLead.additional_info,
        targetCoaches: props.selectedCoach ? [props.selectedCoach.id] : [],
        status: 'pending',
        priority: 'medium',
        source: 'web',
        createdAt: new Date(finalLead.created_at),
        isCompleted: true,
      }

      emit('submit', requestData)
    } else {
      console.error('❌ Failed to complete lead')
    }
  } catch (error) {
    console.error('❌ Error saving step 3:', error)
  } finally {
    isSubmitting.value = false
  }
}

const goToPreviousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleBackdropClick = () => {
  emit('close')
}

// Load coach services when component mounts
onMounted(async () => {
  if (props.selectedCoach) {
    try {
      console.log('📡 Loading services for coach:', props.selectedCoach.id)
      const services = await supabaseCoachServicesApi.getPublicCoachServices(props.selectedCoach.id)
      coachServices.value = services
      console.log('✅ Loaded', services.length, 'services for modal')
    } catch (error) {
      console.error('❌ Error loading coach services:', error)
    }
  }
})
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>

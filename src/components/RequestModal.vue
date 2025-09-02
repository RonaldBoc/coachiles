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
            <div v-if="!isFinalized" class="flex items-center mt-2 space-x-2">
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
            <div v-else class="mt-2 text-sm font-medium text-green-600">Terminé</div>
          </div>
          <button @click="handleCloseClick" class="text-gray-400 hover:text-gray-600">
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
          <!-- Success State -->
          <div v-if="isFinalized" class="space-y-6 text-center py-6">
            <div
              class="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"
            >
              <svg
                class="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div class="space-y-2">
              <h3 class="text-xl font-semibold text-gray-900">Votre demande a été envoyée !</h3>
              <p class="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Votre coach a bien reçu vos informations. Vous serez contacté(e) prochainement pour
                organiser la suite.
              </p>
            </div>
            <div class="pt-2">
              <button
                type="button"
                @click="finalizeClose()"
                class="px-6 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                Fermer
              </button>
            </div>
          </div>

          <template v-else>
            <!-- Step 1: Basic Information -->
            <div v-if="currentStep === 1" class="space-y-4">
              <!-- <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations de base</h3> -->
              <p class="text-sm text-gray-600 -mt-2 mb-2 leading-snug">
                Aidez votre coach à mieux vous connaître avec ces informations essentielles. Elles
                ne seront partagées qu'avec votre coach pour personnaliser votre accompagnement.
              </p>

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

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Âge *</label>
                  <input
                    v-model.number="form.age"
                    type="number"
                    min="15"
                    max="120"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Genre *</label>
                  <select
                    v-model="form.gender"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                    <option value="prefer_not_say">Je préfère ne pas répondre</option>
                  </select>
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

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0696123456"
                />
              </div>

              <div class="flex justify-end pt-4">
                <button
                  type="submit"
                  :disabled="!isStep1Valid || isCreatingLead"
                  class="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>

            <!-- Step 2: Location Information -->
            <div v-if="currentStep === 2" class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Votre localisation</h3>

              <!-- Country Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
                <select
                  v-model="form.country"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Sélectionnez votre pays</option>
                  <option v-for="(label, key) in countryOptions" :key="key" :value="key">
                    {{ label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                <select
                  v-model="form.location"
                  :disabled="!form.country"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Sélectionnez votre ville</option>
                  <option v-for="city in availableCities" :key="city" :value="city">
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
                <div class="space-y-3 max-h-64 overflow-y-auto pr-1">
                  <div
                    v-for="service in coachServices"
                    :key="service.id"
                    class="border rounded-lg p-3 space-y-2"
                  >
                    <label class="flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        :value="service.title"
                        v-model="form.preferredCoaching"
                        @change="
                          form.preferredCoaching.includes(service.title) &&
                          ensureServiceSelection(service)
                        "
                        class="mr-3 h-4 w-4 rounded text-orange-500 focus:ring-orange-500"
                      />
                      <div class="flex-1">
                        <div class="font-medium">{{ service.title }}</div>
                        <div class="text-xs text-gray-500">{{ service.duration }} min</div>
                      </div>
                      <!-- <div class="text-sm font-medium text-gray-700">
                      <span v-if="service.soloPrice">
                        {{
                          formatServicePrice(
                            service.soloPrice,
                            service.soloPriceUnit,
                            service.duration,
                          )
                        }}
                      </span>
                      <span
                        v-if="service.groupPrice && service.soloPrice"
                        class="text-gray-400 mx-1"
                        >/</span
                      >
                      <span v-if="service.groupPrice">
                        {{
                          formatServicePrice(
                            service.groupPrice,
                            service.groupPriceUnit,
                            service.duration,
                          )
                        }}
                      </span>
                    </div> -->
                    </label>

                    <!-- Expanded options when selected -->
                    <div
                      v-if="
                        form.preferredCoaching.includes(service.title) &&
                        serviceSelections[service.id]
                      "
                      class="bg-gray-50 border-t pt-2 mt-2 space-y-3 rounded"
                    >
                      <!-- Modalities with title -->
                      <div v-if="service.canBeSolo || service.canBeGroup" class="space-y-1">
                        <div class="text-[11px] uppercase tracking-wide text-gray-500 font-medium">
                          Type de cours
                        </div>
                        <div class="flex flex-wrap gap-3">
                          <label
                            v-if="service.canBeSolo"
                            class="flex items-center text-xs cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              v-model="serviceSelections[service.id].solo"
                              class="mr-1 h-3 w-3 text-orange-500 focus:ring-orange-500"
                            />
                            <span>
                              Cours particuliers
                              <span v-if="service.soloPrice != null" class="text-gray-500">
                                ({{
                                  formatServicePrice(
                                    service.soloPrice,
                                    service.soloPriceUnit,
                                    service.duration,
                                  )
                                }})
                              </span>
                            </span>
                          </label>
                          <label
                            v-if="service.canBeGroup"
                            class="flex items-center text-xs cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              v-model="serviceSelections[service.id].group"
                              class="mr-1 h-3 w-3 text-orange-500 focus:ring-orange-500"
                            />
                            <span>
                              Cours en groupe
                              <span v-if="service.groupPrice != null" class="text-gray-500">
                                ({{
                                  formatServicePrice(
                                    service.groupPrice,
                                    service.groupPriceUnit,
                                    service.duration,
                                  )
                                }})
                              </span>
                            </span>
                          </label>
                        </div>
                      </div>

                      <!-- Locations with title -->
                      <div
                        v-if="
                          service.canBeAtHome ||
                          service.canBeOnline ||
                          service.canBeInPublicSpaces ||
                          service.customPlace
                        "
                        class="space-y-1"
                      >
                        <div class="text-[11px] uppercase tracking-wide text-gray-500 font-medium">
                          Lieux de cours
                        </div>
                        <div class="flex flex-wrap gap-3">
                          <label
                            v-if="service.canBeAtHome"
                            class="flex items-center text-xs cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              v-model="serviceSelections[service.id].locations.atHome"
                              class="mr-1 h-3 w-3 text-orange-500 focus:ring-orange-500"
                            />
                            <span>À domicile</span>
                          </label>
                          <label
                            v-if="service.canBeOnline"
                            class="flex items-center text-xs cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              v-model="serviceSelections[service.id].locations.online"
                              class="mr-1 h-3 w-3 text-orange-500 focus:ring-orange-500"
                            />
                            <span>En ligne</span>
                          </label>
                          <label
                            v-if="service.canBeInPublicSpaces"
                            class="flex items-center text-xs cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              v-model="serviceSelections[service.id].locations.publicSpaces"
                              class="mr-1 h-3 w-3 text-orange-500 focus:ring-orange-500"
                            />
                            <span>Lieux publics</span>
                          </label>
                          <label
                            v-if="service.customPlace"
                            class="flex items-center text-xs cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              v-model="serviceSelections[service.id].locations.customPlace"
                              class="mr-1 h-3 w-3 text-orange-500 focus:ring-orange-500"
                            />
                            <span>{{ service.customPlace.label || 'Autre lieu' }}</span>
                          </label>
                        </div>
                      </div>

                      <!-- Available Days (from customAvailability) -->
                      <div
                        v-if="service.customAvailability && service.customAvailability.length"
                        class="space-y-1"
                      >
                        <div class="text-[11px] uppercase tracking-wide text-gray-500">
                          Jours souhaités
                        </div>
                        <div class="flex flex-wrap gap-2">
                          <label
                            v-for="slot in service.customAvailability.filter((a) => a.isActive)"
                            :key="slot.dayOfWeek"
                            class="flex items-center text-xs cursor-pointer px-2 py-1 border rounded bg-white"
                          >
                            <input
                              type="checkbox"
                              :value="slot.dayOfWeek"
                              v-model="serviceSelections[service.id].days"
                              class="mr-1 h-3 w-3 text-orange-500 focus:ring-orange-500"
                            />
                            <span>{{
                              ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][slot.dayOfWeek]
                            }}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
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

              <!-- Availability (only if no services or none selected) -->
              <div v-if="coachServices.length === 0 || form.preferredCoaching.length === 0">
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Disponibilités (jours)</label
                >
                <div class="flex flex-wrap gap-2 mb-3">
                  <button
                    v-for="d in weekDaysClient"
                    :key="d"
                    type="button"
                    @click="toggleDay(d)"
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-medium border transition',
                      selectedDays.includes(d)
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400',
                    ]"
                  >
                    {{ d.slice(0, 3) }}
                  </button>
                </div>
                <div class="flex flex-wrap gap-2 mb-2">
                  <button
                    type="button"
                    class="text-xs px-2.5 py-1 rounded border border-gray-300 hover:bg-gray-50"
                    @click="selectAllDays"
                  >
                    Tous les jours
                  </button>
                  <button
                    type="button"
                    class="text-xs px-2.5 py-1 rounded border border-gray-300 hover:bg-gray-50"
                    @click="selectWeekend"
                  >
                    Week-end
                  </button>
                  <button
                    type="button"
                    class="text-xs px-2.5 py-1 rounded border border-gray-300 hover:bg-gray-50"
                    @click="clearDays"
                  >
                    Effacer
                  </button>
                </div>
                <p class="text-[11px] text-gray-500">
                  Sélectionnez les jours où vous êtes généralement disponible. (Créneaux horaires
                  détaillés à venir.)
                </p>
              </div>

              <!-- Start Timeframe -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Quand souhaitez-vous commencer ?</label
                >
                <select
                  v-model="form.startTimeframe"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Sélectionnez une option</option>
                  <option value="Immédiatement">Immédiatement</option>
                  <option value="Dans les prochains jours">Dans les prochains jours</option>
                  <option value="Dans les prochains mois">Dans les prochains mois</option>
                  <option value="Je ne sais pas">Je ne sais pas</option>
                </select>
              </div>

              <!-- Goals (now specialties selection) -->
              <div v-if="showGoalsSection">
                <label class="block text-sm font-medium text-gray-700 mb-2">Vos objectifs *</label>
                <div v-if="specialtyOptions.length" class="flex flex-wrap gap-2 mb-2">
                  <button
                    v-for="spec in specialtyOptions"
                    :key="spec"
                    type="button"
                    @click="toggleGoal(spec)"
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-medium border transition',
                      form.goals.includes(spec)
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400',
                    ]"
                  >
                    {{ spec }}
                  </button>
                </div>
                <div v-else class="text-xs text-gray-500 mb-2">
                  Aucune spécialité définie pour ce coach. Décrivez vos objectifs ci-dessous.
                </div>
                <textarea
                  v-if="!specialtyOptions.length"
                  v-model="fallbackGoals"
                  required
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Décrivez vos objectifs et attentes..."
                ></textarea>
                <p class="text-[11px] text-gray-500 mt-1" v-if="specialtyOptions.length">
                  Sélectionnez une ou plusieurs spécialités qui correspondent à vos objectifs.
                </p>
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
                  placeholder="Partagez toute information supplémentaire... (ne donnez pas vos informations personnelles ici)"
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
          </template>
        </form>
      </div>
      <!-- Exit confirmation dialog -->
      <div
        v-if="showExitConfirm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg max-w-md w-full mx-4 p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Avant de quitter</h3>
          <p class="text-sm text-gray-700 mb-4">
            Votre progression ne sera pas sauvegardée. Voulez-vous annuler votre demande ?
          </p>
          <label class="flex items-center space-x-2 mb-4 select-none">
            <input
              type="checkbox"
              v-model="doNotContact"
              class="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span class="text-sm text-gray-700">Je ne veux pas être contacté</span>
          </label>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="cancelExit"
              class="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Retour
            </button>
            <button
              type="button"
              @click="confirmExit"
              class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Quitter
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import type { Coach } from '@/types/coach'
import type { CoachService } from '@/types/service'
import type { ClientRequest, Lead } from '@/types/Lead'
import { COUNTRIES, getCitiesByCountry } from '@/constants/locations'
import type { CountryType } from '@/constants/locations'
import { supabaseCoachServicesApi } from '@/services/supabaseCoachServicesApi'
import LeadService from '@/services/leadService'
import { v4 as uuidv4 } from 'uuid'

// Lead data interface
interface ChosenServiceSelection {
  title: string
  modalities: string[]
  locations: string[]
  days: number[]
}

interface LeadData {
  id: string
  client_name: string
  client_email: string
  client_phone?: string
  client_age?: number
  client_gender?: 'male' | 'female' | 'other' | 'prefer_not_say'
  coach_id?: string
  location?: string
  chosen_services?: ChosenServiceSelection[]
  experience?: string
  goals?: string
  availability?: string
  start_timeframe?: string
  additional_info?: string
  current_step: number
  created_at: string
  updated_at: string
  lead_score?: number
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
const isCreatingLead = ref(false)
const showExitConfirm = ref(false)
const doNotContact = ref(false)
const isFinalized = ref(false)
const pendingEmitData = ref<Partial<ClientRequest> | null>(null)
const sessionId = ref<string>(uuidv4())

// Form data
const form = ref({
  firstName: '',
  lastName: '',
  age: null as number | null,
  gender: '' as '' | 'male' | 'female' | 'other' | 'prefer_not_say',
  email: '',
  phone: '',
  country: '' as '' | CountryType,
  location: '',
  preferredCoaching: [] as string[],
  experience: '',
  goals: [] as string[],
  availability: '',
  startTimeframe: '',
  additionalInfo: '',
})
// Client availability day selection (Sunday first per requirement)
const weekDaysClient = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const selectedDays = ref<string[]>([])
function toggleDay(day: string) {
  if (selectedDays.value.includes(day)) {
    selectedDays.value = selectedDays.value.filter((d) => d !== day)
  } else {
    selectedDays.value = [...selectedDays.value, day]
  }
  syncAvailabilityToForm()
}
function selectAllDays() {
  selectedDays.value = [...weekDaysClient]
  syncAvailabilityToForm()
}
function selectWeekend() {
  selectedDays.value = weekDaysClient.filter((d) => d === 'Samedi' || d === 'Dimanche')
  syncAvailabilityToForm()
}
function clearDays() {
  selectedDays.value = []
  syncAvailabilityToForm()
}
function syncAvailabilityToForm() {
  form.value.availability = selectedDays.value.join(', ')
}
// Detailed per-service selections
interface ServiceSelection {
  solo: boolean
  group: boolean
  locations: {
    atHome: boolean
    online: boolean
    publicSpaces: boolean
    customPlace: boolean
  }
  days: number[]
}
const serviceSelections = ref<Record<string, ServiceSelection>>({})
const ensureServiceSelection = (service: CoachService) => {
  if (!serviceSelections.value[service.id]) {
    serviceSelections.value[service.id] = {
      solo: false,
      group: false,
      locations: { atHome: false, online: false, publicSpaces: false, customPlace: false },
      days: [],
    }
  }
}
watch(
  () => form.value.preferredCoaching.slice(),
  (newVal) => {
    const activeIds = new Set(
      coachServices.value.filter((s) => newVal.includes(s.title)).map((s) => s.id),
    )
    Object.keys(serviceSelections.value).forEach((id) => {
      if (!activeIds.has(id)) delete serviceSelections.value[id]
    })
    coachServices.value.forEach((s) => {
      if (newVal.includes(s.title)) ensureServiceSelection(s)
    })
  },
  { deep: false },
)

// Constants
const countryOptions = COUNTRIES
const availableCities = computed(() => {
  return form.value.country ? getCitiesByCountry(form.value.country as CountryType) : []
})

// Reset city when country changes
watch(
  () => form.value.country,
  () => {
    form.value.location = ''
  },
)

// Computed
const isStep1Valid = computed(() => {
  return (
    form.value.firstName.trim() !== '' &&
    form.value.lastName.trim() !== '' &&
    form.value.age !== null &&
    form.value.age >= 5 &&
    form.value.gender !== '' &&
    form.value.email.trim() !== ''
  )
})

const isStep2Valid = computed(() => {
  return form.value.country !== '' && form.value.location !== ''
})

const showGoalsSection = computed(
  () => coachServices.value.length === 0 || form.value.preferredCoaching.length === 0,
)
const isStep3Valid = computed(() => {
  if (!showGoalsSection.value) return true
  // If specialties available, require at least one selected; otherwise require fallback text
  if (specialtyOptions.value.length) return form.value.goals.length > 0
  return fallbackGoals.value.trim() !== ''
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
    // If a lead already exists for this session, don't create a duplicate
    if (currentLead.value) {
      currentStep.value = 2
      return
    }

    isCreatingLead.value = true
    const leadData = {
      client_name: `${form.value.firstName} ${form.value.lastName}`,
      client_email: form.value.email,
      client_phone: form.value.phone || undefined, // capture phone at creation now that field moved to step 1
      client_age: form.value.age || undefined,
      client_gender: form.value.gender || undefined,
      session_id: sessionId.value,
      // Do not assign a coach at creation time to satisfy public RLS
      // coach_id: props.selectedCoach?.id,
    }

    const lead = await LeadService.createLead(leadData)
    if (lead) {
      // Convert Lead to LeadData format
      currentLead.value = {
        id: lead.id,
        client_name: lead.client_name,
        client_email: lead.client_email,
        client_phone: lead.client_phone,
        client_age: (lead as unknown as { client_age?: number }).client_age,
        client_gender: (lead as unknown as { client_gender?: LeadData['client_gender'] })
          .client_gender,
        coach_id: lead.coach_id,
        location: lead.location,
        chosen_services: (lead as unknown as { chosen_services?: ChosenServiceSelection[] })
          .chosen_services,
        experience: lead.experience,
        goals: lead.goals,
        availability: lead.availability,
        start_timeframe: lead.start_timeframe,
        additional_info: lead.additional_info,
        current_step: lead.current_step,
        created_at: lead.created_at,
        updated_at: lead.updated_at,
      }
      // If a coach was pre-selected, assign it now via RPC while the lead is still public
      if (props.selectedCoach?.id) {
        const withCoach = await LeadService.setCoachPublic(lead.id, props.selectedCoach.id)
        if (withCoach) {
          if (currentLead.value) {
            currentLead.value.coach_id = withCoach.coach_id
            currentLead.value.lead_score = withCoach.lead_score
          }
        }
      }

      currentStep.value = 2
      console.log('✅ Step 1 saved, lead created:', lead.id)
    } else {
      console.error('❌ Failed to create lead')
    }
  } catch (error) {
    console.error('❌ Error saving step 1:', error)
  } finally {
    isCreatingLead.value = false
  }
}

const saveStep2 = async () => {
  if (!currentLead.value) return

  try {
    const updateData = {
      client_phone: form.value.phone,
      // Store both country and city as a JSON string in the existing text column
      location: JSON.stringify({
        country: form.value.country || null,
        city: form.value.location || null,
      }),
    }

    const updatedLead = await LeadService.updateLeadStep(currentLead.value.id, 2, updateData)

    if (updatedLead) {
      // Convert Lead to LeadData format
      currentLead.value = {
        id: updatedLead.id,
        client_name: updatedLead.client_name,
        client_email: updatedLead.client_email,
        client_phone: updatedLead.client_phone,
        client_age: (updatedLead as unknown as { client_age?: number }).client_age,
        client_gender: (updatedLead as unknown as { client_gender?: LeadData['client_gender'] })
          .client_gender,
        coach_id: updatedLead.coach_id,
        location: updatedLead.location,
        chosen_services: (updatedLead as unknown as { chosen_services?: ChosenServiceSelection[] })
          .chosen_services,
        experience: updatedLead.experience,
        goals: updatedLead.goals,
        availability: updatedLead.availability,
        start_timeframe: updatedLead.start_timeframe,
        additional_info: updatedLead.additional_info,
        current_step: updatedLead.current_step,
        created_at: updatedLead.created_at,
        updated_at: updatedLead.updated_at,
        lead_score: updatedLead.lead_score,
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

// Specialties (goals) selection helpers
const specialtyOptions = computed(() => (props.selectedCoach?.specialties || []).filter(Boolean))
function toggleGoal(goal: string) {
  if (form.value.goals.includes(goal)) {
    form.value.goals = form.value.goals.filter((g) => g !== goal)
  } else {
    form.value.goals = [...form.value.goals, goal]
  }
}
// Fallback free text goals when no specialties
const fallbackGoals = ref('')

// Build structured chosen services payload
function buildChosenServicesPayload(): ChosenServiceSelection[] {
  const result: ChosenServiceSelection[] = []
  coachServices.value.forEach((svc) => {
    if (!form.value.preferredCoaching.includes(svc.title)) return
    const sel = serviceSelections.value[svc.id]
    if (!sel) return
    const modalities: string[] = []
    if (sel.solo && svc.canBeSolo) modalities.push('solo')
    if (sel.group && svc.canBeGroup) modalities.push('group')
    const locations: string[] = []
    if (sel.locations.atHome && svc.canBeAtHome) locations.push('at_home')
    if (sel.locations.online && svc.canBeOnline) locations.push('online')
    if (sel.locations.publicSpaces && svc.canBeInPublicSpaces) locations.push('public_spaces')
    if (sel.locations.customPlace && svc.customPlace?.label) locations.push('custom_place')
    result.push({
      title: svc.title,
      modalities,
      locations,
      days: sel.days.slice(),
    })
  })
  return result
}

const saveStep3 = async () => {
  if (!currentLead.value) return

  try {
    isSubmitting.value = true

    const updateData: {
      chosen_services: ChosenServiceSelection[]
      experience: string
      goals?: string
      availability: string
      start_timeframe: string
      additional_info: string
    } = {
      chosen_services: buildChosenServicesPayload(),
      experience: form.value.experience,
      availability: form.value.availability,
      start_timeframe: form.value.startTimeframe,
      additional_info: form.value.additionalInfo,
    }
    if (showGoalsSection.value) {
      updateData.goals = specialtyOptions.value.length
        ? form.value.goals.join(', ')
        : fallbackGoals.value
    }

    // Use RPC finalize to mark steps complete and optionally assign the selected coach
    // Now backend supports jsonb structured objects; send them directly
    const finalLead = await LeadService.finalizeLeadPublic(
      currentLead.value.id,
      updateData as unknown as Partial<Lead> & { start_timeframe?: string | null },
      props.selectedCoach ? props.selectedCoach.id : null,
    )

    if (finalLead) {
      console.log('✅ Lead completed successfully:', finalLead.id)
      isFinalized.value = true
      // Prepare data for emitting later (after user reads success)
      const requestData: Partial<ClientRequest> = {
        id: finalLead.id,
        clientName: finalLead.client_name,
        email: finalLead.client_email,
        phone: finalLead.client_phone,
        // Age & gender could be added to ClientRequest if needed later
        location: finalLead.location,
        // Convert structured objects to titles for legacy ClientRequest interface
        chosenServices: Array.isArray(updateData.chosen_services)
          ? updateData.chosen_services.map((c) => c.title)
          : [],
        experience: finalLead.experience,
        coachingGoals: finalLead.goals,
        availability: finalLead.availability,
        startTimeframe: finalLead.start_timeframe || undefined,
        additionalInfo: finalLead.additional_info,
        targetCoaches: props.selectedCoach ? [props.selectedCoach.id] : [],
        status: 'pending',
        priority: 'medium',
        source: 'web',
        createdAt: new Date(finalLead.created_at),
        isCompleted: true,
      }

      // Optionally keep latest lead_score
      if (currentLead.value) {
        currentLead.value.lead_score = finalLead.lead_score
      }

      pendingEmitData.value = requestData
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
  if (isFinalized.value) {
    finalizeClose()
    return
  }
  if (!currentLead.value || currentStep.value === 1) {
    emit('close')
    return
  }
  showExitConfirm.value = true
}

const handleCloseClick = () => {
  // Same logic as backdrop: ask confirm if progress exists
  handleBackdropClick()
}

const cancelExit = () => {
  showExitConfirm.value = false
}

const confirmExit = async () => {
  try {
    // If user opts out of contact and we have a lead created, set flag
    if (doNotContact.value && currentLead.value) {
      await LeadService.setContactPreference(currentLead.value.id, true)
    }
  } catch (e) {
    console.error('Error setting contact preference:', e)
  } finally {
    showExitConfirm.value = false
    if (isFinalized.value && pendingEmitData.value) emit('submit', pendingEmitData.value)
    emit('close')
  }
}

function finalizeClose() {
  if (pendingEmitData.value) emit('submit', pendingEmitData.value)
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
// Removed buildAdditionalInfoWithSelections: additional_info now strictly the user's free-text message.

// Format price with explicit unit if provided; fallback to duration heuristic
function formatServicePrice(
  price: number | null,
  unit: 'per_hour' | 'per_session' | undefined,
  duration?: number,
) {
  if (price == null) return ''
  const resolvedUnit = unit || (duration === 60 ? 'per_hour' : 'per_session')
  return resolvedUnit === 'per_hour' ? `${price}€ / heure` : `${price}€ / séance`
}
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

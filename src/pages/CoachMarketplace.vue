<template>
  <CoachLayout>
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div class="px-4 py-6 sm:p-8">
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div class="md:max-w-3xl">
              <h1 class="text-3xl font-bold text-gray-900">Mes Services / Cours Particuliers</h1>
              <!-- Description -->
              <p v-if="!showFullDesc && isMobile" class="text-gray-600 mt-3 leading-relaxed">
                {{ truncatedDescription }}
                <button
                  v-if="needsTruncation"
                  @click="showFullDesc = true"
                  class="ml-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Afficher plus
                </button>
              </p>
              <div v-else class="mt-3 space-y-3">
                <p class="text-gray-600 leading-relaxed">
                  {{ fullDescription }}
                  <button
                    v-if="isMobile && needsTruncation"
                    @click="showFullDesc = false"
                    class="ml-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Réduire
                  </button>
                </p>
              </div>
            </div>
            <div class="flex md:flex-col items-start gap-3">
              <button
                v-if="!isEditingService && !isLoadingServices"
                @click="addNewService"
                class="w-full md:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-md font-medium shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                + Ajouter un service
              </button>
              <div
                v-else-if="isLoadingServices"
                class="animate-pulse bg-gray-200 h-10 w-40 rounded-md"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Service Form (Add/Edit) -->
      <div
        v-if="isEditingService"
        class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl mb-8"
      >
        <div class="px-4 py-6 sm:p-8">
          <div
            v-if="isFreePlan"
            class="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-800 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div class="flex items-start gap-2">
              <svg class="w-5 h-5 mt-0.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.5a.75.75 0 00-1.5 0v4.25c0 .414.336.75.75.75h2a.75.75 0 000-1.5h-1.25V6.5zM10 13a1 1 0 100 2 1 1 0 000-2z"
                  clip-rule="evenodd"
                />
              </svg>
              <p>
                Passez en <span class="font-medium">Premium</span> pour activer plusieurs services
                simultanément.
              </p>
            </div>
            <button
              @click="goUpgrade"
              class="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            >
              Passer en Premium
            </button>
          </div>
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
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-900"
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
                    class="w-32 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-900 no-spinner"
                  />
                  <span class="relative inline-flex ml-2">
                    <select
                      v-model="serviceForm.soloPriceUnit"
                      class="dark:text-gray-900 pr-6 pl-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none no-native-arrow"
                    >
                      <option value="per_hour">€/ heure</option>
                      <option value="per_session">€/ séance</option>
                    </select>
                    <svg
                      class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </span>
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
                    class="w-32 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-900 no-spinner"
                  />
                  <span class="relative inline-flex ml-2">
                    <select
                      v-model="serviceForm.groupPriceUnit"
                      class="dark:text-gray-900 pr-6 pl-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none no-native-arrow"
                    >
                      <option value="per_session">€/ séance</option>
                      <option value="per_hour">€/ heure</option>
                    </select>
                    <svg
                      class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            <!-- Category & Domain: first show coach specialties as chips, then optional 'Autres catégories' dropdown -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
              <div class="flex items-start gap-3">
                <div class="flex-1 space-y-2" ref="categoryDropdownEl">
                  <!-- Coach specialties chips -->
                  <div v-if="coachSpecialties.length" class="flex flex-wrap gap-2">
                    <button
                      v-for="spec in coachSpecialties"
                      :key="spec"
                      type="button"
                      class="px-2.5 py-1 rounded-full text-xs font-medium border transition"
                      :class="[
                        serviceForm.category === spec
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400',
                      ]"
                      @click="selectCoachSpecialty(spec)"
                    >
                      {{ spec }}
                    </button>
                  </div>
                  <!-- Toggle to open other categories -->
                  <div class="flex items-center gap-2" v-if="allSpecialties.length">
                    <button
                      type="button"
                      class="text-xs text-indigo-600 hover:text-indigo-800 underline"
                      @click="showOtherCategories = !showOtherCategories"
                    >
                      {{ showOtherCategories ? 'Masquer autres catégories' : 'Autres catégories' }}
                    </button>
                    <span
                      v-if="
                        serviceForm.category && !coachSpecialties.includes(serviceForm.category)
                      "
                      class="text-[11px] text-gray-500"
                    >
                      (sélection hors spécialités)
                    </span>
                  </div>
                  <!-- Existing searchable dropdown wrapped as 'Autres catégories' -->
                  <div v-if="showOtherCategories" class="space-y-1">
                    <div class="relative">
                      <input
                        v-model="specialtySearch"
                        type="text"
                        placeholder="Rechercher / choisir une autre spécialité..."
                        class="w-full rounded-md border text-sm pr-8 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-900"
                        :class="[
                          serviceForm.category && !isValidCategory
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-500'
                            : 'border-gray-300',
                        ]"
                        @focus="openCategoryDropdown()"
                        @input="showCategoryDropdown = true"
                      />
                      <button
                        v-if="specialtySearch"
                        type="button"
                        class="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
                        @click="((specialtySearch = ''), (serviceForm.category = ''))"
                      >
                        ×
                      </button>
                      <!-- Dropdown -->
                      <div
                        v-if="showCategoryDropdown"
                        class="absolute z-30 mt-1 w-full max-h-72 overflow-auto rounded-md border bg-white shadow-lg text-sm"
                      >
                        <div
                          v-if="!hasCategoryMatches"
                          class="px-3 py-2 text-xs text-gray-500 italic"
                        >
                          Aucune spécialité trouvée
                        </div>
                        <template v-for="group in filteredSpecialtyGroups" :key="group.category">
                          <div v-if="group.specialties.length" class="py-1">
                            <div
                              class="px-3 pt-2 pb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wide"
                            >
                              {{ group.category }}
                            </div>
                            <button
                              v-for="opt in group.specialties"
                              :key="opt"
                              type="button"
                              class="w-full text-left px-3 py-1.5 hover:bg-indigo-50 flex items-center justify-between"
                              :disabled="serviceForm.category === opt"
                              @click="selectCategory(opt)"
                            >
                              <span
                                :class="[
                                  'text-xs',
                                  serviceForm.category === opt
                                    ? 'text-gray-400 line-through'
                                    : 'text-gray-700',
                                ]"
                                >{{ opt }}</span
                              >
                              <span
                                v-if="serviceForm.category === opt"
                                class="text-[10px] text-gray-400"
                                >Sélectionné</span
                              >
                            </button>
                          </div>
                        </template>
                      </div>
                    </div>
                    <p v-if="serviceForm.category && !isValidCategory" class="text-xs text-red-600">
                      Catégorie inconnue (liste mise à jour requise ?)
                    </p>
                    <p class="text-[11px] text-gray-500">
                      Recherchez par nom ou parcourez les groupes, puis cliquez pour sélectionner.
                    </p>
                  </div>
                </div>
                <span
                  v-if="derivedDomain"
                  class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap"
                >
                  {{ derivedDomain }}
                </span>
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
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-900"
              ></textarea>
            </div>

            <!-- Duration -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Durée de la séance *</label
              >
              <select
                v-model.number="serviceForm.duration"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-900"
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
                <label class="flex items-center">
                  <input
                    v-model="serviceForm.canBeOtherLocation"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">Autre lieu spécifique</span>
                </label>
                <div v-if="serviceForm.canBeOtherLocation" class="ml-6 space-y-2">
                  <input
                    v-model="serviceForm.otherLocationLabel"
                    type="text"
                    placeholder="Nom du lieu (ex: Studio privé, Salle partenaire)"
                    class="w-full md:w-72 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    v-model="serviceForm.otherLocationAddress"
                    type="text"
                    placeholder="Adresse (optionnel)"
                    class="w-full md:w-96 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p class="text-[11px] text-gray-500">
                    Ces informations seront visibles par les clients intéressés.
                  </p>
                </div>
              </div>
            </div>

            <!-- Free Trial -->
            <div>
              <label class="flex items-center mb-3">
                <input
                  v-model="serviceForm.hasFreeTrial"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm font-medium text-gray-700">Premier cours gratuit</span>
              </label>

              <div v-if="serviceForm.hasFreeTrial">
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Modalités du cours gratuit</label
                >
                <textarea
                  v-model="serviceForm.freeTrialModalities"
                  rows="2"
                  placeholder="Ex: Séance de 45min pour évaluer vos besoins..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-900"
                ></textarea>
              </div>
            </div>

            <!-- Cancellation Policy (free text) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Politique d'annulation *</label
              >
              <input
                v-model="serviceForm.cancellationPolicy"
                type="text"
                maxlength="120"
                placeholder="Ex: Annulation gratuite jusqu'à 24h avant"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-900"
                required
              />
              <p class="text-[11px] text-gray-500 mt-1">120 caractères maximum.</p>
            </div>

            <!-- Availability Days (new simplified design) -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-3"
                >Disponibilités (jours) pour ce service</label
              >
              <div class="flex flex-wrap gap-2 mb-3">
                <button
                  v-for="d in weekDays"
                  :key="d"
                  type="button"
                  @click="
                    selectedDays = selectedDays.includes(d)
                      ? selectedDays.filter((x) => x !== d)
                      : [...selectedDays, d]
                  "
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium border transition',
                    selectedDays.includes(d)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400',
                  ]"
                >
                  {{ d.slice(0, 3) }}
                </button>
              </div>
              <div class="flex flex-wrap gap-2 mb-2">
                <button
                  type="button"
                  class="text-xs px-2.5 py-1 rounded border border-gray-300 hover:bg-gray-50 dark:text-gray-900"
                  @click="selectedDays = [...weekDays]"
                >
                  Tous les jours
                </button>
                <button
                  type="button"
                  class="dark:text-gray-900 text-xs px-2.5 py-1 rounded border border-gray-300 hover:bg-gray-50"
                  @click="selectedDays = weekDays.filter((d) => d === 'Samedi' || d === 'Dimanche')"
                >
                  Week-end
                </button>
                <button
                  type="button"
                  class="dark:text-gray-900 text-xs px-2.5 py-1 rounded border border-gray-300 hover:bg-gray-50"
                  @click="selectedDays = []"
                >
                  Effacer
                </button>
              </div>
              <p class="text-[11px] text-gray-500">
                Sélectionnez les jours habituels où ce service est disponible. (Créneaux horaires
                détaillés à venir.)
              </p>
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
                  !isValidCategory ||
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

      <!-- Conditional Services Content -->
      <div>
        <!-- Loading skeleton while fetching services -->
        <div
          v-if="!isEditingService && isLoadingServices"
          class="grid grid-cols-1 md:grid-cols-2 gap-4 py-4"
          aria-busy="true"
          aria-live="polite"
        >
          <div
            v-for="n in 2"
            :key="n"
            class="border border-gray-200 rounded-lg p-6 animate-pulse space-y-4"
          >
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-gray-200 rounded-md"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-2/3"></div>
                <div class="h-3 bg-gray-100 rounded w-full"></div>
                <div class="h-3 bg-gray-100 rounded w-5/6"></div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 mt-2">
              <div class="h-3 bg-gray-100 rounded w-3/4"></div>
              <div class="h-3 bg-gray-100 rounded w-2/3"></div>
              <div class="h-3 bg-gray-100 rounded w-1/2"></div>
              <div class="h-3 bg-gray-100 rounded w-2/5"></div>
            </div>
            <div class="flex gap-2 pt-2">
              <div class="h-5 bg-gray-100 rounded-full w-16"></div>
              <div class="h-5 bg-gray-100 rounded-full w-20"></div>
            </div>
          </div>
        </div>

        <!-- No services message -->
        <div v-else-if="!isEditingService && coachServices.length === 0" class="text-center py-12">
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

        <!-- Services list -->
        <div v-if="!isEditingService && coachServices.length > 0" class="space-y-4">
          <div
            v-if="isFreePlan"
            class="text-xs text-gray-600 mb-2 flex items-center gap-3 flex-wrap"
          >
            <span>Plan gratuit: 1 service actif maximum.</span>
            <button
              type="button"
              @click="goUpgrade"
              class="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-medium text-[11px] hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Passer Premium
            </button>
          </div>
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
                      service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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
                    <div class="font-medium dark:text-gray-500">{{ service.category }}</div>
                  </div>
                  <div>
                    <span class="text-gray-500">Durée:</span>
                    <div class="font-medium dark:text-gray-500">{{ service.duration }} min</div>
                  </div>
                  <div v-if="service.canBeSolo">
                    <span class="text-gray-500">Prix solo:</span>
                    <div class="font-medium dark:text-gray-500">
                      {{ service.soloPrice }}€
                      <span class="text-xs text-gray-500"
                        >/{{ service.soloPriceUnit === 'per_hour' ? 'heure' : 'séance' }}</span
                      >
                    </div>
                  </div>
                  <div v-if="service.canBeGroup">
                    <span class="text-gray-500">Prix groupe:</span>
                    <div class="font-medium dark:text-gray-500">
                      {{ service.groupPrice }}€
                      <span class="text-xs text-gray-500"
                        >/{{ service.groupPriceUnit === 'per_hour' ? 'heure' : 'séance' }}</span
                      >
                    </div>
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
                  @click="toggleServiceActive(service)"
                  class="text-xs px-2 py-1 rounded-md border font-medium"
                  :class="
                    service.isActive
                      ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                      : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                  "
                >
                  {{ service.isActive ? 'Désactiver' : 'Activer' }}
                </button>
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
    <!-- /.container -->
  </CoachLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import CoachLayout from '@/layouts/CoachLayout.vue'
import type { CoachService, ServiceFormData } from '@/types/service'
import { DURATION_OPTIONS } from '@/types/service'
import { supabaseCoachServicesApi } from '@/services/supabaseCoachServicesApi'
import { useAuthStore } from '@/stores/auth'
import { SPECIALTY_OPTIONS, type SpecialtyGroup } from '@/constants/coachOptions'
// Week days (FR)
const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

// Store
const authStore = useAuthStore()

// State
const coachServices = ref<CoachService[]>([])
const router = useRouter()
const isEditingService = ref(false)
const editingServiceId = ref<string | null>(null)
const isLoadingServices = ref(true) // Add loading state

// Responsive description controls
const fullDescription = `Créez, organisez et optimisez vos offres : cours particuliers ou de groupe, durées, tarifs, lieux (domicile, en ligne, espaces publics) et éventuel cours d'essai gratuit. Activez ou désactivez un service à tout moment pour ajuster votre visibilité.`
const showFullDesc = ref(false)
const isMobile = ref(false)
const MAX_MOBILE_CHARS = 140
const truncatedDescription = computed(() =>
  fullDescription.length > MAX_MOBILE_CHARS
    ? fullDescription.slice(0, MAX_MOBILE_CHARS).trimEnd() + '…'
    : fullDescription,
)
const needsTruncation = computed(() => fullDescription.length > MAX_MOBILE_CHARS)

const updateViewport = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    showFullDesc.value = true
  } else if (!needsTruncation.value) {
    showFullDesc.value = true
  } else {
    showFullDesc.value = false
  }
}

// Form data
const serviceForm = ref<ServiceFormData>({
  title: '',
  description: '',
  canBeSolo: false,
  canBeGroup: false,
  soloPrice: null,
  groupPrice: null,
  soloPriceUnit: 'per_session',
  groupPriceUnit: 'per_session',
  category: '',
  subCategory: '',
  duration: 60,
  canBeAtHome: false,
  canBeOnline: false,
  canBeInPublicSpaces: false,
  canBeOtherLocation: false,
  otherLocationLabel: '',
  otherLocationAddress: '',
  hasFreeTrial: false,
  freeTrialModalities: '',
  cancellationPolicy: 'flexible',
  useProfileAvailability: true,
  customAvailability: [],
})
// Simple day selection (names)
const selectedDays = ref<string[]>([])

// All specialties flat list for searchable datalist
const allSpecialties = computed(() => {
  return SPECIALTY_OPTIONS.flatMap((g) => g.specialties)
})

// Validate that entered category matches one of the known specialties
const isValidCategory = computed(() => {
  if (!serviceForm.value.category) return false
  return allSpecialties.value.includes(serviceForm.value.category)
})

// Coach specialties (chips) – only keep those present in SPECIALTY_OPTIONS
const coachSpecialties = computed<string[]>(() => {
  const raw = authStore.coach?.specialties as unknown as string[] | undefined
  const list = Array.isArray(raw) ? raw : []
  const set = new Set<string>()
  for (const s of list) {
    if (typeof s === 'string' && allSpecialties.value.includes(s)) set.add(s)
  }
  return Array.from(set)
})

// Toggle for showing the full searchable dropdown
const showOtherCategories = ref(false)

function selectCoachSpecialty(spec: string) {
  serviceForm.value.category = spec
  specialtySearch.value = spec
  closeCategoryDropdown()
}

// Map category to domain using SPECIALTY_OPTIONS
const categoryToDomainMap: Record<string, string> = {}
for (const group of SPECIALTY_OPTIONS) {
  for (const spec of group.specialties) {
    categoryToDomainMap[spec] = group.category
  }
}
const derivedDomain = computed(() => {
  return serviceForm.value.category ? categoryToDomainMap[serviceForm.value.category] : ''
})

// --- Category (Specialty) searchable dropdown (reuse design from profile specialties) ---
const specialtySearch = ref('')
const showCategoryDropdown = ref(false)
const categoryDropdownEl = ref<HTMLElement | null>(null)
const filteredSpecialtyGroups = computed<SpecialtyGroup[]>(() => {
  const term = specialtySearch.value.trim().toLowerCase()
  if (!term) return SPECIALTY_OPTIONS
  return SPECIALTY_OPTIONS.map((g) => ({
    category: g.category,
    specialties: g.specialties.filter((s) => s.toLowerCase().includes(term)),
  })).filter((g) => g.specialties.length > 0 || g.category.toLowerCase().includes(term))
})
const hasCategoryMatches = computed(() =>
  filteredSpecialtyGroups.value.some((g) => g.specialties.length > 0),
)
function openCategoryDropdown() {
  showCategoryDropdown.value = true
}
function closeCategoryDropdown() {
  showCategoryDropdown.value = false
}
function selectCategory(opt: string) {
  serviceForm.value.category = opt
  // Show the chosen category directly inside the input field
  specialtySearch.value = opt
  closeCategoryDropdown()
}
function handleOutsideClickCategory(e: MouseEvent) {
  if (!showCategoryDropdown.value) return
  const target = e.target as Node
  if (categoryDropdownEl.value && !categoryDropdownEl.value.contains(target)) {
    closeCategoryDropdown()
  }
}

onMounted(() => {
  window.addEventListener('mousedown', handleOutsideClickCategory)
})
onBeforeUnmount(() => {
  window.removeEventListener('mousedown', handleOutsideClickCategory)
})

// Methods
// Subscription based limits
const subscriptionStatus = computed(() => authStore.coach?.subscriptionStatus) // 'active' | 'trial' | 'inactive'
const isFreePlan = computed(() => subscriptionStatus.value === 'inactive')
const activeServicesCount = computed(() => coachServices.value.filter((s) => s.isActive).length)
// Creation allowed even when limit reached; only one ACTIVE at a time on free plan

const addNewService = () => {
  isEditingService.value = true
  editingServiceId.value = null
  resetServiceForm()
}

const goUpgrade = () => {
  // Route hypothétique vers page d'abonnement
  router.push('/coach/abonnement')
}

const editService = (service: CoachService) => {
  isEditingService.value = true
  editingServiceId.value = service.id

  // Populate form with service data
  const svc = service as CoachService & {
    canBeOtherLocation?: boolean
    otherLocationLabel?: string
    otherLocationAddress?: string
  }
  // Derive other-location fields from customPlace if present (DB JSON column)
  const hasCustomPlace =
    !!service.customPlace && (!!service.customPlace.label || !!service.customPlace.address)
  const derivedOtherLocationLabel = service.customPlace?.label || svc.otherLocationLabel || ''
  const derivedOtherLocationAddress = service.customPlace?.address || svc.otherLocationAddress || ''
  serviceForm.value = {
    title: service.title,
    description: service.description,
    canBeSolo: service.canBeSolo,
    canBeGroup: service.canBeGroup,
    soloPrice: service.soloPrice,
    groupPrice: service.groupPrice,
    soloPriceUnit: service.soloPriceUnit || 'per_session',
    groupPriceUnit: service.groupPriceUnit || 'per_session',
    category: service.category,
    subCategory: service.subCategory || '',
    duration: service.duration,
    canBeAtHome: service.canBeAtHome,
    canBeOnline: service.canBeOnline,
    canBeInPublicSpaces: service.canBeInPublicSpaces,
    canBeOtherLocation: hasCustomPlace || svc.canBeOtherLocation || false,
    otherLocationLabel: derivedOtherLocationLabel,
    otherLocationAddress: derivedOtherLocationAddress,
    hasFreeTrial: service.hasFreeTrial,
    freeTrialModalities: service.freeTrialModalities || '',
    cancellationPolicy: service.cancellationPolicy,
    useProfileAvailability: service.useProfileAvailability,
    customAvailability: service.customAvailability || [],
  }
  // Ensure the category appears inside the searchable input
  specialtySearch.value = service.category
  // Hydrate selectedDays from customAvailability if present
  if (service.customAvailability && service.customAvailability.length) {
    selectedDays.value = service.customAvailability
      .map((a) => (a.dayOfWeek === 0 ? 'Dimanche' : weekDays[a.dayOfWeek - 1]))
      .filter(Boolean)
  } else {
    selectedDays.value = []
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
    soloPriceUnit: 'per_session',
    groupPriceUnit: 'per_session',
    category: '',
    subCategory: '',
    duration: 60,
    canBeAtHome: false,
    canBeOnline: false,
    canBeInPublicSpaces: false,
    canBeOtherLocation: false,
    otherLocationLabel: '',
    otherLocationAddress: '',
    hasFreeTrial: false,
    freeTrialModalities: '',
    cancellationPolicy: 'flexible',
    useProfileAvailability: true,
    customAvailability: [],
  }
  selectedDays.value = []
  specialtySearch.value = ''
}

const saveService = async () => {
  try {
    // Map selectedDays -> customAvailability placeholder time ranges
    serviceForm.value.customAvailability = selectedDays.value.map((d) => {
      const idx = weekDays.indexOf(d)
      const dayOfWeek = d === 'Dimanche' ? 0 : idx + 1
      return { dayOfWeek, startTime: '08:00', endTime: '20:00', isActive: true }
    })
    // Attach derived domain into form data
    ;(serviceForm.value as ServiceFormData & { domain?: string }).domain = derivedDomain.value || ''
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
      // Create new service (allowed even if already have an active one)
      const newService = await supabaseCoachServicesApi.createService(serviceForm.value)
      coachServices.value.unshift(newService)
      console.log('✅ Service created successfully')
      if (isFreePlan.value) {
        // Deactivate previously active services (keep new one active)
        const previouslyActive = coachServices.value.filter(
          (s) => s.id !== newService.id && s.isActive,
        )
        for (const s of previouslyActive) {
          await supabaseCoachServicesApi.setServiceActive(s.id, false)
          s.isActive = false
        }
        // Ensure new service active (if DB default differs)
        if (!newService.isActive) {
          await supabaseCoachServicesApi.setServiceActive(newService.id, true)
          newService.isActive = true
        }
      }
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

// Toggle activation respecting plan limit
const toggleServiceActive = async (service: CoachService) => {
  try {
    if (!service.isActive) {
      // Activating a service
      if (isFreePlan.value) {
        // Need to deactivate others first
        const otherActive = coachServices.value.filter((s) => s.isActive && s.id !== service.id)
        if (otherActive.length >= 1) {
          // Auto-disable the other one(s) per spec
          for (const s of otherActive) {
            await supabaseCoachServicesApi.setServiceActive(s.id, false)
            s.isActive = false
          }
        }
      }
      // Ensure free plan doesn't exceed 1
      if (isFreePlan.value && activeServicesCount.value >= 1) {
        // Safety guard (should already be handled)
        alert("Vous ne pouvez avoir qu'un seul service actif avec le plan gratuit.")
        return
      }
      await supabaseCoachServicesApi.setServiceActive(service.id, true)
      service.isActive = true
    } else {
      // Deactivating is always allowed
      await supabaseCoachServicesApi.setServiceActive(service.id, false)
      service.isActive = false
    }
  } catch (e) {
    console.error('❌ Erreur changement statut service', e)
    alert('Erreur lors de la mise à jour du statut du service.')
  }
}

// Load services when component mounts
const loadCoachServices = async () => {
  try {
    isLoadingServices.value = true

    // Small delay to ensure skeleton is visible (can be removed in production)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const services = await supabaseCoachServicesApi.getCoachServices()
    coachServices.value = services
    console.log('✅ Loaded', services.length, 'services')
  } catch (error) {
    console.error('❌ Error loading services:', error)
  } finally {
    isLoadingServices.value = false
  }
}

onMounted(async () => {
  await loadCoachServices()

  // Debug: Log current coach and specialties
  console.log('🧑‍💼 Current coach:', authStore.coach)
  console.log('🎯 Coach specialties:', authStore.coach?.specialties || [])
  // If coach has no specialties, open 'Autres catégories' by default
  showOtherCategories.value = coachSpecialties.value.length === 0
  updateViewport()
  window.addEventListener('resize', updateViewport)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewport)
})
</script>
<style>
/* Remove number input spinners (Chrome, Safari, Edge) */
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* Firefox */
.no-spinner[type='number'] {
  -moz-appearance: textfield;
}
/* Hide native select arrow */
.no-native-arrow {
  background-image: none !important;
  padding-right: 1.5rem; /* ensure space for custom arrow */
}
/* Safari & older browsers override */
.no-native-arrow::-ms-expand {
  display: none;
}
select.no-native-arrow {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
</style>

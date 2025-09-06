<template>
  <div class="min-h-screen bg-gray-50 py-12 sm:px-6 lg:px-8">
    <!-- Progress Bar -->
    <div class="max-w-5xl mx-auto mb-10">
      <div class="bg-white rounded-lg shadow px-4 py-6 md:px-8">
        <!-- Mobile compact indicator -->
        <div class="md:hidden text-sm text-gray-600 text-center mb-4">
          Étape <span class="font-semibold">{{ currentStep + 1 }}</span> / {{ steps.length }} ·
          <span class="font-medium">{{ steps[currentStep].title }}</span>
        </div>
        <!-- Desktop / Tablet full stepper (centered) -->
        <div class="hidden md:block relative">
          <!-- Background line -->
          <div class="absolute left-0 right-0 top-5 h-0.5 bg-gray-200"></div>
          <!-- Progress line -->
          <div
            class="absolute left-0 top-5 h-0.5 bg-blue-600 transition-all duration-300"
            :style="{ width: (currentStep / (steps.length - 1)) * 100 + '%' }"
          ></div>
          <div class="flex justify-between items-start w-full relative">
            <div
              v-for="(step, index) in steps"
              :key="step.id"
              class="flex flex-col items-center gap-1 w-20 md:w-24"
            >
              <div
                :class="[
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors duration-200',
                  currentStep > index
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : currentStep === index
                      ? 'bg-blue-50 border-blue-600 text-blue-600'
                      : 'bg-gray-100 border-gray-300 text-gray-400',
                ]"
              >
                {{ index + 1 }}
              </div>
              <div
                :class="[
                  'relative z-10 text-xs md:text-sm font-medium text-center leading-tight',
                  currentStep >= index ? 'text-gray-900' : 'text-gray-400',
                ]"
              >
                {{ step.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-lg shadow p-8">
        <!-- Global save status message -->
        <div
          v-if="saveStatus"
          :class="[
            'mb-6 px-4 py-3 rounded-md text-sm font-medium flex items-center gap-2',
            saveStatus.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200',
          ]"
        >
          <span>
            {{ saveStatus.message }}
          </span>
        </div>
        <!-- Step 0: Welcome / Intro (new) -->
        <div v-if="currentStep === 0">
          <div class="text-center space-y-6 relative">
            <!-- Radial transition overlay -->
            <div v-if="welcomeTransitionActive" class="fixed inset-0 z-40 pointer-events-none">
              <div class="welcome-radial absolute" :style="welcomeOverlayStyle"></div>
            </div>
            <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
              Bienvenue sur <span class="text-blue-600">Coachiles</span> 👋
            </h1>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Nous allons ensemble créer ton profil qui va te permettre de
              <span class="font-medium text-gray-800">trouver des clients qualifiés</span>, mettre
              en avant ton expertise et accélérer ton activité. <br />
              En quelques étapes simples, ton espace sera prêt et visible.
            </p>
            <div class="grid md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
              <div class="p-5 rounded-xl bg-white border shadow-sm flex flex-col gap-2">
                <span class="text-2xl">🚀</span>
                <h3 class="font-semibold text-gray-900 text-sm">Visibilité rapide</h3>
                <p class="text-xs text-gray-600 leading-snug">
                  Un profil complet inspire confiance et apparaît en priorité dans les recherches.
                </p>
              </div>
              <div class="p-5 rounded-xl bg-white border shadow-sm flex flex-col gap-2">
                <span class="text-2xl">🎯</span>
                <h3 class="font-semibold text-gray-900 text-sm">Clients pertinents</h3>
                <p class="text-xs text-gray-600 leading-snug">
                  Tes spécialités, diplômes et modalités aident les clients à te choisir plus vite.
                </p>
              </div>
              <div class="p-5 rounded-xl bg-white border shadow-sm flex flex-col gap-2">
                <span class="text-2xl">🛠️</span>
                <h3 class="font-semibold text-gray-900 text-sm">Contrôle total</h3>
                <p class="text-xs text-gray-600 leading-snug">
                  Tu peux tout modifier plus tard: rien n'est figé, avance à ton rythme.
                </p>
              </div>
            </div>
            <div
              class="max-w-xl mx-auto bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 flex items-start gap-3"
            >
              <span class="text-base">💡</span>
              <p>
                <span class="font-medium">Astuce:</span> Prépare une bio authentique et une belle
                photo: ce sont les deux premiers éléments que les clients remarquent.
              </p>
            </div>
            <div>
              <button
                ref="welcomeStartBtn"
                @click="playWelcomeTransition"
                :disabled="welcomeTransitionActive"
                class="relative px-10 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-medium rounded-md shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 overflow-hidden group transition-all duration-300"
              >
                <span class="relative z-10 flex items-center gap-2 tracking-wide">
                  <span class="text-sm uppercase font-semibold">Commencer</span>
                  <span class="group-hover:translate-x-1 transition-transform">➜</span>
                </span>
                <span
                  class="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Step 1: Basic Personal Information (updated) -->
        <div v-if="currentStep === 1">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Informations personnelles</h2>

          <form @submit.prevent="nextStep" class="space-y-8">
            <!-- Identity -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700"
                  >Prénom *</label
                >
                <input
                  id="firstName"
                  v-model="formData.firstName"
                  type="text"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-gray-900"
                />
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">Nom *</label>
                <input
                  id="lastName"
                  v-model="formData.lastName"
                  type="text"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-gray-900"
                />
              </div>
            </div>

            <!-- Demographics -->
            <div class="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div class="md:col-span-1">
                <label for="age" class="block text-sm font-medium text-gray-700">Âge *</label>
                <input
                  id="age"
                  v-model.number="formData.age"
                  type="number"
                  min="16"
                  max="100"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-gray-900 no-spinner"
                />
              </div>
              <div class="md:col-span-2">
                <label for="gender" class="block text-sm font-medium text-gray-700">Genre *</label>
                <select
                  id="gender"
                  v-model="formData.gender"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-gray-900"
                >
                  <option value="">Sélectionnez</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                </select>
              </div>
              <div class="md:col-span-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <div class="relative" ref="onboardingPhoneSelectorRef">
                  <div
                    class="flex items-center w-full border border-gray-300 rounded-md bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition"
                  >
                    <button
                      type="button"
                      @click="toggleOnboardingPhoneMenu"
                      class="flex items-center gap-1 h-10 px-2 focus:outline-none select-none"
                      aria-haspopup="listbox"
                      :aria-expanded="showOnboardingIndicativeMenu ? 'true' : 'false'"
                    >
                      <span class="text-base leading-none">{{
                        onboardingSelectedPhoneIndicative.flag
                      }}</span>
                      <svg
                        class="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    <span class="h-6 w-px bg-gray-200" aria-hidden="true"></span>
                    <span class="px-2 text-sm text-gray-700 min-w-[52px]">{{
                      onboardingSelectedPhoneIndicative.prefix
                    }}</span>
                    <input
                      v-model="formData.phone"
                      @input="handleOnboardingPhoneRawInput"
                      type="tel"
                      maxlength="10"
                      pattern="[0-9]*"
                      class="flex-1 min-w-0 h-10 px-2 border-0 focus:ring-0 focus:outline-none bg-transparent text-sm truncate dark:text-gray-900"
                      placeholder="601020304"
                      inputmode="numeric"
                      autocomplete="tel"
                    />
                  </div>
                  <ul
                    v-if="showOnboardingIndicativeMenu"
                    :class="[
                      'absolute z-40 w-60 bg-white border border-gray-200 rounded-md shadow-lg overflow-auto focus:outline-none py-1',
                      onboardingOpenAbove ? 'bottom-full mb-1 max-h-72' : 'top-full mt-1 max-h-72',
                    ]"
                    role="listbox"
                  >
                    <li v-for="opt in phoneIndicatives" :key="opt.code" role="option">
                      <button
                        type="button"
                        @click="selectOnboardingPhoneIndicative(opt.code)"
                        class="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-blue-50 dark:text-gray-900"
                        :class="
                          opt.code === onboardingPhoneIndicative ? 'bg-blue-100 font-medium' : ''
                        "
                      >
                        <span class="text-base leading-none">{{ opt.flag }}</span>
                        <span>{{ opt.prefix }}</span>
                        <span class="text-xs text-gray-500 ml-auto">{{ opt.label }}</span>
                      </button>
                    </li>
                  </ul>
                </div>
                <p class="mt-1 text-[11px] text-gray-500">
                  Format international enregistré automatiquement.
                </p>
              </div>
            </div>

            <!-- Location (standardized) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="territory" class="block text-sm font-medium text-gray-700"
                  >Territoire *</label
                >
                <select
                  id="territory"
                  v-model="formData.territory"
                  required
                  @change="formData.city = ''"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-gray-900"
                >
                  <option value="">Sélectionnez</option>
                  <option v-for="(label, key) in COUNTRIES" :key="key" :value="key">
                    {{ label }}
                  </option>
                </select>
              </div>
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700">Ville *</label>
                <select
                  id="city"
                  v-model="formData.city"
                  :disabled="!formData.territory"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:text-gray-900"
                >
                  <option value="">Sélectionnez</option>
                  <option
                    v-for="cityName in formData.territory
                      ? getCitiesByCountry(formData.territory)
                      : []"
                    :key="cityName"
                    :value="cityName"
                  >
                    {{ cityName }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Languages (dropdown + chips) -->
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 mb-2">Langues parlées *</label>
              <!-- Selected chips -->
              <div class="flex flex-wrap gap-2 mb-3" v-if="formData.languages.length">
                <span
                  v-for="lang in formData.languages"
                  :key="lang"
                  class="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-2 py-1 text-xs font-medium gap-1"
                >
                  {{ lang }}
                  <button
                    type="button"
                    aria-label="Retirer"
                    class="hover:text-blue-900"
                    @click="removeLanguage(lang)"
                  >
                    ×
                  </button>
                </span>
              </div>
              <!-- Trigger -->
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="languageMenuOpen = !languageMenuOpen"
                  class="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-900"
                >
                  {{ languageMenuOpen ? 'Fermer' : 'Ajouter des langues' }}
                  <span v-if="!formData.languages.length" class="ml-2 text-gray-400">(min 1)</span>
                </button>
                <span class="text-xs text-gray-500" v-if="formData.languages.length"
                  >{{ formData.languages.length }} sélectionnée(s)</span
                >
              </div>
              <!-- Dropdown -->
              <div
                v-if="languageMenuOpen"
                class="absolute z-20 mt-2 w-full max-w-sm bg-white border border-gray-200 rounded-md shadow-lg p-3"
              >
                <div class="max-h-56 overflow-y-auto pr-1 space-y-1">
                  <button
                    v-for="lang in languageOptions"
                    :key="lang"
                    type="button"
                    @click="toggleLanguage(lang)"
                    :class="[
                      'w-full flex items-center justify-between px-2 py-1.5 rounded text-sm',
                      formData.languages.includes(lang)
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700',
                    ]"
                  >
                    <span class="truncate">{{ lang }}</span>
                    <span
                      v-if="formData.languages.includes(lang)"
                      class="ml-2 text-[10px] font-semibold uppercase tracking-wide"
                      >OK</span
                    >
                  </button>
                </div>
                <div class="flex justify-between items-center mt-3 border-t pt-2">
                  <button
                    type="button"
                    class="text-xs text-red-600 hover:underline"
                    @click="formData.languages = []"
                  >
                    Effacer
                  </button>
                  <button
                    type="button"
                    class="text-xs text-blue-600 hover:underline"
                    @click="languageMenuOpen = false"
                  >
                    Terminer
                  </button>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-2">Sélectionnez au moins une langue</p>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="
                  !formData.firstName ||
                  !formData.lastName ||
                  !formData.gender ||
                  !formData.age ||
                  !formData.city ||
                  !formData.territory ||
                  formData.languages.length === 0
                "
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </form>
        </div>

        <!-- Step 2: Activité du coach (module identique à l'éditeur de profil) -->
        <div v-if="currentStep === 2">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Activité de coach</h2>
          <p class="text-sm text-gray-600 mb-6">
            Partage ton <span class="font-medium">expérience</span>, tes
            <span class="font-medium">diplômes</span> et tes
            <span class="font-medium">spécialités</span> 🎯 Ces infos aident les clients à
            comprendre en un coup d'œil ce qui te rend unique.
          </p>
          <form @submit.prevent="nextStep" class="space-y-8">
            <!-- Row 3: Specialties -->
            <div class="p-4 border rounded-lg bg-gray-50 space-y-4" ref="specialtyDropdownEl">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-gray-800">Spécialités</h3>
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="s in activity.specialties"
                  :key="s"
                  class="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium"
                >
                  {{ s }}
                  <button
                    type="button"
                    class="ml-1 text-green-600 hover:text-green-900"
                    @click="removeSpecialty(s)"
                  >
                    ×
                  </button>
                </span>
              </div>
              <div class="space-y-2">
                <div class="relative">
                  <input
                    v-model="activity.specialtySearch"
                    type="text"
                    placeholder="Rechercher / ajouter une spécialité..."
                    class="w-full rounded-md border-gray-300 text-sm pr-8 dark:text-gray-900"
                    @focus="openSpecialtyDropdown()"
                    @input="activity.showSpecialtyDropdown = true"
                  />
                  <button
                    v-if="activity.specialtySearch"
                    type="button"
                    class="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
                    @click="activity.specialtySearch = ''"
                  >
                    ×
                  </button>
                  <div
                    v-if="activity.showSpecialtyDropdown"
                    class="absolute z-20 mt-1 w-full max-h-72 overflow-auto rounded-md border bg-white shadow-lg text-sm"
                  >
                    <div v-if="!hasSpecialtyMatches" class="px-3 py-2 text-xs text-gray-500 italic">
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
                          class="w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between"
                          :disabled="activity.specialties.includes(opt)"
                          @click="selectSpecialty(opt)"
                        >
                          <span
                            :class="[
                              'text-xs',
                              activity.specialties.includes(opt)
                                ? 'text-gray-400 line-through'
                                : 'text-gray-700',
                            ]"
                            >{{ opt }}</span
                          >
                          <span
                            v-if="activity.specialties.includes(opt)"
                            class="text-[10px] text-gray-400"
                            >Ajouté</span
                          >
                        </button>
                      </div>
                    </template>
                  </div>
                </div>
                <p class="text-[11px] text-gray-500">
                  Recherchez par nom ou faites défiler les catégories, puis cliquez pour ajouter.
                </p>
              </div>
            </div>

            <!-- Row 1: Experience + Work Experiences -->
            <div class="grid gap-6 md:grid-cols-4">
              <div class="p-4 border rounded-lg bg-gray-50 space-y-3">
                <label class="block text-sm font-medium text-gray-700">Années d'expérience</label>
                <input
                  type="number"
                  v-model.number="activity.experienceYears"
                  class="w-full rounded-md border-gray-300 dark:text-gray-900 no-spinner"
                  min="0"
                  max="60"
                />
              </div>
              <div class="md:col-span-3 p-4 border rounded-lg bg-gray-50 space-y-3">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium text-gray-700">Expériences professionnelles</h3>
                </div>
                <div v-if="activity.workExperiences.length" class="flex flex-col gap-2">
                  <div
                    v-for="(exp, idx) in activity.workExperiences"
                    :key="idx"
                    class="group flex items-start justify-between gap-3 rounded-md bg-white border px-3 py-2 text-xs"
                  >
                    <span class="flex-1 leading-snug">{{ exp }}</span>
                    <button
                      type="button"
                      @click="removeWorkExperience(idx)"
                      class="opacity-60 hover:opacity-100 text-gray-500"
                    >
                      <XMarkIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div class="flex gap-2">
                  <input
                    v-model="activity.newWorkExp"
                    placeholder="Ajouter (ex: Coach en salle...)"
                    class="flex-1 rounded-md border-gray-300 text-xs dark:text-gray-900"
                  />
                  <button
                    type="button"
                    @click="addWorkExperience"
                    class="px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                  >
                    +
                  </button>
                </div>
                <p class="text-[11px] text-gray-500">
                  Ajoutez des expériences clés (emplois, missions freelances...).
                </p>
              </div>
            </div>

            <!-- Row 2: Diplomas -->
            <div class="p-4 border rounded-lg bg-gray-50 space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-gray-800">Diplômes & Certifications</h3>
              </div>
              <div class="space-y-2">
                <select
                  v-model="activity.selectedDiplomaOption"
                  @change="addDiplomaFromSelect"
                  class="w-full rounded-md border-gray-300 text-sm dark:text-gray-900"
                >
                  <option value="">Ajouter un diplôme</option>
                  <option
                    v-for="opt in ALL_CERTIFICATIONS"
                    :key="opt"
                    :value="opt"
                    :disabled="activity.diplomas.some((d) => d.title === opt)"
                  >
                    {{ opt }}
                  </option>
                </select>
                <div class="flex gap-2">
                  <input
                    v-model="activity.newDiplomaTitle"
                    placeholder="Diplôme personnalisé"
                    class="flex-1 rounded-md border-gray-300 text-sm dark:text-gray-900"
                  />
                  <button
                    type="button"
                    @click="addDiploma"
                    class="px-3 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                  >
                    Ajouter
                  </button>
                </div>
                <p class="text-[11px] text-gray-500">
                  Téléversez votre diplome pour accélérer la validation.
                </p>
              </div>
              <ul class="space-y-3 max-h-72 overflow-auto pr-1" v-if="activity.diplomas.length">
                <li
                  v-for="d in activity.diplomas"
                  :key="d.id"
                  class="bg-white border rounded-lg p-3 flex flex-col gap-2"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex flex-col">
                      <span class="text-sm font-medium text-gray-800">{{ d.title }}</span>
                      <span
                        class="text-[11px] mt-0.5 inline-flex items-center rounded-full px-2 py-0.5"
                        :class="{
                          'bg-yellow-100 text-yellow-700': d.status === 'pending',
                          'bg-green-100 text-green-700': d.status === 'approved',
                          'bg-red-100 text-red-700': d.status === 'rejected',
                        }"
                        >{{ d.status }}</span
                      >
                    </div>
                    <button @click="removeDiploma(d.id)" class="text-gray-400 hover:text-red-500">
                      <XMarkIcon class="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <label
                      class="inline-flex items-center gap-1.5 text-xs cursor-pointer text-blue-600 hover:underline"
                    >
                      <ArrowUpTrayIcon class="w-4 h-4" />
                      <span>Importer une photo de votre diplome</span>
                      <input
                        type="file"
                        class="hidden"
                        accept="image/*,.pdf"
                        @change="
                          (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) uploadDiplomaProof(d, file)
                          }
                        "
                      />
                    </label>
                    <div
                      v-if="d.proofFilePath || d.proofFileName"
                      class="mt-1 text-[11px] text-gray-600 flex items-center gap-2"
                    >
                      <span
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200"
                        v-if="d._uploadSuccess"
                      >
                        Fichier chargé:
                        <strong class="font-medium truncate max-w-[140px]">{{
                          d.proofFileName
                        }}</strong>
                      </span>
                      <span
                        v-else
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200"
                      >
                        Fichier:
                        <strong class="font-medium truncate max-w-[140px]">{{
                          d.proofFileName
                        }}</strong>
                      </span>
                    </div>
                  </div>
                  <div
                    v-if="d.status === 'rejected' && d.rejectionNote"
                    class="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded p-2"
                  >
                    Raison du refus: {{ d.rejectionNote }}
                  </div>
                </li>
              </ul>
              <div v-else class="text-xs text-gray-500 italic">Aucun diplôme ajouté.</div>
            </div>

            <div class="flex justify-between">
              <button
                type="button"
                @click="prevStep"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Suivant
              </button>
            </div>
          </form>
        </div>

        <!-- Step 3: Profil -->
        <div v-if="currentStep === 3">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Profil</h2>
          <p class="text-sm text-gray-600 mb-6">
            Ajoute une <span class="font-medium">photo pro</span>, une
            <span class="font-medium">bio engageante</span> et tes
            <span class="font-medium">liens</span>. C'est ta vitrine: montre ta personnalité et ce
            qui donne envie de réserver avec toi ✨
          </p>
          <form @submit.prevent="nextStep" class="space-y-8">
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">Photo de profil</label>
              <!-- <p class="text-xs text-gray-500">
                Une photo claire et professionnelle augmente la confiance des clients.
              </p> -->
              <div class="flex items-center gap-4">
                <div
                  class="w-24 h-24 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden"
                >
                  <img
                    v-if="avatarPreviewUrl"
                    :src="avatarPreviewUrl"
                    alt="Aperçu"
                    class="w-full h-full object-cover"
                  />
                  <img
                    v-else
                    :src="formData.gender === 'female' ? femaleDefaultAvatar : maleDefaultAvatar"
                    alt="Avatar par défaut"
                    class="w-full h-full object-contain p-2"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label
                    class="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50 dark:text-gray-900"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="handleAvatarSelect"
                    />
                    <span>{{ pendingAvatarFile ? 'Changer' : 'Importer une photo' }}</span>
                  </label>
                  <button
                    v-if="pendingAvatarFile"
                    type="button"
                    class="text-xs text-red-600 hover:underline self-start"
                    @click="removeAvatar"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Biographie *</label>
              <textarea
                v-model="formData.bio"
                rows="5"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-gray-900"
                placeholder="Présentez votre parcours, vos valeurs, votre manière de coacher..."
              ></textarea>
              <p class="text-[11px] text-gray-500 mt-1">
                Astuce: racontez une histoire qui montre votre impact.
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">Site web</label>
                <input
                  v-model="formData.website"
                  type="url"
                  placeholder="https://"
                  class="mt-1 w-full rounded-md border-gray-300 dark:text-gray-900"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Instagram</label>
                <input
                  v-model="formData.instagram"
                  type="url"
                  placeholder="https://instagram.com/votreprofil"
                  class="mt-1 w-full rounded-md border-gray-300 dark:text-gray-900"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Facebook</label>
                <input
                  v-model="formData.facebook"
                  type="url"
                  placeholder="https://facebook.com/votreprofil"
                  class="mt-1 w-full rounded-md border-gray-300 dark:text-gray-900"
                />
              </div>
            </div>
            <div class="flex justify-between">
              <button
                type="button"
                @click="prevStep"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                type="submit"
                :disabled="!formData.bio"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </form>
        </div>

        <!-- Step 4: Modalités générales -->
        <div v-if="currentStep === 4">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Modalités générales</h2>
          <p class="text-sm text-gray-600 mb-6">
            Indique comment tu <span class="font-medium">fonctionnes au quotidien</span>: jours
            habituels, lieux possibles (domicile, visio, extérieur), cours d'essai et règles
            d'annulation. Ces infos rassurent et évitent les malentendus avant même la première
            séance ✅
          </p>
          <form @submit.prevent="nextStep" class="space-y-8">
            <!-- Hourly Rate -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Tarif horaire * (€ / h)</label
              >
              <input
                type="number"
                min="0"
                step="1"
                v-model.number="formData.basePrice"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-gray-900 no-spinner"
                placeholder="Ex: 50"
              />
              <p class="text-[11px] text-gray-500 mt-1">
                Indique ton tarif de base pour une séance individuelle d'une heure. Tu peux le
                modifier plus tard.
              </p>
            </div>
            <!-- Availability Days -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Jours habituels de disponibilité</label
              >
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="d in weekDays"
                  :key="d"
                  type="button"
                  @click="
                    modalities.availabilityDays = modalities.availabilityDays.includes(d)
                      ? modalities.availabilityDays.filter((x: string) => x !== d)
                      : [...modalities.availabilityDays, d]
                  "
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium border transition',
                    modalities.availabilityDays.includes(d)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400',
                  ]"
                >
                  {{ d.slice(0, 3) }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="p-4 border rounded-lg bg-gray-50 space-y-3">
                <h3 class="text-sm font-semibold text-gray-800">Où se déroulent vos cours ?</h3>
                <div class="space-y-2">
                  <div>
                    <label class="inline-flex items-center gap-2 text-sm dark:text-gray-900">
                      <input
                        type="checkbox"
                        v-model="modalities.canBeAtHome"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      À domicile
                    </label>
                    <textarea
                      v-if="modalities.canBeAtHome"
                      v-model="modalities.atHomeDetails"
                      rows="2"
                      class="mt-2 w-full rounded-md border-gray-300 text-xs focus:ring-blue-500 focus:border-blue-500 dark:text-gray-900"
                      placeholder="Précisions: zone d'intervention, frais, matériel..."
                    ></textarea>
                  </div>
                  <div>
                    <label class="inline-flex items-center gap-2 text-sm dark:text-gray-900">
                      <input
                        type="checkbox"
                        v-model="modalities.canBeOnline"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Visio
                    </label>
                    <textarea
                      v-if="modalities.canBeOnline"
                      v-model="modalities.onlineDetails"
                      rows="2"
                      class="mt-2 w-full rounded-md border-gray-300 text-xs focus:ring-blue-500 focus:border-blue-500 dark:text-gray-900"
                      placeholder="Plateforme, prérequis techniques..."
                    ></textarea>
                  </div>
                  <div>
                    <label class="inline-flex items-center gap-2 text-sm dark:text-gray-900">
                      <input
                        type="checkbox"
                        v-model="modalities.canBeInPublicSpaces"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Espaces publics / extérieur
                    </label>
                  </div>
                </div>
              </div>
              <div class="p-4 border rounded-lg bg-gray-50 space-y-3">
                <h3 class="text-sm font-semibold text-gray-800">Cours d'essai</h3>
                <label class="flex items-center gap-2 text-sm dark:text-gray-900">
                  <input
                    type="checkbox"
                    v-model="modalities.hasFreeTrial"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Proposer un cours d'essai gratuit
                </label>
                <textarea
                  v-if="modalities.hasFreeTrial"
                  v-model="modalities.freeTrialModalities"
                  rows="3"
                  placeholder="Décrivez les conditions du cours d'essai (durée, contenu...)"
                  class="w-full rounded-md border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 dark:text-gray-900"
                ></textarea>
              </div>
            </div>

            <div class="p-4 border rounded-lg bg-gray-50 space-y-3">
              <h3 class="text-sm font-semibold text-gray-800">Politique d'annulation</h3>
              <textarea
                v-model="modalities.cancellationPolicy"
                rows="3"
                class="w-full rounded-md border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 dark:text-gray-900"
              ></textarea>
              <p class="text-[11px] text-gray-500">
                Expliquez les conditions d'annulation (ex: 24h avant sinon facturé).
              </p>
            </div>

            <div class="flex justify-between">
              <button
                type="button"
                @click="prevStep"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                type="submit"
                :disabled="formData.basePrice === null"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </form>
        </div>

        <!-- Step 5: Services (Enhanced) -->
        <div v-if="currentStep === 5">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Services proposés</h2>
          <p class="text-sm text-gray-600 mb-6">
            Ici tu crées des <span class="font-medium">offres/produits</span> spécifiques et
            détaillés, que les clients pourront réserver (titre, format, durée, prix). Tu peux en
            ajouter autant que tu veux, maintenant ou passer et revenir plus tard dans ton espace
            personnel💡
          </p>
          <div class="space-y-6">
            <div class="flex space-x-4">
              <button
                type="button"
                @click="wantsToAddServices = true"
                :class="[
                  'flex-1 p-4 border-2 rounded-lg text-center',
                  wantsToAddServices
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400',
                ]"
              >
                <div class="text-lg font-medium dark:text-gray-900">Oui, ajouter des services</div>
                <div class="text-sm text-gray-600 mt-1">Créez des offres personnalisées</div>
              </button>

              <button
                type="button"
                @click="wantsToAddServices = false"
                :class="[
                  'flex-1 p-4 border-2 rounded-lg text-center',
                  !wantsToAddServices
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400',
                ]"
              >
                <div class="text-lg font-medium dark:text-gray-900">Non, plus tard</div>
                <div class="text-sm text-gray-600 mt-1">Je compléterai mon profil plus tard</div>
              </button>
            </div>

            <div class="flex justify-between">
              <button
                type="button"
                @click="prevStep"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                type="button"
                @click="completeOnboarding"
                :disabled="loading"
                class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {{ loading ? 'Finalisation...' : 'Terminer' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="mt-6 rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-700">{{ error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { XMarkIcon, ArrowUpTrayIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/utils/supabase'
import { COUNTRIES, getCitiesByCountry, type CountryType } from '@/constants/locations'
import {
  LANGUAGE_OPTIONS,
  getAllCertifications,
  SPECIALTY_OPTIONS,
  type SpecialtyGroup,
} from '@/constants/coachOptions'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const currentStep = ref(0)
const wantsToAddServices = ref(false)
// Incremental save related state
const coachId = ref<string | null>(null)
const saving = ref(false)
const saveStatus = ref<{ step: number; message: string; type: 'success' | 'error' } | null>(null)

const steps = [
  { id: 'welcome', title: 'Bienvenue' },
  { id: 'basic', title: 'Informations' },
  { id: 'activity', title: 'Activité' },
  { id: 'profile', title: 'Profil' },
  { id: 'modalities', title: 'Modalités' },
  { id: 'services', title: 'Services' },
]

// Activity module state (mirrors CoachProfileEditor)
interface DiplomaEntry {
  id: string
  title: string
  status: 'pending' | 'approved' | 'rejected'
  proofFileName?: string
  proofFilePath?: string
  proofFileUrl?: string
  rejectionNote?: string
  _uploadSuccess?: boolean
}

const ALL_CERTIFICATIONS = getAllCertifications()
// Specialty search & grouped filtering
const activity = ref({
  experienceYears: null as number | null,
  workExperiences: [] as string[],
  newWorkExp: '',
  diplomas: [] as DiplomaEntry[],
  newDiplomaTitle: '',
  selectedDiplomaOption: '',
  specialties: [] as string[],
  specialtySearch: '',
  showSpecialtyDropdown: false,
})

const filteredSpecialtyGroups = computed<SpecialtyGroup[]>(() => {
  const term = activity.value.specialtySearch.trim().toLowerCase()
  if (!term) return SPECIALTY_OPTIONS
  return SPECIALTY_OPTIONS.map((g) => {
    const categoryMatches = g.category.toLowerCase().includes(term)
    return {
      category: g.category,
      specialties: categoryMatches
        ? g.specialties.slice()
        : g.specialties.filter((s) => s.toLowerCase().includes(term)),
    }
  }).filter((g) => g.specialties.length > 0)
})
const hasSpecialtyMatches = computed(() =>
  filteredSpecialtyGroups.value.some((g) => g.specialties.length > 0),
)
const specialtyDropdownEl = ref<HTMLElement | null>(null)
function openSpecialtyDropdown() {
  activity.value.showSpecialtyDropdown = true
}
function selectSpecialty(opt: string) {
  if (!activity.value.specialties.includes(opt)) activity.value.specialties.push(opt)
  activity.value.specialtySearch = ''
  activity.value.showSpecialtyDropdown = false
}
function removeSpecialty(opt: string) {
  const i = activity.value.specialties.indexOf(opt)
  if (i >= 0) activity.value.specialties.splice(i, 1)
}

function addWorkExperience() {
  const v = activity.value.newWorkExp.trim()
  if (!v) return
  activity.value.workExperiences.push(v)
  activity.value.newWorkExp = ''
}
function removeWorkExperience(idx: number) {
  activity.value.workExperiences.splice(idx, 1)
}

function addDiplomaFromSelect() {
  const title = activity.value.selectedDiplomaOption.trim()
  if (!title) return
  if (activity.value.diplomas.some((d) => d.title === title)) {
    activity.value.selectedDiplomaOption = ''
    return
  }
  activity.value.diplomas.push({ id: crypto.randomUUID(), title, status: 'pending' })
  activity.value.selectedDiplomaOption = ''
}
function addDiploma() {
  const title = activity.value.newDiplomaTitle.trim()
  if (!title) return
  activity.value.diplomas.push({ id: crypto.randomUUID(), title, status: 'pending' })
  activity.value.newDiplomaTitle = ''
}
function removeDiploma(id: string) {
  const i = activity.value.diplomas.findIndex((d) => d.id === id)
  if (i > -1) activity.value.diplomas.splice(i, 1)
}
async function uploadDiplomaProof(d: DiplomaEntry, file: File) {
  const bucket = 'diploma-proofs'
  const cleanName = file.name.replace(/[^\w.\-]/g, '_')
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData?.user?.id
  if (!userId) {
    alert('Vous devez être connecté pour téléverser un diplôme.')
    return
  }
  const path = `${userId}/${Date.now()}_${cleanName}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (!error) {
    d.proofFileName = file.name
    d.proofFilePath = path
    d.status = 'pending'
    d._uploadSuccess = true
    window.setTimeout(() => {
      d._uploadSuccess = false
    }, 6000)
    return
  }
  alert("Erreur lors de l'upload: " + error.message)
}

// Form data for multiple services
const formData = ref({
  firstName: '',
  lastName: '',
  phone: '',
  age: null as number | null,
  gender: '',
  territory: '' as '' | CountryType,
  city: '',
  languages: [] as string[],
  basePrice: null as number | null,
  bio: '',
  website: '',
  instagram: '',
  facebook: '',
})

// Phone indicative selector (borrowed from RequestModal design)
const phoneIndicatives = [
  { code: 'mq', prefix: '+596', flag: '🇲🇶', label: 'Martinique' },
  { code: 'gp', prefix: '+590', flag: '🇬🇵', label: 'Guadeloupe' },
  { code: 'fr', prefix: '+33', flag: '🇫🇷', label: 'France' },
  { code: 'gf', prefix: '+594', flag: '🇬🇫', label: 'Guyane' },
]
type PhoneIndicativeCode = (typeof phoneIndicatives)[number]['code']
const onboardingPhoneIndicative = ref<PhoneIndicativeCode>('mq')
const showOnboardingIndicativeMenu = ref(false)
const onboardingPhoneSelectorRef = ref<HTMLElement | null>(null)
const onboardingOpenAbove = ref(false)
const onboardingSelectedPhoneIndicative = computed(
  () =>
    phoneIndicatives.find((p) => p.code === onboardingPhoneIndicative.value) || phoneIndicatives[0],
)
function toggleOnboardingPhoneMenu() {
  showOnboardingIndicativeMenu.value = !showOnboardingIndicativeMenu.value
  if (showOnboardingIndicativeMenu.value) {
    const el = onboardingPhoneSelectorRef.value
    if (el) {
      const rect = el.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const estimatedHeight = 240
      onboardingOpenAbove.value = spaceBelow < estimatedHeight && spaceAbove > spaceBelow
    }
  }
}
function selectOnboardingPhoneIndicative(code: PhoneIndicativeCode) {
  onboardingPhoneIndicative.value = code
  showOnboardingIndicativeMenu.value = false
}
function buildInternationalPhoneOnboarding(raw: string) {
  const indicative = phoneIndicatives.find((p) => p.code === onboardingPhoneIndicative.value)
  const digits = (raw || '').replace(/[^0-9]/g, '')
  if (!indicative) return raw
  const normalized = digits.replace(/^0+/, '')
  return `${indicative.prefix}${normalized}`
}
function handleOnboardingPhoneClickOutside(e: MouseEvent) {
  if (!showOnboardingIndicativeMenu.value) return
  const el = onboardingPhoneSelectorRef.value
  if (el && !el.contains(e.target as Node)) showOnboardingIndicativeMenu.value = false
}
if (typeof window !== 'undefined')
  window.addEventListener('click', handleOnboardingPhoneClickOutside)

function handleOnboardingPhoneRawInput(e: Event) {
  const target = e.target as HTMLInputElement
  const digits = target.value.replace(/\D+/g, '').slice(0, 10)
  formData.value.phone = digits
}

// Language selection options (reuse shared constant)
const languageOptions = LANGUAGE_OPTIONS

// UI state for languages dropdown
const languageMenuOpen = ref(false)

const toggleLanguage = (lang: string) => {
  const idx = formData.value.languages.indexOf(lang)
  if (idx === -1) {
    formData.value.languages.push(lang)
  } else {
    formData.value.languages.splice(idx, 1)
  }
}

const removeLanguage = (lang: string) => {
  const idx = formData.value.languages.indexOf(lang)
  if (idx !== -1) {
    formData.value.languages.splice(idx, 1)
  }
}

// Avatar staging & helpers
import { supabaseCoachApi } from '@/services/supabaseCoachApi'
const pendingAvatarFile = ref<File | null>(null)
const avatarPreviewUrl = ref<string | null>(null)
function handleAvatarSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  pendingAvatarFile.value = file
  if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
  avatarPreviewUrl.value = URL.createObjectURL(file)
}
function removeAvatar() {
  if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
  avatarPreviewUrl.value = null
  pendingAvatarFile.value = null
}
function normalizeUrl(v: string) {
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) return v
  return `https://${v}`
}

// Gender-based default avatar assets
import maleDefaultAvatar from '@/assets/avatars/default_male.svg'
import femaleDefaultAvatar from '@/assets/avatars/default_female.svg'

// Service creation removed from onboarding; handled on /coach/services after redirect.

// General modalities (mirrors account editor general course settings)
// Modalities state (onboarding subset of full account editor)
const modalities = ref({
  availabilityDays: [] as string[],
  canBeAtHome: true,
  atHomeDetails: '',
  canBeOnline: true,
  onlineDetails: '',
  canBeInPublicSpaces: true,
  hasFreeTrial: false,
  freeTrialModalities: '',
  cancellationPolicy: "Annulation possible jusqu'à 24h avant le cours",
})

// French week day labels (same as account editor)
const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

// Service management methods
// (Previously had addService/removeService/resetServiceForm helpers.)

onMounted(async () => {
  if (!authStore.user) {
    router.push('/auth')
    return
  }
  if (authStore.loading) {
    const wait = () =>
      new Promise<void>((resolve) => {
        const int = setInterval(() => {
          if (!authStore.loading) {
            clearInterval(int)
            resolve()
          }
        }, 40)
      })
    await wait()
  }
  // Try loading existing draft (inactive) or active profile
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('coaches')
      .select('*')
      .eq('email', authStore.user.email)
      .single()
    if (!fetchErr && existing) {
      coachId.value = existing.id
      // If onboarding already done, redirect
      if (existing.onboarding_done === true) {
        router.push('/coach/profile')
        return
      }
      // Always show welcome step again on reload while onboarding isn't completed
      currentStep.value = 0
      // Ensure account stays active during onboarding (retro-fit older rows)
      if (existing.is_active === false) {
        await supabase.from('coaches').update({ is_active: true }).eq('id', existing.id)
      }
      // Populate draft values
      if (existing.profile_personal) {
        formData.value.firstName = existing.profile_personal.firstName || ''
        formData.value.lastName = existing.profile_personal.lastName || ''
        formData.value.age = existing.profile_personal.age || null
        formData.value.gender = existing.profile_personal.gender || ''
        formData.value.territory = existing.profile_personal.territory || ''
        formData.value.city = existing.profile_personal.city || ''
        formData.value.languages = existing.profile_personal.languages || []
      }
      // Pricing
      if (typeof existing.hourly_rate === 'number') {
        formData.value.basePrice = Number(existing.hourly_rate)
      }
      if (existing.profile_activity) {
        activity.value.experienceYears = existing.profile_activity.experienceYears || null
        activity.value.workExperiences = existing.profile_activity.workExperiences || []
        activity.value.diplomas = existing.profile_activity.diplomas || []
        activity.value.specialties = existing.profile_activity.specialties || []
      }
      if (existing.profile_contact) {
        formData.value.phone = existing.profile_contact.phone || ''
        formData.value.website = existing.profile_contact.website || ''
        formData.value.instagram = existing.profile_contact.instagram || ''
        formData.value.facebook = existing.profile_contact.facebook || ''
      }
      formData.value.bio = existing.bio || ''
      if (existing.modalities) {
        modalities.value.availabilityDays = existing.modalities.availabilityDays || []
        if (existing.modalities.locations) {
          modalities.value.canBeAtHome = existing.modalities.locations.atHome?.enabled ?? true
          modalities.value.atHomeDetails = existing.modalities.locations.atHome?.details || ''
          modalities.value.canBeOnline = existing.modalities.locations.visio?.enabled ?? true
          modalities.value.onlineDetails = existing.modalities.locations.visio?.details || ''
          modalities.value.canBeInPublicSpaces =
            existing.modalities.locations.publicSpaces?.enabled ?? true
        }
        if (existing.modalities.freeTrial) {
          modalities.value.hasFreeTrial = existing.modalities.freeTrial.enabled
          modalities.value.freeTrialModalities = existing.modalities.freeTrial.details || ''
        }
        modalities.value.cancellationPolicy =
          existing.modalities.cancellationPolicy || modalities.value.cancellationPolicy
      }
      console.log('📝 Draft coach profile loaded')
    }
  } catch (e) {
    console.warn('Impossible de charger un brouillon existant', e)
  }
})

const nextStep = async () => {
  // Step 0 is purely informational; no save
  if (currentStep.value === 0) {
    currentStep.value = 1
    return
  }
  await saveCurrentStep(true)
}

const prevStep = () => {
  // Can't go back before welcome
  if (currentStep.value > 0) currentStep.value--
}

// Welcome radial transition
const welcomeTransitionActive = ref(false)
const welcomeOverlayStyle = ref<Record<string, string>>({})
const welcomeStartBtn = ref<HTMLButtonElement | null>(null)
function playWelcomeTransition() {
  if (welcomeTransitionActive.value) return
  const btn = welcomeStartBtn.value
  const vw = window.innerWidth
  const vh = window.innerHeight
  let x = vw / 2
  let y = vh / 2
  if (btn) {
    const r = btn.getBoundingClientRect()
    x = r.left + r.width / 2
    y = r.top + r.height / 2
  }
  const distTL = Math.hypot(x, y)
  const distTR = Math.hypot(vw - x, y)
  const distBL = Math.hypot(x, vh - y)
  const distBR = Math.hypot(vw - x, vh - y)
  const maxR = Math.max(distTL, distTR, distBL, distBR)
  welcomeOverlayStyle.value = {
    '--ox': x + 'px',
    '--oy': y + 'px',
    '--r': maxR + 'px',
  }
  welcomeTransitionActive.value = true
  setTimeout(() => {
    if (currentStep.value === 0) currentStep.value = 1
  }, 520)
  setTimeout(() => {
    welcomeTransitionActive.value = false
  }, 1100)
}

function setSaveStatus(step: number, message: string, type: 'success' | 'error') {
  saveStatus.value = { step, message, type }
  setTimeout(
    () => {
      if (saveStatus.value && saveStatus.value.step === step) saveStatus.value = null
    },
    type === 'success' ? 3500 : 6000,
  )
}

async function saveCurrentStep(advance: boolean) {
  const step = currentStep.value
  if (!authStore.user) {
    setSaveStatus(step, 'Utilisateur non connecté', 'error')
    return
  }
  saving.value = true
  try {
    if (step === 1) {
      // Insert or update draft
      const payload: Record<string, unknown> = {
        email: authStore.user.email,
        first_name: formData.value.firstName || null,
        last_name: formData.value.lastName || null,
        phone: formData.value.phone
          ? buildInternationalPhoneOnboarding(formData.value.phone)
          : null,
        bio: formData.value.bio || null,
        languages: formData.value.languages,
        specialties: [],
        certifications: [],
        experience_years: null,
        hourly_rate: formData.value.basePrice,
        locations: formData.value.territory ? [COUNTRIES[formData.value.territory]] : [],
        profile_personal: {
          firstName: formData.value.firstName,
          lastName: formData.value.lastName,
          age: formData.value.age,
          gender: formData.value.gender,
          territory: formData.value.territory,
          city: formData.value.city,
          languages: formData.value.languages,
        },
        // Keep account active so coach isn't shown as "désactivé" while onboarding
        is_active: true,
        onboarding_done: false,
      }
      if (!coachId.value) {
        const { data, error } = await supabase.from('coaches').insert([payload]).select().single()
        if (error) throw error
        coachId.value = data.id
      } else {
        const { error } = await supabase.from('coaches').update(payload).eq('id', coachId.value)
        if (error) throw error
      }
    } else if (coachId.value && step === 2) {
      const { error } = await supabase
        .from('coaches')
        .update({
          experience_years: activity.value.experienceYears,
          specialties: activity.value.specialties,
          certifications: activity.value.diplomas.map((d) => d.title),
          profile_activity: {
            experienceYears: activity.value.experienceYears,
            workExperiences: activity.value.workExperiences,
            diplomas: activity.value.diplomas,
            specialties: activity.value.specialties,
          },
          onboarding_done: false,
        })
        .eq('id', coachId.value)
      if (error) throw error
    } else if (coachId.value && step === 3) {
      const { error } = await supabase
        .from('coaches')
        .update({
          bio: formData.value.bio || null,
          phone: formData.value.phone
            ? buildInternationalPhoneOnboarding(formData.value.phone)
            : null,
          profile_contact: {
            email: authStore.user.email,
            phone: formData.value.phone
              ? buildInternationalPhoneOnboarding(formData.value.phone)
              : null,
            website: normalizeUrl(formData.value.website),
            instagram: normalizeUrl(formData.value.instagram),
            facebook: normalizeUrl(formData.value.facebook),
          },
          onboarding_done: false,
        })
        .eq('id', coachId.value)
      if (error) throw error
      // Upload avatar immediately if chosen
      if (pendingAvatarFile.value) {
        try {
          await supabaseCoachApi.uploadAvatar(coachId.value, pendingAvatarFile.value)
        } catch (e) {
          console.warn('Avatar upload failed (non bloquant)', e)
        }
      }
    } else if (coachId.value && step === 4) {
      const { error } = await supabase
        .from('coaches')
        .update({
          modalities: {
            availabilityDays: modalities.value.availabilityDays,
            locations: {
              atHome: {
                enabled: modalities.value.canBeAtHome,
                details: modalities.value.atHomeDetails,
              },
              visio: {
                enabled: modalities.value.canBeOnline,
                details: modalities.value.onlineDetails,
              },
              publicSpaces: { enabled: modalities.value.canBeInPublicSpaces, details: '' },
              gym: { enabled: false, details: '' },
            },
            freeTrial: {
              enabled: modalities.value.hasFreeTrial,
              details: modalities.value.freeTrialModalities,
            },
            cancellationPolicy: modalities.value.cancellationPolicy,
          },
          availability: modalities.value.availabilityDays,
          hourly_rate: formData.value.basePrice,
          onboarding_done: false,
        })
        .eq('id', coachId.value)
      if (error) throw error
    }
    setSaveStatus(step, `Étape ${step + 1} enregistrée ✅`, 'success')
    if (advance && currentStep.value < steps.length - 1) currentStep.value++
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'inconnue'
    console.error('Erreur sauvegarde', e)
    setSaveStatus(step, 'Erreur enregistrement: ' + msg, 'error')
  } finally {
    saving.value = false
  }
}

const completeOnboarding = async () => {
  if (!authStore.user) {
    error.value = 'Vous devez être connecté'
    return
  }

  loading.value = true
  error.value = ''

  try {
    console.log('🔄 Finalisation du profil coach')
    // Ensure previous step data saved (modalities already saved at step 3). Save step 4 doesn't alter coach row directly.
    if (!coachId.value) {
      // If user jumped somehow, save step 0 first
      await saveCurrentStep(false)
    }
    // Skip inline service creation during onboarding; redirect after activation instead.
    // Activate profile
    if (coachId.value) {
      const { error: activateErr } = await supabase
        .from('coaches')
        .update({ is_active: true, onboarding_done: true })
        .eq('id', coachId.value)
      if (activateErr) console.warn('Erreur activation/onboarding profil', activateErr)
    }
    await authStore.loadCoachProfile()
    // Redirect choice: if coach wants to add services -> services page; else dashboard
    if (wantsToAddServices.value) {
      router.push('/coach/services')
    } else {
      router.push('/coach/dashboard')
    }
  } catch (err: unknown) {
    console.error('❌ Error completing onboarding:', err)
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Radial expansion animation */
@keyframes welcome-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  55% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.welcome-radial {
  left: var(--ox);
  top: var(--oy);
  width: calc(var(--r) * 2);
  height: calc(var(--r) * 2);
  border-radius: 9999px;
  background: radial-gradient(circle at center, #2563eb 0%, #1d4ed8 35%, #1e3a8a 70%, #1e3a8a 100%);
  transform-origin: center;
  transform: translate(-50%, -50%) scale(0);
  animation: welcome-expand 1.05s ease forwards;
  box-shadow:
    0 0 40px -5px rgba(37, 99, 235, 0.6),
    0 0 80px -10px rgba(59, 130, 246, 0.5);
  filter: saturate(1.15);
}
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
</style>

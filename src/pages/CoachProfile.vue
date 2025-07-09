<script setup lang="ts">
import { ref } from 'vue'
import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Switch,
} from '@headlessui/vue'
import {
  UserCircleIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  MapPinIcon,
  VideoCameraIcon,
  HomeIcon,
  BuildingOfficeIcon,
  SunIcon,
} from '@heroicons/vue/24/outline'

// const userStore = useUserStore() // Commented out for now

// Matching preferences
const onlineAvailable = ref(true)
const onlineTools = ref<string[]>(['Zoom', 'Google Meet'])
const clientHomeAvailable = ref(true)
const coachHomeAvailable = ref(false)
const gymAvailable = ref(true)
const outdoorAvailable = ref(true)
const weeklyAvailability = ref({
  lundi: { morning: false, afternoon: true, evening: false },
  mardi: { morning: false, afternoon: true, evening: true },
  mercredi: { morning: false, afternoon: true, evening: false },
  jeudi: { morning: false, afternoon: true, evening: true },
  vendredi: { morning: false, afternoon: true, evening: false },
  samedi: { morning: true, afternoon: true, evening: false },
  dimanche: { morning: false, afternoon: false, evening: false },
})

// Tabs
const tabs = [
  { id: 'profile', name: 'Informations personnelles', icon: UserCircleIcon },
  { id: 'services', name: 'Services proposés', icon: BriefcaseIcon },
  { id: 'credentials', name: 'Diplômes & certifications', icon: AcademicCapIcon },
  { id: 'matching', name: 'Préférences de coaching', icon: MapPinIcon },
]

const toggleOnlineTool = (tool: string) => {
  const index = onlineTools.value.indexOf(tool)
  if (index > -1) {
    onlineTools.value.splice(index, 1)
  } else {
    onlineTools.value.push(tool)
  }
}

const saveMatchingPreferences = () => {
  console.log('Saving matching preferences:', {
    onlineAvailable: onlineAvailable.value,
    onlineTools: onlineTools.value,
    clientHomeAvailable: clientHomeAvailable.value,
    coachHomeAvailable: coachHomeAvailable.value,
    gymAvailable: gymAvailable.value,
    outdoorAvailable: outdoorAvailable.value,
    weeklyAvailability: weeklyAvailability.value,
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">Profil coach</h1>
        <p class="mt-2 text-sm text-gray-600">
          Gérez vos informations personnelles, services et préférences de coaching
        </p>
      </div>

      <!-- Tabs -->
      <TabGroup>
        <TabList class="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab
            v-for="tab in tabs"
            :key="tab.id"
            v-slot="{ selected }"
            class="w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            :class="[
              selected
                ? 'bg-white text-blue-700 shadow'
                : 'text-blue-700 hover:bg-white/[0.12] hover:text-blue-800',
            ]"
          >
            <div class="flex items-center justify-center space-x-2">
              <component :is="tab.icon" class="h-5 w-5" />
              <span class="hidden sm:inline">{{ tab.name }}</span>
              <span class="sm:hidden">{{
                tab.name.split(' ')[0]
              }}</span>
            </div>
          </Tab>
        </TabList>

        <TabPanels class="mt-8">
          <!-- Profile Tab -->
          <TabPanel class="space-y-8">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <h2 class="text-lg font-medium text-gray-900">Informations personnelles</h2>
                <p class="mt-1 text-sm text-gray-600">
                  Gérez vos informations de base, photo de profil et description.
                </p>
                <div class="mt-6">
                  <p class="text-sm text-gray-500">
                    Cette section contiendra le formulaire de profil personnel : nom, prénom, ville, email, téléphone, photo, description professionnelle, etc.
                  </p>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- Services Tab -->
          <TabPanel class="space-y-8">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <h2 class="text-lg font-medium text-gray-900">Services proposés</h2>
                <p class="mt-1 text-sm text-gray-600">
                  Configurez les services que vous proposez à vos clients.
                </p>
                <div class="mt-6">
                  <p class="text-sm text-gray-500">
                    Cette section contiendra la gestion des services : recherche avec fuzzy search, sélection par catégorie, validation des diplômes requis, etc.
                  </p>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- Credentials Tab -->
          <TabPanel class="space-y-8">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <h2 class="text-lg font-medium text-gray-900">Diplômes & certifications</h2>
                <p class="mt-1 text-sm text-gray-600">
                  Ajoutez et gérez vos diplômes et certifications.
                </p>
                <div class="mt-6">
                  <p class="text-sm text-gray-500">
                    Cette section contiendra la gestion des diplômes : ajout, upload de fichiers, statut de validation, suppression, etc.
                  </p>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- Matching Preferences Tab -->
          <TabPanel class="space-y-8">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <div class="max-w-2xl">
                  <h2 class="text-base font-semibold leading-7 text-gray-900">
                    Préférences de coaching
                  </h2>
                  <p class="mt-1 text-sm leading-6 text-gray-600">
                    Configurez vos préférences pour le matching avec les clients. Ces informations ne sont pas visibles publiquement.
                  </p>

                  <!-- Meeting Types -->
                  <div class="mt-8">
                    <h3 class="text-sm font-medium text-gray-900 mb-4">Types de rendez-vous</h3>
                    <div class="space-y-4">
                      <!-- Online -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <VideoCameraIcon class="h-5 w-5 text-gray-400" />
                          <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">Coaching en ligne</h4>
                            <p class="text-sm text-gray-500">Séances par vidéoconférence</p>
                          </div>
                        </div>
                        <Switch
                          v-model="onlineAvailable"
                          :class="onlineAvailable ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                          <span
                            :class="onlineAvailable ? 'translate-x-5' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          />
                        </Switch>
                      </div>

                      <!-- Online Tools -->
                      <div v-if="onlineAvailable" class="ml-8 space-y-2">
                        <p class="text-sm text-gray-600">Outils préférés :</p>
                        <div class="flex flex-wrap gap-2">
                          <button
                            v-for="tool in ['Zoom', 'Google Meet', 'Microsoft Teams', 'Skype', 'WhatsApp']"
                            :key="tool"
                            @click="toggleOnlineTool(tool)"
                            :class="onlineTools.includes(tool) ? 'bg-blue-100 text-blue-800 ring-blue-600/20' : 'bg-gray-100 text-gray-800 ring-gray-600/20'"
                            class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset hover:bg-opacity-80"
                          >
                            {{ tool }}
                          </button>
                        </div>
                      </div>

                      <!-- Client's Home -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <HomeIcon class="h-5 w-5 text-gray-400" />
                          <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">Chez le client</h4>
                            <p class="text-sm text-gray-500">Vous vous déplacez chez le client</p>
                          </div>
                        </div>
                        <Switch
                          v-model="clientHomeAvailable"
                          :class="clientHomeAvailable ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                          <span
                            :class="clientHomeAvailable ? 'translate-x-5' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          />
                        </Switch>
                      </div>

                      <!-- Coach's Home -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <HomeIcon class="h-5 w-5 text-gray-400" />
                          <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">Chez vous</h4>
                            <p class="text-sm text-gray-500">Le client vient chez vous</p>
                          </div>
                        </div>
                        <Switch
                          v-model="coachHomeAvailable"
                          :class="coachHomeAvailable ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                          <span
                            :class="coachHomeAvailable ? 'translate-x-5' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          />
                        </Switch>
                      </div>

                      <!-- Gym -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <BuildingOfficeIcon class="h-5 w-5 text-gray-400" />
                          <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">En salle de sport</h4>
                            <p class="text-sm text-gray-500">Dans votre salle ou celle du client</p>
                          </div>
                        </div>
                        <Switch
                          v-model="gymAvailable"
                          :class="gymAvailable ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                          <span
                            :class="gymAvailable ? 'translate-x-5' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          />
                        </Switch>
                      </div>

                      <!-- Outdoor -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <SunIcon class="h-5 w-5 text-gray-400" />
                          <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">En extérieur</h4>
                            <p class="text-sm text-gray-500">Parcs, plages, terrains de sport...</p>
                          </div>
                        </div>
                        <Switch
                          v-model="outdoorAvailable"
                          :class="outdoorAvailable ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                          <span
                            :class="outdoorAvailable ? 'translate-x-5' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          />
                        </Switch>
                      </div>
                    </div>
                  </div>

                  <!-- Weekly Availability -->
                  <div class="mt-8">
                    <h3 class="text-sm font-medium text-gray-900 mb-4">Disponibilités hebdomadaires</h3>
                    <div class="grid grid-cols-1 gap-4">
                      <div
                        v-for="(day, dayKey) in weeklyAvailability"
                        :key="dayKey"
                        class="flex items-center justify-between border border-gray-200 rounded-lg p-3"
                      >
                        <div class="flex-1">
                          <h4 class="text-sm font-medium text-gray-900 capitalize">{{ dayKey }}</h4>
                        </div>
                        <div class="flex space-x-6">
                          <label class="flex items-center">
                            <input
                              v-model="day.morning"
                              type="checkbox"
                              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span class="ml-2 text-sm text-gray-700">Matin</span>
                          </label>
                          <label class="flex items-center">
                            <input
                              v-model="day.afternoon"
                              type="checkbox"
                              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span class="ml-2 text-sm text-gray-700">Après-midi</span>
                          </label>
                          <label class="flex items-center">
                            <input
                              v-model="day.evening"
                              type="checkbox"
                              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span class="ml-2 text-sm text-gray-700">Soir</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-6 flex items-center justify-end gap-x-6">
                    <button
                      @click="saveMatchingPreferences"
                      type="button"
                      class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Sauvegarder les préférences
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  </div>
</template>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">Profil coach</h1>
        <p class="mt-2 text-sm text-gray-600">
          Gérez vos informations personnelles, services et préférences de coaching
        </p>
      </div>

      <!-- Tabs -->
      <TabGroup>
        <TabList class="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab
            v-for="tab in tabs"
            :key="tab.id"
            v-slot="{ selected }"
            class="w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            :class="[
              selected
                ? 'bg-white text-blue-700 shadow'
                : 'text-blue-700 hover:bg-white/[0.12] hover:text-blue-800',
            ]"
          >
            <div class="flex items-center justify-center space-x-2">
              <component :is="tab.icon" class="h-5 w-5" />
              <span class="hidden sm:inline">{{ tab.name }}</span>
              <span class="sm:hidden">{{
                tab.name.split(' ')[0]
              }}</span>
            </div>
          </Tab>
        </TabList>

        <TabPanels class="mt-8">
          <!-- Profile Tab -->
          <TabPanel class="space-y-8">
            <!-- Profile content would go here - keeping it brief for now -->
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <h2 class="text-lg font-medium text-gray-900">Informations personnelles</h2>
                <p class="mt-1 text-sm text-gray-600">
                  Gérez vos informations de base, photo de profil et description.
                </p>
                <!-- Add profile form here -->
              </div>
            </div>
          </TabPanel>

          <!-- Services Tab -->
          <TabPanel class="space-y-8">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <h2 class="text-lg font-medium text-gray-900">Services proposés</h2>
                <p class="mt-1 text-sm text-gray-600">
                  Configurez les services que vous proposez à vos clients.
                </p>
                <!-- Add services management here -->
              </div>
            </div>
          </TabPanel>

          <!-- Credentials Tab -->
          <TabPanel class="space-y-8">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <h2 class="text-lg font-medium text-gray-900">Diplômes & certifications</h2>
                <p class="mt-1 text-sm text-gray-600">
                  Ajoutez et gérez vos diplômes et certifications.
                </p>
                <!-- Add diploma management here -->
              </div>
            </div>
          </TabPanel>

          <!-- Matching Preferences Tab -->
          <TabPanel class="space-y-8">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <div class="max-w-2xl">
                  <h2 class="text-base font-semibold leading-7 text-gray-900">
                    Préférences de coaching
                  </h2>
                  <p class="mt-1 text-sm leading-6 text-gray-600">
                    Configurez vos préférences pour le matching avec les clients. Ces informations ne sont pas visibles publiquement.
                  </p>

                  <!-- Meeting Types -->
                  <div class="mt-8">
                    <h3 class="text-sm font-medium text-gray-900 mb-4">Types de rendez-vous</h3>
                    <div class="space-y-4">
                      <!-- Online -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <VideoCameraIcon class="h-5 w-5 text-gray-400" />
                          <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">Coaching en ligne</h4>
                            <p class="text-sm text-gray-500">Séances par vidéoconférence</p>
                          </div>
                        </div>
                        <Switch
                          v-model="onlineAvailable"
                          :class="onlineAvailable ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                          <span
                            :class="onlineAvailable ? 'translate-x-5' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          />
                        </Switch>
                      </div>

                      <!-- Online Tools -->
                      <div v-if="onlineAvailable" class="ml-8 space-y-2">
                        <p class="text-sm text-gray-600">Outils préférés :</p>
                        <div class="flex flex-wrap gap-2">
                          <button
                            v-for="tool in ['Zoom', 'Google Meet', 'Microsoft Teams', 'Skype', 'WhatsApp']"
                            :key="tool"
                            @click="toggleOnlineTool(tool)"
                            :class="onlineTools.includes(tool) ? 'bg-blue-100 text-blue-800 ring-blue-600/20' : 'bg-gray-100 text-gray-800 ring-gray-600/20'"
                            class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset hover:bg-opacity-80"
                          >
                            {{ tool }}
                          </button>
                        </div>
                      </div>

                      <!-- Client's Home -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <HomeIcon class="h-5 w-5 text-gray-400" />
                          <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">Chez le client</h4>
                            <p class="text-sm text-gray-500">Vous vous déplacez chez le client</p>
                          </div>
                        </div>
                        <Switch
                          v-model="clientHomeAvailable"
                          :class="clientHomeAvailable ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                          <span
                            :class="clientHomeAvailable ? 'translate-x-5' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          />
                        </Switch>
                      </div>

                      <!-- Coach's Home -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <HomeIcon class="h-5 w-5 text-gray-400" />
                          <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">Chez vous</h4>
                            <p class="text-sm text-gray-500">Le client vient chez vous</p>
                          </div>
                        </div>
                        <Switch
                          v-model="coachHomeAvailable"
                          :class="coachHomeAvailable ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                          <span
                            :class="coachHomeAvailable ? 'translate-x-5' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          />
                        </Switch>
                      </div>

                      <!-- Gym -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <BuildingOfficeIcon class="h-5 w-5 text-gray-400" />
                          <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">En salle de sport</h4>
                            <p class="text-sm text-gray-500">Dans votre salle ou celle du client</p>
                          </div>
                        </div>
                        <Switch
                          v-model="gymAvailable"
                          :class="gymAvailable ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                          <span
                            :class="gymAvailable ? 'translate-x-5' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          />
                        </Switch>
                      </div>

                      <!-- Outdoor -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <SunIcon class="h-5 w-5 text-gray-400" />
                          <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">En extérieur</h4>
                            <p class="text-sm text-gray-500">Parcs, plages, terrains de sport...</p>
                          </div>
                        </div>
                        <Switch
                          v-model="outdoorAvailable"
                          :class="outdoorAvailable ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                          <span
                            :class="outdoorAvailable ? 'translate-x-5' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          />
                        </Switch>
                      </div>
                    </div>
                  </div>

                  <!-- Weekly Availability -->
                  <div class="mt-8">
                    <h3 class="text-sm font-medium text-gray-900 mb-4">Disponibilités hebdomadaires</h3>
                    <div class="grid grid-cols-1 gap-4">
                      <div
                        v-for="(day, dayKey) in weeklyAvailability"
                        :key="dayKey"
                        class="flex items-center justify-between border border-gray-200 rounded-lg p-3"
                      >
                        <div class="flex-1">
                          <h4 class="text-sm font-medium text-gray-900 capitalize">{{ dayKey }}</h4>
                        </div>
                        <div class="flex space-x-6">
                          <label class="flex items-center">
                            <input
                              v-model="day.morning"
                              type="checkbox"
                              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span class="ml-2 text-sm text-gray-700">Matin</span>
                          </label>
                          <label class="flex items-center">
                            <input
                              v-model="day.afternoon"
                              type="checkbox"
                              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span class="ml-2 text-sm text-gray-700">Après-midi</span>
                          </label>
                          <label class="flex items-center">
                            <input
                              v-model="day.evening"
                              type="checkbox"
                              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span class="ml-2 text-sm text-gray-700">Soir</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-6 flex items-center justify-end gap-x-6">
                    <button
                      @click="saveMatchingPreferences"
                      type="button"
                      class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Sauvegarder les préférences
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  </div>
</template>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-blue-50">
    <!-- Header -->
    <header
      ref="headerRef"
      class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-sm z-40 transition-all duration-300"
      :class="isCondensedHeader ? 'shadow-md' : 'shadow-sm'"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          class="flex justify-between items-center transition-all duration-300"
          :class="isCondensedHeader ? 'py-2' : 'py-4'"
        >
          <!-- Logo -->
          <div class="flex items-center">
            <h1
              class="font-black text-transparent bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text tracking-tight transition-all duration-300"
              :class="isCondensedHeader ? 'text-2xl' : 'text-3xl md:text-4xl'"
            >
              Coachiles
            </h1>
          </div>
          <!-- Become Coach Button -->
          <router-link
            to="/auth"
            class="bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-full font-bold hover:shadow-lg transition-all duration-300"
            :class="isCondensedHeader ? 'px-4 py-2 text-sm' : 'px-6 py-3'"
          >
            Espace Coach
          </router-link>
        </div>
      </div>
    </header>

    <!-- Spacer for fixed header -->
    <div aria-hidden="true" :style="{ height: headerHeight + 'px' }"></div>

    <!-- Hero Section -->
    <div class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <!-- Main Title -->
      <div class="text-center mb-12">
        <h1 class="text-6xl md:text-7xl font-black text-gray-900 mb-4 tracking-tight">
          Trouvez le coach
          <span class="text-transparent bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text">
            parfait
          </span>
        </h1>
        <p class="text-xl text-gray-600 font-medium">
          Atteignez vos objectifs avec les meilleurs coachs des Antilles
        </p>
      </div>

      <!-- Compact Search + Country Chips Row -->
      <div class="max-w-3xl mx-auto mb-12">
        <div class="flex flex-wrap gap-3 justify-center items-center">
          <!-- Expanding Search Control -->
          <div ref="searchContainerRef" class="relative">
            <div
              :class="[
                'group flex items-center border-2 rounded-full bg-white shadow-sm transition-all duration-300 overflow-hidden',
                isSearchOpen
                  ? 'w-full md:w-72 px-3 py-2 border-orange-300'
                  : 'w-12 h-12 justify-center border-gray-200 hover:border-orange-300 cursor-pointer',
              ]"
              @click="handleSearchWrapperClick"
            >
              <!-- Icon -->
              <svg
                class="h-5 w-5 text-gray-500 flex-shrink-0 transition-colors duration-300 group-hover:text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <!-- Selected specialty chip -->
              <span
                v-if="isSearchOpen && selectedSpecialty"
                class="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium"
                @click.stop
              >
                {{ selectedSpecialty }}
                <button
                  type="button"
                  class="ml-1 hover:text-orange-900"
                  aria-label="Retirer la spécialité"
                  @click.stop="removeSelectedSpecialtyChip"
                >
                  ✕
                </button>
              </span>
              <!-- Input (appears only when open) -->
              <input
                v-if="isSearchOpen && !selectedSpecialty"
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                inputmode="search"
                placeholder="Filtrer les spécialités..."
                class="ml-3 flex-1 bg-transparent outline-none text-base md:text-sm font-medium placeholder-gray-400"
                @keydown.esc.stop.prevent="closeSearch"
                @click.stop="openDropdownFromInput"
                @focus="openDropdownFromInput"
              />
              <!-- Close button inside when open -->
              <button
                v-if="isSearchOpen && !selectedSpecialty && searchQuery"
                @click.stop="clearSearchQuery"
                class="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
                aria-label="Effacer"
              >
                ✕
              </button>
            </div>
            <!-- Dropdown Panel -->
            <transition name="fade">
              <div
                v-if="isSearchOpen && showDropdown"
                class="absolute left-0 mt-2 w-80 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-3 z-50"
                @click.stop
              >
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >Spécialités ({{ filteredSpecialtyCount }})</span
                  >
                  <button
                    type="button"
                    class="text-xs text-orange-600 hover:underline"
                    v-if="selectedSpecialty"
                    @click="clearSelectedSpecialty"
                  >
                    Réinitialiser
                  </button>
                </div>
                <ul class="space-y-3">
                  <li v-for="group in groupedFilteredSpecialties" :key="group.category">
                    <p
                      class="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1 px-1"
                    >
                      {{ group.category }}
                    </p>
                    <ul class="space-y-1">
                      <li
                        v-for="spec in group.specialties"
                        :key="group.category + '-' + spec"
                        @click="selectSpecialtyFromDropdown(spec)"
                        :class="[
                          'px-3 py-2 rounded-xl text-sm flex items-center gap-2 cursor-pointer transition-colors',
                          selectedSpecialty === spec
                            ? 'bg-orange-100 text-orange-700 font-semibold'
                            : 'hover:bg-orange-50 text-gray-700',
                        ]"
                      >
                        <span class="flex-1">{{ spec }}</span>
                        <svg
                          v-if="selectedSpecialty === spec"
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 text-orange-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="3"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </li>
                    </ul>
                  </li>
                  <li
                    v-if="groupedFilteredSpecialties.length === 0"
                    class="px-3 py-6 text-center text-xs text-gray-400"
                  >
                    Aucune spécialité trouvée
                  </li>
                </ul>
                <div class="mt-3 border-t pt-3">
                  <p class="text-[11px] leading-snug text-gray-400">
                    Tapez pour filtrer les spécialités ou sélectionnez-en une pour appliquer le
                    filtre.
                  </p>
                </div>
              </div>
            </transition>
          </div>

          <!-- Country Filter Chips -->
          <button
            v-for="c in countryChips"
            :key="c.code"
            type="button"
            @click="toggleCountry(c.code)"
            :class="[
              'px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold border-2 transition-all duration-200 flex items-center gap-2',
              selectedCountry === c.code
                ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white border-transparent shadow'
                : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:text-gray-900',
            ]"
          >
            <span class="text-base md:text-lg">{{ c.emoji }}</span>
            <span>{{ c.label }}</span>
          </button>
        </div>
      </div>

      <!-- Category Stickers Bar (dynamic based on coaches' actual specialties) -->
      <div class="mb-12" v-if="specialtyOptions.length">
        <h2 class="text-base md:text-lg font-bold text-gray-800 tracking-tight mb-1">
          Catégories populaires
        </h2>
        <div
          class="overflow-x-auto scrollbar-hide select-none"
          ref="specialtyScrollRef"
          @mousedown="onSpecialtyDragStart"
          @mousemove="onSpecialtyDragMove"
          @mouseup="onSpecialtyDragEnd"
          @mouseleave="onSpecialtyDragEnd"
          @touchstart.passive="onSpecialtyTouchStart"
          @touchmove.prevent="onSpecialtyTouchMove"
          @touchend="onSpecialtyDragEnd"
          :class="isSpecialtyDragging ? 'cursor-grabbing' : 'cursor-grab'"
        >
          <div class="flex space-x-3 md:space-x-4 w-max min-w-full pt-2 pb-3 md:pt-4 md:pb-4">
            <button
              @click="selectedSpecialty = ''"
              :class="[
                'flex-shrink-0 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-xs md:text-sm transition-all duration-200 transform hover:scale-105',
                selectedSpecialty === ''
                  ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300',
              ]"
            >
              🎯 Tous
            </button>
            <button
              v-for="spec in specialtyOptions"
              :key="spec.name"
              @click="onSpecialtyBarSelect(spec.name)"
              :class="[
                'flex-shrink-0 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-xs md:text-sm transition-all duration-200 transform hover:scale-105 whitespace-nowrap',
                selectedSpecialty === spec.name
                  ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300',
              ]"
              :title="spec.count + (spec.count > 1 ? ' coachs' : ' coach')"
            >
              {{ spec.emoji }} {{ spec.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Results Count -->
      <div class="flex justify-between items-center mb-8">
        <p class="text-sm md:text-lg text-gray-600 font-medium">
          <template v-if="isLoading && coaches.length === 0">
            <span class="animate-pulse bg-gray-200 rounded w-40 h-6 inline-block"></span>
          </template>
          <template v-else>
            {{ filteredCoaches.length }} coach{{ filteredCoaches.length > 1 ? 'es' : '' }}
            <template v-if="selectedSpecialty">en {{ selectedSpecialty }}</template>
            <template v-else>disponible{{ filteredCoaches.length > 1 ? 's' : '' }}</template>
            <template v-if="selectedCountry"> en {{ displayCountry }}</template>
          </template>
        </p>
        <div>
          <button
            type="button"
            @click="clearFilters"
            :disabled="!hasActiveFilters"
            class="dark:text-gray-900 px-4 py-2 rounded-full text-xs md:text-sm font-medium border-2 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            :class="
              hasActiveFilters
                ? 'border-orange-300 text-orange-600 hover:bg-orange-50'
                : 'border-gray-200 text-gray-400'
            "
            aria-label="Réinitialiser les filtres"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Coach Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-5 sm:px-0">
        <!-- Loading skeleton cards -->
        <template v-if="isLoading && coaches.length === 0">
          <div
            v-for="n in 9"
            :key="'skeleton-' + n"
            class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
          >
            <div class="animate-pulse">
              <!-- Photo skeleton -->
              <div
                class="aspect-square bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 shimmer"
              ></div>
              <!-- Content skeleton -->
              <div class="p-5">
                <!-- Rating skeleton -->
                <div class="flex items-center mb-3">
                  <div class="flex items-center space-x-1">
                    <div class="w-4 h-4 bg-gray-200 rounded shimmer"></div>
                    <div class="h-3 bg-gray-200 rounded w-8 shimmer"></div>
                  </div>
                  <div class="mx-2 w-1 h-1 bg-gray-200 rounded-full"></div>
                  <div class="h-3 bg-gray-200 rounded w-16 shimmer"></div>
                </div>
                <!-- Description skeleton -->
                <div class="mb-4">
                  <div class="h-3 bg-gray-200 rounded w-full mb-2 shimmer"></div>
                  <div class="h-3 bg-gray-200 rounded w-4/5 shimmer"></div>
                </div>
                <!-- Specialties skeleton -->
                <div class="mb-4 flex gap-1">
                  <div class="h-6 bg-gray-200 rounded-full w-20 shimmer"></div>
                  <div class="h-6 bg-gray-200 rounded-full w-16 shimmer"></div>
                </div>
                <!-- Price and button skeleton -->
                <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                  <div>
                    <div class="h-5 bg-gray-200 rounded w-12 mb-1 shimmer"></div>
                    <div class="h-3 bg-gray-200 rounded w-16 shimmer"></div>
                  </div>
                  <div class="h-8 bg-gray-200 rounded-full w-20 shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Coach cards -->
        <template v-if="coaches.length > 0">
          <div
            v-for="coach in filteredCoaches"
            :key="coach.id"
            class="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-102 group border border-transparent hover:border-orange-200"
            @click="navigateToCoachProfile(coach)"
          >
            <!-- Photo with overlay -->
            <div class="relative aspect-square overflow-hidden rounded-t-2xl">
              <img
                :src="coach.photo || '/default-avatar.png'"
                :alt="`${coach.firstName}`"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                :srcset="
                  coach.photo
                    ? `${coach.photo.replace(/(_profile|_highres)?\.jpg$/, '_thumb.jpg')} 150w, ${coach.photo.replace(/(_profile|_highres)?\.jpg$/, '_profile.jpg')} 400w, ${coach.photo.replace(/(_profile|_highres)?\.jpg$/, '_highres.jpg')} 900w`
                    : undefined
                "
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="lazy"
                decoding="async"
              />
              <!-- Dark gradient overlay -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
              ></div>

              <!-- Coach name and location overlay -->
              <div class="absolute bottom-4 right-4 text-right">
                <h3
                  class="text-lg font-bold text-white drop-shadow-lg group-hover:text-orange-200 transition-colors duration-300"
                >
                  {{ coach.firstName }}
                </h3>
                <p class="text-sm text-white/90 drop-shadow-md">{{ coach.location }}</p>
              </div>

              <!-- Availability badge -->
              <!-- <div class="absolute top-4 left-4">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  Disponible
                </span>
              </div> -->

              <!-- Certification badge (for coaches with active subscription) -->
              <div v-if="isCoachCertified(coach.id)" class="absolute top-4 right-4">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  title="Coach certifié Coachiles"
                >
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Certifié
                </span>
              </div>
            </div>

            <!-- Card content -->
            <div class="p-5">
              <!-- Rating and reviews (hidden if zero) -->
              <div v-if="(coachReviewCounts.get(coach.id) || 0) > 0" class="flex items-center mb-3">
                <div class="flex items-center">
                  <StarIcon class="w-4 h-4 text-yellow-400 fill-current" />
                  <span class="ml-1 text-sm font-semibold text-gray-900">{{ coach.rating }}</span>
                </div>
                <span class="mx-2 text-gray-300">•</span>
                <span class="text-sm text-gray-600"
                  >{{ coachReviewCounts.get(coach.id) || 0 }} avis</span
                >
              </div>

              <!-- Description -->
              <div class="mb-4">
                <p class="text-sm text-gray-700 line-clamp-2 leading-relaxed">{{ coach.bio }}</p>
              </div>

              <!-- Specialties -->
              <div class="mb-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="specialty in coach.specialties.slice(0, 2)"
                    :key="specialty"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                  >
                    {{ specialty }}
                  </span>
                  <span
                    v-if="coach.specialties.length > 2"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                  >
                    +{{ coach.specialties.length - 2 }}
                  </span>
                </div>
              </div>

              <!-- Price and contact -->
              <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                <div class="text-left">
                  <p class="text-lg font-bold text-gray-900">{{ coach?.hourlyRate }}€</p>
                  <p class="text-xs text-gray-500">de l'heure</p>
                </div>
                <button
                  @click.stop="navigateToCoachProfileWithContact(coach)"
                  class="bg-white border-2 border-orange-400 text-orange-600 px-4 py-2 rounded-full font-medium hover:bg-orange-50 hover:border-orange-500 hover:text-orange-700 transition-all duration-200 text-sm"
                >
                  Contacter
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore && coaches.length > 0" class="text-center mt-12">
        <button
          @click="loadMoreCoaches"
          :disabled="isLoading"
          class="bg-gradient-to-r from-orange-500 to-blue-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span v-if="isLoading" class="flex items-center">
            <svg
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Chargement...
          </span>
          <span v-else>Voir plus de coachs</span>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="filteredCoaches.length === 0 && !isLoading" class="text-center py-12">
        <p class="text-gray-500">Aucun coach trouvé avec ces critères.</p>
        <button @click="clearFilters" class="mt-4 text-indigo-600 hover:text-indigo-800 text-sm">
          Effacer les filtres
        </button>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import AppFooter from '@/components/AppFooter.vue'
import { useRouter, useRoute } from 'vue-router'
import { StarIcon } from '@heroicons/vue/24/solid'
import type { Coach } from '@/types/coach'
import { useCoachStore } from '@/stores/coach'
import { SPECIALTY_OPTIONS } from '@/constants/coachOptions'
import { supabase } from '@/utils/supabase'

// Router
const router = useRouter()
const route = useRoute()

// Coach Store
const coachStore = useCoachStore()

// State
// Header condensation & size
const isCondensedHeader = ref(false)
const headerRef = ref<HTMLElement | null>(null)
const headerHeight = ref(0)
const measureHeader = () => {
  if (headerRef.value) headerHeight.value = headerRef.value.offsetHeight
}

const coaches = ref<Coach[]>([])
const searchQuery = ref('')
// Compact expanding search UI state
const isSearchOpen = ref(false)
const showDropdown = ref(false)
const searchContainerRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
// Grouped specialty options (categories + specialties) for dropdown
// Helper: accent/diacritic-insensitive normalization
const normalizeStr = (str: string) =>
  str
    .normalize('NFD') // split accented characters
    .replace(/\p{Diacritic}/gu, '') // remove all diacritic marks (Unicode property class)
    .toLowerCase()

const groupedFilteredSpecialties = computed(() => {
  const raw = searchQuery.value.trim()
  const q = normalizeStr(raw)
  return SPECIALTY_OPTIONS.map((group) => {
    const specs = q
      ? group.specialties.filter((s) => normalizeStr(s).includes(q))
      : group.specialties.slice()
    return { category: group.category, specialties: specs }
  }).filter((g) => g.specialties.length > 0)
})
const filteredSpecialtyCount = computed(() =>
  groupedFilteredSpecialties.value.reduce((acc, g) => acc + g.specialties.length, 0),
)

const openSearch = () => {
  if (!isSearchOpen.value) {
    isSearchOpen.value = true
    nextTick(() => searchInputRef.value?.focus())
  }
}
const closeSearch = () => {
  isSearchOpen.value = false
}
const handleSearchWrapperClick = () => {
  if (!isSearchOpen.value) {
    openSearch()
    showDropdown.value = true
    return
  }
  // If already open and no dropdown (chip mode), reopen dropdown to change selection
  if (isSearchOpen.value && !showDropdown.value) {
    if (!selectedSpecialty.value) {
      showDropdown.value = true
      nextTick(() => searchInputRef.value?.focus())
    } else {
      // Click when chip present: open dropdown to change
      showDropdown.value = true
      // Show input by clearing selectedSpecialty? Keep specialty; allow selecting another directly
    }
  }
}
// Ensure dropdown shows when user clicks or focuses the input
const openDropdownFromInput = () => {
  if (!isSearchOpen.value) isSearchOpen.value = true
  showDropdown.value = true
}
const clearSearchQuery = () => {
  searchQuery.value = ''
  nextTick(() => searchInputRef.value?.focus())
}
const clearSelectedSpecialty = () => {
  selectedSpecialty.value = ''
  // Re-trigger search after clearing
  debouncedSearch(searchQuery.value, selectedSpecialty.value, sortBy.value)
  showDropdown.value = true
  nextTick(() => searchInputRef.value?.focus())
}
const removeSelectedSpecialtyChip = () => {
  clearSelectedSpecialty()
}
const selectSpecialtyFromDropdown = (spec: string) => {
  selectedSpecialty.value = spec
  searchQuery.value = '' // reset filter text
  showDropdown.value = false // keep bar open, hide dropdown
  debouncedSearch('', selectedSpecialty.value, sortBy.value)
}
// When selecting from the horizontal specialty bar: ensure search UI is open & chip shown
const onSpecialtyBarSelect = (spec: string) => {
  // Set chosen specialty
  selectedSpecialty.value = spec
  // Open the compact search bar if closed so chip appears inside
  if (!isSearchOpen.value) {
    isSearchOpen.value = true
  }
  // Hide text input (since chip mode) & dropdown
  showDropdown.value = false
  searchQuery.value = ''
  // Trigger backend refresh with new specialty
  debouncedSearch('', selectedSpecialty.value, sortBy.value)
}
// No commitSearch: typing doesn't trigger backend fetch; only selecting specialty does

// Click outside to close search (but keep country chips intact)
const onClickOutside = (e: MouseEvent) => {
  if (!isSearchOpen.value) return
  const target = e.target as HTMLElement
  if (searchContainerRef.value && !searchContainerRef.value.contains(target)) {
    if (showDropdown.value) {
      showDropdown.value = false
      return
    }
    // If no specialty selected, allow closing fully
    if (!selectedSpecialty.value) {
      closeSearch()
    }
  }
}
document.addEventListener('click', onClickOutside)
const selectedSpecialty = ref('')
// Country (territory) filter (single select for now)
const selectedCountry = ref<string>('')
// We only have 3 territories currently
const countryChips = [
  { code: 'martinique', label: 'Martinique', emoji: '🇲🇶' },
  { code: 'guadeloupe', label: 'Guadeloupe', emoji: '🇬🇵' },
  { code: 'guyane', label: 'Guyane', emoji: '🇬🇫' },
]
const toggleCountry = (code: string) => {
  selectedCountry.value = selectedCountry.value === code ? '' : code
}
const sortBy = ref('rating')
const isLoading = ref(false)
const searchDebounceTimer = ref<number | null>(null)
// Debug state removed
const coachSubscriptions = ref<Map<string, boolean>>(new Map()) // Track which coaches have active subscriptions
const coachReviewCounts = ref<Map<string, number>>(new Map()) // Approved review counts per coach
// Drag scroll state for specialty bar
const specialtyScrollRef = ref<HTMLElement | null>(null)
const isSpecialtyDragging = ref(false)
let specialtyDragStartX = 0
let specialtyDragScrollLeft = 0

const onSpecialtyDragStart = (e: MouseEvent) => {
  if (!specialtyScrollRef.value) return
  isSpecialtyDragging.value = true
  specialtyDragStartX = e.pageX - specialtyScrollRef.value.offsetLeft
  specialtyDragScrollLeft = specialtyScrollRef.value.scrollLeft
}
const onSpecialtyDragMove = (e: MouseEvent) => {
  if (!isSpecialtyDragging.value || !specialtyScrollRef.value) return
  const x = e.pageX - specialtyScrollRef.value.offsetLeft
  const walk = x - specialtyDragStartX
  specialtyScrollRef.value.scrollLeft = specialtyDragScrollLeft - walk
}
const onSpecialtyDragEnd = () => {
  isSpecialtyDragging.value = false
}
const onSpecialtyTouchStart = (e: TouchEvent) => {
  if (!specialtyScrollRef.value) return
  isSpecialtyDragging.value = true
  specialtyDragStartX = e.touches[0].pageX - specialtyScrollRef.value.offsetLeft
  specialtyDragScrollLeft = specialtyScrollRef.value.scrollLeft
}
const onSpecialtyTouchMove = (e: TouchEvent) => {
  if (!isSpecialtyDragging.value || !specialtyScrollRef.value) return
  const x = e.touches[0].pageX - specialtyScrollRef.value.offsetLeft
  const walk = x - specialtyDragStartX
  specialtyScrollRef.value.scrollLeft = specialtyDragScrollLeft - walk
}
// Global specialty frequencies among all active coaches
const globalSpecialtyFrequency = ref<{ name: string; count: number }[]>([])

// Pagination for database approach
const currentPage = ref(1)
const pageSize = ref(12)
const totalCoaches = ref(0)
const hasMore = ref(true)

// Coach categories with emojis
// Emoji mapping for known specialties (fallback star)
const specialtyEmojiMap: Record<string, string> = {
  Fitness: '💪',
  Musculation: '🏋️',
  Yoga: '🧘',
  Méditation: '🧠',
  Nutrition: '🥗',
  'Perte de poids': '⚖️',
  'Remise en forme': '🎯',
  Relaxation: '😌',
  'Bien-être': '✨',
  'Course à pied': '🏃',
  'Préparation physique': '🏆',
}

// Dynamic specialty options derived from all active coaches (stable, independent of current filter)
const specialtyOptions = computed(() => {
  return globalSpecialtyFrequency.value
    .slice()
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .map((item) => ({ ...item, emoji: specialtyEmojiMap[item.name] || '⭐' }))
})

// Human-readable country label for result count
const displayCountry = computed(() => {
  if (!selectedCountry.value) return ''
  const found = countryChips.find((c) => c.code === selectedCountry.value)
  return found ? found.label : selectedCountry.value
})

// Fetch all active coaches specialties once (or on demand) for stable category list
const loadGlobalSpecialties = async () => {
  try {
    // Select only id & specialties for active coaches to minimize payload
    const { data, error } = await supabase
      .from('coaches')
      .select('id, specialties')
      .eq('is_active', true)
    if (error) {
      console.error('❌ Error loading global specialties:', error)
      return
    }
    const freq: Record<string, number> = {}
    interface CoachRow {
      id: string
      specialties?: string[] | null
    }
    ;(data as CoachRow[] | null)?.forEach((row) => {
      if (Array.isArray(row.specialties)) {
        row.specialties.forEach((s) => {
          if (!s) return
          freq[s] = (freq[s] || 0) + 1
        })
      }
    })
    globalSpecialtyFrequency.value = Object.entries(freq).map(([name, count]) => ({ name, count }))
  } catch (e) {
    console.error('❌ Unexpected error computing global specialties:', e)
  }
}
// Helper function to get coach pricing
// const getCoachPrice = (coach: Coach): number => {
//   // Base price calculation based on experience and rating
//   const basePrice = 35 // Base price in euros
//   const experienceMultiplier = Math.min(coach.experience * 2, 20) // Max 20€ bonus for experience
//   const ratingBonus = (coach.rating - 4.0) * 10 // Rating bonus
//   const specialtyBonus = coach.specialties.some((s) =>
//     ['Nutrition', 'Préparation physique', 'Powerlifting', 'Tennis'].includes(s),
//   )
//     ? 10
//     : 0 // Premium specialties

//   return Math.round(basePrice + experienceMultiplier + ratingBonus + specialtyBonus)
// }

// Check subscription status for coaches
const checkCoachSubscriptions = async (coachIds: string[]) => {
  try {
    console.log('🔍 Checking subscription status for coaches:', coachIds)

    const { data: subscriptions, error } = await supabase
      .from('coaches_current_subscription')
      .select('id, has_active_subscription')
      .in('id', coachIds)

    if (error) {
      console.error('❌ Error checking coach subscriptions:', error)
      return
    }

    console.log('✅ Coach subscription data:', subscriptions)

    // Update the subscription map
    subscriptions?.forEach((sub) => {
      coachSubscriptions.value.set(sub.id, sub.has_active_subscription || false)
    })

    console.log('📊 Updated subscription map:', Object.fromEntries(coachSubscriptions.value))
  } catch (error) {
    console.error('❌ Error in checkCoachSubscriptions:', error)
  }
}

// Load approved (published) review counts for given coaches
const loadReviewCounts = async (coachIds: string[]) => {
  try {
    if (!coachIds.length) return
    // Only fetch counts for coachIds not yet loaded (optimization)
    const missing = coachIds.filter((id) => !coachReviewCounts.value.has(id))
    if (!missing.length) return

    const { data, error } = await supabase
      .from('reviews')
      .select('id, coach_id')
      .eq('is_published', true)
      .in('coach_id', missing)

    if (error) {
      console.error('❌ Error loading review counts:', error)
      return
    }

    interface ReviewRow {
      id: string
      coach_id: string
    }
    const counts: Record<string, number> = {}
    ;(data as ReviewRow[] | null)?.forEach((row) => {
      counts[row.coach_id] = (counts[row.coach_id] || 0) + 1
    })
    Object.entries(counts).forEach(([id, count]) => coachReviewCounts.value.set(id, count))
  } catch (err) {
    console.error('❌ Unexpected error loading review counts:', err)
  }
}

// Helper to check if coach is certified (has active subscription)
const isCoachCertified = (coachId: string): boolean => {
  return coachSubscriptions.value.get(coachId) || false
}

// Computed - apply client-side country & specialty filters (robust if backend misses specialty)
const filteredCoaches = computed(() => {
  return coaches.value.filter((c) => {
    if (selectedCountry.value && c.territory !== selectedCountry.value) return false
    if (selectedSpecialty.value && !c.specialties?.includes(selectedSpecialty.value)) return false
    return true
  })
})

// Search coaches using the coach store (which uses Supabase)
const searchCoaches = async (_query: string, specialty: string, sort: string, page: number = 1) => {
  // _query ignored (UI input only filters specialties locally)
  console.log('🔍 searchCoaches called with:', { specialty, sort, page })
  isLoading.value = true

  try {
    console.log('🔍 Searching coaches with:', { specialty, sort, page })

    // Prepare filters object
    const filters: {
      page: number
      limit: number
      search?: string
      specialties?: string[]
      territory?: string
    } = {
      page,
      limit: pageSize.value,
    }

    // Search query from text input intentionally ignored (specialty filtering only)

    // Specialty now filtered client-side to avoid inconsistent server behavior

    // Add territory filter if selected (backend matches profile_personal->>territory)
    if (selectedCountry.value) {
      filters.territory = selectedCountry.value
      console.log('🔍 Added territory filter:', filters.territory)
    }

    console.log('📡 Calling coachStore.fetchCoaches with filters:', filters)

    // Fetch coaches using the store
    await coachStore.fetchCoaches(filters)

    console.log('📡 Store state after fetch:', {
      coaches: coachStore.coaches.length,
      total: coachStore.total,
      loading: coachStore.loading,
      error: coachStore.error,
    })

    // Update local state from store
    if (page === 1) {
      coaches.value = coachStore.coaches
    } else {
      coaches.value = [...coaches.value, ...coachStore.coaches]
    }

    // Debug snippet generation removed

    totalCoaches.value = coachStore.total
    hasMore.value = coachStore.coaches.length === pageSize.value // Has more if we got a full page
    currentPage.value = page

    // Load subscription status for the coaches
    const coachIds = coachStore.coaches.map((coach) => coach.id)
    if (coachIds.length > 0) {
      await checkCoachSubscriptions(coachIds)
      await loadReviewCounts(coachIds)
    }

    console.log('✅ Search completed:', {
      totalResults: coaches.value.length,
      hasMore: hasMore.value,
      localCoaches: coaches.value,
    })
  } catch (error) {
    console.error('❌ Search error:', error)
    // Handle error - could show a toast notification here
  } finally {
    isLoading.value = false
  }
}

// Debounced search function
const debouncedSearch = (_query: string, specialty: string, sort: string) => {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }

  searchDebounceTimer.value = window.setTimeout(() => {
    searchCoaches('', specialty, sort, 1)
  }, 300) // 300ms delay
}

// Load more coaches for pagination
const loadMoreCoaches = () => {
  if (hasMore.value && !isLoading.value) {
    searchCoaches('', selectedSpecialty.value, sortBy.value, currentPage.value + 1)
  }
}

// Methods
const navigateToCoachProfile = (coach: Coach) => {
  // Navigate to coach profile page using unique coach ID
  router.push(`/coach/${coach.id}`)
}

const navigateToCoachProfileWithContact = (coach: Coach) => {
  // Navigate to coach profile page and trigger contact modal
  router.push(`/coach/${coach.id}?contact=true`)
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedSpecialty.value = ''
  selectedCountry.value = ''
  // Trigger search refresh
  debouncedSearch('', '', sortBy.value)
}

// Active filters state
const hasActiveFilters = computed(() => !!(selectedSpecialty.value || selectedCountry.value))

// Scroll handler to toggle condensed header
const handleScroll = () => {
  const y = window.scrollY || document.documentElement.scrollTop
  isCondensedHeader.value = y > 40
  requestAnimationFrame(measureHeader)
}

// Watchers
watch([selectedSpecialty, sortBy, selectedCountry], ([specialty, sort]) => {
  debouncedSearch('', specialty, sort)
})

// Lifecycle
onMounted(async () => {
  console.log('🏗️ CoachBrowser: Component mounted, loading coaches...')
  
  // Check for specialty query parameter from URL
  const specialtyFromUrl = route.query.specialty as string | undefined
  if (specialtyFromUrl) {
    selectedSpecialty.value = specialtyFromUrl
    isSearchOpen.value = true // Show the search bar with the selected specialty chip
  }
  
  console.log('🔧 Current state:', {
    searchQuery: searchQuery.value,
    selectedSpecialty: selectedSpecialty.value,
    sortBy: sortBy.value,
  })

  // Initialize with the first load of coaches
  await searchCoaches('', selectedSpecialty.value, sortBy.value, 1)
  // Load global specialty frequencies (not tied to current filters)
  loadGlobalSpecialties()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', measureHeader, { passive: true })
  handleScroll()
  nextTick(measureHeader)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', measureHeader)
  document.removeEventListener('click', onClickOutside)
})

watch(isCondensedHeader, async () => {
  await nextTick()
  measureHeader()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Custom font for coach energy */
h1 {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-weight: 900;
  letter-spacing: -0.025em;
}

/* Hover scale effect */
.hover\:scale-102:hover {
  transform: scale(1.02);
}

/* Aspect ratio for square images */
.aspect-square {
  aspect-ratio: 1 / 1;
}

/* Text shadow for better readability on images */
.drop-shadow-lg {
  filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));
}

.drop-shadow-md {
  filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));
}

/* Shimmer animation for skeleton loading */
.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Fade transition for dropdown */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>

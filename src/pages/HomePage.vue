<template>
  <div class="min-h-screen flex flex-col bg-gray-900">
    <!-- Navigation Header -->
    <header
      class="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <!-- Logo -->
          <div class="flex items-center">
            <img
              src="/images/logos/logo_coachiles_color.png"
              alt="Coachiles"
              class="h-10 w-auto brightness-0 invert"
            />
          </div>

          <!-- Navigation Desktop -->
          <nav class="hidden md:flex items-center space-x-8">
            <router-link
              to="/coaches"
              class="text-white/80 hover:text-white font-medium transition-colors"
            >
              Trouver un coach
            </router-link>
            <router-link
              to="/coaches"
              class="text-white/80 hover:text-white font-medium transition-colors"
            >
              Catégories
            </router-link>
            <a
              href="#how-it-works"
              class="text-white/80 hover:text-white font-medium transition-colors"
            >
              Comment ça marche
            </a>
            <router-link
              to="/signup"
              class="text-white/80 hover:text-white font-medium transition-colors"
            >
              Devenir coach
            </router-link>
            <a href="#reviews" class="text-white/80 hover:text-white font-medium transition-colors">
              Avis
            </a>
            <router-link
              to="/contact"
              class="text-white/80 hover:text-white font-medium transition-colors"
            >
              Aide
            </router-link>
          </nav>

          <!-- CTA Desktop -->
          <div class="hidden md:flex items-center space-x-4">
            <router-link
              to="/auth"
              class="bg-lime-400 text-gray-900 px-5 py-2.5 rounded-full font-bold hover:bg-lime-300 transition-all"
            >
              Espace Coach
            </router-link>
          </div>

          <!-- Mobile menu button -->
          <button class="md:hidden text-white p-2" @click="mobileMenuOpen = !mobileMenuOpen">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                v-if="!mobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Mobile Navigation -->
        <div
          v-if="mobileMenuOpen"
          class="md:hidden bg-gray-900/95 backdrop-blur-sm rounded-2xl p-4 mt-2"
        >
          <nav class="flex flex-col space-y-4">
            <router-link to="/coaches" class="text-white/80 hover:text-white font-medium">
              Trouver un coach
            </router-link>
            <router-link to="/coaches" class="text-white/80 hover:text-white font-medium">
              Catégories
            </router-link>
            <a href="#how-it-works" class="text-white/80 hover:text-white font-medium">
              Comment ça marche
            </a>
            <router-link to="/signup" class="text-white/80 hover:text-white font-medium">
              Devenir coach
            </router-link>
            <a href="#reviews" class="text-white/80 hover:text-white font-medium"> Avis </a>
            <router-link to="/contact" class="text-white/80 hover:text-white font-medium">
              Aide
            </router-link>
            <router-link
              to="/auth"
              class="bg-lime-400 text-gray-900 px-5 py-2.5 rounded-full font-bold text-center"
            >
              Espace Coach
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <!-- Hero Section with Full-Bleed Background -->
    <section class="relative min-h-screen flex items-center">
      <!-- Background Image -->
      <div class="absolute inset-0">
        <img
          src="/images/photo_front.png"
          alt="Coach sportif"
          class="w-full h-full object-cover object-right md:object-center object-[70%]"
        />
        <div
          class="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-transparent md:bg-gradient-to-r md:from-gray-900/80 md:via-gray-900/60 md:to-transparent"
        ></div>
        <!-- Stronger overlay on mobile for better text readability -->
        <div
          class="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-transparent to-gray-900/80 md:hidden"
        ></div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div class="max-w-2xl">
          <h1
            class="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 md:mb-6 leading-tight"
          >
            Trouvez le coach
            <span class="text-lime-400">parfait</span>
          </h1>
          <p class="text-lg sm:text-xl md:text-2xl text-white/80 mb-8 md:mb-10 font-medium">
            Du projet au progrès
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <router-link
              to="/coaches"
              class="bg-lime-400 text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-lime-300 hover:scale-105 transition-all shadow-lg text-center"
            >
              Trouver un coach
            </router-link>
            <router-link
              to="/auth"
              class="bg-white/10 backdrop-blur-sm text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white/20 transition-all border border-white/20 text-center"
            >
              Espace coach
            </router-link>
          </div>
        </div>
      </div>

      <!-- Mobile: Simple stats strip -->
      <div class="absolute bottom-6 left-0 right-0 z-20 md:hidden">
        <div class="px-4">
          <div class="flex items-center justify-center gap-6 text-white">
            <div class="flex items-center gap-2">
              <div class="flex -space-x-2">
                <template
                  v-for="(coach, index) in featuredCoachesAvatars.slice(0, 3)"
                  :key="coach.id"
                >
                  <img
                    :src="coach.photo"
                    :alt="coach.firstName"
                    class="w-8 h-8 rounded-full border-2 border-white object-cover"
                    :style="{ zIndex: 3 - index }"
                  />
                </template>
              </div>
              <span class="font-bold">{{ totalCoaches }}+ coachs</span>
            </div>
            <div class="flex items-center gap-1">
              <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              <span class="font-bold">4.9</span>
            </div>
          </div>
          <!-- Scroll indicator -->
          <div class="flex justify-center mt-4">
            <div class="animate-bounce">
              <svg
                class="w-6 h-6 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop: Bottom Cards Row -->
      <div class="absolute bottom-8 left-0 right-0 z-20 hidden md:block">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-3 gap-4">
            <!-- Card 1: Coaches -->
            <div class="bg-white rounded-2xl p-5 shadow-xl">
              <div class="flex items-center gap-4">
                <!-- Avatars Stack -->
                <div class="flex -space-x-3">
                  <template
                    v-for="(coach, index) in featuredCoachesAvatars.slice(0, 4)"
                    :key="coach.id"
                  >
                    <img
                      :src="coach.photo"
                      :alt="coach.firstName"
                      class="w-12 h-12 rounded-full border-2 border-white object-cover"
                      :style="{ zIndex: 4 - index }"
                    />
                  </template>
                </div>
                <div>
                  <div class="text-3xl font-black text-gray-900">{{ totalCoaches }}+</div>
                  <div class="text-sm text-gray-500">Coachs disponibles</div>
                </div>
              </div>
              <p class="mt-3 text-gray-600 text-sm">
                Les meilleurs coachs, triés sur le volet. Des experts prêts à vous accompagner.
              </p>
            </div>

            <!-- Card 2: Reviews -->
            <div class="bg-white rounded-2xl p-5 shadow-xl">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
                <span class="font-bold text-gray-900">4.9</span>
              </div>
              <p class="text-gray-700 text-sm italic">"{{ currentReview.text }}"</p>
              <div class="flex items-center justify-between mt-3">
                <span class="text-xs text-gray-500">{{ currentReview.author }}</span>
                <div class="flex gap-1">
                  <button
                    @click="prevReview"
                    class="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      class="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    @click="nextReview"
                    class="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      class="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Card 3: Categories -->
            <div class="bg-lime-400 rounded-2xl p-5 shadow-xl">
              <h3 class="font-bold text-gray-900 mb-3">Filtrer par catégorie</h3>
              <p class="text-gray-700 text-sm mb-3">
                Sport, bien-être, nutrition, coaching personnel et plus encore.
              </p>
              <router-link
                to="/coaches"
                class="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Explorer
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Coachiles Section -->
    <section class="bg-white py-12 md:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          class="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 text-center mb-2 md:mb-4"
        >
          Pourquoi <span class="text-orange-500">Coachiles</span> ?
        </h2>
        <p
          class="text-sm sm:text-base md:text-xl text-gray-600 text-center mb-8 md:mb-16 max-w-2xl mx-auto"
        >
          Le meilleur moyen pour trouver un coach adapté à vos besoins
        </p>

        <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
          <!-- Benefit 1 -->
          <div class="text-center p-3 md:p-6">
            <div
              class="w-12 h-12 md:w-16 md:h-16 bg-orange-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-4"
            >
              <svg
                class="w-6 h-6 md:w-8 md:h-8 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 class="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2">
              Match intelligent
            </h3>
            <p class="text-xs md:text-base text-gray-600">
              Trouvez le coach idéal selon vos objectifs
            </p>
          </div>

          <!-- Benefit 2 -->
          <div class="text-center p-3 md:p-6">
            <div
              class="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-4"
            >
              <svg
                class="w-6 h-6 md:w-8 md:h-8 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 class="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Coachs vérifiés</h3>
            <p class="text-xs md:text-base text-gray-600">Certifiés et spécialisés</p>
          </div>

          <!-- Benefit 3 -->
          <div class="text-center p-3 md:p-6">
            <div
              class="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-4"
            >
              <svg
                class="w-6 h-6 md:w-8 md:h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 class="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2">
              Réservation simple
            </h3>
            <p class="text-xs md:text-base text-gray-600">Contactez facilement</p>
          </div>

          <!-- Benefit 4 -->
          <div class="text-center p-3 md:p-6">
            <div
              class="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-4"
            >
              <svg
                class="w-6 h-6 md:w-8 md:h-8 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 class="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Suivi clair</h3>
            <p class="text-xs md:text-base text-gray-600">Atteignez vos objectifs</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="bg-gray-50 py-12 md:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          class="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 text-center mb-8 md:mb-16"
        >
          Comment ça <span class="text-orange-500">marche</span> ?
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          <!-- Step 1 -->
          <div class="relative">
            <div class="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 shadow-lg">
              <div
                class="w-10 h-10 md:w-12 md:h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl mb-3 md:mb-6"
              >
                1
              </div>
              <h3 class="text-base md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                Décrivez vos objectifs
              </h3>
              <p class="text-sm md:text-base text-gray-600">Indiquez vos besoins et objectifs</p>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="relative">
            <div class="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 shadow-lg">
              <div
                class="w-10 h-10 md:w-12 md:h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl mb-3 md:mb-6"
              >
                2
              </div>
              <h3 class="text-base md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                Explorez les profils
              </h3>
              <p class="text-sm md:text-base text-gray-600">Parcourez nos coachs certifiés</p>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="relative">
            <div class="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 shadow-lg">
              <div
                class="w-10 h-10 md:w-12 md:h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl mb-3 md:mb-6"
              >
                3
              </div>
              <h3 class="text-base md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Commencez</h3>
              <p class="text-sm md:text-base text-gray-600">Démarrez votre parcours</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Categories Section -->
    <section class="bg-white py-12 md:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          class="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 text-center mb-2 md:mb-4"
        >
          Catégories <span class="text-orange-500">populaires</span>
        </h2>
        <p class="text-sm md:text-xl text-gray-600 text-center mb-6 md:mb-16">
          Trouvez un coach dans votre domaine
        </p>

        <div class="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          <router-link
            v-for="category in popularCategories"
            :key="category.name"
            :to="{ path: '/coaches', query: { specialty: category.specialty } }"
            class="group bg-gray-50 hover:bg-orange-50 rounded-xl md:rounded-2xl p-3 md:p-6 text-center transition-all hover:shadow-lg"
          >
            <div
              class="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 transition-colors"
              :class="category.bgColor"
            >
              <component
                :is="category.icon"
                class="w-5 h-5 md:w-7 md:h-7"
                :class="category.iconColor"
              />
            </div>
            <span
              class="font-semibold text-xs md:text-base text-gray-900 group-hover:text-orange-600 transition-colors"
            >
              {{ category.name }}
            </span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Featured Coaches Section -->
    <section class="bg-slate-900 py-12 md:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl sm:text-3xl md:text-5xl font-black text-white text-center mb-2 md:mb-4">
          Coachs en <span class="text-lime-400">vedette</span>
        </h2>
        <p class="text-sm md:text-xl text-gray-400 text-center mb-6 md:mb-16">
          Découvrez nos meilleurs coachs
        </p>

        <div v-if="loadingCoaches" class="flex justify-center">
          <div
            class="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-4 border-lime-400 border-t-transparent"
          ></div>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          <router-link
            v-for="coach in featuredCoaches"
            :key="coach.id"
            :to="`/coach/${coach.id}`"
            class="group bg-slate-800 rounded-xl md:rounded-2xl overflow-hidden hover:bg-slate-750 transition-all hover:-translate-y-1"
          >
            <!-- Photo container with overlay -->
            <div class="relative aspect-[3/4] md:aspect-[4/5]">
              <img
                :src="coach.photo"
                :alt="coach.firstName"
                class="w-full h-full object-cover object-center"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"
              ></div>
              <!-- Name and specialty overlaid on photo -->
              <div class="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4">
                <h3 class="text-base md:text-2xl font-bold text-white">{{ coach.firstName }}</h3>
                <p class="text-gray-300 text-xs md:text-sm">
                  {{ coach.specialties[0] || 'Coach' }}
                </p>
              </div>
            </div>
            <!-- Info below photo -->
            <div class="p-3 md:p-5">
              <div class="flex items-center gap-1 md:gap-2 mb-1 md:mb-3">
                <div class="flex items-center">
                  <svg
                    class="w-4 h-4 md:w-5 md:h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                  <span class="font-bold text-white ml-1 text-xs md:text-base">{{
                    coach.rating?.toFixed(1) || '5.0'
                  }}</span>
                </div>
                <span class="text-gray-500 hidden md:inline">•</span>
                <span class="text-gray-400 text-xs md:text-base hidden md:inline"
                  >{{ coach.experience }} ans</span
                >
              </div>
              <p class="text-gray-400 line-clamp-2 text-xs md:text-sm hidden md:block">
                {{ coach.bio || 'Coach professionnel passionné' }}
              </p>
            </div>
          </router-link>
        </div>

        <div class="text-center mt-8 md:mt-12">
          <router-link
            to="/coaches"
            class="inline-flex items-center gap-2 bg-lime-400 text-slate-900 px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-sm md:text-lg hover:bg-lime-300 transition-all"
          >
            Voir tous les coachs
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Reviews Section -->
    <section id="reviews" class="bg-white py-12 md:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          class="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 text-center mb-2 md:mb-4"
        >
          Ce que disent nos <span class="text-orange-500">clients</span>
        </h2>
        <p class="text-sm md:text-xl text-gray-600 text-center mb-6 md:mb-16">
          Ils ont trouvé leur coach idéal
        </p>

        <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <div
            v-for="review in reviews"
            :key="review.author"
            class="bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-6"
          >
            <div class="flex items-center gap-0.5 md:gap-1 mb-2 md:mb-4">
              <svg
                v-for="n in 5"
                :key="n"
                class="w-3 h-3 md:w-5 md:h-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </div>
            <p
              class="text-gray-700 mb-2 md:mb-4 italic text-xs md:text-base line-clamp-3 md:line-clamp-none"
            >
              "{{ review.text }}"
            </p>
            <div class="text-xs md:text-sm">
              <span class="font-semibold text-gray-900">{{ review.author }}</span>
              <span class="text-gray-500 hidden md:inline"> — {{ review.location }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="bg-gradient-to-r from-orange-500 to-blue-600 py-12 md:py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-xl sm:text-2xl md:text-5xl font-black text-white mb-3 md:mb-6">
          Prêt à atteindre vos objectifs ?
        </h2>
        <p class="text-sm md:text-xl text-white/90 mb-6 md:mb-10">
          Rejoignez ceux qui ont transformé leur vie
        </p>
        <router-link
          to="/coaches"
          class="inline-flex items-center gap-2 bg-white text-gray-900 px-6 md:px-10 py-3 md:py-5 rounded-full font-bold text-sm md:text-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          Trouver mon coach
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-10 md:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 mb-8 md:mb-12">
          <!-- Logo & Description -->
          <div class="col-span-2">
            <img
              src="/images/logos/logo_coachiles_color.png"
              alt="Coachiles"
              class="h-10 w-auto mb-4"
            />
            <p class="text-gray-400 mb-6 max-w-sm">
              La plateforme de référence pour trouver le coach parfait aux Antilles.
            </p>
            <!-- Social Links -->
            <div class="flex gap-4">
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"
                  />
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  />
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  />
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <!-- Produit -->
          <div>
            <h4 class="font-bold text-white mb-4">Produit</h4>
            <ul class="space-y-3">
              <li>
                <router-link to="/coaches" class="text-gray-400 hover:text-white transition-colors"
                  >Trouver un coach</router-link
                >
              </li>
              <li>
                <router-link to="/coaches" class="text-gray-400 hover:text-white transition-colors"
                  >Catégories</router-link
                >
              </li>
              <li>
                <router-link
                  to="/coach/abonnement"
                  class="text-gray-400 hover:text-white transition-colors"
                  >Tarifs</router-link
                >
              </li>
            </ul>
          </div>

          <!-- Coachs -->
          <div>
            <h4 class="font-bold text-white mb-4">Coachs</h4>
            <ul class="space-y-3">
              <li>
                <router-link to="/signup" class="text-gray-400 hover:text-white transition-colors"
                  >Devenir coach</router-link
                >
              </li>
              <li>
                <router-link to="/faq" class="text-gray-400 hover:text-white transition-colors"
                  >Ressources</router-link
                >
              </li>
            </ul>
          </div>

          <!-- Société -->
          <div>
            <h4 class="font-bold text-white mb-4">Société</h4>
            <ul class="space-y-3">
              <li>
                <router-link to="/about" class="text-gray-400 hover:text-white transition-colors"
                  >À propos</router-link
                >
              </li>
              <li>
                <router-link to="/contact" class="text-gray-400 hover:text-white transition-colors"
                  >Contact</router-link
                >
              </li>
              <li>
                <a
                  href="mailto:contact@coachiles.com"
                  class="text-gray-400 hover:text-white transition-colors"
                  >contact@coachiles.com</a
                >
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div
          class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p class="text-gray-400 text-sm">
            © {{ new Date().getFullYear() }} Coachiles. Tous droits réservés.
          </p>
          <div class="flex gap-6 text-sm">
            <router-link to="/cgu" class="text-gray-400 hover:text-white transition-colors"
              >CGU</router-link
            >
            <router-link to="/privacy" class="text-gray-400 hover:text-white transition-colors"
              >Politique de confidentialité</router-link
            >
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue'
import { supabaseCoachApi } from '@/services/supabaseCoachApi'
import type { Coach } from '@/types/coach'
import { useSeo, useOrganizationSchema, useWebsiteSchema } from '@/composables/useSeo'

// SEO Configuration
useSeo({
  title: 'Coachiles | Trouvez votre coach sportif, de vie ou professionnel',
  description:
    'Trouvez le coach idéal parmi nos coachs certifiés : coach sportif, coach de vie, coach professionnel, nutrition, yoga, musculation. Comparez et réservez facilement.',
  url: '/',
  keywords: [
    'coach sportif',
    'coach de vie',
    'coach professionnel',
    'coaching personnel',
    'trouver un coach',
    'coach fitness',
    'coach musculation',
    'coach nutrition',
    'coach yoga',
    'coach running',
    'préparation mentale',
    'coaching France',
  ],
})

// Schema.org pour le SEO
useOrganizationSchema()
useWebsiteSchema()

// Mobile menu state
const mobileMenuOpen = ref(false)

// Coaches data
const featuredCoaches = ref<Coach[]>([])
const totalCoaches = ref(30)
const loadingCoaches = ref(true)

// Reviews data
const reviews = [
  {
    text: "J'ai trouvé une coach qui comprend exactement mes objectifs. Super expérience.",
    author: 'Léa',
    location: 'Paris',
  },
  {
    text: 'Process clair, coachs sérieux, et un vrai suivi.',
    author: 'Karim',
    location: 'Lyon',
  },
  {
    text: "En deux jours j'avais mon premier rendez-vous. Efficace.",
    author: 'Chloé',
    location: 'Lille',
  },
  {
    text: "Coachiles m'a aidé à choisir le bon coach, sans prise de tête.",
    author: 'Adrien',
    location: 'Bordeaux',
  },
]

// Review carousel for hero card
const currentReviewIndex = ref(0)
const currentReview = computed(() => reviews[currentReviewIndex.value])

const nextReview = () => {
  currentReviewIndex.value = (currentReviewIndex.value + 1) % reviews.length
}

const prevReview = () => {
  currentReviewIndex.value = (currentReviewIndex.value - 1 + reviews.length) % reviews.length
}

// Featured coaches avatars for hero card
const featuredCoachesAvatars = computed(() => featuredCoaches.value)

// Category icons as render functions
const WeightIcon = () =>
  h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-width': '2',
      d: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
    }),
  ])

const MuscleIcon = () =>
  h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-width': '2',
      d: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    }),
  ])

const RunIcon = () =>
  h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-width': '2',
      d: 'M13 10V3L4 14h7v7l9-11h-7z',
    }),
  ])

const YogaIcon = () =>
  h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-width': '2',
      d: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5',
    }),
  ])

const BrainIcon = () =>
  h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-width': '2',
      d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    }),
  ])

const NutritionIcon = () =>
  h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-width': '2',
      d: 'M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z',
    }),
  ])

// Popular categories
const popularCategories = [
  {
    name: 'Perte de poids',
    specialty: 'Perte de poids',
    icon: WeightIcon,
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-500',
  },
  {
    name: 'Musculation',
    specialty: 'Musculation & Force',
    icon: MuscleIcon,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-500',
  },
  {
    name: 'Running',
    specialty: 'Course à pied',
    icon: RunIcon,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-500',
  },
  {
    name: 'Yoga',
    specialty: 'Yoga',
    icon: YogaIcon,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-500',
  },
  {
    name: 'Prépa mentale',
    specialty: 'Préparation mentale',
    icon: BrainIcon,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-500',
  },
  {
    name: 'Nutrition',
    specialty: 'Nutrition sportive',
    icon: NutritionIcon,
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
]

// Fetch coaches on mount
onMounted(async () => {
  try {
    const response = await supabaseCoachApi.getCoaches({ limit: 10 })

    // Sort by rating and get top 3
    const sortedCoaches = response.data
      .filter((coach) => coach.photo && !coach.photo.includes('default'))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3)

    featuredCoaches.value = sortedCoaches.length > 0 ? sortedCoaches : response.data.slice(0, 3)
    totalCoaches.value = response.total || 30
  } catch (error) {
    console.error('Error fetching coaches:', error)
  } finally {
    loadingCoaches.value = false
  }
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

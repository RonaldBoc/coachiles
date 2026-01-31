<template>
  <div
    class="coach-public-profile no-horizontal-overflow min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50"
  >
    <!-- Header -->
    <header
      ref="headerRef"
      class="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300"
      :class="isCondensedHeader ? 'shadow-md' : 'shadow-sm'"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300">
        <div
          class="flex justify-between items-center transition-all duration-300"
          :class="isCondensedHeader ? 'py-2' : 'py-4'"
        >
          <!-- Logo / Brand -->
          <div class="flex items-center min-w-0">
            <button
              @click="$router.go(-1)"
              class="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
              :class="isCondensedHeader ? 'mr-2' : 'mr-3'"
            >
              <svg
                class="text-gray-600 transition-all duration-300"
                :class="isCondensedHeader ? 'w-4 h-4' : 'w-5 h-5'"
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
            <h1
              @click="router.push('/')"
              class="font-black text-transparent bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text tracking-tight transition-all duration-300 cursor-pointer select-none"
              :class="isCondensedHeader ? 'text-xl' : 'text-3xl'"
              role="button"
              tabindex="0"
              @keydown.enter="router.push('/')"
              @keydown.space.prevent="router.push('/')"
              aria-label="Aller à l'accueil"
            >
              Coachiles
            </h1>
          </div>
          <!-- Header Action (dynamic shrink) -->
          <div class="flex items-center">
            <!-- Coach logged in: large button -> icon on scroll -->
            <template v-if="authStore.isAuthenticated && authStore.isCoach">
              <button
                v-if="!isCondensedHeader"
                @click="router.push('/coach/profile')"
                class="bg-white text-orange-600 px-6 py-3 rounded-full font-semibold border-2 border-orange-400 hover:bg-orange-50 hover:shadow-md transition-all duration-300"
              >
                Mon espace coach
              </button>
              <button
                v-else
                @click="router.push('/coach/profile')"
                class="relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                aria-label="Espace coach"
                :class="isCondensedHeader ? 'w-10 h-10' : 'w-12 h-12'"
              >
                <UserCircleIcon class="w-6 h-6" />
              </button>
            </template>
            <!-- Authenticated but not coach -->
            <template v-else-if="authStore.isAuthenticated && !authStore.isCoach">
              <button
                @click="router.push('/coach/onboarding')"
                class="bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-full font-bold hover:shadow-lg transition-all duration-300"
                :class="isCondensedHeader ? 'px-4 py-2 text-sm' : 'px-6 py-3'"
              >
                Devenir Coach
              </button>
            </template>
            <!-- Guest user -->
            <template v-else>
              <button
                @click="router.push('/signup')"
                class="bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-full font-bold hover:shadow-lg transition-all duration-300"
                :class="isCondensedHeader ? 'px-4 py-2 text-sm' : 'px-6 py-3'"
              >
                Devenir Coach
              </button>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- Spacer to offset fixed header height -->
    <div aria-hidden="true" :style="{ height: headerHeight + 'px' }"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Coach Header Info (Mobile) -->
          <div class="lg:hidden bg-white rounded-2xl shadow-lg p-6">
            <div class="flex items-start space-x-4 mb-6">
              <div class="relative">
                <img
                  :src="coach?.photo || '/default-avatar.png'"
                  :alt="`${coach?.firstName}`"
                  class="w-20 h-20 rounded-full object-cover cursor-pointer transition-transform duration-200 hover:scale-[1.03]"
                  @click="openImagePreview"
                  :srcset="profilePhotoSrcSet"
                  sizes="80px"
                  loading="lazy"
                  decoding="async"
                />
                <!-- Certification badge (mobile) -->
                <div v-if="isAdminCertified" class="absolute -top-2 -right-2">
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
              <div class="flex-1">
                <h1 class="text-2xl font-bold text-gray-900 mb-2">
                  {{ coach?.firstName
                  }}<template v-if="hasPremiumSubscription && coach?.lastName">
                    {{ coach?.lastName }}</template
                  >
                </h1>
                <div
                  v-if="reviews.length > 0"
                  class="flex items-center mb-2 cursor-pointer select-none group"
                  role="button"
                  tabindex="0"
                  aria-label="Voir les avis du coach"
                  @click="scrollToReviews"
                  @keydown.enter.prevent="scrollToReviews"
                  @keydown.space.prevent="scrollToReviews"
                >
                  <StarIcon
                    class="w-5 h-5 text-yellow-400 fill-current group-hover:scale-110 transition-transform"
                  />
                  <span
                    class="ml-1 text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors"
                    >{{ coach?.rating }}</span
                  >
                  <span class="mx-2 text-gray-300">•</span>
                  <span class="text-gray-600 group-hover:text-orange-600 transition-colors"
                    >{{ reviews.length }} avis</span
                  >
                </div>
                <p class="text-orange-600 font-medium">{{ coach?.location }}</p>
              </div>
            </div>

            <!-- Quick Stats (Mobile) -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="text-center p-3 bg-orange-50 rounded-lg">
                <p class="text-2xl font-bold text-orange-600">{{ coach?.hourlyRate }}€</p>
                <p class="text-sm text-gray-600">par séance</p>
              </div>
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <p class="text-2xl font-bold text-blue-600">{{ coach?.experience }}</p>
                <p class="text-sm text-gray-600">ans d'expérience</p>
              </div>
            </div>

            <!-- Primary CTA (Mobile) -->
            <div class="space-y-3">
              <!-- <button
                @click="bookFreeTrial"
                class="w-full bg-gradient-to-r from-orange-500 to-blue-600 text-white py-3 px-6 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Réserver le 1er cours gratuit
              </button> -->
              <button
                @click="contactCoach"
                class="w-full bg-white border-2 border-orange-400 text-orange-600 py-3 px-6 rounded-full font-semibold hover:bg-orange-50 transition-all duration-200"
              >
                Contacter {{ coach?.firstName }}
              </button>
            </div>

            <!-- Premium Contact & Social (Mobile) -->
            <div
              v-if="hasPremiumSubscription && contactAvailable"
              class="mt-8 border-t border-gray-100 pt-6 space-y-4"
            >
              <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <svg
                  class="w-4 h-4 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Contact & Réseaux
              </h3>
              <ul class="space-y-2 text-sm">
                <li v-if="contactInfo?.email" class="flex items-center gap-2 break-all">
                  <svg
                    class="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1a3 3 0 01-3 3H8m8-4v1a3 3 0 003 3h1"
                    />
                  </svg>
                  <a
                    :href="`mailto:${contactInfo.email}`"
                    class="text-orange-600 hover:underline"
                    >{{ contactInfo.email }}</a
                  >
                </li>
                <li v-if="contactInfo?.website" class="flex items-center gap-2 truncate">
                  <svg
                    class="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4a8 8 0 100 16 8 8 0 000-16zm2 12l-4-4 4-4"
                    />
                  </svg>
                  <a
                    :href="normalizeWebsite(contactInfo.website)"
                    target="_blank"
                    rel="noopener"
                    class="text-orange-600 hover:underline max-w-[14ch] truncate"
                    >{{ displayDomain(contactInfo.website) }}</a
                  >
                </li>
                <li v-if="contactInfo?.instagram" class="flex items-center gap-2 truncate">
                  <svg class="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zm8.75 2a1 1 0 110 2 1 1 0 010-2zM12 8a4 4 0 110 8 4 4 0 010-8z"
                    />
                  </svg>
                  <a
                    :href="instagramUrl"
                    target="_blank"
                    rel="noopener"
                    class="text-orange-600 hover:underline max-w-[14ch] truncate"
                    >{{ instagramHandleDisplay }}</a
                  >
                </li>
                <li v-if="contactInfo?.facebook" class="flex items-center gap-2 truncate">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M22 12.07C22 6.48 17.52 2 11.93 2 6.35 2 1.87 6.48 1.87 12.07c0 4.99 3.66 9.13 8.44 9.93v-7.03H7.9v-2.9h2.41V9.41c0-2.38 1.42-3.7 3.6-3.7 1.04 0 2.13.19 2.13.19v2.34h-1.2c-1.18 0-1.55.73-1.55 1.48v1.78h2.64l-.42 2.9h-2.22V22c4.78-.8 8.44-4.94 8.44-9.93z"
                    />
                  </svg>
                  <a
                    :href="facebookUrl"
                    target="_blank"
                    rel="noopener"
                    class="text-orange-600 hover:underline max-w-[14ch] truncate"
                    >{{ facebookHandleDisplay }}</a
                  >
                </li>
              </ul>
            </div>
          </div>

          <!-- About / Profile Section -->
          <div class="bg-white rounded-2xl shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">
              À propos du coach {{ coach?.firstName }}
              <template v-if="hasPremiumSubscription && coach?.lastName">
                {{ coach?.lastName }}</template
              >
            </h2>

            <!-- Bio -->
            <div class="mb-8 space-y-6" v-if="bioParagraphs.length">
              <div v-for="(para, i) in bioParagraphs" :key="i" class="space-y-2">
                <p
                  v-for="(line, j) in para
                    .split(/\n/)
                    .map((l) => l.trim())
                    .filter((l) => l.length > 0)"
                  :key="j"
                  class="text-gray-700 leading-relaxed text-lg"
                >
                  {{ line }}
                </p>
              </div>
            </div>
            <div v-else class="mb-8">
              <p class="text-gray-400 italic">Bio en cours de rédaction.</p>
            </div>

            <!-- Experience & Credentials -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div v-if="approvedDiplomas.length">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  Formation & Certifications
                  <span
                    v-if="isAdminCertified"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 border border-blue-200"
                    >Validées</span
                  >
                </h3>
                <div class="space-y-2">
                  <div
                    v-for="d in approvedDiplomas"
                    :key="d.title"
                    class="flex items-start text-gray-700"
                  >
                    <svg
                      class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span>{{ d.title }}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Expérience & parcours</h3>
                <div class="space-y-5">
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="text-gray-600">Années d'expérience</span>
                      <span class="font-semibold text-gray-900">{{ coach?.experience }} ans</span>
                    </div>
                    <!-- <div class="flex items-center justify-between">
                      <span class="text-gray-600">Élèves accompagnés</span>
                      <span class="font-semibold text-gray-900">{{ coach?.totalClients }}+</span>
                    </div> -->
                  </div>
                  <div
                    v-if="
                      coach?.profile_activity?.workExperiences &&
                      coach.profile_activity.workExperiences.length
                    "
                  >
                    <ul class="space-y-2">
                      <li
                        v-for="(exp, idx) in coach.profile_activity.workExperiences"
                        :key="idx"
                        class="flex items-start gap-3"
                      >
                        <svg
                          class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        <span class="text-gray-700 leading-snug">{{ exp }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Specialties -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Spécialités</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="specialty in coach?.specialties"
                  :key="specialty"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200"
                >
                  {{ specialty }}
                </span>
              </div>
              <!-- Languages -->
              <div v-if="coach?.languages && coach.languages.length" class="mt-8">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Langues parlées</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="lang in coach.languages"
                    :key="lang"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {{ lang }}
                  </span>
                </div>
              </div>
              <!-- Professional Work Experiences moved into combined experience section above -->
            </div>
          </div>

          <!-- Services Offered -->
          <div
            v-if="isLoadingServices || coachServices.length > 0"
            class="bg-white rounded-2xl shadow-lg p-4 sm:p-8"
          >
            <div class="flex items-center justify-between mb-4 sm:mb-6">
              <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Services proposés</h2>
              <button
                @click="coach && loadCoachServices(coach.id)"
                :disabled="isLoadingServices"
                class="flex items-center space-x-2 text-gray-500 hover:text-orange-600 transition-colors disabled:opacity-50"
                title="Actualiser les services"
              ></button>
            </div>

            <!-- Loading Skeleton (shown first while loading) -->
            <div v-if="isLoadingServices" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Service Loading Skeletons - Only 2 cards -->
              <div
                v-for="n in 2"
                :key="n"
                class="border border-gray-200 rounded-xl p-6 animate-pulse"
              >
                <div class="flex items-center mb-4">
                  <!-- Icon skeleton -->
                  <div class="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                  <div class="flex-1">
                    <!-- Title skeleton -->
                    <div class="h-5 bg-gray-300 rounded w-32 mb-2"></div>
                    <!-- Price skeletons -->
                    <div class="space-y-1">
                      <div class="h-4 bg-gray-200 rounded w-28"></div>
                      <div class="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>

                <!-- Description skeleton -->
                <div class="mb-4">
                  <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>

                <!-- Details list skeleton -->
                <div class="space-y-1 mb-4">
                  <div class="h-3 bg-gray-200 rounded w-32"></div>
                  <div class="h-3 bg-gray-200 rounded w-48"></div>
                  <div class="h-3 bg-gray-200 rounded w-28"></div>
                  <div class="h-3 bg-gray-200 rounded w-40"></div>
                </div>

                <!-- Click indicator skeleton -->
                <div class="flex items-center justify-between">
                  <div class="h-3 bg-gray-200 rounded w-32"></div>
                  <div class="w-4 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            <!-- Actual Services (shown after loading if services exist) -->
            <div
              v-else-if="coachServices.length > 0"
              class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            >
              <div
                v-for="service in coachServices"
                :key="service.id"
                class="border border-gray-200 rounded-xl p-4 md:p-6 hover:border-orange-300 hover:shadow-md transition-colors md:transition-all duration-200 cursor-pointer md:transform md:hover:scale-[1.02]"
                @click="openServiceModal(service)"
              >
                <div class="flex items-start md:items-center mb-2 md:mb-4">
                  <div
                    class="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-3 md:mr-4"
                  >
                    <svg
                      v-if="service.canBeSolo && !service.canBeGroup"
                      class="w-6 h-6 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <svg
                      v-else-if="service.canBeGroup && !service.canBeSolo"
                      class="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3
                      class="text-base md:text-lg font-semibold text-gray-900 leading-snug line-clamp-2"
                    >
                      {{ service.title }}
                    </h3>
                    <div class="mt-1 space-y-0.5">
                      <p
                        v-if="service.canBeSolo && service.soloPrice"
                        class="text-xs md:text-sm text-orange-600 font-medium"
                      >
                        Individuel: {{ service.soloPrice }}€/séance
                      </p>
                      <p
                        v-if="service.canBeGroup && service.groupPrice"
                        class="text-xs md:text-sm text-blue-600 font-medium"
                      >
                        Groupe: {{ service.groupPrice }}€/séance
                      </p>
                    </div>
                  </div>
                </div>
                <p class="hidden md:block text-gray-600 mb-3">
                  {{ service.description || 'Service personnalisé selon vos besoins.' }}
                </p>
                <ul class="hidden md:block text-sm text-gray-500 space-y-1 mb-3">
                  <li>• Durée: {{ service.duration }} minutes</li>
                  <li v-if="service.canBeSolo && service.canBeGroup">
                    • Disponible en individuel et en groupe
                  </li>
                  <li v-else-if="service.canBeSolo">• Cours particulier uniquement</li>
                  <li v-else-if="service.canBeGroup">• Cours en groupe uniquement</li>
                  <li>• Catégorie: {{ service.category }}</li>
                </ul>
                <div class="flex items-center justify-between mt-1 md:mt-0">
                  <span class="text-[10px] md:text-xs text-gray-400 italic"
                    >Cliquer pour détails</span
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
                </div>
              </div>
            </div>

            <!-- No services: section hidden by outer v-if -->
          </div>

          <!-- Modalités des cours -->
          <div v-if="hasModalitesContent" class="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
            <button
              type="button"
              class="w-full flex items-center justify-between sm:cursor-default group"
              @click="mobileModalitesOpen = !mobileModalitesOpen"
            >
              <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-0">Modalités des cours</h2>
              <span
                class="sm:hidden inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 text-gray-500 group-active:scale-95 transition"
              >
                <svg
                  :class="{ 'rotate-180': mobileModalitesOpen }"
                  class="w-4 h-4 transform transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </button>
            <div class="mt-4 sm:mt-6" :class="{ 'hidden sm:block': !mobileModalitesOpen }">
              <div v-if="coach?.modalities" class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Dynamic Locations -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Lieux de cours</h3>
                  <div class="space-y-4">
                    <template v-for="(entry, key) in coach.modalities.locations" :key="key">
                      <div v-if="entry?.enabled" class="flex items-start">
                        <svg
                          class="w-5 h-5 text-green-500 mr-3 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        <div>
                          <p class="font-medium text-gray-900">
                            {{ (locationLabels as Record<string, string>)[String(key)] || String(key) }}
                          </p>
                          <p v-if="entry.details" class="text-sm text-gray-600 whitespace-pre-line">
                            {{ entry.details }}
                          </p>
                        </div>
                      </div>
                    </template>
                    <!-- Hide empty state when no locations; overall section hidden if nothing configured -->
                  </div>
                </div>

                <!-- Practical Info -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations pratiques</h3>
                  <div class="space-y-4">
                    <div
                      v-if="coach.modalities.freeTrial?.enabled"
                      class="bg-green-50 border border-green-200 rounded-lg p-4"
                    >
                      <div class="flex items-center mb-2">
                        <svg
                          class="w-5 h-5 text-green-600 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        <span class="font-semibold text-green-800">Premier cours gratuit</span>
                      </div>
                      <p class="text-sm text-green-700 whitespace-pre-line">
                        {{ coach.modalities.freeTrial.details || "Séance d'essai gratuite" }}
                      </p>
                    </div>

                    <div class="space-y-3">
                      <div
                        v-if="coach.modalities.availabilityDays?.length"
                        class="flex items-start justify-between gap-4"
                      >
                        <span class="text-gray-600 mt-0.5 shrink-0">Disponibilités</span>
                        <div class="flex-1 text-right leading-snug">
                          <template v-if="modalitiesAvailabilityShortcut === 'all'">
                            <span
                              class="inline-block text-xs font-medium px-2 py-0.5 rounded bg-orange-100 text-orange-700"
                              >Tous les jours</span
                            >
                          </template>
                          <template v-else-if="modalitiesAvailabilityShortcut === 'weekend'">
                            <span
                              class="inline-block text-xs font-medium px-2 py-0.5 rounded bg-orange-100 text-orange-700"
                              >Week-end</span
                            >
                          </template>
                          <template v-else-if="modalitiesAvailabilityShortcut === 'weekdays'">
                            <span
                              class="inline-block text-xs font-medium px-2 py-0.5 rounded bg-orange-100 text-orange-700"
                              >En semaine</span
                            >
                          </template>
                          <template v-else>
                            <div class="flex flex-wrap gap-1 justify-end">
                              <span
                                v-for="d in modalitiesAvailabilityShortList"
                                :key="d"
                                class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-100 text-orange-700"
                              >
                                {{ d }}
                              </span>
                            </div>
                          </template>
                        </div>
                      </div>
                      <div v-if="coach.modalities.cancellationPolicy" class="space-y-1">
                        <span class="text-gray-600 font-medium block">Annulation</span>
                        <div
                          class="text-sm text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50 border border-gray-100 rounded-md p-3"
                        >
                          {{ coach.modalities.cancellationPolicy }}
                        </div>
                      </div>
                      <p
                        v-if="
                          !coach.modalities.availabilityDays?.length &&
                          !coach.modalities.cancellationPolicy
                        "
                        class="text-sm text-gray-500 italic"
                      >
                        Informations à venir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <!-- No else fallback: entire section hidden when no content -->
            </div>
          </div>

          <!-- Reviews Section -->
          <div ref="reviewsSection" class="bg-white rounded-2xl shadow-lg p-8" v-if="coach">
            <!-- Header -->
            <div class="flex flex-col md:flex-row md:items-start md:justify-between md:gap-8 mb-6">
              <div class="flex-1">
                <h2 class="text-2xl font-bold text-gray-900 flex items-center leading-tight">
                  <StarIcon class="w-6 h-6 text-yellow-400 mr-2 shrink-0" />
                  <span>
                    Avis récents du coach
                    {{ coach?.firstName }}
                  </span>
                </h2>
                <div
                  v-if="approvedAverageRating !== null"
                  class="mt-2 flex items-center text-sm text-gray-600 gap-2"
                >
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100"
                  >
                    <StarIcon class="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span class="font-semibold text-gray-900">{{ approvedAverageRating }}</span>
                  </span>
                  <span class="text-gray-400">note générale</span>
                  <span v-if="approvedReviews.length > 0" class="text-[11px] text-gray-400">
                    ({{ approvedReviews.length }}
                    {{ approvedReviews.length > 1 ? 'avis' : 'avis' }})
                  </span>
                </div>
              </div>
              <div class="mt-4 md:mt-0 md:text-right">
                <button
                  @click="openReviewModal"
                  class="inline-flex items-center bg-gradient-to-r from-orange-500 to-blue-600 text-white px-5 py-2 rounded-full font-semibold text-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500"
                  :disabled="creatingReview"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Laisser un avis
                </button>
              </div>
            </div>
            <div v-if="loadingReviews" class="space-y-4">
              <div v-for="n in 3" :key="n" class="animate-pulse space-y-2">
                <div class="h-4 bg-gray-200 rounded w-1/3" />
                <div class="h-3 bg-gray-100 rounded w-full" />
                <div class="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
            <div v-else>
              <div v-if="reviews.length === 0" class="text-gray-500 text-sm italic">
                Aucun avis pour le moment. Soyez le premier !
              </div>
              <ul v-else class="divide-y divide-gray-100">
                <li v-for="rev in reviewsToDisplay" :key="rev.id" class="py-5 first:pt-0 last:pb-0">
                  <header class="flex flex-wrap items-start gap-x-4 gap-y-1">
                    <p class="font-semibold text-gray-900">{{ rev.clientName }}</p>
                    <div class="flex items-center text-yellow-400">
                      <StarIcon
                        v-for="i in 5"
                        :key="i"
                        class="w-4 h-4"
                        :class="i <= rev.rating ? 'fill-current' : 'text-gray-300'"
                      />
                      <span class="ml-2 text-xs text-gray-500">
                        {{ formatDate(rev.createdAt) }}
                      </span>
                    </div>
                  </header>
                  <p
                    v-if="rev.comment"
                    class="mt-2 text-gray-700 whitespace-pre-line leading-relaxed"
                  >
                    {{ rev.comment }}
                  </p>
                  <div
                    v-if="rev.coachResponse && !rev.coachResponseHidden"
                    class="mt-3 pl-4 border-l-4 border-blue-200"
                  >
                    <p class="text-sm text-blue-700 font-medium">Réponse du coach :</p>
                    <p class="text-sm text-gray-700 whitespace-pre-line mt-1 leading-relaxed">
                      {{ rev.coachResponse }}
                    </p>
                  </div>
                </li>
              </ul>
              <div v-if="!showAllReviews && approvedReviews.length > 1" class="mt-4 text-center">
                <button
                  @click="showAllReviews = true"
                  class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white border border-orange-300 text-orange-600 hover:bg-orange-50 transition"
                >
                  Voir les {{ approvedReviews.length - 1 }} avis supplémentaires
                </button>
              </div>
              <div
                v-else-if="showAllReviews && approvedReviews.length > 1"
                class="mt-4 text-center"
              >
                <button
                  @click="showAllReviews = false"
                  class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                >
                  Réduire
                </button>
              </div>
            </div>
          </div>

          <!-- Post-Modalités Call To Action -->
          <div
            class="bg-gradient-to-br from-orange-500 via-orange-600 to-blue-600 rounded-2xl shadow-lg p-6 sm:p-10 text-white"
          >
            <h2 class="text-2xl sm:text-3xl font-extrabold mb-4">Prêt à passer à l'action ?</h2>
            <p class="text-base sm:text-lg leading-relaxed mb-6 max-w-3xl">
              {{ coach?.firstName }} peut vous aider à structurer un programme motivant et durable.
              Un simple premier message suffit pour clarifier vos objectifs et démarrer votre
              progression. Ne remettez pas vos bonnes résolutions à plus tard.
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                @click="contactCoach"
                class="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-orange-600 font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                Contacter {{ coach?.firstName }} maintenant
              </button>
              <!-- <button
                @click="contactCoach"
                class="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white/10 text-white font-semibold backdrop-blur-sm ring-1 ring-white/30 hover:bg-white/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                Poser une question rapide
              </button> -->
            </div>
          </div>

          <!-- Similar Coaches -->
          <div class="bg-white rounded-2xl shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">
              Vous recherchez peut-être autre chose?
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="similarCoach in similarCoaches"
                :key="similarCoach.id"
                class="border border-gray-200 rounded-xl p-4 hover:border-orange-300 transition-colors cursor-pointer"
                @click="navigateToCoach(similarCoach.id)"
              >
                <div class="flex items-center space-x-4 mb-4">
                  <img
                    :src="similarCoach.photo"
                    :alt="`${similarCoach.firstName}`"
                    class="w-16 h-16 rounded-full object-cover"
                  />
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900">
                      {{ similarCoach.firstName }}
                    </h3>
                    <p class="text-xs text-gray-600">{{ similarCoach.location }}</p>
                    <div class="flex items-center mt-1">
                      <template v-if="similarCoach.rating && similarCoach.rating > 0">
                        <StarIcon class="w-4 h-4 text-yellow-400 fill-current" />
                        <span class="ml-1 text-sm text-gray-600">{{ similarCoach.rating }}</span>
                        <span class="mx-2 text-gray-300">•</span>
                      </template>
                      <span class="text-xs text-gray-600"
                        >{{ similarCoach.experience }} ans d'expérience</span
                      >
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-bold text-gray-900">
                      <!-- {{ getCoachPrice(similarCoach) }}€ -->
                      {{ similarCoach.hourlyRate }}€
                    </p>
                    <p class="text-xs text-gray-500">par séance</p>
                  </div>
                </div>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="specialty in similarCoach.specialties.slice(0, 3)"
                    :key="specialty"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {{ specialty }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sticky Sidebar (Desktop) -->
        <div class="hidden lg:block">
          <div class="sticky top-24">
            <!-- Coach Info Card -->
            <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div class="text-center mb-6">
                <div class="relative w-fit mx-auto">
                  <img
                    :src="coach?.photo || '/default-avatar.png'"
                    :alt="`${coach?.firstName}`"
                    class="w-32 h-32 rounded-full object-cover mb-4 cursor-pointer transition-transform duration-200 hover:scale-[1.03]"
                    @click="openImagePreview"
                    :srcset="profilePhotoSrcSet"
                    sizes="128px"
                    loading="lazy"
                    decoding="async"
                  />
                  <!-- Certification badge (desktop) -->
                  <div v-if="isAdminCertified" class="absolute -top-2 -right-2">
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
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                  {{ coach?.firstName }}
                </h1>
                <div
                  v-if="reviews.length > 0"
                  class="flex items-center justify-center mb-2 cursor-pointer select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-md"
                  role="button"
                  tabindex="0"
                  aria-label="Voir les avis du coach"
                  @click="scrollToReviews"
                  @keydown.enter.prevent="scrollToReviews"
                  @keydown.space.prevent="scrollToReviews"
                >
                  <StarIcon
                    class="w-5 h-5 text-yellow-400 fill-current transition-transform group-hover:scale-110"
                  />
                  <span
                    class="ml-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-orange-600"
                    >{{ coach?.rating }}</span
                  >
                  <span class="mx-2 text-gray-300">•</span>
                  <span class="text-gray-600 transition-colors group-hover:text-orange-600"
                    >{{ reviews.length }} avis</span
                  >
                </div>
                <p class="text-orange-600 font-medium">{{ coach?.location }}</p>
              </div>

              <!-- Key Stats -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="text-center p-3 bg-orange-50 rounded-lg">
                  <p class="text-2xl font-bold text-orange-600">{{ coach?.hourlyRate }}€</p>
                  <p class="text-sm text-gray-600">par séance</p>
                </div>
                <div class="text-center p-3 bg-blue-50 rounded-lg">
                  <p class="text-2xl font-bold text-blue-600">{{ coach?.experience }}</p>
                  <p class="text-sm text-gray-600">ans d'expérience</p>
                </div>
                <!-- <div class="text-center p-3 bg-green-50 rounded-lg">
                  <p class="text-lg font-bold text-green-600">&lt; 2h</p>
                  <p class="text-sm text-gray-600">temps de réponse</p>
                </div> -->
                <!-- <div class="text-center p-3 bg-purple-50 rounded-lg">
                  <p class="text-lg font-bold text-purple-600">GRATUIT</p>
                  <p class="text-sm text-gray-600">1er cours</p>
                </div> -->
              </div>

              <!-- Primary Specialties -->
              <div class="mb-6">
                <h3 class="text-sm font-semibold text-gray-900 mb-2">Spécialités</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="specialty in coach?.specialties?.slice(0, 4)"
                    :key="specialty"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                  >
                    {{ specialty }}
                  </span>
                </div>
              </div>

              <!-- CTA Buttons -->
              <div class="space-y-3">
                <!-- <button
                  @click="bookFreeTrial"
                  class="w-full bg-gradient-to-r from-orange-500 to-blue-600 text-white py-3 px-6 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Réserver le 1er cours gratuit
                </button> -->
                <button
                  @click="contactCoach"
                  class="w-full bg-gradient-to-r from-orange-500 to-blue-600 text-white py-3 px-6 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Contacter {{ coach?.firstName }}
                </button>
              </div>

              <!-- Premium Contact & Social (Desktop) -->
              <div
                v-if="hasPremiumSubscription && contactAvailable"
                class="mt-8 border-t border-gray-100 pt-6 space-y-4"
              >
                <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <svg
                    class="w-4 h-4 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Contact & Réseaux
                </h3>
                <ul class="space-y-2 text-sm">
                  <li v-if="contactInfo?.email" class="flex items-center gap-2 break-all">
                    <svg
                      class="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1a3 3 0 01-3 3H8m8-4v1a3 3 0 003 3h1"
                      />
                    </svg>
                    <a
                      :href="`mailto:${contactInfo.email}`"
                      class="text-orange-600 hover:underline"
                      >{{ contactInfo.email }}</a
                    >
                  </li>
                  <li v-if="contactInfo?.website" class="flex items-center gap-2 truncate">
                    <svg
                      class="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4a8 8 0 100 16 8 8 0 000-16zm2 12l-4-4 4-4"
                      />
                    </svg>
                    <a
                      :href="normalizeWebsite(contactInfo.website)"
                      target="_blank"
                      rel="noopener"
                      class="text-orange-600 hover:underline max-w-[14ch] truncate"
                      >{{ displayDomain(contactInfo.website) }}</a
                    >
                  </li>
                  <li v-if="contactInfo?.instagram" class="flex items-center gap-2 truncate">
                    <svg class="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zm8.75 2a1 1 0 110 2 1 1 0 010-2zM12 8a4 4 0 110 8 4 4 0 010-8z"
                      />
                    </svg>
                    <a
                      :href="instagramUrl"
                      target="_blank"
                      rel="noopener"
                      class="text-orange-600 hover:underline max-w-[14ch] truncate"
                      >{{ instagramHandleDisplay }}</a
                    >
                  </li>
                  <li v-if="contactInfo?.facebook" class="flex items-center gap-2 truncate">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M22 12.07C22 6.48 17.52 2 11.93 2 6.35 2 1.87 6.48 1.87 12.07c0 4.99 3.66 9.13 8.44 9.93v-7.03H7.9v-2.9h2.41V9.41c0-2.38 1.42-3.7 3.6-3.7 1.04 0 2.13.19 2.13.19v2.34h-1.2c-1.18 0-1.55.73-1.55 1.48v1.78h2.64l-.42 2.9h-2.22V22c4.78-.8 8.44-4.94 8.44-9.93z"
                      />
                    </svg>
                    <a
                      :href="facebookUrl"
                      target="_blank"
                      rel="noopener"
                      class="text-orange-600 hover:underline max-w-[14ch] truncate"
                      >{{ facebookHandleDisplay }}</a
                    >
                  </li>
                </ul>
              </div>
            </div>

            <!-- Share Profile -->
            <!-- <div class="bg-white rounded-2xl shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Partager ce profil</h3>
              <div class="flex space-x-3">
                <button
                  @click="shareProfile('email')"
                  class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Email
                </button>
                <button
                  @click="shareProfile('facebook')"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Facebook
                </button>
                <button
                  @click="shareProfile('whatsapp')"
                  class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  WhatsApp
                </button>
              </div>
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Modal -->
    <RequestModal
      v-if="showContactModal"
      :selectedCoach="coach"
      @close="showContactModal = false"
      @submit="submitContact"
    />

    <!-- Free Trial Modal -->
    <div
      v-if="showTrialModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Réserver votre cours gratuit</h3>
        <p class="text-gray-600 mb-6">
          Réservez dès maintenant votre séance d'essai gratuite de 45 minutes avec
          {{ coach?.firstName }}.
        </p>
        <div class="space-y-4">
          <button
            class="w-full bg-gradient-to-r from-orange-500 to-blue-600 text-white py-3 px-6 rounded-full font-bold hover:shadow-lg transition-all duration-200"
          >
            Choisir un créneau
          </button>
          <button
            @click="showTrialModal = false"
            class="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-full font-medium hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>

    <!-- Service Details Modal -->
    <div
      v-if="showServiceModal && selectedService"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="closeServiceModal"
    >
      <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <!-- Service icon based on type -->
                <svg
                  v-if="selectedService.canBeSolo && !selectedService.canBeGroup"
                  class="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <svg
                  v-else-if="selectedService.canBeGroup && !selectedService.canBeSolo"
                  class="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <svg
                  v-else
                  class="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">{{ selectedService.title }}</h3>
                <p class="text-gray-600">
                  {{ selectedService.category }} - {{ selectedService.domain }}
                </p>
              </div>
            </div>
            <button
              @click="closeServiceModal"
              class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                class="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="p-6 space-y-6">
          <!-- Pricing Section -->
          <div class="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl p-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Tarifs</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-if="selectedService.canBeSolo && selectedService.soloPrice"
                class="bg-white rounded-lg p-4"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-600">Cours particulier</p>
                    <p class="text-2xl font-bold text-orange-600">
                      {{ selectedService.soloPrice }}€
                    </p>
                  </div>
                  <svg
                    class="w-8 h-8 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  Par séance de {{ selectedService.duration }} minutes
                </p>
              </div>
              <div
                v-if="selectedService.canBeGroup && selectedService.groupPrice"
                class="bg-white rounded-lg p-4"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-600">Cours en groupe</p>
                    <p class="text-2xl font-bold text-blue-600">
                      {{ selectedService.groupPrice }}€
                    </p>
                  </div>
                  <svg
                    class="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  Par personne / {{ selectedService.duration }} minutes
                </p>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div v-if="selectedService.description">
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Description</h4>
            <p class="text-gray-700 leading-relaxed">{{ selectedService.description }}</p>
          </div>

          <!-- Service Details -->
          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Détails du service</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Durée</span>
                  <span class="font-medium text-gray-900"
                    >{{ selectedService.duration }} minutes</span
                  >
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Domaine</span>
                  <span class="font-medium text-gray-900">{{ selectedService.domain }}</span>
                </div>
                <div v-if="selectedService.subCategory" class="flex items-center justify-between">
                  <span class="text-gray-600">Sous-catégorie</span>
                  <span class="font-medium text-gray-900">{{ selectedService.subCategory }}</span>
                </div>
                <div
                  v-if="
                    selectedService.customAvailability && selectedService.customAvailability.length
                  "
                  class="flex items-start justify-between"
                >
                  <span class="text-gray-600 mt-0.5">Jours disponibles</span>
                  <div class="text-right">
                    <template v-if="availabilityShortcut === 'all'">
                      <span
                        class="inline-block text-xs font-medium px-2 py-0.5 rounded bg-orange-100 text-orange-700"
                        >Tous les jours</span
                      >
                    </template>
                    <template v-else-if="availabilityShortcut === 'weekend'">
                      <span
                        class="inline-block text-xs font-medium px-2 py-0.5 rounded bg-orange-100 text-orange-700"
                        >Week-end</span
                      >
                    </template>
                    <template v-else-if="availabilityShortcut === 'weekdays'">
                      <span
                        class="inline-block text-xs font-medium px-2 py-0.5 rounded bg-orange-100 text-orange-700"
                        >En semaine</span
                      >
                    </template>
                    <template v-else>
                      <div class="flex flex-wrap gap-1 justify-end max-w-[200px]">
                        <span
                          v-for="slot in normalizedAvailability"
                          :key="slot.day"
                          class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-100 text-orange-700"
                        >
                          {{ slot.short }}
                        </span>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Format</span>
                  <div class="text-right">
                    <span
                      v-if="selectedService.canBeSolo && selectedService.canBeGroup"
                      class="font-medium text-gray-900"
                    >
                      Individuel & Groupe
                    </span>
                    <span v-else-if="selectedService.canBeSolo" class="font-medium text-gray-900">
                      Cours particulier
                    </span>
                    <span v-else-if="selectedService.canBeGroup" class="font-medium text-gray-900">
                      Cours en groupe
                    </span>
                  </div>
                </div>
                <div v-if="selectedService.hasFreeTrial" class="flex items-center justify-between">
                  <span class="text-gray-600">Essai gratuit</span>
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    Disponible
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Location Options -->
          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Lieux disponibles</h4>
            <div class="space-y-3">
              <div v-if="selectedService.canBeAtHome" class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-gray-700">À domicile</span>
              </div>
              <div v-if="selectedService.canBeOnline" class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-gray-700">En ligne (visioconférence)</span>
              </div>
              <div v-if="selectedService.canBeInPublicSpaces" class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-gray-700">Espaces publics (parcs, plages)</span>
              </div>
              <div
                v-if="
                  selectedService.customPlace &&
                  (selectedService.customPlace.label || selectedService.customPlace.address)
                "
                class="flex items-start"
              >
                <svg
                  class="w-5 h-5 text-green-500 mr-3 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <div class="text-gray-700 text-sm">
                  <div class="font-medium">Lieu du cours :</div>
                  <div>
                    <span v-if="selectedService.customPlace.label" class="text-gray-900">{{
                      selectedService.customPlace.label
                    }}</span>
                    <span
                      v-if="selectedService.customPlace.address"
                      class="block text-gray-500 text-[13px] mt-0.5"
                      >{{ selectedService.customPlace.address }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Free Trial Info -->
          <div
            v-if="selectedService.hasFreeTrial && selectedService.freeTrialModalities"
            class="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div class="flex items-start">
              <svg
                class="w-5 h-5 text-green-600 mr-3 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <div>
                <p class="font-medium text-green-800 mb-1">Séance d'essai gratuite</p>
                <p class="text-sm text-green-700">{{ selectedService.freeTrialModalities }}</p>
              </div>
            </div>
          </div>

          <!-- Cancellation Policy -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h5 class="font-medium text-gray-900 mb-2">Politique d'annulation</h5>
            <p class="text-sm text-gray-600">{{ selectedService.cancellationPolicy }}</p>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div class="flex space-x-4">
            <button
              @click="contactCoachFromService"
              class="flex-1 bg-gradient-to-r from-orange-500 to-blue-600 text-white py-3 px-6 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Contacter {{ coach?.firstName }}
            </button>
            <button
              @click="closeServiceModal"
              class="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Leave Review Modal -->
    <TransitionRoot as="template" :show="showReviewModal">
      <Dialog as="div" class="relative z-50" @close="closeReviewModal">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30" />
        </TransitionChild>
        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                class="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle class="text-lg font-bold text-gray-900 mb-4">
                  Laisser un avis pour {{ coach?.firstName }}
                </DialogTitle>
                <div v-if="!reviewSubmitted">
                  <form @submit.prevent="submitReview" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1"
                        >Votre prénom</label
                      >
                      <input
                        v-model.trim="reviewForm.clientName"
                        type="text"
                        required
                        maxlength="50"
                        class="dark:text-gray-900 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1"
                        >Votre email
                        <span class="text-gray-400 text-xs">(ne sera pas affiché)</span></label
                      >
                      <input
                        v-model.trim="reviewForm.clientEmail"
                        type="email"
                        required
                        maxlength="120"
                        class="dark:text-gray-900 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
                      <div class="flex items-center space-x-2">
                        <button
                          v-for="i in 5"
                          :key="i"
                          type="button"
                          @click="reviewForm.rating = i"
                          class="p-1"
                          :aria-label="`Donner ${i} étoiles`"
                        >
                          <StarIcon
                            class="w-7 h-7"
                            :class="
                              i <= reviewForm.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            "
                          />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1"
                        >Votre avis (optionnel)</label
                      >
                      <textarea
                        v-model.trim="reviewForm.comment"
                        rows="4"
                        maxlength="1000"
                        class="dark:text-gray-900 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Partagez votre expérience (facultatif)"
                      ></textarea>
                    </div>
                    <p class="text-xs text-gray-500">
                      Merci pour votre avis. Il apparaîtra une fois approuvé par notre équipe.
                    </p>
                    <div class="pt-2 flex justify-end space-x-3">
                      <button
                        type="button"
                        @click="closeReviewModal"
                        class="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        :disabled="creatingReview || !reviewForm.rating"
                        class="px-5 py-2 rounded-md bg-gradient-to-r from-orange-500 to-blue-600 text-white font-semibold disabled:opacity-50 flex items-center"
                      >
                        <span v-if="!creatingReview">Envoyer</span>
                        <span v-else class="flex items-center">
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
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                          Envoi...
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
                <div v-else class="text-center py-8">
                  <div
                    class="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4"
                  >
                    <CheckIcon class="w-8 h-8 text-green-600" />
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Merci beaucoup !</h3>
                  <p class="text-gray-600">
                    Votre avis a été reçu. Il sera publié après validation.
                  </p>
                  <button
                    @click="closeReviewModal"
                    class="mt-6 px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-blue-600 text-white font-semibold"
                  >
                    Fermer
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
    <AppFooter />
    <!-- Fullscreen Image Preview -->
    <transition name="fade">
      <div
        v-if="showImagePreview"
        class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        @click="closeImagePreview"
      >
        <div class="relative mx-auto w-[400px] h-[400px] max-w-full max-h-[80vh]">
          <img
            :src="highResPhoto || coach?.photo || '/default-avatar.png'"
            :alt="`${coach?.firstName}`"
            class="w-full h-full rounded-3xl shadow-2xl object-cover"
            :srcset="profilePhotoSrcSet"
            sizes="400px"
            decoding="async"
          />
        </div>
        <p class="mt-3 text-center text-sm text-white/70 select-none">
          Cliquer à l'extérieur pour fermer
        </p>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { StarIcon, UserCircleIcon } from '@heroicons/vue/24/solid'
import type { Coach } from '@/types/coach'
import type { CoachService } from '@/types/service'
import type { ClientRequest } from '@/types/Lead'
import RequestModal from '@/components/RequestModal.vue'
import { useCoachStore } from '@/stores/coach'
import { useAuthStore } from '@/stores/auth'
import { supabaseCoachServicesApi } from '@/services/supabaseCoachServicesApi'
import { supabase } from '@/utils/supabase'
import { reviewApi } from '@/services'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { CheckIcon } from '@heroicons/vue/24/outline'
import type { Review } from '@/types/review'
import AppFooter from '@/components/AppFooter.vue'

// Router
const route = useRoute()
const router = useRouter()

// Stores
const coachStore = useCoachStore()
const authStore = useAuthStore()

// State
const coach = ref<Coach | null>(null)
const coachServices = ref<CoachService[]>([])
const similarCoaches = ref<Coach[]>([])
const showContactModal = ref(false)
const showTrialModal = ref(false)
const showServiceModal = ref(false)
const selectedService = ref<CoachService | null>(null)
const isLoading = ref(false)
const isLoadingServices = ref(false)
// Image preview modal
const showImagePreview = ref(false)
const openImagePreview = () => {
  if (!coach.value?.photo) return
  showImagePreview.value = true
}
const closeImagePreview = () => {
  showImagePreview.value = false
}
// Premium subscription gates last name & direct contact info (not publicly shown yet)
const hasPremiumSubscription = ref<boolean>(false)
// Certified badge now represents having an active premium subscription (NOT diploma validation)
const isAdminCertified = ref<boolean>(false)
// Header condensation
const isCondensedHeader = ref(false)
// Header sizing (for fixed header spacer)
const headerRef = ref<HTMLElement | null>(null)
const headerHeight = ref(0)
const measureHeader = () => {
  if (headerRef.value) headerHeight.value = headerRef.value.offsetHeight
}
// Mobile collapse state for "Modalités des cours"
const mobileModalitesOpen = ref(false)
// Dynamic modalities helpers
const locationLabels: Record<string, string> = {
  atHome: 'À domicile',
  visio: 'Visio',
  publicSpaces: 'Espaces publics',
  gym: 'Salle de sport',
}

// Summarize modalities availability days (e.g. Tous les jours / Week-end / En semaine / custom list)
const dayNameToIndex: Record<string, number> = {
  Dimanche: 0,
  Sunday: 0,
  Lundi: 1,
  Monday: 1,
  Mardi: 2,
  Tuesday: 2,
  Mercredi: 3,
  Wednesday: 3,
  Jeudi: 4,
  Thursday: 4,
  Vendredi: 5,
  Friday: 5,
  Samedi: 6,
  Saturday: 6,
}
const indexToShort = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const modalitiesAvailabilityNormalized = computed(() => {
  const list = coach.value?.modalities?.availabilityDays || []
  return list
    .map((d) => dayNameToIndex[d] ?? null)
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b)
})
const modalitiesAvailabilityShortcut = computed(() => {
  const days = modalitiesAvailabilityNormalized.value
  if (days.length === 7 && days.every((d, i) => d === i)) return 'all'
  if (days.length && days.every((d) => d === 0 || d === 6)) return 'weekend'
  const weekdays = days.filter((d) => d > 0 && d < 6)
  if (weekdays.length === 5 && days.length === 5) return 'weekdays'
  return 'custom'
})
const modalitiesAvailabilityShortList = computed(() => {
  const days = modalitiesAvailabilityNormalized.value
  const unique = Array.from(new Set(days))
  return unique.map((i) => indexToShort[i] || i)
})

// Determine if there is any meaningful modalities content to show
interface ModalitiesLike {
  locations?: Record<string, { enabled?: boolean; details?: string }>
  freeTrial?: { enabled?: boolean; details?: string }
  availabilityDays?: string[]
  cancellationPolicy?: string
}
const hasModalitesContent = computed(() => {
  const m = coach.value?.modalities as ModalitiesLike | undefined
  if (!m) return false
  const hasLocations = !!m.locations && Object.values(m.locations).some((l) => l?.enabled)
  const hasFreeTrial = !!m.freeTrial?.enabled
  const hasAvailability = Array.isArray(m.availabilityDays) && m.availabilityDays.length > 0
  const hasCancellation = !!m.cancellationPolicy
  return hasLocations || hasFreeTrial || hasAvailability || hasCancellation
})

// Bio paragraphs: split on blank lines, trim each, filter empties
const bioParagraphs = computed(() => {
  const raw = coach.value?.bio || ''
  // Normalize Windows line endings then split on two or more newlines
  return raw
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
})

// Scroll handler to toggle condensed header
const handleScroll = () => {
  const y = window.scrollY || document.documentElement.scrollTop
  isCondensedHeader.value = y > 40
  // Measuring after scroll (debounced via rAF)
  requestAnimationFrame(measureHeader)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', measureHeader, { passive: true })
  handleScroll()
  nextTick(measureHeader)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', measureHeader)
})

// Re-measure whenever condensation state toggles (after transition start)
watch(isCondensedHeader, async () => {
  await nextTick()
  measureHeader()
})

// Helper function to get coach pricing
// const getCoachPrice = (coach: Coach | null): number => {
//   if (!coach) return 0
//   const basePrice = 35
//   const experienceMultiplier = Math.min(coach.experience * 2, 20)
//   const ratingBonus = (coach.rating - 4.0) * 10
//   const specialtyBonus = coach.specialties.some((s) =>
//     ['Nutrition', 'Préparation physique', 'Powerlifting', 'Tennis'].includes(s),
//   )
//     ? 10
//     : 0

//   return Math.round(basePrice + experienceMultiplier + ratingBonus + specialtyBonus)
// }

// Premium subscription check (non-blocking)
const checkPremiumSubscription = async (coachId: string) => {
  const { data: subscription } = await supabase
    .from('coaches_current_subscription')
    .select('has_active_subscription')
    .eq('id', coachId)
    .single()
  hasPremiumSubscription.value = subscription?.has_active_subscription || false
}

// Compute certification: premium subscription only (decoupled from diploma approvals)
interface DiplomaLike {
  title?: string
  status?: string
}
const evaluateAdminCertification = () => {
  // Simply mirror premium status
  isAdminCertified.value = hasPremiumSubscription.value === true
}

// Only diplomas with status approved are publicly visible
const approvedDiplomas = computed(() => {
  const diplomas = (coach.value as unknown as { profile_activity?: { diplomas?: DiplomaLike[] } })
    ?.profile_activity?.diplomas
  if (!Array.isArray(diplomas)) return [] as DiplomaLike[]
  return diplomas.filter((d) => d && d.status === 'approved' && d.title)
})

// Premium contact & social info (from structured profile_contact JSON)
interface ContactInfoShape {
  email?: string | null
  website?: string | null
  instagram?: string | null
  facebook?: string | null
  phone?: string | null
}
// Local extension of Coach to carry profile_contact without modifying global Coach interface
interface CoachWithContact extends Coach {
  profile_contact?: ContactInfoShape
}
const contactInfo = computed<ContactInfoShape | null>(() => {
  const anyCoach = coach.value as unknown as { profile_contact?: ContactInfoShape }
  if (!anyCoach || !anyCoach.profile_contact) return null
  return anyCoach.profile_contact
})
const cleanedHandle = (val?: string | null) => {
  if (!val) return ''
  let v = val.trim()
  // If full URL pasted, extract final path / handle
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v)
      v = u.pathname.replace(/\/+$/, '').split('/').filter(Boolean).pop() || v
    } catch {}
  }
  // Remove leading @ if present
  v = v.replace(/^@+/, '')
  return v
}
const instagramHandleDisplay = computed(() => {
  const h = cleanedHandle(contactInfo.value?.instagram)
  return h ? '@' + h : ''
})
const facebookHandleDisplay = computed(() => {
  const h = cleanedHandle(contactInfo.value?.facebook)
  return h ? h : ''
})
const instagramUrl = computed(() => {
  const h = cleanedHandle(contactInfo.value?.instagram)
  return h ? `https://www.instagram.com/${h}` : undefined
})
const facebookUrl = computed(() => {
  const h = cleanedHandle(contactInfo.value?.facebook)
  return h ? `https://www.facebook.com/${h}` : undefined
})
const normalizeWebsite = (url?: string | null) => {
  if (!url) return undefined
  let u = url.trim()
  if (!u) return undefined
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u.replace(/^\/+/, '')
  return u
}
const displayDomain = (url?: string | null) => {
  try {
    const u = normalizeWebsite(url)
    if (!u) return ''
    const parsed = new URL(u)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return url || ''
  }
}
const contactAvailable = computed(() => {
  if (!contactInfo.value) return false
  return !!(
    contactInfo.value.email ||
    contactInfo.value.website ||
    contactInfo.value.instagram ||
    contactInfo.value.facebook
  )
})

// Methods

const contactCoach = () => {
  showContactModal.value = true
}

const openServiceModal = (service: CoachService) => {
  selectedService.value = service
  showServiceModal.value = true
}

const closeServiceModal = () => {
  showServiceModal.value = false
  selectedService.value = null
}

const contactCoachFromService = () => {
  // Close service modal and open contact modal
  closeServiceModal()
  setTimeout(() => {
    showContactModal.value = true
  }, 100)
}

const submitContact = (requestData: Partial<ClientRequest>) => {
  console.log('Contact submitted:', requestData)
  showContactModal.value = false
}

// const shareProfile = (platform: string) => {
//   const url = window.location.href
//   const text = `Découvrez le profil de ${coach.value?.firstName}, coach ${coach.value?.specialties[0]} sur Coachiles`

//   switch (platform) {
//     case 'email':
//       window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`
//       break
//     case 'facebook':
//       window.open(
//         `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
//         '_blank',
//       )
//       break
//     case 'whatsapp':
//       window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
//       break
//   }
// }

const navigateToCoach = (coachId: string) => {
  router.push(`/coach/${coachId}`)
}

// --- Similar Coaches Logic --------------------------------------------------
// Derive a country name from a location string (heuristic: last token if comma, else last word)
const deriveCountry = (loc: string | undefined | null): string | null => {
  if (!loc) return null
  if (loc.includes(',')) {
    const parts = loc
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
    return parts[parts.length - 1].toLowerCase()
  }
  const words = loc.split(/\s+/).filter(Boolean)
  if (!words.length) return null
  return words[words.length - 1].toLowerCase()
}

const pickSimilarCoaches = (current: Coach, all: Coach[], max: number = 3): Coach[] => {
  const currentCountry = deriveCountry(current.location)
  const currentSpecs = new Set(current.specialties)
  const candidates = all.filter((c) => c.id !== current.id)

  interface RankedCoach {
    coach: Coach
    score: number
    matchBoth: boolean
    matchCountry: boolean
    matchSpec: boolean
  }
  const ranked: RankedCoach[] = candidates.map((c) => {
    const country = deriveCountry(c.location)
    const matchCountry = !!currentCountry && country === currentCountry
    const matchSpec = c.specialties.some((s) => currentSpecs.has(s))
    const matchBoth = matchCountry && matchSpec
    // Base scoring: both +4, country +2, spec +1, plus rating normalized (0-1) * 0.5
    const score =
      (matchBoth ? 4 : 0) + (matchCountry ? 2 : 0) + (matchSpec ? 1 : 0) + c.rating * 0.05
    return { coach: c, score, matchBoth, matchCountry, matchSpec }
  })

  // Primary selection: any that match at least one criterion
  const primary = ranked
    .filter((r) => r.matchCountry || r.matchSpec)
    .sort((a, b) => {
      // Sort by: matchBoth desc, score desc, rating desc
      if (b.matchBoth !== a.matchBoth) return Number(b.matchBoth) - Number(a.matchBoth)
      if (b.score !== a.score) return b.score - a.score
      return b.coach.rating - a.coach.rating
    })
    .slice(0, max)
    .map((r) => r.coach)

  if (primary.length >= max) return primary

  // Fallback: fill with best rated remaining coaches not already chosen
  const chosenIds = new Set(primary.map((c) => c.id))
  const remaining = candidates
    .filter((c) => !chosenIds.has(c.id))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, max - primary.length)

  return [...primary, ...remaining]
}

// Load coach services from database
const loadCoachServices = async (coachId: string) => {
  try {
    isLoadingServices.value = true
    console.log('📡 Loading services for coach:', coachId)

    // Small delay to ensure skeleton is visible (can be removed in production)
    await new Promise((resolve) => setTimeout(resolve, 300))

    const services = await supabaseCoachServicesApi.getPublicCoachServices(coachId)
    coachServices.value = services
    console.log('✅ Loaded', services.length, 'services')
  } catch (error) {
    console.error('❌ Error loading coach services:', error)
    coachServices.value = []
  } finally {
    isLoadingServices.value = false
  }
}

// Refresh services when page becomes visible again
const handleVisibilityChange = () => {
  if (!document.hidden && coach.value) {
    console.log('👁️ Page visible again, refreshing services...')
    loadCoachServices(coach.value.id)
  }
}

// Watch for route parameter changes to reload services
watch(
  () => route.params.id,
  async (newId) => {
    if (newId && coach.value) {
      console.log('🔄 Route changed, reloading services for coach ID:', newId)
      await loadCoachServices(coach.value.id)
    }
  },
)

// Lifecycle
const forceScrollTop = () => {
  if (typeof window !== 'undefined') {
    // Disable native restoration for this navigation
    if ('scrollRestoration' in window.history) {
      try {
        window.history.scrollRestoration = 'manual'
      } catch {}
    }
    window.scrollTo(0, 0)
    requestAnimationFrame(() => window.scrollTo(0, 0))
  }
}

// After dynamic content (images/services) loads, ensure scroll pinned to top
const ensureFinalTopPosition = () => {
  if (typeof window === 'undefined') return
  const container = document.querySelector('.coach-public-profile')
  if (!container) return
  const images = Array.from(container.querySelectorAll('img')) as HTMLImageElement[]
  if (!images.length) {
    forceScrollTop()
    return
  }
  let remaining = images.filter((img) => !img.complete).length
  if (remaining === 0) {
    forceScrollTop()
    return
  }
  const done = () => {
    remaining--
    if (remaining <= 0) {
      requestAnimationFrame(() => forceScrollTop())
      stopScrollEnforcement()
    }
  }
  images.forEach((img) => {
    if (img.complete) return
    img.addEventListener('load', done, { once: true })
    img.addEventListener('error', done, { once: true })
  })
}

// --- Scroll Enforcement Logic -------------------------------------------------
// Some dynamic content (images/services) appears to push the scroll position down after
// initial navigation. We aggressively keep the scroll at 0 until all critical loads finish
// (or a max timeout) to guarantee landing at the top for user perception.
let scrollEnforcementTimer: number | null = null
let scrollEnforcementStart = 0

const startScrollEnforcement = () => {
  if (typeof window === 'undefined') return
  stopScrollEnforcement()
  scrollEnforcementStart = performance.now()
  scrollEnforcementTimer = window.setInterval(() => {
    // If something pushed us down, yank back up.
    if (window.scrollY !== 0) {
      window.scrollTo(0, 0)
    }
    // Safety stop after 1500ms to avoid locking user scroll.
    if (performance.now() - scrollEnforcementStart > 1500) {
      stopScrollEnforcement()
    }
  }, 16) // ~60fps
}

const stopScrollEnforcement = () => {
  if (scrollEnforcementTimer !== null) {
    clearInterval(scrollEnforcementTimer)
    scrollEnforcementTimer = null
  }
}

// Consolidated loader so we can reuse on route changes
const loadCoachProfile = async (coachId: string) => {
  console.log('Loading coach profile for ID:', coachId)
  // Reset state for new coach navigation
  coach.value = null
  coachServices.value = []
  similarCoaches.value = []
  isAdminCertified.value = false
  hasPremiumSubscription.value = false
  reviews.value = []
  isLoading.value = true
  isLoadingServices.value = true
  try {
    if (coachStore.coaches.length === 0) {
      console.log('📡 Fetching coaches (store empty) ...')
      await coachStore.fetchCoaches()
    }
    coach.value = coachStore.coaches.find((c) => c.id === coachId) || null
    if (!coach.value) {
      console.warn('❌ Coach not found for id', coachId)
      isLoadingServices.value = false
      return
    }
    // Always fetch a fresh copy to ensure profile_activity (diplomas) is up-to-date after moderation
    try {
      interface FreshCoachRow {
        id: string
        last_name?: string | null
        bio?: string | null
        profile_activity?: {
          diplomas?: Array<{
            id: string
            title?: string
            status?: 'pending' | 'approved' | 'rejected'
            proofFileName?: string
            proofFileUrl?: string
            rejectionNote?: string
          }>
        }
      }
      const { data: fresh, error: freshErr } = await supabase
        .from('coaches')
        .select('id,last_name,bio,profile_activity,profile_contact')
        .eq('id', coach.value.id)
        .single<FreshCoachRow>()
      if (!freshErr && fresh && coach.value) {
        const existing = coach.value as CoachWithContact
        const freshContact = (fresh as unknown as { profile_contact?: ContactInfoShape })
          .profile_contact
        const updated: CoachWithContact = {
          ...existing,
          profile_activity: fresh.profile_activity,
          lastName: fresh.last_name || existing.lastName,
          bio: fresh.bio || existing.bio,
          profile_contact: freshContact || existing.profile_contact,
        }
        coach.value = updated
      }
    } catch (e) {
      console.warn('⚠️ Could not refresh coach profile with profile_activity', e)
    }
    if (coach.value) await loadCoachServices(coach.value.id)
    stopScrollEnforcement()
    // Fetch premium status then set certification accordingly
    if (coach.value) await checkPremiumSubscription(coach.value.id)
    evaluateAdminCertification()
    // (Optional) could refetch diplomas for display but they no longer influence certification
    if (coach.value) similarCoaches.value = pickSimilarCoaches(coach.value, coachStore.coaches, 3)
    console.log(
      '🔗 Similar coaches after reload:',
      similarCoaches.value.map((c) => c.firstName),
    )
  } catch (err) {
    console.error('❌ Error in loadCoachProfile:', err)
    isLoadingServices.value = false
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  forceScrollTop()
  startScrollEnforcement()
  if (window.innerWidth >= 640) mobileModalitesOpen.value = true
  document.addEventListener('visibilitychange', handleVisibilityChange)
  const coachId = route.params.id as string
  await loadCoachProfile(coachId)
  // Auto-open contact modal (and clean URL) if query present
  if (route.query.contact === 'true') {
    showContactModal.value = true
    router.replace({ path: route.path, query: { ...route.query, contact: undefined } })
  }
  ensureFinalTopPosition()
})

// Scroll reset on coach id change (same component instance navigation)
watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (!newId || newId === oldId) return
    forceScrollTop()
    startScrollEnforcement()
    await loadCoachProfile(newId as string)
    ensureFinalTopPosition()
  },
)

onUnmounted(() => {
  // Clean up visibility change listener
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  stopScrollEnforcement()
})

// Reviews
const reviews = ref<Review[]>([])
// Only display approved/published reviews publicly. Show latest one by default.
const approvedReviews = computed(() =>
  reviews.value.filter((r) => r.isPublished && r.moderationStatus === 'approved'),
)
const showAllReviews = ref(false)
const reviewsToDisplay = computed(() => {
  if (showAllReviews.value) return approvedReviews.value
  return approvedReviews.value.slice(0, 1)
})
// General average rating (one decimal) for approved reviews only
const approvedAverageRating = computed(() => {
  if (!approvedReviews.value.length) return null
  const avg =
    approvedReviews.value.reduce(
      (sum, r) => sum + (typeof r.rating === 'number' ? r.rating : 0),
      0,
    ) / approvedReviews.value.length
  return Number(avg.toFixed(1))
})
const loadingReviews = ref(false)
const showReviewModal = ref(false)
const creatingReview = ref(false)
const reviewSubmitted = ref(false)

interface ReviewForm {
  clientName: string
  clientEmail: string
  rating: number
  comment: string
}
const reviewForm = reactive<ReviewForm>({ clientName: '', clientEmail: '', rating: 0, comment: '' })
// reCAPTCHA
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined
const recaptchaReady = ref(false)
let recaptchaScriptAppended = false

// Minimal grecaptcha typing
declare global {
  interface Window {
    grecaptcha?: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>
      ready?: (cb: () => void) => void
    }
  }
}

const loadRecaptcha = () => {
  if (!recaptchaSiteKey || recaptchaScriptAppended) return
  const script = document.createElement('script')
  script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`
  script.async = true
  script.defer = true
  script.onload = () => {
    recaptchaReady.value = true
  }
  document.head.appendChild(script)
  recaptchaScriptAppended = true
}

const loadReviews = async () => {
  if (!coach.value) return
  loadingReviews.value = true
  try {
    reviews.value = await reviewApi.getCoachReviews(coach.value.id)
  } catch (e) {
    console.error('Failed to load reviews', e)
  } finally {
    loadingReviews.value = false
  }
}

const openReviewModal = () => {
  showReviewModal.value = true
  reviewSubmitted.value = false
  reviewForm.clientName = ''
  reviewForm.clientEmail = ''
  reviewForm.rating = 0
  reviewForm.comment = ''
  loadRecaptcha()
}
const closeReviewModal = () => {
  showReviewModal.value = false
}

const sanitize = (text: string) => text.replace(/<[^>]*>/g, '')

const submitReview = async () => {
  if (!coach.value) return
  if (!reviewForm.clientName || !reviewForm.clientEmail || !reviewForm.rating) return
  creatingReview.value = true
  try {
    let token: string | undefined
    if (recaptchaSiteKey && window.grecaptcha) {
      try {
        token = await window.grecaptcha.execute(recaptchaSiteKey, {
          action: 'submit_review',
        })
      } catch (e) {
        console.warn('reCAPTCHA execution failed', e)
      }
    }

    if (recaptchaSiteKey) {
      // Use Edge Function for server-side verification
      const { data, error } = await supabase.functions.invoke('create-review', {
        body: {
          token,
          coachId: coach.value.id,
          clientName: sanitize(reviewForm.clientName).substring(0, 50),
          clientEmail: sanitize(reviewForm.clientEmail).substring(0, 120),
          rating: reviewForm.rating,
          comment: reviewForm.comment ? sanitize(reviewForm.comment).substring(0, 1000) : undefined,
        },
      })
      if (error) throw error
      if (!data || data.status !== 'ok') {
        throw new Error('Review creation failed')
      }
    } else {
      // Fallback (no captcha configured)
      await reviewApi.createReview({
        coachId: coach.value.id,
        clientName: sanitize(reviewForm.clientName).substring(0, 50),
        clientEmail: sanitize(reviewForm.clientEmail).substring(0, 120),
        rating: reviewForm.rating,
        comment: reviewForm.comment ? sanitize(reviewForm.comment).substring(0, 1000) : undefined,
      })
    }
    reviewSubmitted.value = true
    // reload list (will still be empty until approved, but attempt fetch)
    await loadReviews()
  } catch (e) {
    console.error('Create review failed', e)
  } finally {
    creatingReview.value = false
  }
}

const formatDate = (d: Date) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(d)

watch(coach, async (c) => {
  if (c) await loadReviews()
})

// Recompute certification if premium status flips asynchronously
watch(hasPremiumSubscription, () => {
  evaluateAdminCertification()
})
// Availability mapping additions
// Map dayOfWeek (0=Dimanche,1=Lundi,..) to French names & short labels
const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const shortNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
// normalizedAvailability depends on selectedService (assumed ref in existing code)
// Provide defensive fallbacks
const normalizedAvailability = computed(() => {
  const svc = selectedService?.value
  if (!svc || !svc.customAvailability) return []
  return svc.customAvailability
    .filter((a) => a && a.isActive !== false)
    .map((a) => {
      const idx = a.dayOfWeek ?? 0
      return {
        day: idx,
        label: dayNames[idx] || 'Jour',
        short: shortNames[idx] || '??',
        startTime: a.startTime,
        endTime: a.endTime,
      }
    })
    .sort((a, b) => a.day - b.day)
})
// Determine if availability matches a shortcut pattern
const availabilityShortcut = computed(() => {
  const days = normalizedAvailability.value.map((d) => d.day).sort((a, b) => a - b)
  if (days.length === 7 && days.every((d, i) => d === i)) return 'all'
  if (days.length && days.every((d) => d === 0 || d === 6)) return 'weekend'
  const weekdays = days.filter((d) => d > 0 && d < 6)
  if (weekdays.length === 5 && days.length === 5) return 'weekdays'
  return 'custom'
})

// New code starts here
const reviewsSection = ref(null)

function scrollToReviews() {
  const el = reviewsSection.value as HTMLElement | null
  if (!el) return
  const rect = el.getBoundingClientRect()
  const elemTop = window.scrollY + rect.top
  const elemHeight = rect.height
  const vh = window.innerHeight
  const headerH = headerHeight.value || (headerRef.value?.offsetHeight ?? 0)
  const elementCenter = elemTop + elemHeight / 2
  let target = elementCenter - (vh + headerH) / 2
  if (target < 0) target = 0
  const maxScroll = document.documentElement.scrollHeight - vh
  if (target > maxScroll) target = maxScroll
  window.scrollTo({ top: target, behavior: 'smooth' })
  // Make section focusable for accessibility (without triggering extra scroll)
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}
// New code ends here

const profilePhotoSrcSet = computed(() => {
  const url = coach.value?.photo
  if (!url) return undefined
  const m = url.match(/^(.*)_(thumb|profile|highres)\.(jpg|jpeg|png|webp)$/i)
  if (!m) return undefined
  const base = m[1]
  const ext = m[3]
  return `${base}_thumb.${ext} 150w, ${base}_profile.${ext} 400w, ${base}_highres.${ext} 900w`
})
const highResPhoto = computed(() => {
  const url = coach.value?.photo
  if (!url) return null
  const m = url.match(/^(.*)_(thumb|profile|highres)\.(jpg|jpeg|png|webp)$/i)
  if (m) {
    const base = m[1]
    const ext = m[3]
    return `${base}_highres.${ext}`
  }
  return url
})
</script>

<style scoped>
/* Custom scrollbar for mobile */
.coach-public-profile {
  overflow-anchor: none;
}
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

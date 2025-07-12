<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <!-- Logo -->
          <div class="flex items-center">
            <button
              @click="$router.go(-1)"
              class="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                class="w-5 h-5 text-gray-600"
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
              class="text-3xl font-black text-transparent bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text"
            >
              Coachiles
            </h1>
          </div>
          <!-- Become Coach Button -->
          <button
            class="bg-gradient-to-r from-orange-500 to-blue-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Devenir Coach
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Coach Header Info (Mobile) -->
          <div class="lg:hidden bg-white rounded-2xl shadow-lg p-6">
            <div class="flex items-start space-x-4 mb-6">
              <img
                :src="coach?.photo || '/default-avatar.png'"
                :alt="`${coach?.firstName}`"
                class="w-20 h-20 rounded-full object-cover"
              />
              <div class="flex-1">
                <h1 class="text-2xl font-bold text-gray-900 mb-2">
                  {{ coach?.firstName }}
                </h1>
                <div class="flex items-center mb-2">
                  <StarIcon class="w-5 h-5 text-yellow-400 fill-current" />
                  <span class="ml-1 text-lg font-semibold text-gray-900">{{ coach?.rating }}</span>
                  <span class="mx-2 text-gray-300">•</span>
                  <span class="text-gray-600">{{ coach?.totalClients }} élèves</span>
                </div>
                <p class="text-orange-600 font-medium">{{ coach?.location }}</p>
              </div>
            </div>

            <!-- Quick Stats (Mobile) -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="text-center p-3 bg-orange-50 rounded-lg">
                <p class="text-2xl font-bold text-orange-600">{{ getCoachPrice(coach) }}€</p>
                <p class="text-sm text-gray-600">par séance</p>
              </div>
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <p class="text-2xl font-bold text-blue-600">{{ coach?.experience }}</p>
                <p class="text-sm text-gray-600">ans d'expérience</p>
              </div>
            </div>

            <!-- Primary CTA (Mobile) -->
            <div class="space-y-3">
              <button
                @click="bookFreeTrial"
                class="w-full bg-gradient-to-r from-orange-500 to-blue-600 text-white py-3 px-6 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Réserver le 1er cours gratuit
              </button>
              <button
                @click="contactCoach"
                class="w-full bg-white border-2 border-orange-400 text-orange-600 py-3 px-6 rounded-full font-semibold hover:bg-orange-50 transition-all duration-200"
              >
                Contacter {{ coach?.firstName }}
              </button>
            </div>
          </div>

          <!-- About / Profile Section -->
          <div class="bg-white rounded-2xl shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">
              À propos de {{ coach?.firstName }}
            </h2>

            <!-- Bio -->
            <div class="mb-8">
              <p class="text-gray-700 leading-relaxed text-lg mb-4">{{ coach?.bio }}</p>
              <p class="text-gray-600 leading-relaxed">
                Passionné(e) par le coaching sportif, j'accompagne mes élèves vers l'atteinte de
                leurs objectifs personnels. Que vous soyez débutant ou confirmé, je propose des
                programmes adaptés à votre niveau et à vos besoins spécifiques.
              </p>
            </div>

            <!-- Experience & Credentials -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Formation & Certifications</h3>
                <ul class="space-y-2">
                  <li
                    v-for="cert in coach?.certifications"
                    :key="cert"
                    class="flex items-center text-gray-700"
                  >
                    <svg
                      class="w-4 h-4 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    {{ cert }}
                  </li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Expérience</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Années d'expérience</span>
                    <span class="font-semibold text-gray-900">{{ coach?.experience }} ans</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Élèves accompagnés</span>
                    <span class="font-semibold text-gray-900">{{ coach?.totalClients }}+</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Spécialisation</span>
                    <span class="font-semibold text-gray-900">Tous niveaux</span>
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
            </div>
          </div>

          <!-- Services Offered -->
          <div class="bg-white rounded-2xl shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Services proposés</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Individual Training -->
              <div
                class="border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors"
              >
                <div class="flex items-center mb-4">
                  <div
                    class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4"
                  >
                    <svg
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
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">Cours particuliers</h3>
                    <p class="text-orange-600 font-medium">{{ getCoachPrice(coach) }}€/séance</p>
                  </div>
                </div>
                <p class="text-gray-600 mb-4">
                  Accompagnement personnalisé pour atteindre vos objectifs rapidement.
                </p>
                <ul class="text-sm text-gray-500 space-y-1">
                  <li>• Séance d'1h en face-à-face</li>
                  <li>• Programme adapté à votre niveau</li>
                  <li>• Suivi personnalisé</li>
                </ul>
              </div>

              <!-- Group Training -->
              <div
                class="border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors"
              >
                <div class="flex items-center mb-4">
                  <div
                    class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4"
                  >
                    <svg
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
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">Cours en groupe</h3>
                    <p class="text-blue-600 font-medium">
                      {{ Math.round(getCoachPrice(coach) * 0.7) }}€/séance
                    </p>
                  </div>
                </div>
                <p class="text-gray-600 mb-4">
                  Entraînements motivants en petit groupe (2-4 personnes).
                </p>
                <ul class="text-sm text-gray-500 space-y-1">
                  <li>• Séance d'1h15 en groupe</li>
                  <li>• Ambiance conviviale et motivante</li>
                  <li>• Tarif réduit par personne</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Location & Delivery -->
          <div class="bg-white rounded-2xl shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Modalités des cours</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Lieux de cours</h3>
                <div class="space-y-4">
                  <div class="flex items-start">
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
                      <p class="font-medium text-gray-900">À domicile</p>
                      <p class="text-sm text-gray-600">
                        Je me déplace chez vous dans un rayon de 20km autour de
                        {{ coach?.location }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start">
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
                      <p class="font-medium text-gray-900">Espaces publics</p>
                      <p class="text-sm text-gray-600">
                        Parcs, plages, terrains de sport publics selon vos préférences
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start">
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
                      <p class="font-medium text-gray-900">Salle de sport</p>
                      <p class="text-sm text-gray-600">
                        Accès à ma salle partenaire (supplément possible)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations pratiques</h3>
                <div class="space-y-4">
                  <div class="bg-green-50 border border-green-200 rounded-lg p-4">
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
                    <p class="text-sm text-green-700">
                      Séance d'essai gratuite de 45 minutes pour faire connaissance et définir vos
                      objectifs.
                    </p>
                  </div>

                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="text-gray-600">Temps de réponse</span>
                      <span class="font-semibold text-gray-900">&lt; 2h</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-gray-600">Disponibilités</span>
                      <span class="font-semibold text-gray-900">{{ coach?.availability }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-gray-600">Annulation</span>
                      <span class="font-semibold text-gray-900">24h avant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pricing & Packages -->
          <div class="bg-white rounded-2xl shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Tarifs & Formules</h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Single Session -->
              <div
                class="border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors"
              >
                <div class="text-center mb-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Séance unique</h3>
                  <div class="text-3xl font-bold text-gray-900">{{ getCoachPrice(coach) }}€</div>
                  <p class="text-sm text-gray-600">par séance d'1h</p>
                </div>
                <ul class="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• Flexibilité maximale</li>
                  <li>• Aucun engagement</li>
                  <li>• Idéal pour tester</li>
                </ul>
                <button
                  class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Réserver
                </button>
              </div>

              <!-- 5-Session Package -->
              <div class="border-2 border-orange-400 rounded-xl p-6 relative bg-orange-50">
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span class="bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-medium"
                    >POPULAIRE</span
                  >
                </div>
                <div class="text-center mb-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Forfait 5 séances</h3>
                  <div class="text-3xl font-bold text-orange-600">
                    {{ Math.round(getCoachPrice(coach) * 4.5) }}€
                  </div>
                  <p class="text-sm text-gray-600">
                    {{ Math.round(getCoachPrice(coach) * 0.9) }}€ par séance
                  </p>
                  <p class="text-xs text-green-600 font-medium">
                    Économie de {{ Math.round(getCoachPrice(coach) * 0.5) }}€
                  </p>
                </div>
                <ul class="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• Engagement sur 1 mois</li>
                  <li>• Suivi personnalisé</li>
                  <li>• 10% de réduction</li>
                </ul>
                <button
                  class="w-full bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Choisir ce forfait
                </button>
              </div>

              <!-- 10-Session Package -->
              <div
                class="border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors"
              >
                <div class="text-center mb-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Forfait 10 séances</h3>
                  <div class="text-3xl font-bold text-blue-600">
                    {{ Math.round(getCoachPrice(coach) * 8.5) }}€
                  </div>
                  <p class="text-sm text-gray-600">
                    {{ Math.round(getCoachPrice(coach) * 0.85) }}€ par séance
                  </p>
                  <p class="text-xs text-green-600 font-medium">
                    Économie de {{ Math.round(getCoachPrice(coach) * 1.5) }}€
                  </p>
                </div>
                <ul class="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• Engagement sur 2 mois</li>
                  <li>• Résultats garantis</li>
                  <li>• 15% de réduction</li>
                </ul>
                <button
                  class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Choisir ce forfait
                </button>
              </div>
            </div>
          </div>

          <!-- Similar Coaches -->
          <div class="bg-white rounded-2xl shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">
              Coachs similaires à {{ coach?.firstName }}
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="similarCoach in similarCoaches"
                :key="similarCoach.id"
                class="border border-gray-200 rounded-xl p-4 hover:border-orange-300 transition-colors cursor-pointer"
                @click="navigateToCoach(similarCoach.firstName)"
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
                    <p class="text-sm text-gray-600">{{ similarCoach.location }}</p>
                    <div class="flex items-center mt-1">
                      <StarIcon class="w-4 h-4 text-yellow-400 fill-current" />
                      <span class="ml-1 text-sm text-gray-600">{{ similarCoach.rating }}</span>
                      <span class="mx-2 text-gray-300">•</span>
                      <span class="text-sm text-gray-600">{{ similarCoach.experience }} ans</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-bold text-gray-900">
                      {{ getCoachPrice(similarCoach) }}€
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
                <img
                  :src="coach?.photo || '/default-avatar.png'"
                  :alt="`${coach?.firstName}`"
                  class="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
                <h1 class="text-2xl font-bold text-gray-900 mb-2">
                  {{ coach?.firstName }}
                </h1>
                <div class="flex items-center justify-center mb-2">
                  <StarIcon class="w-5 h-5 text-yellow-400 fill-current" />
                  <span class="ml-1 text-lg font-semibold text-gray-900">{{ coach?.rating }}</span>
                  <span class="mx-2 text-gray-300">•</span>
                  <span class="text-gray-600">{{ coach?.totalClients }} élèves</span>
                </div>
                <p class="text-orange-600 font-medium">{{ coach?.location }}</p>
              </div>

              <!-- Key Stats -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="text-center p-3 bg-orange-50 rounded-lg">
                  <p class="text-2xl font-bold text-orange-600">{{ getCoachPrice(coach) }}€</p>
                  <p class="text-sm text-gray-600">par séance</p>
                </div>
                <div class="text-center p-3 bg-blue-50 rounded-lg">
                  <p class="text-2xl font-bold text-blue-600">{{ coach?.experience }}</p>
                  <p class="text-sm text-gray-600">ans d'expérience</p>
                </div>
                <div class="text-center p-3 bg-green-50 rounded-lg">
                  <p class="text-lg font-bold text-green-600">&lt; 2h</p>
                  <p class="text-sm text-gray-600">temps de réponse</p>
                </div>
                <div class="text-center p-3 bg-purple-50 rounded-lg">
                  <p class="text-lg font-bold text-purple-600">GRATUIT</p>
                  <p class="text-sm text-gray-600">1er cours</p>
                </div>
              </div>

              <!-- Primary Specialties -->
              <div class="mb-6">
                <h3 class="text-sm font-semibold text-gray-900 mb-2">Spécialités principales</h3>
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
                <button
                  @click="bookFreeTrial"
                  class="w-full bg-gradient-to-r from-orange-500 to-blue-600 text-white py-3 px-6 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Réserver le 1er cours gratuit
                </button>
                <button
                  @click="contactCoach"
                  class="w-full bg-white border-2 border-orange-400 text-orange-600 py-3 px-6 rounded-full font-semibold hover:bg-orange-50 transition-all duration-200"
                >
                  Contacter {{ coach?.firstName }}
                </button>
              </div>
            </div>

            <!-- Share Profile -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
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
            </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { StarIcon } from '@heroicons/vue/24/solid'
import type { Coach } from '@/types/coach'
import type { ClientRequest } from '@/types/Lead'
import RequestModal from '@/components/RequestModal.vue'

// Router
const route = useRoute()
const router = useRouter()

// State
const coach = ref<Coach | null>(null)
const similarCoaches = ref<Coach[]>([])
const showContactModal = ref(false)
const showTrialModal = ref(false)

// Helper function to get coach pricing
const getCoachPrice = (coach: Coach | null): number => {
  if (!coach) return 0
  const basePrice = 35
  const experienceMultiplier = Math.min(coach.experience * 2, 20)
  const ratingBonus = (coach.rating - 4.0) * 10
  const specialtyBonus = coach.specialties.some((s) =>
    ['Nutrition', 'Préparation physique', 'Powerlifting', 'Tennis'].includes(s),
  )
    ? 10
    : 0

  return Math.round(basePrice + experienceMultiplier + ratingBonus + specialtyBonus)
}

// Mock data (same as CoachBrowser)
const mockCoaches: Coach[] = [
  {
    id: '1',
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie@example.com',
    phone: '0596123456',
    photo:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop&crop=face',
    bio: 'Coach fitness spécialisée dans la remise en forme et la perte de poids. Passionnée par le sport depuis 10 ans.',
    location: 'Fort-de-France',
    specialties: ['Fitness', 'Musculation', 'Perte de poids', 'Remise en forme'],
    certifications: ['BPJEPS', 'CQP Fitness'],
    experience: 5,
    availability: 'Lun-Ven 9h-18h',
    rating: 4.8,
    totalClients: 45,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '2',
    firstName: 'Pierre',
    lastName: 'Martin',
    email: 'pierre@example.com',
    phone: '0596234567',
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=face',
    bio: 'Coach yoga et méditation. Formé en Inde, je vous accompagne vers un bien-être physique et mental.',
    location: 'Schoelcher',
    specialties: ['Yoga', 'Méditation', 'Relaxation', 'Bien-être'],
    certifications: ['RYT 200', 'Instructeur Méditation'],
    experience: 8,
    availability: 'Lun-Sam 8h-20h',
    rating: 4.9,
    totalClients: 67,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '3',
    firstName: 'Sophie',
    lastName: 'Laurent',
    email: 'sophie@example.com',
    phone: '0596345678',
    photo:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop&crop=face',
    bio: 'Nutritionniste et coach bien-être. Je vous accompagne vers une alimentation saine et équilibrée.',
    location: 'Le Lamentin',
    specialties: ['Nutrition', 'Bien-être', 'Perte de poids'],
    certifications: ['Diplôme de Nutritionniste', 'Formation Coach Bien-être'],
    experience: 6,
    availability: 'Mar-Sam 10h-19h',
    rating: 4.7,
    totalClients: 38,
    subscriptionStatus: 'active',
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  // Add more coaches as needed
]

// Methods
const bookFreeTrial = () => {
  showTrialModal.value = true
}

const contactCoach = () => {
  showContactModal.value = true
}

const submitContact = (requestData: Partial<ClientRequest>) => {
  console.log('Contact submitted:', requestData)
  showContactModal.value = false
}

const shareProfile = (platform: string) => {
  const url = window.location.href
  const text = `Découvrez le profil de ${coach.value?.firstName}, coach ${coach.value?.specialties[0]} sur Coachiles`

  switch (platform) {
    case 'email':
      window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`
      break
    case 'facebook':
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank',
      )
      break
    case 'whatsapp':
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
      break
  }
}

const navigateToCoach = (coachFirstName: string) => {
  router.push(`/coach/${coachFirstName.toLowerCase()}`)
}

// Lifecycle
onMounted(() => {
  const firstName = route.params.firstName as string

  // Find the coach by first name (case insensitive)
  coach.value = mockCoaches.find((c) => c.firstName.toLowerCase() === firstName.toLowerCase()) || null

  if (coach.value) {
    // Find similar coaches (same specialties, different coach)
    similarCoaches.value = mockCoaches
      .filter(
        (c) =>
          c.firstName.toLowerCase() !== firstName.toLowerCase() && 
          c.specialties.some((spec) => coach.value?.specialties.includes(spec)),
      )
      .slice(0, 4)
  }
})
</script>

<style scoped>
/* Custom scrollbar for mobile */
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

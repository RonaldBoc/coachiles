<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-3xl">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Système de Suppression de Compte - Démonstration
        </h1>
        <p class="text-lg text-gray-600">
          Démonstration du système de suppression de compte suivant les meilleures pratiques de
          l'industrie
        </p>
      </div>

      <!-- Feature Overview -->
      <div class="bg-white shadow-lg rounded-lg mb-8">
        <div class="px-6 py-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Fonctionnalités Implémentées</h2>

          <div class="grid md:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <svg
                    class="h-6 w-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Interface Multi-Étapes</h3>
                  <p class="text-gray-600">
                    Processus de confirmation en 4 étapes avec collecte de feedback
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <svg
                    class="h-6 w-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Export GDPR</h3>
                  <p class="text-gray-600">Téléchargement des données utilisateur au format JSON</p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <svg
                    class="h-6 w-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Soft Delete</h3>
                  <p class="text-gray-600">Suppression douce avec période de grâce de 30 jours</p>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <svg
                    class="h-6 w-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Système de Réactivation</h3>
                  <p class="text-gray-600">Interface dédiée pour récupérer un compte supprimé</p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <svg
                    class="h-6 w-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Audit et Logging</h3>
                  <p class="text-gray-600">Journal complet des suppressions avec raisons</p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <svg
                    class="h-6 w-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Sécurité Tokens</h3>
                  <p class="text-gray-600">Tokens sécurisés pour les liens de réactivation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Industry Comparison -->
      <div class="bg-white shadow-lg rounded-lg mb-8">
        <div class="px-6 py-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Comparaison avec l'Industrie</h2>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Plateforme
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Période de Grâce
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Export de Données
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Réactivation
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr class="bg-orange-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span class="flex items-center">
                      <span class="h-2 w-2 bg-orange-500 rounded-full mr-2"></span>
                      Coachiles (Notre système)
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">30 jours</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">✓ JSON complet</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    ✓ Interface dédiée
                  </td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Facebook
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">30 jours</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    ✓ Archive complète
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    ✓ Simple connexion
                  </td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Google
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2-3 semaines</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    ✓ Google Takeout
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                    ~ Variable par service
                  </td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    LinkedIn
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">20 jours</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    ✓ Export professionnel
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    ✗ Recréation nécessaire
                  </td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Instagram
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">30 jours</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    ✓ Photos et données
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    ✓ Simple connexion
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Technical Implementation -->
      <div class="bg-white shadow-lg rounded-lg mb-8">
        <div class="px-6 py-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Implémentation Technique</h2>

          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center">
              <div
                class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 mb-4"
              >
                <svg
                  class="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Base de Données</h3>
              <p class="text-sm text-gray-600">
                Tables de soft delete avec fonctions PostgreSQL pour l'audit
              </p>
            </div>

            <div class="text-center">
              <div
                class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 mb-4"
              >
                <svg
                  class="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">API TypeScript</h3>
              <p class="text-sm text-gray-600">
                Service complet avec types stricts et gestion d'erreurs
              </p>
            </div>

            <div class="text-center">
              <div
                class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-purple-100 mb-4"
              >
                <svg
                  class="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Interface Vue.js</h3>
              <p class="text-sm text-gray-600">Composants réutilisables avec UX optimisée</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Demo Action -->
      <div class="bg-white shadow-lg rounded-lg">
        <div class="px-6 py-8 text-center">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Tester le Système</h2>
          <p class="text-gray-600 mb-6">
            Accédez aux paramètres de compte pour voir le système de suppression en action
          </p>

          <div class="space-y-4">
            <button
              @click="goToAccount"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Paramètres de Compte
            </button>

            <p class="text-sm text-gray-500">
              Ou simulez une réactivation avec ce lien :
              <a
                href="/account/reactivate?token=demo-token"
                class="text-orange-600 hover:text-orange-500 underline"
              >
                Page de Réactivation
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToAccount = () => {
  router.push('/coach/account')
}
</script>

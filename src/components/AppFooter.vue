<template>
  <footer class="mt-24 border-t border-gray-200 bg-white/80 backdrop-blur-sm text-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
        <!-- Brand / Mission -->
        <div>
          <img src="/images/logos/logo_coachiles_color.png" alt="Coachiles" class="h-10 mb-3" />
          <p class="text-sm leading-relaxed text-gray-600">
            Trouvez le coach qui vous correspond et progressez avec un accompagnement humain et
            motivant.
          </p>
        </div>

        <!-- Navigation -->
        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-4">
            Navigation
          </h3>
          <ul class="space-y-2 text-sm">
            <li>
              <RouterLink to="/coaches" class="hover:text-orange-600 transition-colors"
                >Trouver un coach</RouterLink
              >
            </li>
            <li>
              <RouterLink to="/coach/onboarding" class="hover:text-orange-600 transition-colors"
                >Devenir coach</RouterLink
              >
            </li>
            <li>
              <RouterLink to="/" class="hover:text-orange-600 transition-colors"
                >Accueil</RouterLink
              >
            </li>
          </ul>
        </div>

        <!-- Ressources -->
        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-4">
            Ressources
          </h3>
          <ul class="space-y-2 text-sm">
            <li>
              <RouterLink to="/contact" class="hover:text-orange-600 transition-colors"
                >Contact</RouterLink
              >
            </li>
            <li>
              <RouterLink to="/a-propos" class="hover:text-orange-600 transition-colors"
                >À propos</RouterLink
              >
            </li>
            <li>
              <RouterLink to="/faq" class="hover:text-orange-600 transition-colors">FAQ</RouterLink>
            </li>
          </ul>
        </div>

        <!-- Newsletter (placeholder) -->
        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-4">
            Restez informé
          </h3>
          <p class="text-sm text-gray-600 mb-3">Recevez les nouveautés de la plateforme.</p>
          <form @submit.prevent="$emit('newsletter', email)">
            <div class="flex items-center gap-2">
              <input
                v-model="email"
                type="email"
                required
                placeholder="Votre email"
                class="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <button
                type="submit"
                class="px-4 py-2 rounded-md bg-gradient-to-r from-orange-500 to-blue-600 text-white text-sm font-medium hover:shadow-md transition"
              >
                OK
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Bottom bar -->
      <div
        class="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <p class="text-xs text-gray-500">© {{ year }} Coachiles. Tous droits réservés.</p>
        <div class="flex items-center gap-4 text-xs text-gray-500">
          <RouterLink
            to="/cgu"
            class="hover:text-orange-600 transition-colors"
            >CGU</RouterLink
          >
          <span class="hidden sm:inline text-gray-300">•</span>
          <RouterLink to="/privacy" class="hover:text-orange-600 transition-colors"
            >Politique de confidentialité</RouterLink
          >
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const year = new Date().getFullYear()
const email = ref('')
</script>

<style scoped>
footer {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}
</style>

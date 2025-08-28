<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <CoachLayout>
    <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <!-- Loading state -->
      <template v-if="!ready">
        <div class="flex justify-center items-center py-32">
          <div class="flex flex-col items-center gap-4 text-gray-500">
            <div
              class="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
            />
            <p class="text-sm">Chargement de votre abonnement…</p>
          </div>
        </div>
      </template>

      <!-- Subscribed View -->
      <template v-else-if="isSubscribed">
        <div class="text-center mb-10">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900">Votre abonnement Pro</h1>
          <p class="mt-4 text-gray-600 text-lg">
            Merci d'être un membre <span class="font-semibold">Coachiles Pro</span>.
            <span v-if="nextBillingDate"
              >Prochaine facturation le {{ formatDate(nextBillingDate) }}.</span
            >
          </p>
        </div>
        <div class="space-y-10">
          <!-- Reuse advanced management component -->
          <ModernSubscriptionManagement />
          <!-- Extra Pro Value Section -->
          <div
            class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6"
          >
            <h2 class="text-xl font-semibold text-blue-900 mb-4">Maximisez votre abonnement</h2>
            <div class="grid gap-6 md:grid-cols-3">
              <div class="flex items-start space-x-3">
                <div
                  class="h-8 w-8 rounded-lg bg-white shadow flex items-center justify-center text-blue-600 font-bold"
                >
                  1
                </div>
                <div>
                  <p class="text-sm font-medium text-blue-900">Ajoutez vos services</p>
                  <p class="text-xs text-blue-700 mt-1">
                    Créez des offres claires pour augmenter vos conversions.
                  </p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div
                  class="h-8 w-8 rounded-lg bg-white shadow flex items-center justify-center text-blue-600 font-bold"
                >
                  2
                </div>
                <div>
                  <p class="text-sm font-medium text-blue-900">Optimisez votre profil</p>
                  <p class="text-xs text-blue-700 mt-1">
                    Ajoutez photo, bio et spécialités complètes.
                  </p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div
                  class="h-8 w-8 rounded-lg bg-white shadow flex items-center justify-center text-blue-600 font-bold"
                >
                  3
                </div>
                <div>
                  <p class="text-sm font-medium text-blue-900">Répondez vite aux leads</p>
                  <p class="text-xs text-blue-700 mt-1">
                    Les réponses rapides doublent vos chances de conversion.
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-6 flex flex-wrap gap-3">
              <RouterLink
                to="/coach/services"
                class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                >Gérer mes services →</RouterLink
              >
              <RouterLink
                to="/coach/profile"
                class="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-200 shadow-sm hover:bg-blue-50"
                >Améliorer mon profil →</RouterLink
              >
              <RouterLink
                to="/coach/proposals"
                class="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-200 shadow-sm hover:bg-blue-50"
                >Voir mes leads →</RouterLink
              >
            </div>
          </div>
        </div>
      </template>

      <!-- Not subscribed: Pricing & Comparison -->
      <template v-else>
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900">Abonnement</h1>
          <p class="mt-3 text-lg text-gray-600">
            Comparez le plan Gratuit et le plan <span class="font-semibold">Coachiles Pro</span> et
            choisissez celui qui correspond à vos besoins.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <!-- Free Plan -->
          <div class="relative rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col">
            <div class="p-6 border-b border-gray-100">
              <h2 class="text-xl font-semibold text-gray-900">Gratuit</h2>
              <p class="mt-2 text-sm text-gray-600">
                Démarrez et testez la plateforme sans engagement.
              </p>
              <div class="mt-4 flex items-baseline">
                <span class="text-3xl font-bold text-gray-900">0€</span>
                <span class="ml-2 text-sm text-gray-500">/ mois</span>
              </div>
            </div>
            <ul class="flex-1 divide-y divide-gray-100">
              <li v-for="f in freeFeatures" :key="f.label" class="p-4 flex items-start space-x-3">
                <component
                  :is="f.included ? CheckIcon : XMarkIcon"
                  :class="f.included ? 'text-green-500' : 'text-gray-300'"
                  class="h-5 w-5 mt-0.5 flex-shrink-0"
                />
                <span class="text-sm" :class="!f.included && 'text-gray-500'">{{ f.label }}</span>
              </li>
            </ul>
            <div class="p-6 border-t border-gray-100">
              <button
                @click="goToAccount"
                class="w-full inline-flex justify-center items-center rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
              >
                Continuer gratuitement
              </button>
            </div>
          </div>
          <!-- Pro Plan -->
          <div
            class="relative rounded-2xl border-2 border-blue-500 bg-white shadow-md flex flex-col ring-1 ring-blue-500"
          >
            <div class="absolute -top-3 left-1/2 -translate-x-1/2">
              <span
                class="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white shadow"
                >Populaire</span
              >
            </div>
            <div class="p-6 border-b border-gray-100">
              <h2 class="text-xl font-semibold text-gray-900 flex items-center">Coachiles Pro</h2>
              <p class="mt-2 text-sm text-gray-600">
                Débloquez le plein potentiel de votre activité.
              </p>
              <div class="mt-4 flex items-baseline">
                <span class="text-3xl font-bold text-gray-900">9€</span>
                <span class="ml-2 text-sm text-gray-500">/ mois</span>
              </div>
            </div>
            <ul class="flex-1 divide-y divide-gray-100">
              <li v-for="f in proFeatures" :key="f" class="p-4 flex items-start space-x-3">
                <CheckIcon class="h-5 w-5 mt-0.5 flex-shrink-0 text-green-500" />
                <span class="text-sm">{{ f }}</span>
              </li>
            </ul>
            <div class="p-6 border-t border-gray-100">
              <button
                @click="subscribe"
                class="w-full inline-flex justify-center items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              >
                Passer à Pro
              </button>
              <p class="mt-3 text-center text-xs text-gray-500">Annulation à tout moment.</p>
            </div>
          </div>
        </div>
        <!-- Detailed Feature Comparison -->
        <div class="mt-16">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">Comparaison détaillée</h3>
          <div class="overflow-x-auto -mx-4 sm:mx-0">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr>
                  <th class="py-3 pl-4 pr-3 text-left font-medium text-gray-500">Fonctionnalité</th>
                  <th class="px-3 py-3 text-left font-medium text-gray-700">Gratuit</th>
                  <th class="px-3 py-3 text-left font-medium text-gray-700">Pro</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="row in comparisonRows" :key="row.label" class="align-top">
                  <td class="py-3 pl-4 pr-3 font-medium text-gray-900">{{ row.label }}</td>
                  <td class="px-3 py-3 text-gray-600">
                    <div class="flex items-start space-x-2">
                      <component
                        :is="row.freeIncluded ? CheckIcon : XMarkIcon"
                        :class="row.freeIncluded ? 'text-green-500' : 'text-gray-300'"
                        class="h-5 w-5 mt-0.5"
                      />
                      <span>{{ row.freeText }}</span>
                    </div>
                  </td>
                  <td class="px-3 py-3 text-gray-600">
                    <div class="flex items-start space-x-2">
                      <CheckIcon class="h-5 w-5 mt-0.5 text-green-500" />
                      <span>{{ row.proText }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- FAQ CTA -->
        <div class="mt-20 text-center">
          <p class="text-sm text-gray-600">Des questions sur l'abonnement ?</p>
          <RouterLink
            to="/faq"
            class="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Consulter la FAQ →
          </RouterLink>
        </div>
      </template>
    </div>
  </CoachLayout>
</template>

<script setup lang="ts">
import CoachLayout from '@/layouts/CoachLayout.vue'
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import { useRouter, RouterLink } from 'vue-router'
import { useModernSubscriptionStore } from '@/stores/modernSubscription'
import { useToast } from '@/composables/useToast'
import { computed, onMounted, ref } from 'vue'
import ModernSubscriptionManagement from '@/components/ModernSubscriptionManagement.vue'

const router = useRouter()
const subscriptionStore = useModernSubscriptionStore()
const { info: toastInfo, error: toastError } = useToast()
const isSubscribed = computed(() => subscriptionStore.isSubscribed)
const ready = ref(false)
onMounted(async () => {
  try {
    await subscriptionStore.loadSubscriptionData()
  } catch (e) {
    console.warn('Abonnement.vue: failed to load subscription data', e)
  } finally {
    ready.value = true
  }
})
const nextBillingDate = computed(
  () =>
    subscriptionStore.currentSubscription.nextBillingDate ||
    subscriptionStore.currentSubscription.currentPeriodEnd ||
    null,
)
const formatDate = (d: Date | null) =>
  d ? d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

interface FeatureRow {
  label: string
  included: boolean
}

const freeFeatures: FeatureRow[] = [
  { label: 'Profil coach public', included: true },
  { label: 'Nombre limité de leads (découverte)', included: true },
  { label: 'Création de quelques services de base', included: true },
  { label: 'Support standard (72h)', included: true },
  { label: 'Statistiques avancées', included: false },
  { label: 'Support prioritaire 24h', included: false },
  { label: 'Badge coach vérifié', included: false },
  { label: 'Visibilité maximale', included: false },
  { label: 'Outils marketing', included: false },
  { label: 'Export des données', included: false },
]

const proFeatures = [
  'Leads illimités',
  'Services illimités',
  'Statistiques avancées',
  'Support prioritaire 24h',
  'Badge coach vérifié',
  'Visibilité maximale',
  'Outils marketing',
  'Export des données',
]

interface ComparisonRow {
  label: string
  freeIncluded: boolean
  freeText: string
  proText: string
}

const comparisonRows: ComparisonRow[] = [
  { label: 'Leads', freeIncluded: true, freeText: 'Volume découverte', proText: 'Illimités' },
  { label: 'Services', freeIncluded: true, freeText: '2', proText: 'Illimités' },
  { label: 'Statistiques', freeIncluded: false, freeText: '—', proText: 'Avancées' },
  {
    label: 'Support',
    freeIncluded: true,
    freeText: 'Standard (72h)',
    proText: 'Prioritaire (24h)',
  },
  { label: 'Badge vérifié', freeIncluded: false, freeText: '—', proText: 'Inclus' },
  { label: 'Marketing', freeIncluded: false, freeText: '—', proText: 'Outils dédiés' },
  { label: 'Export', freeIncluded: false, freeText: '—', proText: 'Export CSV / données' },
]

const goToAccount = () => {
  router.push('/coach/account')
}

const subscribe = async () => {
  const ok = await subscriptionStore.subscribeWithStripe()
  if (ok) {
    toastInfo('Redirection vers le paiement sécurisé…')
  } else if (subscriptionStore.error) {
    toastError(subscriptionStore.error)
  }
}
</script>

<style scoped>
/* Subtle gradient highlight for Pro plan */
.pro-gradient {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0));
}
</style>

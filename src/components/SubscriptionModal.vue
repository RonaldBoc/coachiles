<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Choisissez votre abonnement</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div
            v-for="plan in plans"
            :key="plan.id"
            :class="[
              'border rounded-lg p-6 cursor-pointer transition-all',
              plan.isPopular
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300',
            ]"
            @click="selectPlan(plan)"
          >
            <div class="text-center">
              <div
                v-if="plan.isPopular"
                class="bg-indigo-500 text-white text-sm px-3 py-1 rounded-full inline-block mb-2"
              >
                Populaire
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ plan.name }}</h3>
              <div class="text-3xl font-bold text-gray-900 mb-1">
                {{ plan.price }}€
                <span class="text-lg font-normal text-gray-600">
                  /{{ plan.billingCycle === 'monthly' ? 'mois' : 'an' }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-4">{{ plan.description }}</p>

              <div class="text-left space-y-2">
                <div class="flex items-center text-sm text-gray-700">
                  <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                  <span>{{ plan.leadsPerMonth }} leads par mois</span>
                </div>
                <div
                  v-for="feature in plan.features"
                  :key="feature"
                  class="flex items-center text-sm text-gray-700"
                >
                  <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                  <span>{{ feature }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 class="font-semibold text-blue-900 mb-2">Comment ça marche ?</h4>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>• Recevez des demandes de clients qualifiés</li>
            <li>• Contactez directement les clients intéressés</li>
            <li>• Fixez vos propres tarifs et conditions</li>
            <li>• Gardez 100% de vos revenus</li>
          </ul>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            v-if="selectedPlan"
            @click="subscribe"
            class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            S'abonner à {{ selectedPlan.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { XMarkIcon, CheckIcon } from '@heroicons/vue/24/outline'
import type { SubscriptionPlan } from '@/types/subscription'

interface Props {
  currentPlan?: SubscriptionPlan | null
}

interface Emits {
  (e: 'close'): void
  (e: 'subscribe', plan: SubscriptionPlan): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedPlan = ref<SubscriptionPlan | null>(null)

const plans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Parfait pour commencer',
    price: 29,
    currency: 'EUR',
    billingCycle: 'monthly',
    leadsPerMonth: 5,
    features: ['Profil coach basique', 'Support par email', 'Notifications par email'],
    isPopular: false,
    priority: 'low',
    supportLevel: 'basic',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Pour les coachs actifs',
    price: 59,
    currency: 'EUR',
    billingCycle: 'monthly',
    leadsPerMonth: 15,
    features: [
      'Profil coach avancé',
      'Support prioritaire',
      'Notifications SMS',
      'Statistiques détaillées',
    ],
    isPopular: true,
    priority: 'medium',
    supportLevel: 'priority',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Pour les coachs établis',
    price: 99,
    currency: 'EUR',
    billingCycle: 'monthly',
    leadsPerMonth: 30,
    features: [
      'Profil coach premium',
      'Support premium 24/7',
      'Notifications SMS & push',
      'Statistiques avancées',
      'Badge coach vérifié',
    ],
    isPopular: false,
    priority: 'high',
    supportLevel: 'premium',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
]

const selectPlan = (plan: SubscriptionPlan) => {
  selectedPlan.value = plan
}

const subscribe = () => {
  if (selectedPlan.value) {
    emit('subscribe', selectedPlan.value)
  }
}
</script>

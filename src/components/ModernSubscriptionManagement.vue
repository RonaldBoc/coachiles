<template>
  <div class="space-y-8">
    <!-- Subscription Status Card -->
    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div class="px-4 py-6 sm:p-8">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Votre abonnement</h2>
            <p class="text-sm text-gray-600 mt-1">Gérez votre plan et votre facturation</p>
          </div>
          <div class="flex items-center space-x-3">
            <!-- Status Badge -->
            <span
              :class="[
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                subscriptionStore.isSubscribed
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800',
              ]"
            >
              <svg
                :class="[
                  'w-1.5 h-1.5 mr-1.5',
                  subscriptionStore.isSubscribed ? 'text-green-400' : 'text-gray-400',
                ]"
                fill="currentColor"
                viewBox="0 0 8 8"
              >
                <circle cx="4" cy="4" r="3" />
              </svg>
              {{ subscriptionStore.isSubscribed ? 'Actif' : 'Inactif' }}
            </span>
          </div>
        </div>

        <!-- Current Plan Info -->
        <div class="mt-6 bg-gray-50 rounded-lg p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center">
                <CreditCardIcon class="h-5 w-5 text-gray-400 mr-2" />
                <h3 class="text-lg font-medium text-gray-900">
                  {{ subscriptionStore.currentPlan?.name || 'Plan Gratuit' }}
                </h3>
              </div>
              <p class="text-sm text-gray-600 mt-1">
                {{
                  subscriptionStore.currentPlan?.description ||
                  'Accès limité aux fonctionnalités de base'
                }}
              </p>

              <!-- Price Display -->
              <div class="mt-3 flex items-baseline">
                <span class="text-2xl font-bold text-gray-900">
                  {{ subscriptionStore.currentPlan?.price || 0 }}€
                </span>
                <span class="text-sm text-gray-500 ml-1">/mois</span>
              </div>

              <!-- Next Billing Date -->
              <div
                v-if="
                  subscriptionStore.isSubscribed &&
                  subscriptionStore.currentSubscription.nextBillingDate
                "
                class="mt-3 flex items-center text-sm text-gray-500"
              >
                <CalendarDaysIcon class="h-4 w-4 mr-1" />
                Prochaine facturation le
                {{ formatDate(subscriptionStore.currentSubscription.nextBillingDate) }}
              </div>

              <!-- Warning for pending cancellation -->
              <div
                v-if="subscriptionStore.currentSubscription.cancelAtPeriodEnd"
                class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
              >
                <div class="flex">
                  <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400" />
                  <div class="ml-3">
                    <p class="text-sm text-yellow-800">
                      Votre abonnement sera annulé le
                      {{ formatDate(subscriptionStore.currentSubscription.currentPeriodEnd!) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col space-y-2 ml-6">
              <button
                v-if="!subscriptionStore.isSubscribed"
                @click="showSubscribeModal = true"
                :disabled="subscriptionStore.loading"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <span v-if="!subscriptionStore.loading">S'abonner</span>
                <div v-else class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Chargement...
                </div>
              </button>

              <template v-else>
                <button
                  v-if="subscriptionStore.currentSubscription.cancelAtPeriodEnd"
                  @click="reactivateSubscription"
                  :disabled="subscriptionStore.loading"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  Réactiver
                </button>
                <button
                  v-else
                  @click="showCancelModal = true"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Gérer
                </button>
              </template>
            </div>
          </div>

          <!-- Features List -->
          <div
            v-if="subscriptionStore.currentPlan?.features"
            class="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2"
          >
            <div
              v-for="feature in subscriptionStore.currentPlan.features"
              :key="feature"
              class="flex items-center text-sm text-gray-600"
            >
              <CheckIcon class="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              {{ feature }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Usage & Limits (if subscribed) -->
    <div
      v-if="subscriptionStore.isSubscribed"
      class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
    >
      <div class="px-4 py-6 sm:p-8">
        <h3 class="text-base font-semibold text-gray-900">Utilisation ce mois-ci</h3>
        <p class="text-sm text-gray-600 mt-1">
          Votre usage pour la période de facturation actuelle
        </p>

        <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <!-- Leads Used -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center">
              <UserGroupIcon class="h-5 w-5 text-blue-500" />
              <h4 class="ml-2 text-sm font-medium text-gray-900">Leads</h4>
            </div>
            <p class="mt-2 text-2xl font-bold text-gray-900">
              {{ subscriptionStore.usage.leadsUsedThisMonth }}
            </p>
            <p class="text-sm text-gray-500">Illimités disponibles</p>
          </div>

          <!-- Services Created -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center">
              <CogIcon class="h-5 w-5 text-green-500" />
              <h4 class="ml-2 text-sm font-medium text-gray-900">Services</h4>
            </div>
            <p class="mt-2 text-2xl font-bold text-gray-900">
              {{ subscriptionStore.usage.servicesCreated }}
            </p>
            <p class="text-sm text-gray-500">Illimités disponibles</p>
          </div>

          <!-- Support Level -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center">
              <ChatBubbleLeftRightIcon class="h-5 w-5 text-purple-500" />
              <h4 class="ml-2 text-sm font-medium text-gray-900">Support</h4>
            </div>
            <p class="mt-2 text-lg font-semibold text-gray-900">Prioritaire</p>
            <p class="text-sm text-gray-500">Réponse sous 24h</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Method (if subscribed) -->
    <div
      v-if="subscriptionStore.isSubscribed"
      class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
    >
      <div class="px-4 py-6 sm:p-8">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-gray-900">Moyen de paiement</h3>
            <p class="text-sm text-gray-600 mt-1">Gérez vos méthodes de paiement</p>
          </div>
          <button
            @click="openBillingPortal"
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Gérer mes cartes
          </button>
        </div>

        <div v-if="subscriptionStore.hasPaymentMethod" class="mt-6">
          <div
            v-for="method in subscriptionStore.paymentMethods"
            :key="method.id"
            class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            :class="{ 'border-blue-500 bg-blue-50': method.isDefault }"
          >
            <div class="flex items-center">
              <CreditCardIcon class="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ method.brand }} •••• {{ method.last4 }}
                </p>
                <p class="text-sm text-gray-500">
                  Expire {{ method.expiryMonth }}/{{ method.expiryYear }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span
                v-if="method.isDefault"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                Défaut
              </span>
            </div>
          </div>
        </div>
        <div v-else class="mt-6 text-center py-6 text-gray-500">
          <CreditCardIcon class="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p>Aucun moyen de paiement configuré</p>
        </div>
      </div>
    </div>

    <!-- Billing History -->
    <div
      v-if="subscriptionStore.billingHistory.length > 0"
      class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
    >
      <div class="px-4 py-6 sm:p-8">
        <h3 class="text-base font-semibold text-gray-900">Historique de facturation</h3>
        <p class="text-sm text-gray-600 mt-1">Vos dernières factures</p>

        <div class="mt-6 flow-root">
          <ul role="list" class="-my-5 divide-y divide-gray-200">
            <li
              v-for="invoice in subscriptionStore.billingHistory.slice(0, 5)"
              :key="invoice.id"
              class="py-4"
            >
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <DocumentIcon class="h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ invoice.description }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ formatDate(invoice.date) }}
                  </p>
                </div>
                <div class="flex items-center space-x-3">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800',
                    ]"
                  >
                    {{ getStatusLabel(invoice.status) }}
                  </span>
                  <p class="text-sm font-medium text-gray-900">{{ invoice.amount }}€</p>
                  <button
                    v-if="invoice.invoiceUrl"
                    @click="downloadInvoice(invoice.invoiceUrl)"
                    class="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    <ArrowDownTrayIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Subscribe Modal -->
    <ModernSubscribeModal
      v-if="showSubscribeModal"
      :show="showSubscribeModal"
      @close="showSubscribeModal = false"
      @subscribe="handleSubscribe"
    />

    <!-- Cancel Modal -->
    <CancelSubscriptionModal
      v-if="showCancelModal"
      :show="showCancelModal"
      :loading="subscriptionStore.loading"
      @close="
        () => {
          console.log('[ModernSubscriptionManagement] close modal')
          showCancelModal = false
        }
      "
      @confirm="handleCancel"
    />

    <!-- Payment Method Modal -->
    <PaymentMethodModal
      v-if="showPaymentModal"
      :show="showPaymentModal"
      @close="showPaymentModal = false"
      @add="handleAddPaymentMethod"
    />

    <!-- Reactivate Confirm Modal -->
    <ReactivateConfirmModal
      v-if="showReactivateModal"
      :show="showReactivateModal"
      :loading="subscriptionStore.loading"
      :paymentMethod="subscriptionStore.defaultPaymentMethod || null"
      :billingDate="
        subscriptionStore.currentSubscription.nextBillingDate ||
        subscriptionStore.currentSubscription.currentPeriodEnd ||
        null
      "
      @close="showReactivateModal = false"
      @confirm="confirmReactivate"
    />

    <!-- Error Alert -->
    <div v-if="subscriptionStore.error" class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Erreur</h3>
          <p class="mt-1 text-sm text-red-700">{{ subscriptionStore.error }}</p>
          <div class="mt-2">
            <button
              @click="subscriptionStore.clearError"
              class="text-sm text-red-800 underline hover:text-red-600"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  CreditCardIcon,
  CheckIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
} from '@heroicons/vue/24/outline'
import { useModernSubscriptionStore, type PaymentMethod } from '@/stores/modernSubscription'
import ModernSubscribeModal from '@/components/ModernSubscribeModal.vue'
import CancelSubscriptionModal from '@/components/CancelSubscriptionModal.vue'
import PaymentMethodModal from '@/components/PaymentMethodModal.vue'
import ReactivateConfirmModal from '@/components/ReactivateConfirmModal.vue'
import { useToast } from '@/composables/useToast'

const { success: toastSuccess, error: toastError, info: toastInfo } = useToast()

const subscriptionStore = useModernSubscriptionStore()

// Modal states
const showSubscribeModal = ref(false)
const showCancelModal = ref(false)
const showPaymentModal = ref(false)
const showReactivateModal = ref(false)

// Load subscription data on mount
onMounted(async () => {
  await subscriptionStore.loadSubscriptionData()
})

// Open Stripe billing portal
const openBillingPortal = async () => {
  const ok = await subscriptionStore.openBillingPortal()
  if (!ok && subscriptionStore.error) {
    toastError(subscriptionStore.error, { title: 'Paiement' })
  }
}

// Helper functions
const formatDate = (date: Date) => {
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'paid':
      return 'Payée'
    case 'pending':
      return 'En attente'
    case 'failed':
      return 'Échouée'
    case 'refunded':
      return 'Remboursée'
    default:
      return status
  }
}

const downloadInvoice = (url: string) => {
  window.open(url, '_blank')
}

// Event handlers
const handleSubscribe = async () => {
  const success = await subscriptionStore.subscribeWithStripe()
  if (success) {
    showSubscribeModal.value = false
    toastInfo('Redirection vers le paiement sécurisé…')
  } else if (subscriptionStore.error) {
    toastError(subscriptionStore.error, { title: 'Abonnement' })
  }
}

const handleCancel = async (immediate: boolean, feedback?: string) => {
  console.log('[ModernSubscriptionManagement] handleCancel', { immediate, feedback })
  const success = await subscriptionStore.cancelSubscription(immediate)
  console.log('[ModernSubscriptionManagement] cancel result', success)
  if (success) {
    showCancelModal.value = false
    toastSuccess('Votre abonnement sera annulé à la fin de la période en cours.', {
      title: 'Annulation programmée',
    })
  } else if (subscriptionStore.error) {
    toastError(subscriptionStore.error, { title: 'Annulation' })
  }
}

const reactivateSubscription = async () => {
  // open confirm modal first
  showReactivateModal.value = true
}

const confirmReactivate = async () => {
  const ok = await subscriptionStore.reactivateSubscription()
  if (ok) {
    showReactivateModal.value = false
    toastSuccess('Abonnement réactivé. La facturation reprendra à la prochaine échéance.', {
      title: 'Réactivation réussie',
    })
  } else if (subscriptionStore.error) {
    toastError(subscriptionStore.error, { title: 'Réactivation' })
  }
}

const handleAddPaymentMethod = async (paymentMethodData: Omit<PaymentMethod, 'id'>) => {
  const success = await subscriptionStore.addPaymentMethod(paymentMethodData)
  if (success) {
    showPaymentModal.value = false
    toastSuccess('Moyen de paiement ajouté avec succès.', { title: 'Paiement' })
  } else if (subscriptionStore.error) {
    toastError(subscriptionStore.error, { title: 'Paiement' })
  }
}
</script>

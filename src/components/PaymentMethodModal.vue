<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50"
    @click="$emit('close')"
  >
    <div class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6"
          @click.stop
        >
          <div>
            <div
              class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
            >
              <CreditCardIcon class="h-6 w-6 text-green-600" />
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-base font-semibold leading-6 text-gray-900">
                Ajouter un moyen de paiement
              </h3>
              <div class="mt-4">
                <form @submit.prevent="addPaymentMethod" class="space-y-4 text-left">
                  <!-- Payment Method Type -->
                  <div>
                    <label class="text-sm font-medium text-gray-900">Type de paiement</label>
                    <div class="mt-2 space-y-2">
                      <div class="flex items-center">
                        <input
                          id="card"
                          v-model="paymentData.type"
                          value="card"
                          type="radio"
                          class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label for="card" class="ml-2 text-sm text-gray-700">Carte bancaire</label>
                      </div>
                      <div class="flex items-center">
                        <input
                          id="sepa"
                          v-model="paymentData.type"
                          value="sepa"
                          type="radio"
                          class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label for="sepa" class="ml-2 text-sm text-gray-700"
                          >Prélèvement SEPA</label
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Card Details (if card selected) -->
                  <div v-if="paymentData.type === 'card'" class="space-y-4">
                    <div>
                      <label for="holderName" class="block text-sm font-medium text-gray-700">
                        Nom du titulaire
                      </label>
                      <input
                        id="holderName"
                        v-model="paymentData.holderName"
                        type="text"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label for="cardNumber" class="block text-sm font-medium text-gray-700">
                        Numéro de carte
                      </label>
                      <input
                        id="cardNumber"
                        v-model="cardNumber"
                        type="text"
                        required
                        maxlength="19"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        placeholder="1234 5678 9012 3456"
                        @input="formatCardNumber"
                      />
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label for="expiryDate" class="block text-sm font-medium text-gray-700">
                          Date d'expiration
                        </label>
                        <input
                          id="expiryDate"
                          v-model="expiryDate"
                          type="text"
                          required
                          maxlength="5"
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                          placeholder="MM/AA"
                          @input="formatExpiryDate"
                        />
                      </div>
                      <div>
                        <label for="cvv" class="block text-sm font-medium text-gray-700">
                          CVV
                        </label>
                        <input
                          id="cvv"
                          v-model="cvv"
                          type="text"
                          required
                          maxlength="4"
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- SEPA Details (if SEPA selected) -->
                  <div v-if="paymentData.type === 'sepa'" class="space-y-4">
                    <div>
                      <label for="accountHolder" class="block text-sm font-medium text-gray-700">
                        Nom du titulaire du compte
                      </label>
                      <input
                        id="accountHolder"
                        v-model="paymentData.holderName"
                        type="text"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label for="iban" class="block text-sm font-medium text-gray-700">
                        IBAN
                      </label>
                      <input
                        id="iban"
                        v-model="iban"
                        type="text"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        placeholder="FR76 1234 5678 9012 3456 7890 123"
                      />
                    </div>
                  </div>

                  <!-- Make Default -->
                  <div class="flex items-center">
                    <input
                      id="makeDefault"
                      v-model="paymentData.isDefault"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label for="makeDefault" class="ml-2 text-sm text-gray-700">
                      Définir comme moyen de paiement par défaut
                    </label>
                  </div>

                  <div class="text-xs text-gray-500">
                    <p>Vos informations de paiement sont sécurisées et chiffrées.</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
              @click="addPaymentMethod"
              :disabled="!isFormValid || loading"
            >
              <span v-if="!loading">Ajouter</span>
              <div v-else class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Ajout...
              </div>
            </button>
            <button
              type="button"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
              @click="$emit('close')"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CreditCardIcon } from '@heroicons/vue/24/outline'
import type { PaymentMethod } from '@/stores/modernSubscription'

defineProps<{
  show: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  add: [paymentMethod: Omit<PaymentMethod, 'id'>]
}>()

// Form data
const paymentData = ref({
  type: 'card' as 'card' | 'sepa' | 'paypal',
  holderName: '',
  isDefault: false,
})

const cardNumber = ref('')
const expiryDate = ref('')
const cvv = ref('')
const iban = ref('')

// Form validation
const isFormValid = computed(() => {
  if (!paymentData.value.holderName) return false

  if (paymentData.value.type === 'card') {
    return cardNumber.value.length >= 16 && expiryDate.value.length === 5 && cvv.value.length >= 3
  } else if (paymentData.value.type === 'sepa') {
    return iban.value.length >= 15
  }

  return false
})

// Format functions
const formatCardNumber = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '')
  const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value
  cardNumber.value = formattedValue
}

const formatExpiryDate = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }
  expiryDate.value = value
}

// Submit handler
const addPaymentMethod = () => {
  if (!isFormValid.value) return

  let paymentMethodData: Omit<PaymentMethod, 'id'>

  if (paymentData.value.type === 'card') {
    const [month, year] = expiryDate.value.split('/')
    const cardBrand = detectCardBrand(cardNumber.value)

    paymentMethodData = {
      type: 'card',
      brand: cardBrand,
      last4: cardNumber.value.replace(/\s/g, '').slice(-4),
      expiryMonth: parseInt(month),
      expiryYear: parseInt('20' + year),
      isDefault: paymentData.value.isDefault,
      holderName: paymentData.value.holderName,
    }
  } else {
    paymentMethodData = {
      type: 'sepa',
      last4: iban.value.slice(-4),
      isDefault: paymentData.value.isDefault,
      holderName: paymentData.value.holderName,
    }
  }

  emit('add', paymentMethodData)
}

// Helper function to detect card brand
const detectCardBrand = (cardNumber: string): string => {
  const number = cardNumber.replace(/\s/g, '')

  if (/^4/.test(number)) return 'Visa'
  if (/^5[1-5]/.test(number)) return 'MasterCard'
  if (/^3[47]/.test(number)) return 'American Express'

  return 'Carte'
}
</script>

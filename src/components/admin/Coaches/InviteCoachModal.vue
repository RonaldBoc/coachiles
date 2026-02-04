<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="$emit('close')"
      ></div>

      <!-- Center modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"
        >&#8203;</span
      >

      <div
        class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Invite New Coach</h3>
            <button
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        <!-- Content -->
        <form @submit.prevent="handleSubmit" class="px-6 py-4">
          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Coach Email *
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter the coach's email address"
              />
            </div>

            <div>
              <label
                for="message"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Personal Message (Optional)
              </label>
              <textarea
                id="message"
                v-model="form.message"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Add a personal message to the invitation email..."
              ></textarea>
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <div class="flex">
                <svg
                  class="w-5 h-5 text-blue-400 mt-0.5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-blue-800 dark:text-blue-200">
                    How invitations work
                  </h4>
                  <p class="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    An email will be sent to this address with a special invitation link to join the
                    Coachiles platform. The coach will still need to complete the full registration
                    process.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="error" class="mt-4 text-sm text-red-600">
            {{ error }}
          </div>

          <!-- Actions -->
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Sending...' : 'Send Invitation' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  invited: []
}>()

// Local state
const loading = ref(false)
const error = ref<string | null>(null)
const form = reactive({
  email: '',
  message: '',
})

// Methods
const handleSubmit = async () => {
  loading.value = true
  error.value = null

  try {
    // TODO: Implement invitation API call
    console.log('Sending invitation to:', form.email, 'with message:', form.message)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // For now, just show success and close
    alert(`Invitation sent to ${form.email}`)
    emit('invited')
    emit('close')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to send invitation'
  } finally {
    loading.value = false
  }
}

// Reset form when modal closes
watch(
  () => props.open,
  (open) => {
    if (!open) {
      Object.assign(form, {
        email: '',
        message: '',
      })
      error.value = null
    }
  },
)
</script>

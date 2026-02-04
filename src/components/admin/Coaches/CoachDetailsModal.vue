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
        class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Coach Details</h3>
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
        <div class="px-6 py-4 max-h-[80vh] overflow-y-auto">
          <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>

          <div v-else-if="error" class="text-center py-8 text-red-600">
            {{ error }}
          </div>

          <div v-else-if="coach" class="space-y-6">
            <!-- Basic Info -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Basic Information
              </h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Name:</span>
                  <span class="ml-2 text-gray-900 dark:text-white">{{ getCoachName() }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Email:</span>
                  <span class="ml-2 text-gray-900 dark:text-white">{{ coach.email }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Status:</span>
                  <Badge
                    :label="coach.is_active ? 'Active' : 'Disabled'"
                    :color="coach.is_active ? 'green' : 'red'"
                    class="ml-2"
                  />
                </div>
                <div>
                  <span class="font-medium text-gray-500 dark:text-gray-400">Created:</span>
                  <span class="ml-2 text-gray-900 dark:text-white">{{
                    formatDate(coach.created_at)
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="border-t pt-4">
              <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Actions</h4>
              <div class="flex space-x-3">
                <button
                  @click="toggleStatus"
                  class="px-4 py-2 text-sm font-medium rounded-md"
                  :class="
                    coach.is_active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200'
                  "
                >
                  {{ coach.is_active ? 'Disable' : 'Enable' }} Coach
                </button>

                <button
                  @click="viewSubscription"
                  class="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-md dark:bg-indigo-900/50 dark:text-indigo-200"
                >
                  View Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAdminStore } from '@/stores/admin'
import Badge from '@/components/admin/Common/Badge.vue'
import type { AdminCoach } from '@/services/supabaseAdminApi'

const props = defineProps<{
  coachId: string
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const adminStore = useAdminStore()

// Local state
const loading = ref(false)
const error = ref<string | null>(null)
const coach = ref<AdminCoach | null>(null)

// Methods
const loadCoachDetails = async () => {
  loading.value = true
  error.value = null

  try {
    // Find coach in store first
    const foundCoach = adminStore.coaches.find((c) => c.id === props.coachId)
    if (foundCoach) {
      coach.value = foundCoach
    } else {
      throw new Error('Coach not found')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load coach details'
  } finally {
    loading.value = false
  }
}

const getCoachName = () => {
  if (!coach.value) return ''
  const fullName = `${coach.value.first_name || ''} ${coach.value.last_name || ''}`.trim()
  return fullName || coach.value.email
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const toggleStatus = async () => {
  if (!coach.value) return

  const newStatus = !coach.value.is_active
  const result = await adminStore.setCoachActive(coach.value.id, newStatus, 'Admin action')

  if (result.success) {
    coach.value.is_active = newStatus
    emit('updated')
  } else {
    alert(`Failed to update coach status: ${result.error}`)
  }
}

const viewSubscription = () => {
  // TODO: Implement subscription details
  alert('Subscription details not implemented yet')
}

// Watch for coach ID changes
watch(
  () => props.coachId,
  () => {
    if (props.open && props.coachId) {
      loadCoachDetails()
    }
  },
)

// Load on mount if modal is open
onMounted(() => {
  if (props.open && props.coachId) {
    loadCoachDetails()
  }
})
</script>

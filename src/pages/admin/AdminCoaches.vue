<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Coaches Management</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage coach accounts, subscriptions, and status
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="refreshData"
            :disabled="adminStore.coachesLoading"
            class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <svg
              class="w-4 h-4 mr-2"
              :class="{ 'animate-spin': adminStore.coachesLoading }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.955 8.955 0 0 1 21 12c0 .778-.099 1.533-.284 2.262M3 12c0-.778.099-1.533.284-2.262m0 0A8.955 8.955 0 0 1 12 3c2.777 0 5.35 1.284 7.018 3.475M3 20.736c1.667-2.191 4.243-3.736 7.018-3.736 2.777 0 5.35 1.284 7.018 3.475"
              />
            </svg>
            Refresh
          </button>
          <button
            @click="showInviteModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
            Invite Coach
          </button>
        </div>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Coaches"
          :value="adminStore.kpis.totalCoaches"
          icon="👥"
          color="blue"
        />
        <StatsCard
          title="Active Coaches"
          :value="adminStore.kpis.activeCoaches"
          :subtitle="`${Math.round((adminStore.kpis.activeCoaches / adminStore.kpis.totalCoaches) * 100)}% active`"
          icon="✅"
          color="green"
        />
        <StatsCard
          title="Premium Coaches"
          :value="premiumCount"
          :subtitle="`${Math.round((premiumCount / adminStore.kpis.totalCoaches) * 100)}% premium`"
          icon="⭐"
          color="yellow"
        />
        <StatsCard title="Disabled Coaches" :value="disabledCount" icon="🚫" color="red" />
      </div>

      <!-- Coaches table -->
      <DataTable
        :data="filteredCoaches"
        :columns="coachColumns"
        title="All Coaches"
        :show-search="true"
        :show-filters="true"
        :show-pagination="true"
        :allow-bulk-select="true"
        :filters="coachFilters"
        search-placeholder="Search coaches by name or email..."
        :page-size="20"
        @search="handleSearch"
        @filter="handleFilter"
        @select="handleBulkSelect"
      >
        <!-- Custom cell renderers -->
        <template #cell-name="{ item }">
          <div class="flex items-center space-x-3">
            <div
              class="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center"
            >
              <span class="text-sm font-medium text-gray-700 dark:text-gray-200">
                {{ getInitials(item) }}
              </span>
            </div>
            <div>
              <button
                @click="navigateToCoachDetail(item)"
                class="text-left hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <div
                  class="text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {{ getFullName(item) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ item.email }}
                </div>
              </button>
            </div>
          </div>
        </template>

        <template #cell-status="{ item }">
          <Badge
            :label="item.is_active ? 'Active' : 'Disabled'"
            :color="item.is_active ? 'green' : 'red'"
          />
        </template>

        <template #cell-subscription="{ item }">
          <Badge
            :label="item.subscription_type || 'free'"
            :color="item.subscription_type === 'premium' ? 'indigo' : 'gray'"
          />
        </template>

        <template #cell-created_at="{ item }">
          {{ adminStore.formatDate(item.created_at) }}
        </template>

        <template #cell-actions="{ item }">
          <div class="flex items-center space-x-2">
            <button
              @click.stop="navigateToCoachDetail(item)"
              class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
            >
              View Details
            </button>
            <button
              @click.stop="toggleCoachStatus(item)"
              class="text-sm"
              :class="
                item.is_active
                  ? 'text-red-600 hover:text-red-900'
                  : 'text-green-600 hover:text-green-900'
              "
            >
              {{ item.is_active ? 'Disable' : 'Enable' }}
            </button>
          </div>
        </template>

        <!-- Bulk actions -->
        <template #bulk-actions="{ selected }">
          <button
            @click="bulkDisable(selected)"
            class="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Disable ({{ selected.length }})
          </button>
          <button
            @click="bulkEnable(selected)"
            class="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Enable ({{ selected.length }})
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Invite Coach Modal -->
    <InviteCoachModal
      :open="showInviteModal"
      @close="showInviteModal = false"
      @invited="refreshData"
    />

    <!-- Confirm Modal -->
    <ConfirmModal
      :open="!!confirmAction"
      :title="confirmAction?.title || ''"
      :message="confirmAction?.message || ''"
      :confirm-label="confirmAction?.confirmLabel"
      :confirm-color="(confirmAction?.confirmColor as 'red' | 'green') || 'blue'"
      @confirm="executeConfirmAction"
      @cancel="confirmAction = null"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AdminLayout from '@/components/admin/Layout/AdminLayout.vue'
import DataTable from '@/components/admin/Common/DataTable.vue'
import StatsCard from '@/components/admin/Common/StatsCard.vue'
import Badge from '@/components/admin/Common/Badge.vue'
import InviteCoachModal from '@/components/admin/Coaches/InviteCoachModal.vue'
import ConfirmModal from '@/components/admin/Common/ConfirmModal.vue'
import type { AdminCoach } from '@/services/supabaseAdminApi'

const router = useRouter()
const adminStore = useAdminStore()

// Local state
const showInviteModal = ref(false)
const searchQuery = ref('')
const activeFilters = ref<Record<string, string>>({})
const confirmAction = ref<{
  title: string
  message: string
  confirmLabel: string
  confirmColor: string
  action: () => Promise<void>
} | null>(null)

// Computed
const premiumCount = computed(
  () => adminStore.coaches.filter((c) => c.subscription_type === 'premium').length,
)

const disabledCount = computed(() => adminStore.coaches.filter((c) => !c.is_active).length)

const filteredCoaches = computed(() => {
  let coaches = [...adminStore.coaches]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    coaches = coaches.filter((coach) => {
      const fullName = getFullName(coach).toLowerCase()
      const email = coach.email.toLowerCase()
      return fullName.includes(query) || email.includes(query)
    })
  }

  // Apply filters
  if (activeFilters.value.status) {
    coaches = coaches.filter((coach) => {
      if (activeFilters.value.status === 'active') return coach.is_active
      if (activeFilters.value.status === 'disabled') return !coach.is_active
      return true
    })
  }

  if (activeFilters.value.subscription) {
    coaches = coaches.filter((coach) => {
      return (coach.subscription_type || 'free') === activeFilters.value.subscription
    })
  }

  return coaches
})

// Table configuration
const coachColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'subscription', label: 'Subscription', sortable: true },
  { key: 'created_at', label: 'Created', sortable: true },
  { key: 'actions', label: 'Actions' },
]

const coachFilters = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'disabled', label: 'Disabled' },
    ],
  },
  {
    key: 'subscription',
    label: 'Subscription',
    options: [
      { value: 'free', label: 'Free' },
      { value: 'premium', label: 'Premium' },
    ],
  },
]

// Methods
const refreshData = async () => {
  await adminStore.loadCoaches()
}

const getInitials = (coach: AdminCoach) => {
  const firstName = coach.first_name || ''
  const lastName = coach.last_name || ''
  return (
    (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() ||
    coach.email.substring(0, 2).toUpperCase()
  )
}

const getFullName = (coach: AdminCoach) => {
  const fullName = `${coach.first_name || ''} ${coach.last_name || ''}`.trim()
  return fullName || coach.email
}

const navigateToCoachDetail = (coach: AdminCoach) => {
  router.push(`/admin/coaches/${coach.id}`)
}

const toggleCoachStatus = (coach: AdminCoach) => {
  const newStatus = !coach.is_active
  const action = newStatus ? 'enable' : 'disable'

  confirmAction.value = {
    title: `${action === 'enable' ? 'Enable' : 'Disable'} Coach`,
    message: `Are you sure you want to ${action} ${getFullName(coach)}?`,
    confirmLabel: action === 'enable' ? 'Enable' : 'Disable',
    confirmColor: action === 'enable' ? 'green' : 'red',
    action: async () => {
      const reason = action === 'disable' ? 'Admin action' : undefined
      const result = await adminStore.setCoachActive(coach.id, newStatus, reason)
      if (!result.success && result.error) {
        alert(`Failed to ${action} coach: ${result.error}`)
      }
    },
  }
}

const bulkDisable = (selectedIds: string[]) => {
  confirmAction.value = {
    title: 'Disable Coaches',
    message: `Are you sure you want to disable ${selectedIds.length} coaches?`,
    confirmLabel: 'Disable All',
    confirmColor: 'red',
    action: async () => {
      for (const id of selectedIds) {
        await adminStore.setCoachActive(id, false, 'Bulk admin action')
      }
    },
  }
}

const bulkEnable = (selectedIds: string[]) => {
  confirmAction.value = {
    title: 'Enable Coaches',
    message: `Are you sure you want to enable ${selectedIds.length} coaches?`,
    confirmLabel: 'Enable All',
    confirmColor: 'green',
    action: async () => {
      for (const id of selectedIds) {
        await adminStore.setCoachActive(id, true)
      }
    },
  }
}

const executeConfirmAction = async () => {
  if (confirmAction.value) {
    await confirmAction.value.action()
    confirmAction.value = null
  }
}

const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handleFilter = (filters: Record<string, string>) => {
  activeFilters.value = { ...filters }
}

const handleBulkSelect = (selectedIds: string[]) => {
  console.log('Selected coaches:', selectedIds)
}

// Lifecycle
onMounted(async () => {
  if (!adminStore.coaches.length) {
    await refreshData()
  }
})
</script>

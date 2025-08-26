<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Superadmin</h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Platform overview and administration
            </p>
          </div>
          <div v-if="!superadminVerified" class="flex items-center text-amber-600 text-sm">
            <svg class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 7zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd"
              />
            </svg>
            Superadmin check via environment fallback — apply the admin migration for secure checks
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              activeTab === tab.key
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
            ]"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Overview -->
      <section v-if="activeTab === 'overview'" class="space-y-6">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="card in kpis"
            :key="card.label"
            class="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow"
          >
            <div class="px-4 py-5 sm:p-6">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {{ card.label }}
              </dt>
              <dd class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {{ card.value }}
              </dd>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              Recent deletion requests
            </h3>
            <div v-if="deletionLogsError" class="mt-3 text-sm text-red-600">
              {{ deletionLogsError }}
            </div>
            <div v-else class="mt-4 overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Coach
                    </th>
                    <th
                      class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Reason
                    </th>
                    <th
                      class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Requested
                    </th>
                    <th
                      class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Deadline
                    </th>
                    <th
                      class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody
                  class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                >
                  <tr v-for="log in deletionLogs.slice(0, 5)" :key="log.id">
                    <td class="px-3 py-2 text-sm text-gray-500">{{ log.coach_name || '—' }}</td>
                    <td class="px-3 py-2 text-sm text-gray-500">{{ log.reason || '—' }}</td>
                    <td class="px-3 py-2 text-sm text-gray-500">
                      {{ formatDate(log.deletion_requested_at) }}
                    </td>
                    <td class="px-3 py-2 text-sm text-gray-500">
                      {{ formatDate(log.reactivation_deadline) }}
                    </td>
                    <td class="px-3 py-2 text-sm">
                      <span
                        :class="[
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          log.reactivated_at
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800',
                        ]"
                      >
                        {{ log.reactivated_at ? 'Reactivated' : 'Pending' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- Coaches -->
      <section v-if="activeTab === 'coaches'" class="space-y-4">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div class="sm:flex sm:items-center sm:justify-between gap-4">
            <div class="relative max-w-sm">
              <input
                v-model="coachQuery"
                type="search"
                placeholder="Search coaches (name or email)"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  class="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 3.5a5.5 5.5 0 104.473 8.765l3.131 3.131a.75.75 0 101.06-1.06l-3.13-3.132A5.5 5.5 0 009 3.5zM4.5 9a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div class="text-xs text-gray-500">
              Showing {{ filteredCoaches.length }} of {{ coaches.length }}
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Subscription
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th class="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody
                class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
              >
                <tr v-for="c in filteredCoaches" :key="c.id">
                  <td class="px-3 py-2 text-sm text-gray-500">
                    {{ c.first_name || c.firstName }} {{ c.last_name || c.lastName }}
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-500">{{ c.email }}</td>
                  <td class="px-3 py-2 text-sm">
                    <span
                      :class="[
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
                      ]"
                    >
                      {{ c.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-500">
                    {{ coachSubs.get(c.id)?.subscription_type || c.subscription_type || '—' }}
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-500">{{ formatDate(c.created_at) }}</td>
                  <td class="px-3 py-2 text-right">
                    <button
                      class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
                      @click="openCoach(c.id)"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p v-if="coachesError" class="text-sm text-red-600">{{ coachesError }}</p>
      </section>

      <!-- Leads -->
      <section v-if="activeTab === 'leads'" class="space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Client
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Coach
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                </tr>
              </thead>
              <tbody
                class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
              >
                <tr v-for="l in leads" :key="l.id">
                  <td class="px-3 py-2 text-sm text-gray-500">{{ l.client_name }}</td>
                  <td class="px-3 py-2 text-sm text-gray-500">{{ l.client_email }}</td>
                  <td class="px-3 py-2 text-sm">
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800"
                      >{{ l.status }}</span
                    >
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-500">{{ getCoachName(l.coach_id) }}</td>
                  <td class="px-3 py-2 text-sm text-gray-500">{{ formatDate(l.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p v-if="leadsError" class="text-sm text-red-600">{{ leadsError }}</p>
      </section>

      <!-- Deletion Logs -->
      <section v-if="activeTab === 'deletion'" class="space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Coach
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Reason
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Requested
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Deadline
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Reactivated
                  </th>
                </tr>
              </thead>
              <tbody
                class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
              >
                <tr v-for="log in deletionLogs" :key="log.id">
                  <td class="px-3 py-2 text-sm text-gray-500">{{ log.coach_name || '—' }}</td>
                  <td class="px-3 py-2 text-sm text-gray-500">{{ log.deletion_type || '—' }}</td>
                  <td class="px-3 py-2 text-sm text-gray-500">{{ log.reason || '—' }}</td>
                  <td class="px-3 py-2 text-sm text-gray-500">
                    {{ formatDate(log.deletion_requested_at) }}
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-500">
                    {{ formatDate(log.reactivation_deadline) }}
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-500">
                    {{ log.reactivated_at ? formatDate(log.reactivated_at) : '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p v-if="deletionLogsError" class="text-sm text-red-600">{{ deletionLogsError }}</p>
      </section>
    </main>
  </div>

  <!-- Coach details modal -->
  <div
    v-if="showCoachModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
  >
    <div class="w-full max-w-2xl rounded-lg bg-white dark:bg-gray-800 shadow">
      <div class="flex items-center justify-between border-b px-4 py-3">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">Coach Details</h3>
        <button class="text-gray-500 hover:text-gray-700" @click="showCoachModal = false">✕</button>
      </div>
      <div class="p-4 space-y-4" v-if="!detailsLoading">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-gray-500 dark:text-gray-400">Name</div>
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ getCoachName(activeCoachId) }}
            </div>
          </div>
          <div>
            <div class="text-gray-500 dark:text-gray-400">Current Plan</div>
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ coachDetails.subscription?.subscription_type || 'free' }}
            </div>
          </div>
          <div>
            <div class="text-gray-500 dark:text-gray-400">Account Status</div>
            <div class="font-medium text-gray-900 dark:text-gray-100">
              <span
                :class="[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  coachIsActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
                ]"
              >
                {{ coachIsActive ? 'Active' : 'Disabled' }}
              </span>
            </div>
          </div>
          <div v-if="!coachIsActive">
            <div class="text-gray-500 dark:text-gray-400">Disabled Reason</div>
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ disabledReason || '—' }}
            </div>
          </div>
          <div>
            <div class="text-gray-500 dark:text-gray-400">Current Period</div>
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ formatDate(coachDetails.subscription?.current_period_start) }} →
              {{ formatDate(coachDetails.subscription?.current_period_end) }}
            </div>
          </div>
        </div>

        <div class="mt-2 border-t pt-4">
          <h4 class="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Set Subscription
          </h4>
          <div class="flex flex-wrap items-end gap-3">
            <label class="text-sm">
              <span class="mr-2">Plan</span>
              <select
                v-model="subPlanType"
                class="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm"
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </label>
            <label class="text-sm">
              <span class="mr-2">Start</span>
              <input
                type="datetime-local"
                v-model="subStart"
                class="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm"
              />
            </label>
            <label class="text-sm">
              <span class="mr-2">End</span>
              <input
                type="datetime-local"
                v-model="subEnd"
                class="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm"
              />
            </label>
            <button
              class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
              @click="saveSubscription"
            >
              Save
            </button>
          </div>
        </div>

        <div class="mt-4 border-t pt-4">
          <h4 class="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Recent Payments
          </h4>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Txn
                  </th>
                </tr>
              </thead>
              <tbody
                class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
              >
                <tr v-for="p in coachDetails.payments" :key="p.id">
                  <td class="px-3 py-2 text-sm text-gray-500">{{ formatDate(p.created_at) }}</td>
                  <td class="px-3 py-2 text-sm text-gray-900">{{ p.amount }} {{ p.currency }}</td>
                  <td class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    {{ p.payment_type }}
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">{{ p.status }}</td>
                  <td
                    class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 truncate max-w-[120px]"
                  >
                    {{ p.transaction_id || '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="mt-4 border-t pt-4">
          <h4 class="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Account Activation
          </h4>
          <div class="flex flex-wrap items-end gap-3">
            <label class="text-sm flex-1 min-w-[220px]">
              <span class="mr-2">Reason (optional)</span>
              <input
                type="text"
                v-model="disabledReasonInput"
                placeholder="Reason for disabling/enabling"
                class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm"
              />
            </label>
            <button
              v-if="coachIsActive"
              class="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500"
              @click="toggleActive(false)"
            >
              Disable Coach
            </button>
            <button
              v-else
              class="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-500"
              @click="toggleActive(true)"
            >
              Enable Coach
            </button>
          </div>
        </div>
      </div>
      <div v-else class="p-6 text-sm text-gray-500">Loading…</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import {
  AdminApi,
  type CoachSubscriptionSummary,
  type PaymentRow,
} from '../services/supabaseAdminApi'
defineOptions({ name: 'SuperadminPage' })

type CoachRow = {
  id: string
  email: string
  first_name?: string
  last_name?: string
  firstName?: string
  lastName?: string
  created_at?: string
  is_active?: boolean
  subscription_type?: string | null
  disabled_reason?: string | null
}

type LeadRow = {
  id: string
  client_name: string
  client_email: string
  status: string
  coach_id: string | null
  created_at: string
}

type DeletionLogRow = {
  id: string
  coach_id: string | null
  reason: string | null
  deletion_type: string | null
  deletion_requested_at: string
  reactivation_deadline: string | null
  reactivated_at: string | null
  coach_name?: string | null
}
const activeTab = ref<'overview' | 'coaches' | 'leads' | 'deletion'>('overview')
const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'coaches', label: 'Coaches' },
  { key: 'leads', label: 'Leads' },
  { key: 'deletion', label: 'Deletion Logs' },
] as const

// State
const superadminVerified = ref(false)
const kpis = ref([
  { label: 'Coaches', value: '—' },
  { label: 'Active Leads', value: '—' },
  { label: 'Pending Deletions', value: '—' },
  { label: 'Reactivated (30d)', value: '—' },
])

const coaches = ref<CoachRow[]>([])
const coachesError = ref<string | null>(null)
const coachQuery = ref('')
const filteredCoaches = computed(() => {
  const q = coachQuery.value.toLowerCase().trim()
  if (!q) return coaches.value
  return coaches.value.filter((c) =>
    [c.email, c.first_name, c.last_name, c.firstName, c.lastName]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  )
})

const leads = ref<LeadRow[]>([])
const leadsError = ref<string | null>(null)
const coachMap = ref<Map<string, string>>(new Map())
const coachSubs = ref<Map<string, CoachSubscriptionSummary>>(new Map())

const deletionLogs = ref<DeletionLogRow[]>([])
const deletionLogsError = ref<string | null>(null)

// Details modal state
const showCoachModal = ref(false)
const activeCoachId = ref<string | null>(null)
const coachDetails = ref<{
  coach: Record<string, unknown> | null
  subscription: CoachSubscriptionSummary | null
  payments: PaymentRow[]
}>({ coach: null, subscription: null, payments: [] })
const detailsLoading = ref(false)
const subPlanType = ref<'free' | 'premium'>('free')
const subStart = ref<string>('')
const subEnd = ref<string>('')
const disabledReasonInput = ref<string>('')
const coachIsActive = computed(() => {
  if (!activeCoachId.value) return true
  const c = coaches.value.find((x) => x.id === activeCoachId.value)
  return c?.is_active !== false
})
const disabledReason = computed(() => {
  // Pull from list row if present; details JSON may not include reason directly
  const c = coaches.value.find((x) => x.id === activeCoachId.value)
  return c?.disabled_reason ?? null
})

function formatDate(d?: string | null) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString()
  } catch {
    return d
  }
}

function getCoachName(id: string | null): string {
  if (!id) return '—'
  return coachMap.value.get(id) || '—'
}

onMounted(async () => {
  // Verify superadmin (RPC if available, fallback to env list)
  superadminVerified.value = await AdminApi.isSuperadmin()

  // Parallel loads
  const [coachRes, leadRes, delRes] = await Promise.all([
    AdminApi.listCoaches().catch((e: unknown) => ({
      error: e instanceof Error ? e.message : String(e),
      data: [] as CoachRow[],
    })),
    AdminApi.listLeads().catch((e: unknown) => ({
      error: e instanceof Error ? e.message : String(e),
      data: [] as LeadRow[],
    })),
    AdminApi.listDeletionLogs().catch((e: unknown) => ({
      error: e instanceof Error ? e.message : String(e),
      data: [] as DeletionLogRow[],
    })),
  ])

  // Coaches
  if ('error' in coachRes && coachRes.error) {
    coachesError.value = coachRes.error
  } else if ('data' in coachRes) {
    coaches.value = coachRes.data as CoachRow[]
  }

  // Leads
  if ('error' in leadRes && leadRes.error) {
    leadsError.value = leadRes.error
  } else if ('data' in leadRes) {
    leads.value = leadRes.data as LeadRow[]
  }

  // Deletion logs
  if ('error' in delRes && delRes.error) {
    deletionLogsError.value = delRes.error
  } else if ('data' in delRes) {
    deletionLogs.value = delRes.data as DeletionLogRow[]
  }

  // Build coach map
  coachMap.value = new Map(
    coaches.value.map((c) => [
      c.id,
      `${c.first_name || c.firstName || ''} ${c.last_name || c.lastName || ''}`.trim(),
    ]),
  )

  // Load subscription types via view
  const subs = await AdminApi.getCoachSubscriptionMap()
  if (!subs.error) {
    coachSubs.value = new Map(Object.entries(subs.data))
  }

  // KPIs
  kpis.value = [
    { label: 'Coaches', value: String(coaches.value.length) },
    {
      label: 'Active Leads',
      value: String(leads.value.filter((l) => l.status && l.status !== 'closed').length),
    },
    {
      label: 'Pending Deletions',
      value: String(deletionLogs.value.filter((d) => !d.reactivated_at).length),
    },
    {
      label: 'Reactivated (30d)',
      value: String(
        deletionLogs.value.filter((d) => d.reactivated_at && daysDiff(d.reactivated_at) <= 30)
          .length,
      ),
    },
  ]
})

function daysDiff(dateStr: string) {
  const d = new Date(dateStr).getTime()
  const now = Date.now()
  return Math.floor((now - d) / (1000 * 60 * 60 * 24))
}

async function openCoach(coachId: string) {
  activeCoachId.value = coachId
  showCoachModal.value = true
  detailsLoading.value = true
  const res = await AdminApi.getCoachDetails(coachId)
  if (!res.error) {
    coachDetails.value = res.data
    const currentType = res.data.subscription?.subscription_type || 'free'
    subPlanType.value = currentType === 'premium' ? 'premium' : 'free'
    subStart.value = res.data.subscription?.current_period_start || ''
    subEnd.value = res.data.subscription?.current_period_end || ''
    // Also fetch payments via dedicated RPC to ensure consistency
    const pay = await AdminApi.listPaymentsForCoach(coachId)
    if (!pay.error) {
      coachDetails.value = { ...coachDetails.value, payments: pay.data }
    }
  }
  detailsLoading.value = false
}

async function saveSubscription() {
  if (!activeCoachId.value) return
  const start = subStart.value && subStart.value.trim() !== '' ? subStart.value : undefined
  const end = subEnd.value && subEnd.value.trim() !== '' ? subEnd.value : undefined
  const ok = await AdminApi.setCoachSubscription(activeCoachId.value, subPlanType.value, start, end)
  if (ok.ok) {
    // Refresh details and list view subscription cache
    const res = await AdminApi.getCoachDetails(activeCoachId.value)
    if (!res.error) {
      coachDetails.value = res.data
      const subsMap = await AdminApi.getCoachSubscriptionMap()
      if (!subsMap.error) coachSubs.value = new Map(Object.entries(subsMap.data))
    }
  }
}

async function toggleActive(active: boolean) {
  if (!activeCoachId.value) return
  const res = await AdminApi.setCoachActive(
    activeCoachId.value,
    active,
    disabledReasonInput.value || undefined,
  )
  if (res.ok) {
    // Refresh coaches list and details
    const list = await AdminApi.listCoaches()
    if (!list.error) coaches.value = list.data as CoachRow[]
    const det = await AdminApi.getCoachDetails(activeCoachId.value)
    if (!det.error) coachDetails.value = det.data
    // Clear input on success
    if (active) disabledReasonInput.value = ''
  }
}
</script>

<style scoped></style>

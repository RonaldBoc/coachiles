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
                    <span v-if="coachSubs.get(c.id)">
                      {{ coachSubs.get(c.id)?.subscription_type || '—' }}
                      <span
                        v-if="showDaysRemaining(coachSubs.get(c.id))"
                        class="ml-1 text-xs text-amber-600 dark:text-amber-400"
                      >
                        ({{ daysRemaining(coachSubs.get(c.id)) }}d left)
                      </span>
                    </span>
                    <span v-else>{{ c.subscription_type || '—' }}</span>
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
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-wrap gap-4 items-end">
          <label class="text-sm">
            <span class="mr-2">Status</span>
            <select
              v-model="leadStatusFilter"
              class="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm"
            >
              <option value="">All</option>
              <option value="new">New</option>
              <option value="assigned">Assigned</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <label class="text-sm">
            <span class="mr-2">Coach</span>
            <select
              v-model="leadCoachFilter"
              class="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm min-w-[160px]"
            >
              <option value="">All</option>
              <option v-for="c in coaches" :key="c.id" :value="c.id">
                {{ getCoachName(c.id) || c.email }}
              </option>
            </select>
          </label>
          <div class="text-xs text-gray-500">
            Showing {{ filteredLeads.length }} of {{ leads.length }}
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
                <tr
                  v-for="l in filteredLeads"
                  :key="l.id"
                  class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  @click="openLead(l.id)"
                >
                  <td class="px-3 py-2 text-sm text-gray-500">{{ l.client_name }}</td>
                  <td class="px-3 py-2 text-sm text-gray-500">{{ l.client_email }}</td>
                  <td class="px-3 py-2 text-sm">
                    <span
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
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

      <!-- Reviews -->
      <section v-if="activeTab === 'reviews'" class="space-y-4">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-wrap gap-4 items-end">
          <label class="text-sm">
            <span class="mr-2">Status</span>
            <select
              v-model="reviewStatusFilter"
              class="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <label class="text-sm">
            <span class="mr-2">Coach</span>
            <select
              v-model="reviewCoachFilter"
              class="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm min-w-[160px]"
            >
              <option value="">All</option>
              <option v-for="c in coaches" :key="c.id" :value="c.id">
                {{ getCoachName(c.id) || c.email }}
              </option>
            </select>
          </label>
          <div class="text-xs text-gray-500">Showing {{ reviews.length }}</div>
          <div class="flex-1"></div>
          <div class="flex items-center gap-2 text-xs">
            <input
              v-model="reviewNote"
              placeholder="Optional note for approve/reject"
              class="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-xs px-2 py-1 w-64"
            />
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div v-if="reviewsLoading" class="p-6 text-sm text-gray-500">Loading reviews...</div>
          <div v-else-if="reviewsError" class="p-6 text-sm text-red-600">{{ reviewsError }}</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Created
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Coach
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Client
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Rating
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Comment
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="r in reviews" :key="r.id" class="text-sm">
                  <td class="px-4 py-2 whitespace-nowrap">{{ formatDate(r.created_at) }}</td>
                  <td class="px-4 py-2 whitespace-nowrap">{{ getCoachName(r.coach_id) }}</td>
                  <td class="px-4 py-2 whitespace-nowrap">{{ r.client_name }}</td>
                  <td class="px-4 py-2 whitespace-nowrap font-medium">{{ r.rating }}★</td>
                  <td class="px-4 py-2 max-w-xs">{{ r.comment || '—' }}</td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium',
                        r.moderation_status === 'pending' &&
                          'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
                        r.moderation_status === 'approved' &&
                          'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
                        r.moderation_status === 'rejected' &&
                          'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
                      ]"
                      >{{ r.moderation_status }}</span
                    >
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap space-x-2">
                    <button
                      v-if="r.moderation_status === 'pending'"
                      @click="approveReview(r.id)"
                      class="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      v-if="r.moderation_status === 'pending'"
                      @click="rejectReview(r.id)"
                      class="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
                <tr v-if="!reviews.length">
                  <td colspan="7" class="px-4 py-6 text-center text-xs text-gray-500">
                    No reviews match filters
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
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
              <span
                v-if="showDaysRemaining(coachDetails.subscription)"
                class="ml-1 text-xs text-amber-600 dark:text-amber-400"
              >
                ({{ daysRemaining(coachDetails.subscription) }}d left)
              </span>
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
          <div class="flex flex-wrap items-end gap-3 mb-3">
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
          <div
            v-if="coachDetails.subscription?.subscription_type === 'premium'"
            class="mt-2 space-y-2"
          >
            <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Cancel Premium Subscription
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex flex-wrap items-center gap-2">
                <button
                  class="inline-flex items-center rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-500"
                  @click="cancelSub('at_period_end')"
                >
                  End at Period End ({{ formatDate(coachDetails.subscription.current_period_end) }})
                </button>
                <div class="flex items-center gap-1 text-xs">
                  <input
                    type="datetime-local"
                    v-model="cancelDate"
                    class="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-xs"
                  />
                  <button
                    class="inline-flex items-center rounded-md bg-amber-500 px-2 py-1 text-[10px] font-semibold text-white shadow-sm hover:bg-amber-400"
                    @click="cancelSub('at_date')"
                    :disabled="!cancelDate"
                  >
                    End At Date
                  </button>
                </div>
                <button
                  class="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500"
                  @click="cancelSub('immediate')"
                >
                  End Now
                </button>
              </div>
              <p v-if="cancelError" class="text-xs text-red-600">{{ cancelError }}</p>
              <p v-if="cancelSuccess" class="text-xs text-green-600">{{ cancelSuccess }}</p>
            </div>
          </div>
        </div>

        <!-- Coach Leads Section -->
        <div class="mt-4 border-t pt-4">
          <h4 class="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Coach Leads</h4>
          <div v-if="coachLeadsLoading" class="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Loading leads…
          </div>
          <div v-else>
            <div v-if="coachLeadsError" class="text-xs text-red-600 mb-2">
              {{ coachLeadsError }}
            </div>
            <div class="overflow-x-auto max-h-64">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      class="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Client
                    </th>
                    <th
                      class="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      class="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      class="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Created
                    </th>
                    <th
                      class="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Hidden
                    </th>
                    <th class="px-2 py-1"></th>
                    <th class="px-2 py-1"></th>
                  </tr>
                </thead>
                <tbody
                  class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                >
                  <tr v-for="lead in coachLeads" :key="lead.id">
                    <td class="px-2 py-1 text-gray-700 dark:text-gray-300">
                      {{ lead.client_name }}
                    </td>
                    <td class="px-2 py-1 text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                      {{ lead.client_email }}
                    </td>
                    <td class="px-2 py-1">
                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {{ lead.status }}
                      </span>
                    </td>
                    <td class="px-2 py-1 text-gray-500 dark:text-gray-400">
                      {{ formatDate(lead.created_at) }}
                    </td>
                    <td class="px-2 py-1">
                      <span
                        :class="
                          lead.is_hidden
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                        "
                      >
                        {{ lead.is_hidden ? 'Yes' : 'No' }}
                      </span>
                    </td>
                    <td class="px-2 py-1 text-right">
                      <button
                        class="inline-flex items-center rounded bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-[10px] font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                        @click="toggleLeadHidden(lead.id, lead.is_hidden)"
                      >
                        {{ lead.is_hidden ? 'Unhide' : 'Hide' }}
                      </button>
                    </td>
                    <td class="px-2 py-1 text-right">
                      <button
                        class="inline-flex items-center rounded bg-red-600 text-white px-2 py-0.5 text-[10px] font-medium hover:bg-red-500"
                        @click="deleteLead(lead.id)"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!coachLeads.length">
                    <td colspan="7" class="px-2 py-3 text-center text-gray-500 dark:text-gray-400">
                      No leads
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
  <!-- Lead details modal -->
  <div
    v-if="showLeadModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
  >
    <div class="w-full max-w-xl rounded-lg bg-white dark:bg-gray-800 shadow">
      <div class="flex items-center justify-between border-b px-4 py-3">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span>Lead Details</span>
          <span
            v-if="leadDetails.lead?.original_lead_id"
            class="inline-flex items-center rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-600/20 dark:text-indigo-300 px-2 py-0.5 text-[11px] font-medium"
            title="This lead is a duplicated copy of another lead"
            >Copy</span
          >
        </h3>
        <button class="text-gray-500 hover:text-gray-700" @click="showLeadModal = false">✕</button>
      </div>
      <div class="p-4 space-y-4 text-sm" v-if="leadDetails.lead">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-gray-500 dark:text-gray-400">Client</div>
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ leadDetails.lead.client_name as string }}
            </div>
          </div>
          <div>
            <div class="text-gray-500 dark:text-gray-400">Email</div>
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ leadDetails.lead.client_email as string }}
            </div>
          </div>
          <div>
            <div class="text-gray-500 dark:text-gray-400">Status</div>
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ leadDetails.lead.status as string }}
            </div>
          </div>
          <div>
            <div class="text-gray-500 dark:text-gray-400">Created</div>
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ formatDate(leadDetails.lead.created_at as string) }}
            </div>
          </div>
          <div v-if="leadDetails.lead.original_lead_id">
            <div class="text-gray-500 dark:text-gray-400">Original Lead ID</div>
            <div class="font-mono text-[11px] break-all text-gray-800 dark:text-gray-200">
              {{ leadDetails.lead.original_lead_id as string }}
            </div>
          </div>
          <div v-if="leadDetails.lead.original_coach_id">
            <div class="text-gray-500 dark:text-gray-400">Original Coach ID</div>
            <div class="font-mono text-[11px] break-all text-gray-800 dark:text-gray-200">
              {{ leadDetails.lead.original_coach_id as string }}
            </div>
          </div>
        </div>
        <div class="border-t pt-4">
          <h4 class="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Duplicate Lead To Other Coaches
          </h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Select one or more coaches to create a new copy of this lead assigned to them. The
            duplicated leads will start in status "new". The original lead stays unchanged.
          </p>
          <div class="space-y-2">
            <div class="flex flex-wrap gap-2 max-h-40 overflow-auto pr-1">
              <label
                v-for="c in coaches.filter((c) => c.id !== (leadDetails.lead?.coach_id as string))"
                :key="c.id"
                class="flex items-center gap-1 text-xs"
              >
                <input
                  type="checkbox"
                  :value="c.id"
                  v-model="leadCoachSelection"
                  class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
                <span>{{ getCoachName(c.id) || c.email }}</span>
              </label>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="duplicateLeadToCoaches"
                :disabled="!leadCoachSelection.length || duplicatingLead"
                class="inline-flex items-center rounded-md bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                <span v-if="!duplicatingLead">Duplicate To Selected Coaches</span>
                <span v-else>Duplicating…</span>
              </button>
              <span
                v-if="leadSaveMessage"
                class="text-xs"
                :class="leadSaveMessage.startsWith('Created') ? 'text-green-600' : 'text-red-600'"
                >{{ leadSaveMessage }}</span
              >
            </div>
          </div>
        </div>
      </div>
      <div v-else class="p-6 text-sm text-gray-500">Loading…</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import {
  AdminApi,
  type CoachSubscriptionSummary,
  type PaymentRow,
  type AdminLead, // added
  type AdminReview,
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
const activeTab = ref<'overview' | 'coaches' | 'leads' | 'deletion' | 'reviews'>('overview')
const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'coaches', label: 'Coaches' },
  { key: 'leads', label: 'Leads' },
  { key: 'reviews', label: 'Reviews' },
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
const leadStatusFilter = ref('')
const leadCoachFilter = ref('')
// Multi-access removed; we now duplicate a lead per coach. Access map no longer used.
const showLeadModal = ref(false)
const activeLeadId = ref<string | null>(null)
const leadDetails = ref<{ lead: Record<string, unknown> | null; coach_ids: string[] }>({
  lead: null,
  coach_ids: [],
})
const leadCoachSelection = ref<string[]>([])
const leadSaveMessage = ref('')
const duplicatingLead = ref(false)
const coachMap = ref<Map<string, string>>(new Map())
const coachSubs = ref<Map<string, CoachSubscriptionSummary>>(new Map())

const deletionLogs = ref<DeletionLogRow[]>([])
const deletionLogsError = ref<string | null>(null)

const reviewStatusFilter = ref<'pending' | 'approved' | 'rejected' | ''>('')
const reviewCoachFilter = ref('')
const reviews = ref<AdminReview[]>([])
const reviewsLoading = ref(false)
const reviewsError = ref<string | null>(null)
const reviewNote = ref('')

// Details modal state
const showCoachModal = ref(false)
const activeCoachId = ref<string | null>(null)
const coachDetails = ref<{
  coach: Record<string, unknown> | null
  subscription: CoachSubscriptionSummary | null
  payments: PaymentRow[]
}>({ coach: null, subscription: null, payments: [] })
const coachLeads = ref<AdminLead[]>([]) // added
const coachLeadsLoading = ref(false) // added
const coachLeadsError = ref<string | null>(null) // added
const detailsLoading = ref(false)
const subPlanType = ref<'free' | 'premium'>('free')
const subStart = ref<string>('')
const subEnd = ref<string>('')
const disabledReasonInput = ref<string>('')
const cancelDate = ref<string>('')
const cancelError = ref<string>('')
const cancelSuccess = ref<string>('')
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

function showDaysRemaining(sub?: CoachSubscriptionSummary | null) {
  if (!sub) return false
  if (sub.subscription_type !== 'premium') return false
  if (!sub.current_period_end) return false
  const end = new Date(sub.current_period_end).getTime()
  if (isNaN(end) || end < Date.now()) return false
  // show if auto_renew is false OR status indicates cancelled/ending
  const status = (sub.subscription_status || '').toLowerCase()
  const endingStatuses = ['canceled', 'cancelled', 'past_due', 'incomplete_expired']
  const autoRenewing = sub.auto_renew !== false && !endingStatuses.includes(status)
  return !autoRenewing
}

function daysRemaining(sub?: CoachSubscriptionSummary | null) {
  if (!sub?.current_period_end) return 0
  const end = new Date(sub.current_period_end).getTime()
  if (isNaN(end)) return 0
  const diff = end - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

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

const filteredLeads = computed(() => {
  return leads.value.filter((l) => {
    const statusOk = !leadStatusFilter.value || l.status === leadStatusFilter.value
    const coachOk = !leadCoachFilter.value || l.coach_id === leadCoachFilter.value
    return statusOk && coachOk
  })
})

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

  // Multi-access removed; duplication strategy requires no extra mapping load.
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
  // Load leads for coach
  coachLeadsLoading.value = true
  coachLeadsError.value = null
  const leadsRes = await AdminApi.listLeadsForCoach(coachId)
  if (leadsRes.error) {
    coachLeadsError.value = leadsRes.error
    coachLeads.value = []
  } else {
    coachLeads.value = leadsRes.data
  }
  coachLeadsLoading.value = false
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

async function cancelSub(mode: 'at_period_end' | 'at_date' | 'immediate') {
  cancelError.value = ''
  cancelSuccess.value = ''
  if (!activeCoachId.value) return
  let endDate: string | undefined
  if (mode === 'at_date') {
    if (!cancelDate.value) {
      cancelError.value = 'Select a date'
      return
    }
    endDate = cancelDate.value
  }
  const res = await AdminApi.cancelCoachSubscription(activeCoachId.value, mode, endDate)
  if (!res.ok) {
    cancelError.value = res.error || 'Failed'
  } else {
    cancelSuccess.value = 'Subscription updated'
    // Refresh subscription info
    const det = await AdminApi.getCoachDetails(activeCoachId.value)
    if (!det.error) coachDetails.value = det.data
    // refresh map
    const subsMap = await AdminApi.getCoachSubscriptionMap()
    if (!subsMap.error) coachSubs.value = new Map(Object.entries(subsMap.data))
  }
}

async function openLead(id: string) {
  activeLeadId.value = id
  leadSaveMessage.value = ''
  const res = await AdminApi.getLeadDetails(id)
  if (!res.error) {
    leadDetails.value = res.data
    leadCoachSelection.value = [] // start empty for duplication selection
  }
  showLeadModal.value = true
}

async function duplicateLeadToCoaches() {
  if (!activeLeadId.value || !leadCoachSelection.value.length) return
  duplicatingLead.value = true
  leadSaveMessage.value = ''
  const res = await AdminApi.duplicateLead(activeLeadId.value, leadCoachSelection.value)
  if (!res.ok) {
    leadSaveMessage.value = res.error || 'Failed'
    duplicatingLead.value = false
    return
  }
  leadSaveMessage.value = `Created ${res.created?.length || 0} copies`
  // Refresh leads list to include new duplicated rows
  const list = await AdminApi.listLeads()
  if (!list.error) leads.value = list.data as LeadRow[]
  // Reset selection
  leadCoachSelection.value = []
  duplicatingLead.value = false
}

async function toggleLeadHidden(leadId: string, current: boolean | undefined) {
  // added
  const res = await AdminApi.setLeadHidden(leadId, !current)
  if (res.ok) {
    const idx = coachLeads.value.findIndex((l: AdminLead) => l.id === leadId)
    if (idx !== -1) coachLeads.value[idx] = { ...coachLeads.value[idx], is_hidden: res.hidden }
  } else {
    coachLeadsError.value = res.error || 'Failed to update lead'
  }
}

async function deleteLead(leadId: string) {
  if (!confirm('Delete this lead permanently? This cannot be undone.')) return
  const res = await AdminApi.deleteLead(leadId)
  if (res.ok) {
    coachLeads.value = coachLeads.value.filter((l) => l.id !== leadId)
    leads.value = leads.value.filter((l) => l.id !== leadId)
  } else {
    coachLeadsError.value = res.error || 'Failed to delete lead'
  }
}

async function loadReviews() {
  reviewsLoading.value = true
  reviewsError.value = null
  const { data, error } = await AdminApi.listReviews({
    status: reviewStatusFilter.value || undefined,
    coachId: reviewCoachFilter.value || undefined,
    limit: 500,
  })
  if (error) reviewsError.value = error
  reviews.value = data as AdminReview[]
  reviewsLoading.value = false
}

async function approveReview(id: string) {
  const note = reviewNote.value.trim() || undefined
  const res = await AdminApi.approveReview(id, note)
  if (!res.ok) {
    alert(res.error || 'Failed to approve')
  }
  reviewNote.value = ''
  await loadReviews()
}
async function rejectReview(id: string) {
  const note = reviewNote.value.trim() || undefined
  const res = await AdminApi.rejectReview(id, note)
  if (!res.ok) {
    alert(res.error || 'Failed to reject')
  }
  reviewNote.value = ''
  await loadReviews()
}
watch([reviewStatusFilter, reviewCoachFilter], () => {
  if (activeTab.value === 'reviews') loadReviews()
})
watch(activeTab, (t) => {
  if (t === 'reviews') loadReviews()
})
</script>

<style scoped></style>

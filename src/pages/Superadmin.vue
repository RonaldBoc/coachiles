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

      <!-- Certifications / Diplomas -->
      <section v-if="activeTab === 'certifications'" class="space-y-4">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-wrap gap-4 items-end">
          <label class="text-sm">
            <span class="mr-2">Status</span>
            <select
              v-model="diplomaStatusFilter"
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
              v-model="diplomaCoachFilter"
              class="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm min-w-[160px]"
            >
              <option value="">All</option>
              <option v-for="c in coaches" :key="c.id" :value="c.id">
                {{ getCoachName(c.id) || c.email }}
              </option>
            </select>
          </label>
          <div class="text-xs text-gray-500">Showing {{ filteredDiplomaSubs.length }}</div>
          <div class="flex-1"></div>
          <button
            @click="loadDiplomas"
            class="text-xs px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-500"
          >
            Refresh
          </button>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div v-if="diplomasLoading" class="p-6 text-sm text-gray-500">Loading diplomas...</div>
          <div v-else-if="diplomasError" class="p-6 text-sm text-red-600">{{ diplomasError }}</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Coach
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Title
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Proof
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Note (rejection)
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <tr v-for="d in filteredDiplomaSubs" :key="d.diploma_id">
                  <td class="px-4 py-2 whitespace-nowrap">
                    <div class="font-medium">{{ d.coach_name || '—' }}</div>
                    <div class="text-[11px] text-gray-500">{{ d.coach_email }}</div>
                  </td>
                  <td class="px-4 py-2 max-w-xs break-words">{{ d.title }}</td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    <a
                      v-if="d.proofFileUrl"
                      :href="d.proofFileUrl"
                      target="_blank"
                      class="text-indigo-600 hover:underline"
                    >
                      {{ d.proofFileName || 'Voir' }}
                    </a>
                    <span v-else class="text-[11px] text-gray-400">—</span>
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium',
                        d.status === 'pending' && 'bg-amber-100 text-amber-800',
                        d.status === 'approved' && 'bg-green-100 text-green-800',
                        d.status === 'rejected' && 'bg-red-100 text-red-800',
                      ]"
                      >{{ d.status }}</span
                    >
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap w-64">
                    <div
                      v-if="d.status === 'rejected' && d.rejectionNote"
                      class="text-[11px] text-red-600 mb-1"
                    >
                      {{ d.rejectionNote }}
                    </div>
                    <input
                      v-model="diplomaNoteMap[d.diploma_id]"
                      placeholder="Raison (si rejet)"
                      class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-xs px-2 py-1"
                    />
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap space-x-2">
                    <button
                      v-if="d.status === 'pending'"
                      @click="approveDiploma(d)"
                      class="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      v-if="d.status === 'pending'"
                      @click="rejectDiploma(d)"
                      class="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
                <tr v-if="!filteredDiplomaSubs.length">
                  <td colspan="6" class="px-4 py-6 text-center text-xs text-gray-500">
                    No diploma submissions match filters
                  </td>
                </tr>
              </tbody>
            </table>
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
                </tr>
              </thead>
              <tbody
                class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
              >
                <tr
                  v-for="c in filteredCoaches"
                  :key="c.id"
                  @click="openCoach(c.id)"
                  class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
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
                    Email
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
                <tr v-for="r in reviews" :key="r.id" class="text-sm align-top">
                  <td class="px-4 py-2 whitespace-nowrap">{{ formatDate(r.created_at) }}</td>
                  <td class="px-4 py-2 whitespace-nowrap">{{ getCoachName(r.coach_id) }}</td>
                  <td class="px-4 py-2 whitespace-nowrap">{{ r.client_name }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                    {{ r.client_email }}
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap font-medium">{{ r.rating }}★</td>
                  <td class="px-4 py-2 max-w-xs">
                    <div class="whitespace-pre-wrap break-words text-xs">
                      {{ r.comment || '—' }}
                    </div>
                    <div
                      v-if="r.coach_response"
                      class="mt-2 p-2 rounded border bg-gray-50 dark:bg-gray-700/30"
                      :class="r.coach_response_hidden ? 'opacity-40 line-through' : ''"
                    >
                      <div
                        class="text-[10px] uppercase font-semibold mb-1 text-gray-500 flex items-center gap-2"
                      >
                        Coach response
                        <span
                          v-if="r.coach_response_hidden"
                          class="px-1 rounded bg-yellow-200 text-yellow-800 text-[10px]"
                          >Hidden</span
                        >
                      </div>
                      <div class="text-xs whitespace-pre-wrap break-words">
                        {{ r.coach_response }}
                      </div>
                    </div>
                  </td>
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
                    <button
                      v-if="r.coach_response"
                      @click="toggleHideResponse(r)"
                      class="text-xs px-2 py-1 rounded bg-yellow-600 text-white hover:bg-yellow-700"
                    >
                      {{ r.coach_response_hidden ? 'Unhide response' : 'Hide response' }}
                    </button>
                    <button
                      @click="deleteReview(r)"
                      class="text-xs px-2 py-1 rounded bg-gray-600 text-white hover:bg-gray-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                <tr v-if="!reviews.length">
                  <td colspan="8" class="px-4 py-6 text-center text-xs text-gray-500">
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
    @click.self="showCoachModal = false"
  >
    <div class="w-full max-w-2xl rounded-lg bg-white dark:bg-gray-800 shadow">
      <div class="flex items-center justify-between border-b px-4 py-3">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">Coach Details</h3>
        <button class="text-gray-500 hover:text-gray-700" @click="showCoachModal = false">✕</button>
      </div>
      <div
        class="p-4 space-y-6 max-h-[80vh] overflow-y-auto relative"
        v-if="!detailsLoading"
        ref="coachModalScrollRef"
        @scroll="onCoachModalScroll"
      >
        <!-- Sticky section navigation -->
        <div
          class="sticky top-0 z-10 -mx-4 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-b flex flex-wrap gap-2 text-[11px]"
        >
          <button
            v-for="s in coachSectionNav"
            :key="s.id"
            @click="scrollToSection(s.id)"
            class="px-2 py-1 rounded border text-xs font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
            :class="
              activeCoachSection === s.id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
            "
          >
            {{ s.label }}
          </button>
        </div>

        <!-- Overview -->
        <section
          data-section="overview"
          class="space-y-3"
          @mouseenter="activeCoachSection = 'overview'"
        >
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Overview</h4>
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
        </section>

        <!-- Subscription -->
        <section
          data-section="subscription"
          class="border-t pt-4 space-y-3"
          @mouseenter="activeCoachSection = 'subscription'"
        >
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Subscription</h4>
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
          <div v-if="coachDetails.subscription?.subscription_type === 'premium'" class="space-y-2">
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
        </section>

        <!-- Coach Data -->
        <section
          data-section="coach-data"
          class="border-t pt-4"
          v-if="coachDetails.coach"
          @mouseenter="activeCoachSection = 'coach-data'"
        >
          <h4 class="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Coach Data</h4>
          <div class="grid grid-cols-2 gap-3 text-[11px]">
            <template v-for="(val, key) in coachDetails.coach" :key="String(key)">
              <div class="text-gray-500 dark:text-gray-400 break-words">{{ key }}</div>
              <div class="font-medium text-gray-900 dark:text-gray-100 break-words">
                <template v-if="typeof val === 'object'">{{ JSON.stringify(val) }}</template>
                <template v-else>{{ String(val) }}</template>
              </div>
            </template>
          </div>
          <details class="mt-2 text-xs">
            <summary class="cursor-pointer select-none text-indigo-600 dark:text-indigo-400">
              Raw JSON
            </summary>
            <pre
              class="mt-2 max-h-60 overflow-auto text-[10px] leading-snug bg-gray-100 dark:bg-gray-900/40 p-2 rounded"
              >{{ JSON.stringify(coachDetails.coach, null, 2) }}</pre
            >
          </details>
        </section>

        <!-- Coach Services -->
        <section
          data-section="services"
          class="border-t pt-4"
          @mouseenter="activeCoachSection = 'services'"
        >
          <h4 class="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Coach Services
          </h4>
          <div v-if="coachServicesError" class="text-xs text-red-600">{{ coachServicesError }}</div>
          <div v-else>
            <div v-if="!coachServices.length" class="text-xs text-gray-500">No services found.</div>
            <div v-else class="overflow-x-auto max-h-64">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-[11px]">
                <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th class="px-2 py-1 text-left font-medium">Title</th>
                    <th class="px-2 py-1 text-left font-medium">Category</th>
                    <th class="px-2 py-1 text-left font-medium">Solo Price</th>
                    <th class="px-2 py-1 text-left font-medium">Group Price</th>
                    <th class="px-2 py-1 text-left font-medium">Duration</th>
                    <th class="px-2 py-1 text-left font-medium">Flags</th>
                    <th class="px-2 py-1 text-left font-medium">Active</th>
                    <th class="px-2 py-1 text-left font-medium">Created</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="svc in coachServices" :key="(svc as any).id">
                    <td class="px-2 py-1 font-medium">{{ (svc as any).title }}</td>
                    <td class="px-2 py-1">{{ (svc as any).category || '—' }}</td>
                    <td class="px-2 py-1">{{ (svc as any).solo_price ?? '—' }}</td>
                    <td class="px-2 py-1">{{ (svc as any).group_price ?? '—' }}</td>
                    <td class="px-2 py-1">{{ (svc as any).duration ?? '—' }}</td>
                    <td class="px-2 py-1 text-[10px]">
                      <span v-if="(svc as any).can_be_online" class="mr-1">Online</span>
                      <span v-if="(svc as any).can_be_at_home" class="mr-1">Home</span>
                      <span v-if="(svc as any).can_be_in_public_spaces" class="mr-1">Public</span>
                      <span v-if="(svc as any).has_free_trial" class="mr-1">Trial</span>
                    </td>
                    <td class="px-2 py-1">
                      <span
                        :class="
                          (svc as any).is_active
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        "
                        >{{ (svc as any).is_active ? 'Yes' : 'No' }}</span
                      >
                    </td>
                    <td class="px-2 py-1">{{ formatDate((svc as any).created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <details class="mt-2 text-xs" v-if="coachServices.length">
              <summary class="cursor-pointer select-none text-indigo-600 dark:text-indigo-400">
                Raw Services JSON
              </summary>
              <pre
                class="mt-2 max-h-60 overflow-auto text-[10px] leading-snug bg-gray-100 dark:bg-gray-900/40 p-2 rounded"
                >{{ JSON.stringify(coachServices, null, 2) }}</pre
              >
            </details>
          </div>
        </section>

        <!-- Coach Leads -->
        <section
          data-section="leads"
          class="border-t pt-4"
          @mouseenter="activeCoachSection = 'leads'"
        >
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
                        >{{ lead.status }}</span
                      >
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
                        >{{ lead.is_hidden ? 'Yes' : 'No' }}</span
                      >
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
        </section>

        <!-- Activation -->
        <section
          data-section="activation"
          class="border-t pt-4"
          @mouseenter="activeCoachSection = 'activation'"
        >
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
        </section>
      </div>
      <div v-else class="p-6 text-sm text-gray-500">Loading…</div>
    </div>
  </div>
  <!-- Lead details modal -->
  <div
    v-if="showLeadModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    @click.self="showLeadModal = false"
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
      <div class="p-4 space-y-6 text-sm max-h-[80vh] overflow-y-auto" v-if="leadDetails.lead">
        <!-- Top Meta Grid -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-gray-500 dark:text-gray-400">Client</div>
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ leadDetails.lead.client_name as string }}
            </div>
          </div>
          <div>
            <div class="text-gray-500 dark:text-gray-400">Email</div>
            <div class="font-medium text-gray-900 dark:text-gray-100 break-all">
              {{ leadDetails.lead.client_email as string }}
            </div>
          </div>
          <div>
            <div class="text-gray-500 dark:text-gray-400">Status</div>
            <div class="font-medium capitalize text-gray-900 dark:text-gray-100">
              {{ leadDetails.lead.status as string }}
            </div>
          </div>
          <div>
            <div class="text-gray-500 dark:text-gray-400">Created</div>
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ formatDate(leadDetails.lead.created_at as string) }}
            </div>
          </div>
          <div v-if="leadDetails.lead.updated_at">
            <div class="text-gray-500 dark:text-gray-400">Updated</div>
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ formatDate(leadDetails.lead.updated_at as string) }}
            </div>
          </div>
          <div v-if="leadDetails.lead.coach_id">
            <div class="text-gray-500 dark:text-gray-400">Coach</div>
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{
                getCoachName(leadDetails.lead.coach_id as string) ||
                (leadDetails.lead.coach_id as string)
              }}
            </div>
          </div>
          <div v-if="leadDetails.lead.original_lead_id">
            <div class="text-gray-500 dark:text-gray-400">Original Lead ID</div>
            <div class="font-mono text-[11px] break-all">
              {{ leadDetails.lead.original_lead_id as string }}
            </div>
          </div>
          <div v-if="leadDetails.lead.original_coach_id">
            <div class="text-gray-500 dark:text-gray-400">Original Coach ID</div>
            <div class="font-mono text-[11px] break-all">
              {{ leadDetails.lead.original_coach_id as string }}
            </div>
          </div>
          <div v-if="leadDetails.lead.is_hidden !== undefined">
            <div class="text-gray-500 dark:text-gray-400">Hidden</div>
            <div
              :class="
                (leadDetails.lead.is_hidden as boolean)
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              "
            >
              {{ (leadDetails.lead.is_hidden as boolean) ? 'Yes' : 'No' }}
            </div>
          </div>
          <div v-if="leadDetails.lead.do_not_contact !== undefined">
            <div class="text-gray-500 dark:text-gray-400">Do Not Contact</div>
            <div
              :class="
                (leadDetails.lead.do_not_contact as boolean)
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              "
            >
              {{ (leadDetails.lead.do_not_contact as boolean) ? 'Yes' : 'No' }}
            </div>
          </div>
        </div>

        <!-- Goals / Message -->
        <div
          v-if="leadDetails.lead.goals || leadDetails.lead.additional_info"
          class="border-t pt-4 space-y-4"
        >
          <div v-if="leadDetails.lead.goals">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Goals</h4>
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line text-xs leading-relaxed">
              {{ leadDetails.lead.goals as string }}
            </p>
          </div>
          <div v-if="leadDetails.lead.additional_info">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Client Message
            </h4>
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line text-xs leading-relaxed">
              {{ leadDetails.lead.additional_info as string }}
            </p>
          </div>
        </div>

        <!-- Parsed Availability / Timeframe -->
        <div
          v-if="leadDetails.lead.start_timeframe || leadDetails.lead.availability_days"
          class="border-t pt-4 grid grid-cols-2 gap-4"
        >
          <div v-if="leadDetails.lead.start_timeframe">
            <div class="text-gray-500 dark:text-gray-400">Start Timeframe</div>
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ leadDetails.lead.start_timeframe as string }}
            </div>
          </div>
          <div v-if="leadDetails.lead.availability_days">
            <div class="text-gray-500 dark:text-gray-400">Availability Days</div>
            <div class="font-medium text-gray-900 dark:text-gray-100 text-xs">
              {{
                Array.isArray(leadDetails.lead.availability_days)
                  ? (leadDetails.lead.availability_days as string[]).join(', ')
                  : (leadDetails.lead.availability_days as string)
              }}
            </div>
          </div>
        </div>

        <!-- Location -->
        <div v-if="leadDetails.lead.location" class="border-t pt-4">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Location</h4>
          <div class="text-xs text-gray-700 dark:text-gray-300">
            <template v-if="parsedLeadLocation">
              <div class="font-medium">
                {{ parsedLeadLocation.city
                }}<span v-if="parsedLeadLocation.region">, {{ parsedLeadLocation.region }}</span
                ><span v-if="parsedLeadLocation.country"> ({{ parsedLeadLocation.country }})</span>
              </div>
              <div
                v-if="parsedLeadLocation.raw"
                class="text-[10px] mt-1 text-gray-500 dark:text-gray-400 break-all"
              >
                Raw: {{ parsedLeadLocation.raw }}
              </div>
            </template>
            <template v-else>
              <div class="break-all">{{ leadDetails.lead.location as string }}</div>
            </template>
          </div>
        </div>

        <!-- Chosen Services -->
        <div v-if="leadDetails.lead.chosen_services" class="border-t pt-4">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Chosen Services
          </h4>
          <div class="space-y-2">
            <template v-for="(svc, idx) in parsedChosenServices" :key="idx">
              <div
                class="rounded border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-700/30"
              >
                <div
                  class="flex justify-between text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  <span>{{ svc.title || 'Service' }}</span>
                  <span
                    v-if="svc.modality"
                    class="text-[10px] px-1 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-600/30 dark:text-indigo-300"
                    >{{ svc.modality }}</span
                  >
                </div>
                <div
                  v-if="svc.frequency || svc.duration"
                  class="mt-1 text-[11px] text-gray-500 flex flex-wrap gap-x-2"
                >
                  <span v-if="svc.frequency">Freq: {{ svc.frequency }}</span>
                  <span v-if="svc.duration">Durée: {{ svc.duration }}m</span>
                </div>
                <div v-if="svc.days && svc.days.length" class="mt-1 text-[11px] text-gray-500">
                  Jours: {{ svc.days.join(', ') }}
                </div>
                <div
                  v-if="svc.locations && svc.locations.length"
                  class="mt-1 text-[11px] text-gray-500"
                >
                  Lieux: {{ svc.locations.join(', ') }}
                </div>
                <div v-if="svc.notes" class="mt-1 text-[11px] text-gray-500 whitespace-pre-line">
                  {{ svc.notes }}
                </div>
              </div>
            </template>
            <div v-if="!parsedChosenServices.length" class="text-xs text-gray-500 italic">
              No parsable services data.
            </div>
          </div>
        </div>

        <!-- Raw Data (debug) -->
        <details class="border-t pt-4 group">
          <summary
            class="cursor-pointer text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1 select-none"
          >
            <span class="group-open:rotate-90 inline-block transition-transform">▶</span>
            Raw Lead Object
          </summary>
          <pre
            class="mt-2 max-h-60 overflow-auto text-[10px] leading-snug bg-gray-100 dark:bg-gray-900/40 p-2 rounded"
            >{{ prettyLead }}</pre
          >
        </details>

        <!-- Duplication Section -->
        <div class="border-t pt-4">
          <h4 class="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Duplicate Lead To Other Coaches
          </h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Select one or more coaches to create a new copy of this lead assigned to them.
            Duplicated leads start with status "new". Original remains unchanged.
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
const activeTab = ref<'overview' | 'coaches' | 'leads' | 'deletion' | 'reviews' | 'certifications'>(
  'overview',
)
const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'coaches', label: 'Coaches' },
  { key: 'leads', label: 'Leads' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'deletion', label: 'Deletion Logs' },
  { key: 'certifications', label: 'Certifications' },
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

// --- Lead detail parsing helpers ---
interface ParsedService {
  title: string
  modality: string
  frequency: string
  duration: string | number
  days: string[]
  locations: string[]
  notes: string
}

const parsedLeadLocation = computed(() => {
  const raw = (leadDetails.value.lead?.location as string | undefined) || ''
  if (!raw) return null
  try {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (obj && typeof obj === 'object') {
      return {
        city: obj.city || obj.town || obj.ville || '',
        region: obj.region || obj.state || obj.departement || '',
        country: obj.country || obj.pays || '',
        raw: raw.length > 160 ? raw.slice(0, 160) + '…' : raw,
      }
    }
  } catch {
    return { city: '', region: '', country: '', raw }
  }
  return null
})

const parsedChosenServices = computed<ParsedService[]>(() => {
  const raw = leadDetails.value.lead?.chosen_services as unknown
  if (!raw) return []
  let data: unknown
  try {
    if (typeof raw === 'string') data = JSON.parse(raw)
    else data = raw
  } catch {
    return []
  }
  if (!Array.isArray(data)) return []
  // Normalize basic fields
  return (data as Record<string, unknown>[]).map((s) => {
    const anyS = s as Record<string, unknown>
    const getStr = (...keys: string[]): string => {
      for (const k of keys) {
        const v = anyS[k]
        if (typeof v === 'string' && v.trim()) return v
      }
      return ''
    }
    const daysRaw = anyS['days']
    const locRaw = anyS['locations']
    const toList = (val: unknown): string[] => {
      if (Array.isArray(val)) return val.filter((x) => typeof x === 'string') as string[]
      if (typeof val === 'string')
        return val
          .split(/[;,]/)
          .map((d) => d.trim())
          .filter(Boolean)
      return []
    }
    const duration = ((): string | number => {
      for (const k of ['duration', 'length', 'minutes']) {
        const v = anyS[k]
        if (typeof v === 'number') return v
        if (typeof v === 'string' && v.trim()) return v
      }
      return ''
    })()
    return {
      title: getStr('title', 'name', 'service'),
      modality: getStr('modality', 'mode', 'type'),
      frequency: getStr('frequency', 'freq'),
      duration,
      days: toList(daysRaw),
      locations: toList(locRaw),
      notes: getStr('notes', 'comment', 'description'),
    }
  })
})

const prettyLead = computed(() => {
  return JSON.stringify(leadDetails.value.lead, null, 2)
})

const deletionLogs = ref<DeletionLogRow[]>([])
const deletionLogsError = ref<string | null>(null)

const reviewStatusFilter = ref<'pending' | 'approved' | 'rejected' | ''>('')
const reviewCoachFilter = ref('')
const reviews = ref<AdminReview[]>([])
const reviewsLoading = ref(false)
const reviewsError = ref<string | null>(null)
const reviewNote = ref('')

// Certifications (diploma submissions)
interface DiplomaSubmissionRow {
  coach_id: string
  coach_name: string
  coach_email: string
  diploma_id: string
  title: string
  status: 'pending' | 'approved' | 'rejected'
  proofFileUrl?: string
  proofFileName?: string
  rejectionNote?: string
}
const diplomaSubs = ref<DiplomaSubmissionRow[]>([])
const diplomasLoading = ref(false)
const diplomasError = ref<string | null>(null)
const diplomaNoteMap = ref<Record<string, string>>({})
const diplomaStatusFilter = ref<'pending' | 'approved' | 'rejected' | ''>('')
const diplomaCoachFilter = ref('')
const filteredDiplomaSubs = computed(() => {
  return diplomaSubs.value.filter((d) => {
    const statusOk = !diplomaStatusFilter.value || d.status === diplomaStatusFilter.value
    const coachOk = !diplomaCoachFilter.value || d.coach_id === diplomaCoachFilter.value
    return statusOk && coachOk
  })
})
async function loadDiplomas() {
  diplomasLoading.value = true
  diplomasError.value = null
  const res = await AdminApi.listDiplomaSubmissions()
  if (res.error) diplomasError.value = res.error
  diplomaSubs.value = res.data as DiplomaSubmissionRow[]
  diplomasLoading.value = false
}
async function approveDiploma(sub: DiplomaSubmissionRow) {
  const { ok, error } = await AdminApi.setDiplomaStatus(sub.coach_id, sub.diploma_id, 'approved')
  if (!ok) alert(error || 'Failed to approve diploma')
  await loadDiplomas()
}
async function rejectDiploma(sub: DiplomaSubmissionRow) {
  const note = diplomaNoteMap.value[sub.diploma_id]?.trim()
  const { ok, error } = await AdminApi.setDiplomaStatus(
    sub.coach_id,
    sub.diploma_id,
    'rejected',
    note,
  )
  if (!ok) alert(error || 'Failed to reject diploma')
  diplomaNoteMap.value[sub.diploma_id] = ''
  await loadDiplomas()
}

// Details modal state
const showCoachModal = ref(false)
const activeCoachId = ref<string | null>(null)
const coachDetails = ref<{
  coach: Record<string, unknown> | null
  subscription: CoachSubscriptionSummary | null
  payments: PaymentRow[]
}>({ coach: null, subscription: null, payments: [] })
// Coach services (admin)
const coachServices = ref<unknown[]>([])
const coachServicesError = ref<string | null>(null)
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

// Coach modal section navigation
const coachSectionNav = [
  { id: 'overview', label: 'Overview' },
  { id: 'subscription', label: 'Subscription' },
  { id: 'coach-data', label: 'Coach Data' },
  { id: 'services', label: 'Services' },
  { id: 'leads', label: 'Leads' },
  { id: 'activation', label: 'Activation' },
]
const activeCoachSection = ref<string>('overview')
const coachModalScrollRef = ref<HTMLElement | null>(null)
function scrollToSection(id: string) {
  const root = coachModalScrollRef.value
  if (!root) return
  const el = root.querySelector(`[data-section="${id}"]`) as HTMLElement | null
  if (!el) return
  const top = el.offsetTop - 8 // small offset for sticky header
  root.scrollTo({ top, behavior: 'smooth' })
}
function onCoachModalScroll() {
  const root = coachModalScrollRef.value
  if (!root) return
  const sections = Array.from(root.querySelectorAll('[data-section]')) as HTMLElement[]
  const scrollPos = root.scrollTop + 60 // account for sticky nav height
  let current = 'overview'
  for (const s of sections) {
    if (s.offsetTop <= scrollPos) current = s.dataset.section || current
  }
  activeCoachSection.value = current
}

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
  // Load services
  coachServicesError.value = null
  coachServices.value = []
  const svc = await AdminApi.getCoachServices(coachId)
  if (svc.error) coachServicesError.value = svc.error
  else coachServices.value = svc.data
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

async function toggleHideResponse(r: AdminReview) {
  if (!confirm(`Confirm to ${r.coach_response_hidden ? 'unhide' : 'hide'} coach response?`)) return
  const { ok, error } = await AdminApi.hideCoachResponse(r.id, !r.coach_response_hidden)
  if (!ok) {
    alert(error || 'Failed')
    return
  }
  await loadReviews()
}

async function deleteReview(r: AdminReview) {
  if (!confirm('Delete this review permanently? This cannot be undone.')) return
  const { ok, error } = await AdminApi.deleteReview(r.id)
  if (!ok) {
    alert(error || 'Failed')
    return
  }
  await loadReviews()
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
  if (t === 'certifications') loadDiplomas()
})
</script>

<style scoped></style>

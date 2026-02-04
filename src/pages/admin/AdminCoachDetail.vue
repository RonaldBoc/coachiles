<template>
  <AdminLayout>
    <template #breadcrumbs>
      <Breadcrumbs
        :items="[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Coaches', href: '/admin/coaches' },
          { label: coachName, href: `/admin/coaches/${route.params.id}` },
        ]"
      />
    </template>

    <div class="space-y-6">
      <!-- Loading State -->
      <div
        v-if="adminStore.loading || (!coach && adminStore.coaches.length === 0)"
        class="flex justify-center"
      >
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Coach Not Found -->
      <div v-else-if="!coach && adminStore.coaches.length > 0" class="text-center py-12">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Coach not found</h3>
        <p class="text-gray-500 dark:text-gray-400">The coach you're looking for doesn't exist.</p>
        <router-link
          to="/admin/coaches"
          class="inline-flex items-center mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          ← Back to Coaches
        </router-link>
      </div>

      <!-- Coach Details -->
      <div v-else-if="coach" class="space-y-6">
        <!-- Header with coach info and actions -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <!-- Avatar -->
                <div
                  class="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center"
                >
                  <span class="text-xl font-medium text-gray-700 dark:text-gray-200">
                    {{ getInitials(coach) }}
                  </span>
                </div>

                <!-- Basic Info -->
                <div>
                  <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ getFullName(coach) }}
                  </h1>
                  <p class="text-gray-500 dark:text-gray-400">{{ coach.email }}</p>
                  <div class="flex items-center space-x-3 mt-2">
                    <Badge
                      :label="coach.is_active ? 'Active' : 'Disabled'"
                      :color="coach.is_active ? 'green' : 'red'"
                    />
                    <Badge
                      :label="coach.subscription_type || 'free'"
                      :color="coach.subscription_type === 'premium' ? 'indigo' : 'gray'"
                    />
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center space-x-3">
                <button
                  @click="viewPublicProfile"
                  class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  View Profile
                </button>

                <button
                  @click="toggleCoachStatus"
                  class="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white"
                  :class="
                    coach.is_active
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  "
                >
                  {{ coach.is_active ? 'Disable' : 'Enable' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Leads"
            :value="loadingLeads ? 'Loading...' : coachStats.totalLeads.toString()"
            icon="📧"
            color="blue"
            @click="showLeadsModal = true"
            :clickable="true"
          />
          <StatsCard
            title="Converted Leads"
            :value="loadingLeads ? 'Loading...' : coachStats.convertedLeads.toString()"
            :subtitle="loadingLeads ? '' : `${coachStats.conversionRate}% rate`"
            icon="✅"
            color="green"
          />
          <StatsCard
            title="Last Activity"
            :value="loadingLeads ? 'Loading...' : coachStats.lastActivity"
            icon="⏰"
            color="blue"
            @click="showLoginModal = true"
            :clickable="true"
          />
        </div>

        <!-- Information Sections -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Personal Information -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Personal Information
              </h3>
            </div>
            <div class="px-6 py-4 space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                <dd class="text-sm text-gray-900 dark:text-white">{{ getFullName(coach) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                <dd class="text-sm text-gray-900 dark:text-white">{{ coach.email }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Registration Date
                </dt>
                <dd class="text-sm text-gray-900 dark:text-white">
                  {{ formatDate(coach.created_at) }}
                </dd>
              </div>
              <div v-if="coach.disabled_reason">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Disabled Reason
                </dt>
                <dd class="text-sm text-red-600">{{ coach.disabled_reason }}</dd>
              </div>
            </div>
          </div>

          <!-- Subscription Information -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Subscription</h3>
            </div>
            <div class="px-6 py-4 space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Current Plan</dt>
                <dd class="text-sm text-gray-900 dark:text-white capitalize">
                  {{ coach.subscription_type || 'Free' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Max Leads</dt>
                <dd class="text-sm text-gray-900 dark:text-white">{{ coachStats.maxLeads }}</dd>
              </div>
              <!-- TODO: Add more subscription details when available -->
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Recent Coach Actions</h3>
          </div>
          <div class="px-6 py-4">
            <div
              v-if="sortedActionsByDate.length === 0"
              class="text-sm text-gray-500 dark:text-gray-400"
            >
              No recent actions found for this coach.
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="action in sortedActionsByDate.slice(0, 5)"
                :key="action.id"
                class="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <div
                      class="w-2 h-2 rounded-full"
                      :class="{
                        'bg-blue-500': action.action_type === 'lead_update',
                        'bg-green-500': action.action_type === 'profile_update',
                        'bg-purple-500': action.action_type === 'availability_update',
                        'bg-gray-500': ![
                          'lead_update',
                          'profile_update',
                          'availability_update',
                        ].includes(action.action_type),
                      }"
                    ></div>
                    <span class="font-medium text-gray-900 dark:text-white">{{
                      action.description
                    }}</span>
                  </div>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatActivityDate(action.timestamp) }}
                </div>
              </div>
              <div v-if="sortedActionsByDate.length > 5" class="text-center">
                <button
                  class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  View all {{ sortedActionsByDate.length }} actions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Modal for status changes -->
    <ConfirmModal
      :open="!!confirmAction"
      :title="confirmAction?.title || ''"
      :message="confirmAction?.message || ''"
      :confirm-label="confirmAction?.confirmLabel"
      :confirm-color="(confirmAction?.confirmColor as 'red' | 'green') || 'blue'"
      @confirm="executeConfirmAction"
      @cancel="confirmAction = null"
    />

    <!-- Activity Modal -->
    <div
      v-if="showActivityModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="activity-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
      >
        <!-- Background overlay -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showActivityModal = false"
        ></div>

        <!-- Center modal -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"
          >&#8203;</span
        >

        <div
          class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Login History - {{ getFullName(coach!) }}
              </h3>
              <button
                @click="showActivityModal = false"
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
          <div class="px-6 py-4 max-h-96 overflow-y-auto">
            <div v-if="sortedConnectionsByDate.length === 0" class="text-center py-8">
              <div v-if="sessionsLoading" class="flex justify-center">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
              <p v-else class="text-gray-500 dark:text-gray-400">
                No session history found for this coach.
              </p>
            </div>
            <div v-else class="space-y-4">
              <h4 class="font-medium text-gray-900 dark:text-white">Recent Sessions</h4>
              <div class="space-y-3">
                <div
                  v-for="connection in sortedConnectionsByDate"
                  :key="connection.id"
                  class="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div class="flex-1">
                    <div class="flex items-center space-x-2">
                      <div
                        :class="[
                          'w-2 h-2 rounded-full',
                          connection.status === 'active'
                            ? 'bg-green-500'
                            : connection.status === 'ended'
                              ? 'bg-blue-500'
                              : 'bg-gray-500',
                        ]"
                      ></div>
                      <span class="font-medium text-gray-900 dark:text-white capitalize">
                        {{ connection.status }}
                      </span>
                      <span
                        v-if="connection.is_suspicious"
                        class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full"
                      >
                        Suspicious
                      </span>
                    </div>
                    <div class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      <div>
                        IP:
                        <code class="bg-gray-200 dark:bg-gray-600 px-1 rounded text-xs">{{
                          connection.ip_address || 'Unknown'
                        }}</code>
                        <span v-if="connection.duration_minutes" class="ml-2">
                          Duration: {{ Math.round(connection.duration_minutes) }}min
                        </span>
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {{ (connection.user_agent || 'Unknown User Agent').substring(0, 60) }}...
                      </div>
                      <div
                        v-if="connection.session_end"
                        class="text-xs text-gray-500 dark:text-gray-400 mt-1"
                      >
                        Ended: {{ formatActivityDate(connection.session_end) }}
                        <span v-if="connection.logout_reason" class="ml-1"
                          >({{ connection.logout_reason }})</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ formatActivityDate(connection.session_start) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-right">
            <button
              @click="showActivityModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Leads Modal -->
    <div
      v-if="showLeadsModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="leads-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
      >
        <!-- Background overlay -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showLeadsModal = false"
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
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                All Leads for {{ getFullName(coach!) }}
              </h3>
              <button
                @click="showLeadsModal = false"
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
          <div class="px-6 py-4 max-h-96 overflow-y-auto">
            <div v-if="loadingLeads" class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
            <div v-else-if="coachLeads.length === 0" class="text-center py-8">
              <p class="text-gray-500 dark:text-gray-400">No leads found for this coach.</p>
            </div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase"
                    >
                      Client
                    </th>
                    <th
                      class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase"
                    >
                      Status
                    </th>
                    <th
                      class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase"
                    >
                      Date
                    </th>
                    <th
                      class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase"
                    >
                      Hidden
                    </th>
                  </tr>
                </thead>
                <tbody
                  class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                >
                  <tr
                    v-for="lead in sortedLeadsByDate"
                    :key="lead.id"
                    class="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td class="px-3 py-4">
                      <div>
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ lead.client_name }}
                        </div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                          {{ lead.client_email }}
                        </div>
                      </div>
                    </td>
                    <td class="px-3 py-4">
                      <div
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                        :class="{
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
                            lead.status === 'converted',
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
                            lead.status === 'pending',
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200':
                            lead.status === 'rejected',
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200': ![
                            'converted',
                            'pending',
                            'rejected',
                          ].includes(lead.status),
                        }"
                      >
                        {{ lead.status }}
                      </div>
                    </td>
                    <td class="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {{ formatActivityDate(lead.created_at) }}
                    </td>
                    <td class="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {{ lead.is_hidden ? 'Yes' : 'No' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-3 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
            <span class="text-sm text-gray-700 dark:text-gray-300">
              Total: {{ coachLeads.length }} leads
            </span>
            <button
              @click="showLeadsModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Login History Modal -->
    <div
      v-if="showLoginModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="login-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
      >
        <!-- Background overlay -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showLoginModal = false"
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
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Login History for {{ getFullName(coach!) }}
              </h3>
              <button
                @click="showLoginModal = false"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="px-6 py-4">
            <div v-if="!coachAuthInfo" class="text-center py-8 text-gray-500">
              Loading login information...
            </div>
            <div
              v-else-if="
                !coachAuthInfo.last_sign_in_at && coachConnections.length === 0 && !sessionsLoading
              "
              class="text-center py-8 text-gray-500"
            >
              No session history found for this coach.
            </div>
            <div v-else class="space-y-3">
              <!-- Real last sign-in from Supabase Auth -->
              <div
                v-if="coachAuthInfo.last_sign_in_at"
                class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-green-900 dark:text-green-100">
                      Latest Authentication Record
                    </div>
                    <div class="text-sm text-green-700 dark:text-green-300">
                      {{ formatDate(coachAuthInfo.last_sign_in_at) }}
                    </div>
                    <div class="text-xs text-green-600 dark:text-green-400">
                      {{ formatRelativeTime(coachAuthInfo.last_sign_in_at) }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-green-600 dark:text-green-400">
                      ✅ Verified from Supabase Auth
                    </div>
                    <div class="text-xs text-green-500 dark:text-green-500">
                      User ID: {{ coachAuthInfo.user_id?.slice(0, 8) }}...
                    </div>
                  </div>
                </div>
              </div>

              <!-- Loading state -->
              <div v-if="sessionsLoading" class="text-center py-8">
                <div class="flex justify-center">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
                <p class="mt-2 text-gray-500 dark:text-gray-400">Loading session history...</p>
              </div>

              <!-- Real session history -->
              <div v-else-if="coachConnections.length > 0" class="space-y-3">
                <div class="text-sm text-gray-600 dark:text-gray-400 border-t pt-3">
                  Detailed Session History ({{ coachConnections.length }} sessions):
                </div>
                <div
                  v-for="connection in coachConnections.slice(0, 20)"
                  :key="connection.id"
                  class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-1">
                        <div
                          :class="[
                            'w-2 h-2 rounded-full',
                            connection.status === 'active'
                              ? 'bg-green-500'
                              : connection.status === 'ended'
                                ? 'bg-blue-500'
                                : 'bg-gray-500',
                          ]"
                        ></div>
                        <span class="font-medium text-gray-900 dark:text-white capitalize">
                          {{ connection.status }} Session
                        </span>
                        <span
                          v-if="connection.is_suspicious"
                          class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full"
                        >
                          Suspicious
                        </span>
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        Started: {{ formatDate(connection.session_start) }}
                      </div>
                      <div
                        v-if="connection.session_end"
                        class="text-sm text-gray-500 dark:text-gray-400"
                      >
                        Ended: {{ formatDate(connection.session_end) }}
                        <span v-if="connection.duration_minutes" class="ml-1">
                          ({{ Math.round(connection.duration_minutes) }} minutes)
                        </span>
                      </div>
                      <div
                        v-if="connection.logout_reason"
                        class="text-xs text-gray-500 dark:text-gray-400"
                      >
                        Logout reason: {{ connection.logout_reason }}
                      </div>
                    </div>
                    <div class="text-right ml-4">
                      <div class="text-sm font-mono text-gray-600 dark:text-gray-300">
                        {{ connection.ip_address || 'Unknown IP' }}
                      </div>
                      <!-- Location info from IP -->
                      <div
                        v-if="
                          connection.location_info &&
                          (connection.location_info.city || connection.location_info.country)
                        "
                        class="text-xs text-gray-500 dark:text-gray-400 mt-1"
                      >
                        📍
                        {{
                          [
                            connection.location_info.city,
                            connection.location_info.region,
                            connection.location_info.country,
                          ]
                            .filter(Boolean)
                            .join(', ')
                        }}
                      </div>
                    </div>
                  </div>
                  <div v-if="connection.user_agent" class="mt-2 text-xs text-gray-400 truncate">
                    {{ connection.user_agent }}
                  </div>
                  <!-- Enhanced device and location display -->
                  <div class="mt-2 space-y-1">
                    <div
                      v-if="
                        connection.device_info && Object.keys(connection.device_info).length > 0
                      "
                      class="text-xs text-gray-500"
                    >
                      <span class="font-medium">Device:</span>
                      {{ connection.device_info.platform }} | {{ connection.device_info.screen }} |
                      {{ connection.device_info.language }}
                      <span v-if="connection.device_info.timezone" class="ml-2">
                        ({{ connection.device_info.timezone }})
                      </span>
                    </div>
                    <div
                      v-if="connection.location_info && connection.location_info.latitude"
                      class="text-xs text-gray-500"
                    >
                      <span class="font-medium">Location:</span>
                      <span class="text-gray-400">
                        🌐 {{ connection.location_info.latitude.toFixed(4) }},
                        {{ connection.location_info.longitude.toFixed(4) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Show only first 20, indicate if there are more -->
                <div
                  v-if="coachConnections.length > 20"
                  class="text-center py-2 text-sm text-gray-500"
                >
                  Showing 20 of {{ coachConnections.length }} sessions
                </div>
              </div>

              <div
                v-if="
                  !coachAuthInfo.last_sign_in_at &&
                  coachConnections.length === 0 &&
                  !sessionsLoading
                "
                class="text-xs text-gray-400 text-center mt-4"
              >
                No session data available for this coach.
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-3 bg-gray-50 dark:bg-gray-800 flex justify-end">
            <button
              @click="showLoginModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AdminLayout from '@/components/admin/Layout/AdminLayout.vue'
import Breadcrumbs from '@/components/admin/Layout/Breadcrumbs.vue'
import StatsCard from '@/components/admin/Common/StatsCard.vue'
import Badge from '@/components/admin/Common/Badge.vue'
import ConfirmModal from '@/components/admin/Common/ConfirmModal.vue'
import type { AdminCoach, AdminLead } from '@/services/supabaseAdminApi'

const route = useRoute()
const adminStore = useAdminStore()

const coachLeads = ref<AdminLead[]>([])
const loadingLeads = ref(false)
const showActivityModal = ref(false)
const showLeadsModal = ref(false)
const showLoginModal = ref(false)

// Real coach authentication info
const coachAuthInfo = ref<{
  last_sign_in_at: string | null
  user_id: string | null
} | null>(null)

// Real coach sessions data (replacing mock)
const coachConnections = ref<
  {
    id: string
    session_start: string
    session_end: string | null
    duration_minutes: number | null
    ip_address: string
    user_agent: string
    device_info: any
    location_info: any
    status: string
    logout_reason: string | null
    is_suspicious: boolean
  }[]
>([])

const coachActions = ref<
  {
    id: string
    action_type: string
    description: string
    timestamp: string
    details?: any
  }[]
>([])

// Loading states
const sessionsLoading = ref(false)

// Load coach authentication info
const loadCoachAuthInfo = async () => {
  if (!coach.value) return

  try {
    const authInfo = await adminStore.getCoachAuthInfo(coach.value.id)
    coachAuthInfo.value = authInfo
    console.log('Loaded coach auth info:', authInfo)
  } catch (err) {
    console.warn('Auth info not available yet:', err)
    coachAuthInfo.value = { last_sign_in_at: null, user_id: null }
  }
}

// Load coach session history
const loadCoachSessions = async () => {
  if (!coach.value) return

  sessionsLoading.value = true

  try {
    const result = await adminStore.getCoachSessions(coach.value.id, 100) // Get last 100 sessions

    if (result.success) {
      coachConnections.value = result.data.map((session: any) => ({
        id: session.id,
        session_start: session.session_start,
        session_end: session.session_end,
        duration_minutes: session.duration_minutes,
        ip_address: session.ip_address,
        user_agent: session.user_agent,
        device_info: session.device_info,
        location_info: session.location_info,
        status: session.status,
        logout_reason: session.logout_reason,
        is_suspicious: session.is_suspicious,
      }))
      console.log('Loaded coach sessions:', result.data.length, 'sessions')
    } else {
      console.error('Failed to load coach sessions:', result.error)
      coachConnections.value = []
    }
  } catch (err) {
    console.error('Exception loading coach sessions:', err)
    coachConnections.value = []
  } finally {
    sessionsLoading.value = false
  }
}

const confirmAction = ref<{
  title: string
  message: string
  confirmLabel: string
  confirmColor: string
  action: () => Promise<void>
} | null>(null)

// Computed
const coach = computed(() => {
  const id = route.params.id as string
  if (!adminStore.coaches.length) {
    return null // Still loading
  }
  return adminStore.coaches.find((c) => c.id === id) || null
})

const coachName = computed(() => {
  if (!coach.value) return 'Unknown Coach'
  return getFullName(coach.value)
})

// Computed stats based on real data
const coachStats = computed(() => {
  const totalLeads = coachLeads.value.length
  const convertedLeads = coachLeads.value.filter((lead) => lead.status === 'converted').length
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0

  // Use real last sign-in time from Supabase auth
  const lastActivity = coachAuthInfo.value?.last_sign_in_at
    ? formatRelativeTime(coachAuthInfo.value.last_sign_in_at)
    : 'Never'

  return {
    totalLeads,
    convertedLeads,
    conversionRate,
    lastActivity,
    maxLeads: coach.value?.subscription_type === 'premium' ? 100 : 20,
  }
})

// Sorted leads for activity modal
const sortedLeadsByDate = computed(() => {
  return [...coachLeads.value].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
})

// Sorted connections for login activity (using real session data)
const sortedConnectionsByDate = computed(() => {
  return [...coachConnections.value].sort(
    (a, b) => new Date(b.session_start).getTime() - new Date(a.session_start).getTime(),
  )
})

// Sorted actions for recent activity
const sortedActionsByDate = computed(() => {
  return [...coachActions.value].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
})

// Methods
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

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatActivityDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays < 7) {
    return `${diffDays} days ago at ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return (
      date.toLocaleDateString('fr-FR') +
      ' at ' +
      date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    )
  }
}

const formatLastActivity = (date: Date) => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1)
    return (
      'Yesterday at ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    )
  return `${diffDays} days ago`
}

// Format relative time for any date string
const formatRelativeTime = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A'
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) {
    return `Il y a ${diffMins} min`
  } else if (diffHours < 24) {
    return `Il y a ${diffHours}h`
  } else {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  }
}

const viewPublicProfile = () => {
  if (!coach.value) return
  // TODO: Update URL structure when coach profile pages are implemented
  window.open(`/coach/${coach.value.id}`, '_blank')
}

const toggleCoachStatus = () => {
  if (!coach.value) return

  const newStatus = !coach.value.is_active
  const action = newStatus ? 'enable' : 'disable'

  confirmAction.value = {
    title: `${action === 'enable' ? 'Enable' : 'Disable'} Coach`,
    message: `Are you sure you want to ${action} ${getFullName(coach.value)}?`,
    confirmLabel: action === 'enable' ? 'Enable' : 'Disable',
    confirmColor: action === 'enable' ? 'green' : 'red',
    action: async () => {
      if (!coach.value) return
      const reason = action === 'disable' ? 'Admin action from coach detail page' : undefined
      const result = await adminStore.setCoachActive(coach.value.id, newStatus, reason)
      if (!result.success && result.error) {
        alert(`Failed to ${action} coach: ${result.error}`)
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

const loadCoachLeads = async () => {
  if (!coach.value) return

  console.log('Loading leads for coach:', coach.value.id, coach.value.email)
  loadingLeads.value = true
  try {
    const leads = await adminStore.loadLeadsForCoach(coach.value.id)
    console.log('Loaded leads:', leads)
    coachLeads.value = leads
  } catch (err) {
    console.error('Failed to load coach leads:', err)
  } finally {
    loadingLeads.value = false
  }
}

// Format coach status
const getStatusText = (status: string) => {
  const statusMap: { [key: string]: { text: string; class: string } } = {
    active: { text: 'Actif', class: 'text-green-600 bg-green-100' },
    inactive: { text: 'Inactif', class: 'text-red-600 bg-red-100' },
    pending: { text: 'En attente', class: 'text-yellow-600 bg-yellow-100' },
  }
  return statusMap[status] || { text: status, class: 'text-gray-600 bg-gray-100' }
}

// Format lead status
const formatLeadStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    new: 'Nouveau',
    contacted: 'Contacté',
    converted: 'Converti',
    lost: 'Perdu',
  }
  return statusMap[status] || status
}

// Format lead status color
const getLeadStatusColor = (status: string) => {
  const colorMap: { [key: string]: string } = {
    new: 'text-blue-600 bg-blue-100',
    contacted: 'text-yellow-600 bg-yellow-100',
    converted: 'text-green-600 bg-green-100',
    lost: 'text-red-600 bg-red-100',
  }
  return colorMap[status] || 'text-gray-600 bg-gray-100'
}

// Format action type
const formatActionType = (type: string) => {
  const typeMap: { [key: string]: string } = {
    lead_update: 'Mise à jour lead',
    profile_update: 'Mise à jour profil',
    availability_update: 'Mise à jour disponibilités',
    service_update: 'Mise à jour service',
  }
  return typeMap[type] || type
}

// Get action icon
const getActionIcon = (type: string) => {
  const iconMap: { [key: string]: string } = {
    lead_update: '👤',
    profile_update: '✏️',
    availability_update: '📅',
    service_update: '⚙️',
  }
  return iconMap[type] || '📝'
}

// Handle card clicks
const handleCardClick = (cardType: string) => {
  switch (cardType) {
    case 'leads':
      showLeadsModal.value = true
      break
    default:
      console.log('Card clicked:', cardType)
  }
}

// Handle last activity click
const handleLastActivityClick = () => {
  showLoginModal.value = true
}

// Load initial data
onMounted(async () => {
  // Ensure coaches are loaded first
  if (!adminStore.coaches.length) {
    await adminStore.loadCoaches()
  }

  // Then load coach-specific data
  if (coach.value) {
    await Promise.all([
      loadCoachLeads(),
      loadCoachAuthInfo(), // Load real auth info
      loadCoachSessions(), // Load real session data
    ])
  }
})

// Watch for coach changes and reload leads
watch(
  () => coach.value?.id,
  async (newId) => {
    if (newId) {
      await Promise.all([
        loadCoachLeads(),
        loadCoachAuthInfo(), // Load real auth info
        loadCoachSessions(), // Load real session data
      ])
    }
  },
  { immediate: true },
)
</script>

<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <!-- Logo and Navigation -->
        <div class="flex items-center space-x-8">
          <!-- Logo -->
          <router-link to="/" class="flex items-center">
            <h1
              class="text-2xl font-black text-transparent bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text"
            >
              Coachiles
            </h1>
          </router-link>

          <!-- Navigation Links -->
          <nav class="hidden md:flex space-x-6">
            <router-link
              to="/coach/profile"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                $route.path === '/coach/profile'
                  ? 'bg-orange-100 text-orange-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              ]"
            >
              Mon Profil
            </router-link>
            <router-link
              to="/coach/proposals"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors relative',
                $route.path === '/coach/proposals'
                  ? 'bg-orange-100 text-orange-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              ]"
            >
              Propositions
              <!-- Badge for new proposals -->
              <span
                v-if="newProposalsCount > 0"
                class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
              >
                {{ newProposalsCount }}
              </span>
            </router-link>
            <router-link
              to="/coach/services"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                $route.path === '/coach/services'
                  ? 'bg-orange-100 text-orange-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              ]"
            >
              Mes Services
            </router-link>
            <!-- <router-link
              to="/coach/bookings"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                $route.path === '/coach/bookings'
                  ? 'bg-orange-100 text-orange-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              ]"
            >
              Réservations
            </router-link> -->
            <router-link
              to="/coach/account"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                $route.path === '/coach/account'
                  ? 'bg-orange-100 text-orange-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              ]"
            >
              Paramètres
            </router-link>
          </nav>
        </div>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <!-- Notifications -->
          <div class="relative" ref="notificationsContainer" @keyup.esc="showNotifications = false">
            <button
              type="button"
              @click="toggleNotifications"
              class="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <BellIcon class="h-6 w-6" />
              <!-- Notification dot -->
              <span
                v-if="hasNotifications"
                class="absolute top-0 right-0 block h-2 w-2 bg-red-500 rounded-full"
              ></span>
            </button>
            <!-- Notifications dropdown -->
            <div
              v-if="showNotifications"
              class="absolute right-0 mt-2 w-80 z-20 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
            >
              <div class="px-4 py-2 border-b flex items-center justify-between">
                <h3 class="text-sm font-medium text-gray-700">Notifications</h3>
                <button
                  v-if="notifications.length"
                  @click="markAllRead"
                  class="text-xs text-gray-500 hover:text-gray-700"
                >
                  Marquer tout lu
                </button>
              </div>
              <ul class="max-h-96 divide-y divide-gray-100">
                <li
                  v-if="!recentNotifications.length"
                  class="p-4 text-sm text-gray-500 text-center"
                >
                  Aucune notification
                </li>
                <li
                  v-for="n in recentNotifications"
                  :key="n.id"
                  @click="goToNotification(n)"
                  class="p-3 cursor-pointer hover:bg-gray-50 flex items-start gap-3"
                >
                  <span
                    class="mt-1 h-2 w-2 rounded-full"
                    :class="n.read ? 'bg-gray-300' : 'bg-red-500'"
                  ></span>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-700" v-html="n.message" />
                    <p class="mt-1 text-[10px] text-gray-400">{{ timeAgo(n.createdAt) }}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- Profile Dropdown -->
          <Menu as="div" class="relative">
            <MenuButton
              class="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <img
                :src="coach?.photo || '/default-avatar.svg'"
                :alt="coach?.firstName"
                class="h-8 w-8 rounded-full object-cover bg-gray-200"
              />
              <span class="hidden md:block text-sm font-medium text-gray-700">
                {{ coach?.firstName }}
              </span>
              <ChevronDownIcon class="h-4 w-4 text-gray-400" />
            </MenuButton>

            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <MenuItems
                class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <MenuItem v-slot="{ active }">
                  <router-link
                    to="/coach/profile"
                    :class="[
                      active ? 'bg-gray-100' : '',
                      'flex items-center px-4 py-2 text-sm text-gray-700',
                    ]"
                  >
                    <UserIcon class="mr-3 h-4 w-4" />
                    Mon Profil
                  </router-link>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <router-link
                    to="/coach/account"
                    :class="[
                      active ? 'bg-gray-100' : '',
                      'flex items-center px-4 py-2 text-sm text-gray-700',
                    ]"
                  >
                    <CogIcon class="mr-3 h-4 w-4" />
                    Paramètres
                  </router-link>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <a
                    href="/"
                    :class="[
                      active ? 'bg-gray-100' : '',
                      'flex items-center px-4 py-2 text-sm text-gray-700',
                    ]"
                  >
                    <HomeIcon class="mr-3 h-4 w-4" />
                    Voir le site
                  </a>
                </MenuItem>
                <hr class="my-1" />
                <MenuItem v-slot="{ active }">
                  <button
                    @click="handleSignOut"
                    :class="[
                      active ? 'bg-gray-100' : '',
                      'flex w-full items-center px-4 py-2 text-sm text-gray-700',
                    ]"
                  >
                    <ArrowRightOnRectangleIcon class="mr-3 h-4 w-4" />
                    Se déconnecter
                  </button>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>

          <!-- Mobile menu button -->
          <button
            type="button"
            @click="showMobileMenu = !showMobileMenu"
            class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <Bars3Icon v-if="!showMobileMenu" class="h-6 w-6" />
            <XMarkIcon v-else class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div v-if="showMobileMenu" class="md:hidden border-t border-gray-200 py-4">
        <nav class="space-y-2">
          <router-link
            to="/coach/profile"
            @click="showMobileMenu = false"
            :class="[
              'block px-3 py-2 rounded-md text-base font-medium',
              $route.path === '/coach/profile'
                ? 'bg-orange-100 text-orange-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
            ]"
          >
            Mon Profil
          </router-link>
          <router-link
            to="/coach/proposals"
            @click="showMobileMenu = false"
            :class="[
              'block px-3 py-2 rounded-md text-base font-medium',
              $route.path === '/coach/proposals'
                ? 'bg-orange-100 text-orange-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
            ]"
          >
            Propositions
            <span
              v-if="newProposalsCount > 0"
              class="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
            >
              {{ newProposalsCount }}
            </span>
          </router-link>
          <router-link
            to="/coach/services"
            @click="showMobileMenu = false"
            :class="[
              'block px-3 py-2 rounded-md text-base font-medium',
              $route.path === '/coach/services'
                ? 'bg-orange-100 text-orange-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
            ]"
          >
            Mes Services
          </router-link>
          <router-link
            to="/coach/bookings"
            @click="showMobileMenu = false"
            :class="[
              'block px-3 py-2 rounded-md text-base font-medium',
              $route.path === '/coach/bookings'
                ? 'bg-orange-100 text-orange-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
            ]"
          >
            Réservations
          </router-link>
          <router-link
            to="/coach/account"
            @click="showMobileMenu = false"
            :class="[
              'block px-3 py-2 rounded-md text-base font-medium',
              $route.path === '/coach/account'
                ? 'bg-orange-100 text-orange-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
            ]"
          >
            Paramètres
          </router-link>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  CogIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useLeadStore } from '@/stores/leads'

// Router
const router = useRouter()

// Auth Store
const authStore = useAuthStore()
const leadStore = useLeadStore()

// Component State
const showMobileMenu = ref(false)

// Computed
const coach = computed(() => authStore.coach)
const newProposalsCount = computed(() => leadStore.newLeadsCount)
// Notifications logic
interface NotificationItem {
  id: string
  type: 'lead:new'
  leadId?: string
  message: string
  createdAt: Date
  read: boolean
}

const notifications = ref<NotificationItem[]>([])
const showNotifications = ref(false)
const previousLeadIds = ref<Set<string>>(new Set())
const notificationsContainer = ref<HTMLElement | null>(null)

// Persistence keys
const LS_NOTIFS_KEY = 'coach_notifications_v1'
const LS_KNOWN_LEADS_KEY = 'coach_known_leads_v1'

const saveNotifications = () => {
  try {
    const raw = notifications.value.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))
    localStorage.setItem(LS_NOTIFS_KEY, JSON.stringify(raw))
  } catch (e) {
    console.warn('Failed to persist notifications', e)
  }
}

const saveKnownLeadIds = () => {
  try {
    localStorage.setItem(LS_KNOWN_LEADS_KEY, JSON.stringify(Array.from(previousLeadIds.value)))
  } catch (e) {
    console.warn('Failed to persist known lead IDs', e)
  }
}

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(LS_NOTIFS_KEY)
    if (stored) {
      const parsed: Array<{
        id: string
        type: 'lead:new'
        leadId?: string
        message: string
        createdAt: string
        read: boolean
      }> = JSON.parse(stored)
      notifications.value = parsed.map((n) => ({ ...n, createdAt: new Date(n.createdAt) }))
    }
    const storedIds = localStorage.getItem(LS_KNOWN_LEADS_KEY)
    if (storedIds) {
      previousLeadIds.value = new Set<string>(JSON.parse(storedIds))
    }
  } catch (e) {
    console.warn('Failed to load notifications from storage', e)
  }
}

const addNotification = (n: Omit<NotificationItem, 'id' | 'read'> & { createdAt?: Date }) => {
  const item: NotificationItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: n.createdAt || new Date(),
    read: false,
    type: n.type,
    leadId: n.leadId,
    message: n.message,
  }
  notifications.value.push(item)
  // Keep only last 50 (after sort later)
  if (notifications.value.length > 50)
    notifications.value.splice(0, notifications.value.length - 50)
  saveNotifications()
}

const markAllRead = () => {
  notifications.value.forEach((n) => (n.read = true))
  saveNotifications()
}

const recentNotifications = computed(() =>
  [...notifications.value]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5),
)
const hasNotifications = computed(() => notifications.value.some((n) => !n.read))

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (!showNotifications.value) markAllRead()
}

const timeAgo = (date: Date) => {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'Il y a quelques sec.'
  const mins = Math.floor(diff / 60)
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours} h`
  const days = Math.floor(hours / 24)
  return `Il y a ${days} j`
}

const goToNotification = (n: NotificationItem) => {
  n.read = true
  showNotifications.value = false
  if (n.type === 'lead:new' && n.leadId) {
    router.push({ path: '/coach/proposals', query: { leadId: n.leadId } })
  }
}

// Outside click handler
const handleClickOutside = (e: MouseEvent) => {
  if (!showNotifications.value) return
  const el = notificationsContainer.value
  if (el && !el.contains(e.target as Node)) {
    showNotifications.value = false
    markAllRead()
  }
}

onMounted(() => {
  loadFromStorage()
  // If we have leads already and no known IDs persisted, seed them (without generating unread spam)
  if (previousLeadIds.value.size === 0 && leadStore.leads.length) {
    leadStore.leads.forEach((l) => previousLeadIds.value.add(l.id))
    saveKnownLeadIds()
    if (notifications.value.length === 0) {
      const snapshot = [...leadStore.leads]
        .filter((l) => l.status === 'new')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
      snapshot.forEach((l) =>
        notifications.value.push({
          id: `init-${l.id}`,
          type: 'lead:new',
          leadId: l.id,
          message: `Nouveau lead: <strong>${l.client_name || 'Client'}</strong>`,
          createdAt: new Date(l.created_at || Date.now()),
          read: true,
        }),
      )
      saveNotifications()
    }
  }
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Ensure leads are loaded for the badge when coach is available
watch(
  () => authStore.coach?.id,
  async (coachId) => {
    if (!coachId) return
    try {
      if (leadStore.leads.length === 0) {
        await leadStore.fetchLeads(coachId)
      }
    } catch (e) {
      console.warn('Failed to fetch leads for header badge', e)
    }
  },
  { immediate: true },
)

// Watch for new leads to create notifications
watch(
  () => leadStore.leads,
  (leads) => {
    const currentIds = new Set<string>()
    leads.forEach((l) => {
      currentIds.add(l.id)
      if (!previousLeadIds.value.has(l.id) && l.status === 'new') {
        addNotification({
          type: 'lead:new',
          leadId: l.id,
          message: `Nouveau lead: <strong>${l.client_name || 'Client'}</strong>`,
          createdAt: new Date(l.created_at || Date.now()),
        })
      }
    })
    previousLeadIds.value = currentIds
    saveKnownLeadIds()
  },
  { deep: true },
)

// Methods
const handleSignOut = async () => {
  try {
    await authStore.signOut()
    router.push('/')
  } catch (error) {
    console.error('Sign out error:', error)
  }
}
</script>

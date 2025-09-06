<template>
  <CoachLayout>
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Greeting & Profile Completion -->
      <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">
            Bonjour, <span>{{ coach?.firstName }}</span>
          </h1>
          <p class="mt-2 text-sm text-gray-600">Vue d'ensemble de votre activité sur Coachiles.</p>
          <div v-if="completionReady && profileCompletion < 100" class="mt-4 max-w-md">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium text-gray-700">
                Profil complété à {{ profileCompletion }}%
              </span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                class="h-full bg-gradient-to-r from-orange-500 to-blue-600 transition-all"
                :style="{ width: profileCompletion + '%' }"
              />
            </div>
            <div v-if="missingSections.length" class="mt-2 flex flex-wrap gap-1">
              <span
                v-for="s in missingSections"
                :key="s"
                @click="goToMissing(s)"
                class="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-[11px] font-medium text-blue-700 cursor-pointer hover:bg-blue-100 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 relative group"
                role="button"
                tabindex="0"
                @keydown.enter.prevent="goToMissing(s)"
                @keydown.space.prevent="goToMissing(s)"
                :aria-describedby="`${s}-tooltip`"
              >
                {{ mapSectionLabel(s) }}
                <!-- Tooltip for each pill -->
                <span
                  :id="`${s}-tooltip`"
                  class="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 z-20 px-2 py-1 rounded bg-gray-900 text-white text-[10px] font-normal whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition"
                >
                  {{ missingSectionHint(s) }}
                </span>
              </span>
            </div>
          </div>
        </div>
        <!-- Quick Actions -->
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <button @click="goToProposals" class="quick-action-btn"><span>Propositions</span></button>
          <button @click="goToServices" class="quick-action-btn"><span>Services</span></button>
          <button @click="goToSubscription" class="quick-action-btn">
            <span>Abonnement</span>
          </button>
          <button @click="goToSettings" class="quick-action-btn hidden sm:block">
            <span>Paramètres</span>
          </button>
          <button
            @click="openPublicProfile"
            :disabled="!coach?.id"
            class="quick-action-btn"
            :class="!coach?.id ? 'opacity-50 cursor-not-allowed' : ''"
            aria-label="Ouvrir le profil public dans un nouvel onglet"
          >
            <span>👁️ Profil public</span>
          </button>
        </div>
      </div>

      <!-- Alerts -->
      <div class="space-y-4 mb-6">
        <div
          v-if="coach && coach.isActive === false"
          class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          Votre compte coach est désactivé. Certaines fonctionnalités peuvent être limitées.
        </div>
        <div
          v-if="subscriptionBanner"
          class="rounded-md border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700 flex items-start gap-3"
        >
          <div class="flex-1" v-html="subscriptionBanner.message" />
          <button
            @click="goToSubscription"
            class="rounded bg-orange-600 px-3 py-1 text-xs font-medium text-white hover:bg-orange-700"
          >
            {{ subscriptionBanner.cta }}
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <KpiCard
          label="Nouveaux leads"
          :value="newLeadsCount"
          icon="leads"
          :loading="loadingLeads"
          :onClick="goToProposals"
        />
        <KpiCard
          label="Services actifs"
          :value="activeServicesCount"
          icon="services"
          :loading="loadingServices"
          :onClick="goToServices"
        />
        <KpiCard
          v-if="subscriptionStatusDisplay"
          :label="subscriptionStatusDisplay.label"
          :value="subscriptionStatusDisplay.value"
          :badge="subscriptionStatusDisplay.badge"
          icon="subscription"
          :onClick="goToSubscription"
        />
        <KpiCard
          label="Note moyenne"
          :value="coach?.rating ? coach.rating.toFixed(1) + '★' : '—'"
          icon="rating"
          :onClick="scrollToReviews"
        />
      </div>

      <!-- Activity Panels -->
      <div class="grid gap-8 lg:grid-cols-2 mb-12">
        <DashPanel title="Leads récents" :loading="loadingLeads">
          <template #default>
            <ul v-if="recentLeads.length" class="divide-y divide-gray-100">
              <li v-for="l in recentLeads" :key="l.id" class="py-3 flex items-start gap-3">
                <div
                  class="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600"
                >
                  {{ (l.client_name || 'C').charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-medium text-gray-800 truncate">
                      {{ l.client_name || 'Client' }}
                    </p>
                    <span
                      :class="statusPillClass(l.status)"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                      >{{ leadStatusLabel(l.status) }}</span
                    >
                  </div>
                  <p class="text-xs text-gray-500 mt-0.5 line-clamp-2" v-if="l.goals">
                    {{ l.goals }}
                  </p>
                  <p class="mt-1 text-[10px] text-gray-400">{{ timeAgo(l.created_at) }}</p>
                </div>
              </li>
            </ul>
            <div v-else class="text-sm text-gray-500">Aucun lead pour le moment.</div>
            <div class="mt-4 text-right">
              <button
                @click="goToProposals"
                class="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Voir tous →
              </button>
            </div>
          </template>
        </DashPanel>
        <DashPanel title="Tendance des leads (7j)">
          <template #default>
            <div v-if="leadTrend.length" class="h-24 flex items-end gap-1">
              <div
                v-for="d in leadTrend"
                :key="d.date"
                class="flex-1 bg-gradient-to-t from-blue-200 to-blue-500 rounded-sm relative"
                :style="{ height: (d.count / maxLeadTrend) * 100 + '%' }"
              >
                <span class="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-600">{{
                  d.count
                }}</span>
                <span
                  class="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-gray-400"
                  >{{ formatShortDate(d.date) }}</span
                >
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">Pas assez de données.</div>
          </template>
        </DashPanel>
        <!-- Reviews Panel (spans full width under two-column grid) -->
        <div id="reviews-section" class="lg:col-span-2">
          <DashPanel title="Avis reçus" :loading="reviewsLoading">
            <template #default>
              <div class="space-y-4">
                <div
                  v-if="!reviewsLoading && !myReviews.length"
                  class="text-sm text-gray-500 dark:text-gray-900"
                >
                  Aucun avis pour le moment.
                </div>
                <div v-for="r in myReviews" :key="r.id" class="border rounded p-3 bg-gray-50/50">
                  <div class="flex flex-wrap gap-2 justify-between items-start">
                    <div class="text-sm font-medium dark:text-gray-900">
                      {{ r.clientName }} • {{ r.rating }}★
                      <span
                        class="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:text-gray-900"
                        >{{ r.moderationStatus }}</span
                      >
                      <span
                        v-if="!r.isPublished"
                        class="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 dark:text-gray-900"
                        >En attente</span
                      >
                    </div>
                    <div class="text-[10px] text-gray-400">
                      {{ new Date(r.createdAt).toLocaleDateString() }}
                    </div>
                  </div>
                  <div class="dark:text-gray-900 mt-1 text-sm whitespace-pre-wrap">
                    {{ r.comment || '—' }}
                  </div>
                  <div
                    v-if="r.coachResponse"
                    class="mt-2 text-xs p-2 bg-blue-50 rounded border border-blue-100 dark:text-gray-900"
                  >
                    <div class="font-semibold mb-1">Votre réponse</div>
                    <div class="whitespace-pre-wrap">{{ r.coachResponse }}</div>
                  </div>
                  <div v-else class="mt-2">
                    <textarea
                      v-model="reviewReply[r.id]"
                      rows="2"
                      placeholder="Répondre (une seule réponse possible)"
                      class="w-full text-xs rounded border-gray-300"
                    ></textarea>
                    <div class="mt-1 flex justify-end">
                      <button
                        @click="submitResponse(r)"
                        class="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        :disabled="!(reviewReply[r.id] || '').trim()"
                      >
                        Envoyer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </DashPanel>
        </div>
      </div>

      <!-- Resources -->
      <div class="grid gap-6 md:grid-cols-3">
        <div class="rounded-lg border border-gray-200 bg-white p-5">
          <h3 class="text-sm font-semibold text-gray-800 mb-2">Prochaines étapes</h3>
          <ul class="text-xs text-gray-600 space-y-1">
            <li v-for="s in missingSections" :key="s">• Compléter : {{ mapSectionLabel(s) }}</li>
            <li v-if="missingSections.length === 0">Tout est prêt 🚀</li>
          </ul>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-5">
          <h3 class="text-sm font-semibold text-gray-800 mb-2">Support</h3>
          <p class="text-xs text-gray-600 mb-3">Besoin d'aide ou d'améliorer votre visibilité ?</p>
          <div class="flex flex-wrap gap-2 text-xs">
            <button
              @click="goToFAQ"
              class="dark:text-gray-900 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            >
              FAQ
            </button>
            <button
              @click="goToContact"
              class="dark:text-gray-900 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            >
              Contact
            </button>
          </div>
        </div>
        <!-- <div class="rounded-lg border border-gray-200 bg-white p-5">
          <h3 class="text-sm font-semibold text-gray-800 mb-2">Avis</h3>
          <p class="text-xs text-gray-600 mb-3">
            Note moyenne: <strong>{{ coach?.rating ? coach.rating.toFixed(1) : '—' }}</strong>
          </p>
          <button
            @click="goToSettingsReviews"
            class="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Gérer mes avis →
          </button>
        </div> -->
      </div>
    </div>
  </CoachLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, defineComponent, h, watch } from 'vue'
import type { PropType } from 'vue'
import CoachLayout from '@/layouts/CoachLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useLeadStore } from '@/stores/leads'
import { supabaseLeadApi } from '@/services/supabaseLeadApi'
import { SupabaseCoachServicesApi } from '@/services/supabaseCoachServicesApi'
import { useRouter } from 'vue-router'
import { supabaseReviewApi } from '@/services/supabaseReviewApi'
import { supabase } from '@/utils/supabase'

interface DashboardService {
  id: string
  title?: string
  is_active?: boolean
}
interface LeadRowMinimal {
  id: string
  created_at: string
  status?: string
  client_name?: string
  goals?: string
}
// Minimal shape for coach completion checks
interface CoachCompletionShape {
  photo?: string | null
  phone?: string | null
  website?: string | null
  instagram?: string | null
  facebook?: string | null
  bio?: string | null
  specialties?: string[] | null
  // legacy 'diplomas' not used; certifications represent diplomas
  hourlyRate?: number | null
  hourly_rate?: number | null
  modalities?: { availabilityDays?: string[] } | null
  certifications?: string[] | null
  subscriptionStatus?: string | null
  availability?: string | null
}

const authStore = useAuthStore()
const leadStore = useLeadStore()
const router = useRouter()
const servicesApi = new SupabaseCoachServicesApi()

const services = ref<DashboardService[]>([])
const loadingServices = ref(false)
const loadingLeads = ref(false)
const leadTrendRaw = ref<LeadRowMinimal[]>([])
const completionReady = ref(false)

const coach = computed(() => authStore.coach)
const activeServicesCount = computed(() => services.value.length)
const newLeadsCount = computed(() => leadStore.newLeadsCount)
// Recent leads (up to 6) using SAME unlocking logic as CoachProposals.vue
const recentLeads = computed(() => {
  const cid = coach.value?.id
  if (!cid) return []

  // 1. Filter to this coach only
  const coachLeads = leadStore.leads.filter((l) => l.coach_id === cid)

  // 2. Base visibility filter (same as proposals page)
  const visibleLeads = coachLeads.filter(
    (l) =>
      !l.is_hidden &&
      !l.do_not_contact &&
      (l.is_completed || (typeof l.current_step === 'number' && l.current_step >= 3)),
  )

  // Detect server-side locking support
  const serverLockingActive = visibleLeads.some((l) => l.is_locked !== undefined)

  if (serverLockingActive) {
    // Only show fully unlocked leads (is_locked === false). Locked ones are excluded entirely.
    return visibleLeads
      .filter((l) => l.is_locked === false)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6)
  }

  // 3. Subscription gating (treat active/trial as unlimited, rest as free quota)
  const status = coach.value?.subscriptionStatus
  const unlimited = status === 'active' || status === 'trial'
  if (unlimited) {
    return visibleLeads
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6)
  }

  // 4. Free unlocking algorithm (2 distinct email buckets, oldest-first selection) fallback when no server locking
  const maxDistinct = 2
  const emailBuckets = new Set<string>()
  const unlockedIds = new Set<string>()
  const chronological = visibleLeads
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  for (const lead of chronological) {
    const emailRaw = (lead.client_email || '').trim().toLowerCase()
    const bucket = emailRaw || '__no_email__'
    if (emailBuckets.has(bucket)) {
      unlockedIds.add(lead.id)
      continue
    }
    if (emailBuckets.size < maxDistinct) {
      emailBuckets.add(bucket)
      unlockedIds.add(lead.id)
    }
  }
  return visibleLeads
    .filter((l) => unlockedIds.has(l.id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)
})

const subscriptionBanner = computed(() => {
  const status = coach.value?.subscriptionStatus
  if (!status || status === 'active') return null
  if (status === 'inactive')
    return {
      message:
        'Votre abonnement est <strong>inactif</strong>. Activez-le pour débloquer toute la visibilité.',
      cta: 'Activer',
    }
  if (status === 'trial')
    return {
      message:
        "Vous êtes en <strong>période d'essai</strong>. Profitez-en pour finaliser votre profil.",
      cta: 'Gérer',
    }
  return null
})
const subscriptionStatusDisplay = computed(() => {
  const status = coach.value?.subscriptionStatus
  if (!status) return null
  return {
    active: { label: 'Abonnement', value: 'Actif', badge: '✔' },
    trial: { label: 'Abonnement', value: 'Essai', badge: '⏳' },
    inactive: { label: 'Abonnement', value: 'Inactif', badge: '!' },
  }[status]
})

// Determine which profile sections are incomplete; used for progress/UI pills
const missingSections = computed(() => {
  const c = coach.value as unknown as CoachCompletionShape | null
  if (!c) return []
  const missing: string[] = []

  // Photo
  if (!c.photo) missing.push('photo')

  // Contact: treat phone existence as sufficient (other fields not yet persisted in auth store)
  const hasPhone = typeof c.phone === 'string' && c.phone.trim().length > 0
  if (!hasPhone) missing.push('contact')

  // Bio
  if (!c.bio || !String(c.bio).trim()) missing.push('bio')

  // Activity: require specialties AND at least one certification (treated as diplomas)
  const specialtiesOk = Array.isArray(c.specialties) && c.specialties.length > 0
  const certificationsOk = Array.isArray(c.certifications) && c.certifications.length > 0
  if (!(specialtiesOk && certificationsOk)) missing.push('activity')

  // Modalities: hourlyRate set (>0) AND at least one availability day
  const hourly = Number(c.hourlyRate || c.hourly_rate || 0)
  let availabilityDays: string[] = []
  if (Array.isArray(c.modalities?.availabilityDays)) {
    availabilityDays = [...(c.modalities?.availabilityDays as string[])].filter(Boolean)
  } else if (typeof c.availability === 'string' && c.availability.trim()) {
    availabilityDays = c.availability
      .split(',')
      .map((d: string) => d.trim())
      .filter(Boolean)
  }
  const modalitiesOk = hourly > 0 && availabilityDays.length > 0
  if (!modalitiesOk) missing.push('modalities')

  // Service (keep existing logic: at least one active service configured)
  if (services.value.length === 0) missing.push('service')

  return missing
})
const profileCompletion = computed(() => {
  const total = 6 // photo, contact, bio, activity, modalities, service
  return Math.round(((total - missingSections.value.length) / total) * 100)
})

const leadTrend = computed(() => {
  const days: Record<string, number> = {}
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000)
    days[d.toISOString().slice(0, 10)] = 0
  }
  leadTrendRaw.value.forEach((l) => {
    const key = (l.created_at || '').slice(0, 10)
    if (key in days) days[key]++
  })
  return Object.entries(days).map(([date, count]) => ({ date, count }))
})
const maxLeadTrend = computed(() => Math.max(1, ...leadTrend.value.map((d) => d.count)))

let completionDelayTimer: number | null = null

const fetchServices = async () => {
  if (loadingServices.value) return
  loadingServices.value = true
  try {
    const svc = await servicesApi.getCoachServices()
    services.value = (svc as unknown as DashboardService[]).map((s) => ({
      id: s.id,
      title: s.title,
      is_active: s.is_active,
    }))
  } catch (e) {
    console.warn('Failed to load services', e)
  } finally {
    loadingServices.value = false
    // Delay showing the completion bar by 5s if profile incomplete
    if (completionDelayTimer) {
      clearTimeout(completionDelayTimer)
    }
    if (profileCompletion.value < 100) {
      completionDelayTimer = window.setTimeout(() => {
        completionReady.value = true
      }, 3000)
    } else {
      // Even if complete we can mark ready immediately (bar won't render anyway)
      completionReady.value = true
    }
  }
}
const fetchLeadTrend = async () => {
  if (!coach.value?.id) return
  try {
    const raw = await supabaseLeadApi.getLeadStats(coach.value.id, '7d')
    leadTrendRaw.value = raw as LeadRowMinimal[]
  } catch (e) {
    console.warn('Failed to load lead stats', e)
  }
}
const ensureLeadsLoaded = async () => {
  if (!coach.value?.id || leadStore.leads.length) return
  loadingLeads.value = true
  try {
    // Fetch a slightly larger window so we can compute unlocking + show 6
    await leadStore.fetchLeads(coach.value.id, { page: 1, limit: 30 })
  } catch {
    /* silent */
  } finally {
    loadingLeads.value = false
  }
}

// Map missing section keys to their destination routes (with in-page anchors where possible)
const goToMissing = (key: string) => {
  const map: Record<string, string> = {
    photo: '/coach/profile#profile-photo-section',
    contact: '/coach/profile#contact-section',
    bio: '/coach/profile#bio-section',
    activity: '/coach/profile#activity-section',
    modalities: '/coach/profile#modalities-section',
    service: '/coach/services',
  }
  router.push(map[key] || '/coach/profile')
}
const goToProposals = () => router.push('/coach/proposals')
const goToServices = () => router.push('/coach/services')
const goToSubscription = () => router.push('/coach/abonnement')
const goToSettings = () => router.push('/coach/account')
const openPublicProfile = () => {
  const id = coach.value?.id
  if (!id) return
  // Open in new tab to allow viewing as client without losing dashboard context
  window.open(`/coach/${id}`, '_blank', 'noopener')
}
const goToFAQ = () => router.push('/faq')
const goToContact = () => router.push('/contact')
const scrollToReviews = () => {
  const el = document.getElementById('reviews-section')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Reviews
interface CoachReviewRow {
  id: string
  createdAt: Date
  rating: number
  comment?: string
  clientName: string
  coachResponse?: string
  coachRespondedAt?: Date
  moderationStatus: string
  isPublished: boolean
  coach_response_hidden?: boolean
}
const myReviews = ref<CoachReviewRow[]>([])
const reviewsLoading = ref(false)
const reviewReply = ref<Record<string, string>>({})

async function loadMyReviews() {
  try {
    reviewsLoading.value = true
    const { data: user } = await supabase.auth.getUser()
    let coachId = user.user?.id || null
    if (user.user?.email) {
      const { data: coachRow } = await supabase
        .from('coaches')
        .select('id')
        .eq('email', user.user.email)
        .maybeSingle()
      if (coachRow?.id) coachId = coachRow.id
    }
    if (!coachId) return
    const rows = await supabaseReviewApi.getCoachReviews(coachId, {
      includeUnpublished: true,
      limit: 100,
    })
    myReviews.value = rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      rating: r.rating,
      comment: r.comment,
      clientName: r.clientName,
      coachResponse: r.coachResponse,
      coachRespondedAt: r.coachRespondedAt,
      moderationStatus: r.moderationStatus,
      isPublished: r.isPublished,
    }))
  } finally {
    reviewsLoading.value = false
  }
}

async function submitResponse(review: CoachReviewRow) {
  const text = (reviewReply.value[review.id] || '').trim()
  if (!text) return
  try {
    const { error } = await supabase
      .from('reviews')
      .update({ coach_response: text, coach_responded_at: new Date().toISOString() })
      .eq('id', review.id)
      .is('coach_response', null)
    if (error) throw error
    await loadMyReviews()
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur en envoyant la réponse'
    alert(msg)
  }
}

const timeAgo = (iso: string) => {
  const date = new Date(iso)
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'Il y a quelques sec.'
  const mins = Math.floor(diff / 60)
  if (mins < 60) return `Il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Il y a ${hrs} h`
  const days = Math.floor(hrs / 24)
  return `Il y a ${days} j`
}
const statusPillClass = (s: string) =>
  ({
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    assigned: 'bg-purple-100 text-purple-700',
    converted: 'bg-green-100 text-green-700',
  })[s as string] || 'bg-gray-100 text-gray-600'
const leadStatusLabel = (s: string) =>
  ({
    new: 'Nouveau',
    contacted: 'Contacté',
    assigned: 'Assigné',
    converted: 'Converti',
  })[s as string] || s
const formatShortDate = (d: string) => d.slice(5).replace('-', '/')
const mapSectionLabel = (s: string) =>
  ({
    photo: 'Photo',
    contact: 'Contact',
    bio: 'Bio',
    activity: 'Activité',
    modalities: 'Modalités',
    service: 'Premier service',
  })[s] || s

// Tooltip hint per missing section
const missingSectionHint = (s: string): string =>
  (
    ({
      photo: 'Ajoutez une photo de profil.',
      contact: 'Ajoutez un numéro de téléphone.',
      bio: 'Rédigez une biographie.',
      activity: 'Ajoutez spécialités et au moins une certification.',
      modalities: 'Définissez tarif horaire + jours disponibles.',
      service: 'Créez votre premier service.',
    }) as Record<string, string>
  )[s] || 'Compléter cette section.'

const KpiCard = defineComponent({
  name: 'KpiCard',
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], required: false },
    icon: { type: String, required: false },
    badge: { type: String, required: false },
    loading: { type: Boolean, default: false },
    onClick: { type: Function as PropType<() => void>, required: false },
  },
  setup(props) {
    return () =>
      h(
        'div',
        {
          class:
            'relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-sm flex flex-col ' +
            (props.onClick ? 'cursor-pointer hover:bg-gray-50 transition' : ''),
          onClick: props.onClick,
        },
        [
          h('div', { class: 'text-xs font-medium text-gray-500 mb-1 flex items-center gap-2' }, [
            props.icon
              ? h('span', {
                  class:
                    'inline-block h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-blue-600',
                })
              : undefined,
            props.label,
            props.badge
              ? h(
                  'span',
                  {
                    class:
                      'ml-auto inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600',
                  },
                  props.badge,
                )
              : undefined,
          ]),
          h(
            'div',
            { class: 'mt-1 text-2xl font-semibold text-gray-900 min-h-[2.25rem]' },
            props.loading ? '…' : (props.value ?? '—'),
          ),
        ],
      )
  },
})
const DashPanel = defineComponent({
  name: 'DashPanel',
  props: { title: { type: String, required: true }, loading: { type: Boolean, default: false } },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        { class: 'rounded-lg border border-gray-200 bg-white p-5 shadow-sm flex flex-col' },
        [
          h('div', { class: 'mb-4 flex items-center justify-between' }, [
            h('h2', { class: 'text-sm font-semibold text-gray-800' }, props.title),
            props.loading
              ? h('span', { class: 'text-[10px] text-gray-400' }, 'Chargement…')
              : undefined,
          ]),
          h('div', { class: 'flex-1 min-h-[60px]' }, slots.default ? slots.default() : undefined),
        ],
      )
  },
})

onMounted(async () => {
  // Always clear stale leads on first mount if they belong to a different coach (edge case after account switch without full reload)
  if (coach.value?.id) {
    const firstLead = leadStore.leads[0]
    if (firstLead && firstLead.coach_id && firstLead.coach_id !== coach.value.id) {
      leadStore.clearLeads()
    }
  } else {
    // If no coach yet, wait a tick then proceed (auth initialization may still be in flight)
    await new Promise((r) => setTimeout(r, 0))
  }
  await ensureLeadsLoaded()
  await fetchServices()
  await fetchLeadTrend()
  await loadMyReviews()
})

// If coach identity changes (edge-case: switching accounts), reset leads to avoid leakage
watch(
  () => coach.value?.id,
  async (id: string | undefined | null, prev: string | undefined | null) => {
    if (id && id !== prev) {
      leadStore.clearLeads()
      await ensureLeadsLoaded()
    }
  },
)

onBeforeUnmount(() => {
  if (completionDelayTimer) clearTimeout(completionDelayTimer)
})
</script>

<style scoped>
.quick-action-btn {
  @apply rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition;
}
</style>

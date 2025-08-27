<template>
  <CoachLayout>
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <!-- Header -->
      <div
        class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl px-4 py-6 sm:p-8 flex items-start space-x-6"
      >
        <img
          :key="`profile-photo-${profileData?.updatedAt?.getTime() || 'default'}`"
          :src="profileData?.photo || '/default-avatar.svg'"
          :alt="`${profileData?.firstName || 'Coach'}`"
          class="h-24 w-24 rounded-full object-cover bg-gray-200"
        />
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900">{{ profileData?.firstName || 'Coach' }}</h1>
          <p class="text-gray-600 mt-1">Gérez vos informations publiques et modalités générales.</p>
        </div>
      </div>

      <!-- Unified Editor -->
      <CoachProfileEditor
        v-if="authStore.user?.id"
        :initial-coach-id="authStore.user.id"
        :initial-data="editorInitialData"
        @saved="handleEditorSaved"
      />
    </div>
  </CoachLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CoachLayout from '@/layouts/CoachLayout.vue'
import { useAuthStore } from '@/stores/auth'
import CoachProfileEditor from '@/components/CoachProfileEditor.vue'

type CountryType = 'martinique' | 'guadeloupe' | 'guyane'
const authStore = useAuthStore()
const profileData = computed(() => authStore.coach)

const parseLocationCountry = (location?: string): CountryType | '' => {
  if (!location) return ''
  const lower = location.toLowerCase()
  if (lower.includes('martinique')) return 'martinique'
  if (lower.includes('guadeloupe')) return 'guadeloupe'
  if (lower.includes('guyane')) return 'guyane'
  return ''
}
const parseLocationCity = (location?: string): string => location?.split(',')[0]?.trim() || ''

const editorInitialData = computed(() => {
  const c = profileData.value
  if (!c) return {}
  const languages = [...(c.languages || [])]
  const modalities = c.modalities
    ? {
        availabilityDays: [...modalitiesEnsureArray(c.modalities.availabilityDays)],
        locations: ensureAllLocations(c.modalities.locations),
        freeTrial: {
          enabled: !!c.modalities.freeTrial?.enabled,
          details: c.modalities.freeTrial?.details || '',
        },
        cancellationPolicy: c.modalities.cancellationPolicy || '',
      }
    : undefined
  return {
    personal: {
      firstName: c.firstName,
      lastName: c.lastName || '',
      age: null,
      gender: '',
      territory: parseLocationCountry(c.location) || '',
      city: parseLocationCity(c.location) || '',
      languages,
      languagesRaw: languages.join(', '),
    },
    contact: {
      email: c.email,
      phone: c.phone || '',
      website: '',
      instagram: '',
      facebook: '',
    },
    activity: {
      experienceYears: c.experience || 0,
      workExperiences: [],
      diplomas: [],
    },
    modalities,
  }
})

function modalitiesEnsureArray(val: unknown): string[] {
  return Array.isArray(val) ? (val.filter((v) => typeof v === 'string') as string[]) : []
}

interface LocationEntryRaw {
  enabled?: boolean
  details?: string
}
interface LocationsRawShape {
  atHome?: LocationEntryRaw
  visio?: LocationEntryRaw
  publicSpaces?: LocationEntryRaw
  gym?: LocationEntryRaw
  [key: string]: LocationEntryRaw | undefined
}
function ensureAllLocations(src: LocationsRawShape = {}) {
  const mk = (k: LocationEntryRaw | undefined) => ({
    enabled: !!k?.enabled,
    details: k?.details || '',
  })
  return {
    atHome: mk(src.atHome),
    visio: mk(src.visio),
    publicSpaces: mk(src.publicSpaces),
    gym: mk(src.gym),
  }
}

function handleEditorSaved() {
  if (authStore.loadCoachProfile) authStore.loadCoachProfile()
}
</script>

<style scoped></style>

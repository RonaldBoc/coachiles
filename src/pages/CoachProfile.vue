<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Switch,
  Dialog,
  DialogPanel,
  DialogTitle,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/vue'
import {
  UserCircleIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  MapPinIcon,
  VideoCameraIcon,
  HomeIcon,
  BuildingOfficeIcon,
  SunIcon,
  CheckIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import { COACH_SERVICES } from '@/constants/services'

// const userStore = useUserStore() // Commented out for now

// Profile data
const profileData = ref({
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@example.com',
  phone: '+596 696 12 34 56',
  bio: "Coach sportif passionné avec 5 ans d'expérience dans l'accompagnement personnalisé.",
  location: 'Fort-de-France',
  specialties: ['Fitness & Musculation'] as string[], // Changed to array, max 2 items
  profilePhoto:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
})

// Service interface
interface Service {
  id: string
  name: string
  category: string
  subcategory?: string
  description: string
  price?: number
  priceRange?: {
    min: number
    max: number
  }
  priceType: 'hour' | 'session'
  isPriceRange: boolean
  deliveryModes: string[]
  locations: string[]
  schedule: {
    [key: string]: {
      morning: boolean
      afternoon: boolean
      evening: boolean
    }
  }
  ageGroups: string[]
  sessionTypes: string[]
  levels: string[]
  isActive: boolean
}

// Services data
const services = ref<Service[]>([
  {
    id: '1',
    name: 'Coaching Remise en Forme',
    category: 'Fitness & Musculation',
    subcategory: 'Remise en forme générale',
    description:
      'Programme personnalisé pour retrouver la forme et améliorer sa condition physique générale.',
    price: 65,
    priceType: 'hour',
    isPriceRange: false,
    deliveryModes: ['En ligne', 'En présentiel'],
    locations: ['À domicile', 'En extérieur'],
    schedule: {
      lundi: { morning: false, afternoon: true, evening: true },
      mardi: { morning: false, afternoon: true, evening: true },
      mercredi: { morning: false, afternoon: true, evening: false },
      jeudi: { morning: false, afternoon: true, evening: true },
      vendredi: { morning: false, afternoon: true, evening: false },
      samedi: { morning: true, afternoon: true, evening: false },
      dimanche: { morning: false, afternoon: false, evening: false },
    },
    ageGroups: ['Adultes (18-65 ans)'],
    sessionTypes: ['Individuel', 'Duo'],
    levels: ['Débutant', 'Intermédiaire'],
    isActive: true,
  },
  {
    id: '2',
    name: 'Cours de Yoga',
    category: 'Yoga & Méditation',
    subcategory: 'Hatha Yoga',
    description: 'Séances de yoga adaptées à tous les niveaux pour détente et flexibilité.',
    priceRange: { min: 40, max: 60 },
    priceType: 'session',
    isPriceRange: true,
    deliveryModes: ['En ligne', 'En présentiel'],
    locations: ['En salle', 'En extérieur'],
    schedule: {
      lundi: { morning: true, afternoon: false, evening: true },
      mardi: { morning: false, afternoon: false, evening: true },
      mercredi: { morning: true, afternoon: false, evening: false },
      jeudi: { morning: false, afternoon: false, evening: true },
      vendredi: { morning: true, afternoon: false, evening: false },
      samedi: { morning: true, afternoon: true, evening: false },
      dimanche: { morning: true, afternoon: false, evening: false },
    },
    ageGroups: ['Adultes (18-65 ans)', 'Seniors (65+ ans)'],
    sessionTypes: ['Individuel', 'Groupe (3-8 personnes)'],
    levels: ['Débutant', 'Intermédiaire', 'Avancé'],
    isActive: true,
  },
])

// Service modal state
const showServiceModal = ref(false)
const editingService = ref<Service | null>(null)
const serviceForm = ref<Partial<Service & { subcategory?: string }>>({
  name: '',
  category: '',
  subcategory: '',
  description: '',
  price: 0,
  priceRange: { min: 0, max: 0 },
  priceType: 'hour',
  isPriceRange: false,
  deliveryModes: [],
  locations: [],
  schedule: {
    lundi: { morning: false, afternoon: false, evening: false },
    mardi: { morning: false, afternoon: false, evening: false },
    mercredi: { morning: false, afternoon: false, evening: false },
    jeudi: { morning: false, afternoon: false, evening: false },
    vendredi: { morning: false, afternoon: false, evening: false },
    samedi: { morning: false, afternoon: false, evening: false },
    dimanche: { morning: false, afternoon: false, evening: false },
  },
  ageGroups: [],
  sessionTypes: [],
  levels: [],
  isActive: true,
})

// Category and subcategory search functionality
const categorySearch = ref('')
const subcategorySearch = ref('')
const showCategoryDropdown = ref(false)
const showSubcategoryDropdown = ref(false)

// Service options
const serviceCategories = COACH_SERVICES.map((cat) => cat.category)

// Filtered categories based on search
const filteredCategories = computed(() => {
  if (!categorySearch.value.trim()) {
    return serviceCategories
  }
  return serviceCategories.filter((category) =>
    category.toLowerCase().includes(categorySearch.value.toLowerCase()),
  )
})

// Available subcategories based on selected category
const availableSubcategories = computed(() => {
  if (!serviceForm.value.category) return []
  const selectedCategoryData = COACH_SERVICES.find(
    (cat) => cat.category === serviceForm.value.category,
  )
  return selectedCategoryData ? selectedCategoryData.subcategories : []
})

// Filtered subcategories based on search
const filteredSubcategories = computed(() => {
  if (!subcategorySearch.value.trim()) {
    return availableSubcategories.value
  }
  return availableSubcategories.value.filter((subcategory: string) =>
    subcategory.toLowerCase().includes(subcategorySearch.value.toLowerCase()),
  )
})

// Functions for category selection
const selectCategory = (category: string) => {
  serviceForm.value.category = category
  serviceForm.value.subcategory = '' // Reset subcategory when category changes
  categorySearch.value = ''
  showCategoryDropdown.value = false
}

const selectSubcategory = (subcategory: string) => {
  serviceForm.value.subcategory = subcategory
  subcategorySearch.value = ''
  showSubcategoryDropdown.value = false
}

// Handle dropdown blur events
const handleCategoryBlur = () => {
  setTimeout(() => {
    showCategoryDropdown.value = false
  }, 200)
}

const handleSubcategoryBlur = () => {
  setTimeout(() => {
    showSubcategoryDropdown.value = false
  }, 200)
}
const deliveryModeOptions = ['En ligne', 'En présentiel']
const locationOptions = ['À domicile', 'Chez le coach', 'En salle', 'En extérieur']
const ageGroupOptions = [
  'Enfants (6-12 ans)',
  'Adolescents (13-17 ans)',
  'Adultes (18-65 ans)',
  'Seniors (65+ ans)',
]
const sessionTypeOptions = ['Individuel', 'Duo', 'Groupe (3-8 personnes)', 'Groupe (9+ personnes)']
const levelOptions = ['Débutant', 'Intermédiaire', 'Avancé']
const dayLabels = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
  samedi: 'Samedi',
  dimanche: 'Dimanche',
}

// Services data (old structure for backward compatibility)
const servicesData = ref({
  services: [] as string[],
  specializations: [] as string[],
  rates: {
    individual: 0,
    group: 0,
  },
})

// Credentials data
const credentialsData = ref({
  certifications: [] as Array<{ name: string; institution: string; year: number }>,
  experience: '',
})

// Matching preferences
const onlineAvailable = ref(true)
const onlineTools = ref<string[]>(['Zoom', 'Google Meet'])
const clientHomeAvailable = ref(true)
const coachHomeAvailable = ref(false)
const gymAvailable = ref(true)
const outdoorAvailable = ref(true)
const weeklyAvailability = ref({
  lundi: { morning: false, afternoon: true, evening: false },
  mardi: { morning: false, afternoon: true, evening: true },
  mercredi: { morning: false, afternoon: true, evening: false },
  jeudi: { morning: false, afternoon: true, evening: true },
  vendredi: { morning: false, afternoon: true, evening: false },
  samedi: { morning: true, afternoon: true, evening: false },
  dimanche: { morning: false, afternoon: false, evening: false },
})

// Auto-save indicators
const showProfileSaved = ref(false)
const showServicesSaved = ref(false)
const showCredentialsSaved = ref(false)
const showMatchingSaved = ref(false)

// Phone verification
const isPhoneVerified = ref(false)
const showPhoneVerification = ref(false)
const verificationCode = ref('')

// Cities data for French overseas territories
const cities = {
  martinique: [
    'Fort-de-France',
    'Le Lamentin',
    'Le Robert',
    'Sainte-Marie',
    'Ducos',
    'Rivière-Pilote',
    'Saint-Joseph',
    'Sainte-Luce',
    'Rivière-Salée',
    'Les Trois-Îlets',
    'Le François',
    'Le Vauclin',
    'Le Marin',
    'Sainte-Anne',
    'Le Diamant',
    "Les Anses-d'Arlet",
    'Case-Pilote',
    'Bellefontaine',
    'Le Morne-Rouge',
    'Basse-Pointe',
    'Macouba',
    "Grand'Rivière",
    'Ajoupa-Bouillon',
    'Le Lorrain',
    'Marigot',
    'Sainte-Marie',
    'Trinité',
    'Tartane',
    'Le Prêcheur',
    'Saint-Pierre',
    'Le Carbet',
    'Schoelcher',
    'Fonds-Saint-Denis',
    'Morne-Vert',
  ],
  guadeloupe: [
    'Pointe-à-Pitre',
    'Les Abymes',
    'Baie-Mahault',
    'Le Gosier',
    'Sainte-Anne',
    'Petit-Bourg',
    "Morne-à-l'Eau",
    'Capesterre-Belle-Eau',
    'Lamentin',
    'Basse-Terre',
    'Saint-François',
    'Gourbeyre',
    'Bouillante',
    'Trois-Rivières',
    'Vieux-Habitants',
    'Deshaies',
    'Sainte-Rose',
    'Petit-Canal',
    'Port-Louis',
    'Anse-Bertrand',
    'Moule',
    'Saint-Claude',
    'Baillif',
    'Vieux-Fort',
    'Capesterre-de-Marie-Galante',
    'Grand-Bourg',
    'Saint-Louis',
    'Terre-de-Bas',
    'Terre-de-Haut',
  ],
  guyane: [
    'Cayenne',
    'Kourou',
    'Saint-Laurent-du-Maroni',
    'Matoury',
    'Rémire-Montjoly',
    'Mana',
    'Macouria',
    'Sinnamary',
    'Iracoubo',
    "Saint-Georges-de-l'Oyapock",
    'Regina',
    'Roura',
    'Montsinéry-Tonnegrande',
    'Apatou',
    'Grand-Santi',
    'Papaichton',
    'Saül',
    'Ouanary',
    'Camopi',
    'Maripasoula',
    'Awala-Yalimapo',
  ],
}

// Available specialties/services for search
const availableSpecialties = [
  'Fitness & Musculation',
  'Yoga',
  'Pilates',
  'Crossfit',
  'Boxe',
  'Arts martiaux',
  'Natation',
  'Course à pied',
  'Cyclisme',
  'Triathlon',
  'Tennis',
  'Football',
  'Basketball',
  'Volleyball',
  'Handball',
  'Rugby',
  'Athlétisme',
  'Gymnastique',
  'Danse',
  'Zumba',
  'Aquagym',
  'Stretching',
  'Méditation',
  'Sophrologie',
  'Coaching mental',
  'Préparation physique',
  'Rééducation sportive',
  'Sport santé',
  'Sport adapté',
  'Remise en forme',
  'Perte de poids',
  'Prise de masse',
  'Coaching nutrition',
  'Coaching lifestyle',
]

// Specialty search functionality
const specialtySearch = ref('')
const showSpecialtyDropdown = ref(false)
const filteredSpecialties = ref(availableSpecialties)

const filterSpecialties = () => {
  if (specialtySearch.value.trim() === '') {
    filteredSpecialties.value = availableSpecialties
  } else {
    filteredSpecialties.value = availableSpecialties.filter((specialty) =>
      specialty.toLowerCase().includes(specialtySearch.value.toLowerCase()),
    )
  }
}

const selectSpecialty = (specialty: string) => {
  const specialties = profileData.value.specialties
  const index = specialties.indexOf(specialty)

  if (index > -1) {
    // Remove if already selected
    specialties.splice(index, 1)
  } else {
    // Add if not selected and under limit
    if (specialties.length < 2) {
      specialties.push(specialty)
    } else {
      // Replace the first one if at limit
      specialties[0] = specialty
    }
  }

  specialtySearch.value = ''
  showSpecialtyDropdown.value = false
}

// Bio editing state
const isEditingBio = ref(false)

// Handle specialty dropdown blur
const handleSpecialtyBlur = () => {
  setTimeout(() => {
    showSpecialtyDropdown.value = false
  }, 200)
}

// Photo upload handling
const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    // In a real app, you would upload to a server
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        profileData.value.profilePhoto = e.target.result as string
      }
    }
    reader.readAsDataURL(file)
  }
}

// Phone verification functions
const sendVerificationCode = () => {
  console.log('Sending verification code to:', profileData.value.phone)
  showPhoneVerification.value = true
  // TODO: Call API to send SMS verification code
}

// Service management functions
const openServiceModal = (service?: Service) => {
  if (service) {
    editingService.value = service
    serviceForm.value = { ...service }
    // Set the search fields to show current values
    categorySearch.value = ''
    subcategorySearch.value = ''
  } else {
    editingService.value = null
    serviceForm.value = {
      name: '',
      category: '',
      subcategory: '',
      description: '',
      price: 0,
      priceRange: { min: 0, max: 0 },
      priceType: 'hour',
      isPriceRange: false,
      deliveryModes: [],
      locations: [],
      schedule: {
        lundi: { morning: false, afternoon: false, evening: false },
        mardi: { morning: false, afternoon: false, evening: false },
        mercredi: { morning: false, afternoon: false, evening: false },
        jeudi: { morning: false, afternoon: false, evening: false },
        vendredi: { morning: false, afternoon: false, evening: false },
        samedi: { morning: false, afternoon: false, evening: false },
        dimanche: { morning: false, afternoon: false, evening: false },
      },
      ageGroups: [],
      sessionTypes: [],
      levels: [],
      isActive: true,
    }
    categorySearch.value = ''
    subcategorySearch.value = ''
  }
  showServiceModal.value = true
}

// Service row state for keyboard navigation
const hoveredServiceId = ref<string | null>(null)

const handleServiceKeydown = (event: KeyboardEvent, serviceId: string) => {
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    deleteService(serviceId)
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const service = services.value.find((s) => s.id === serviceId)
    if (service) {
      openServiceModal(service)
    }
  }
}

const closeServiceModal = () => {
  showServiceModal.value = false
  editingService.value = null
  // Reset search fields
  categorySearch.value = ''
  subcategorySearch.value = ''
  showCategoryDropdown.value = false
  showSubcategoryDropdown.value = false
}

const saveService = () => {
  if (!serviceForm.value.name || !serviceForm.value.category || !serviceForm.value.subcategory)
    return

  const serviceData: Service = {
    id: editingService.value?.id || Date.now().toString(),
    name: serviceForm.value.name!,
    category: serviceForm.value.category!,
    subcategory: serviceForm.value.subcategory!,
    description: serviceForm.value.description || '',
    price: serviceForm.value.isPriceRange ? undefined : serviceForm.value.price,
    priceRange: serviceForm.value.isPriceRange ? serviceForm.value.priceRange : undefined,
    priceType: serviceForm.value.priceType || 'hour',
    isPriceRange: serviceForm.value.isPriceRange || false,
    deliveryModes: serviceForm.value.deliveryModes || [],
    locations: serviceForm.value.locations || [],
    schedule: serviceForm.value.schedule || {},
    ageGroups: serviceForm.value.ageGroups || [],
    sessionTypes: serviceForm.value.sessionTypes || [],
    levels: serviceForm.value.levels || [],
    isActive: serviceForm.value.isActive ?? true,
  }

  if (editingService.value) {
    const index = services.value.findIndex((s) => s.id === editingService.value!.id)
    if (index > -1) {
      services.value[index] = serviceData
    }
  } else {
    services.value.push(serviceData)
  }

  closeServiceModal()
  triggerServicesSave()
}

const deleteService = (serviceId: string) => {
  const service = services.value.find((s) => s.id === serviceId)
  if (
    service &&
    confirm(
      `Êtes-vous sûr de vouloir supprimer le service "${service.name}" ?\n\nCette action est irréversible.`,
    )
  ) {
    services.value = services.value.filter((s) => s.id !== serviceId)
    triggerServicesSave()
  }
}

const toggleServiceStatus = (serviceId: string) => {
  const service = services.value.find((s) => s.id === serviceId)
  if (service) {
    service.isActive = !service.isActive
    triggerServicesSave()
  }
}

const triggerServicesSave = () => {
  showServicesSaved.value = true
  setTimeout(() => {
    showServicesSaved.value = false
  }, 2000)
  // TODO: Save to backend
}

const toggleMultiSelectOption = (array: string[], option: string) => {
  const index = array.indexOf(option)
  if (index > -1) {
    array.splice(index, 1)
  } else {
    array.push(option)
  }
}

const formatPriceRange = (service: Service) => {
  if (service.isPriceRange && service.priceRange) {
    if (service.priceRange.min === service.priceRange.max) {
      return `${service.priceRange.min}€`
    }
    return `${service.priceRange.min}€ - ${service.priceRange.max}€`
  } else if (service.price !== undefined) {
    return `${service.price}€`
  }
  return '0€'
}

const verifyPhone = () => {
  if (verificationCode.value === '123456') {
    // Mock verification
    isPhoneVerified.value = true
    showPhoneVerification.value = false
    console.log('Phone verified successfully')
  } else {
    alert('Code de vérification incorrect')
  }
}

// Auto-save watchers
watch(
  profileData,
  () => {
    saveProfileData()
  },
  { deep: true },
)

watch(
  servicesData,
  () => {
    saveServicesData()
  },
  { deep: true },
)

watch(
  credentialsData,
  () => {
    saveCredentialsData()
  },
  { deep: true },
)

watch(
  [
    onlineAvailable,
    onlineTools,
    clientHomeAvailable,
    coachHomeAvailable,
    gymAvailable,
    outdoorAvailable,
    weeklyAvailability,
  ],
  () => {
    saveMatchingPreferences()
  },
  { deep: true },
)

// Tabs
const tabs = [
  { id: 'profile', name: 'Informations personnelles', icon: UserCircleIcon },
  { id: 'services', name: 'Services proposés', icon: BriefcaseIcon },
  { id: 'credentials', name: 'Diplômes & certifications', icon: AcademicCapIcon },
  { id: 'matching', name: 'Préférences de coaching', icon: MapPinIcon },
]

const toggleOnlineTool = (tool: string) => {
  const index = onlineTools.value.indexOf(tool)
  if (index > -1) {
    onlineTools.value.splice(index, 1)
  } else {
    onlineTools.value.push(tool)
  }
}

// Auto-save functions
const saveProfileData = () => {
  console.log('Auto-saving profile data:', profileData.value)
  showProfileSaved.value = true
  setTimeout(() => {
    showProfileSaved.value = false
  }, 2000)
  // TODO: Call API to save profile data
}

const saveServicesData = () => {
  console.log('Auto-saving services data:', servicesData.value)
  showServicesSaved.value = true
  setTimeout(() => {
    showServicesSaved.value = false
  }, 2000)
  // TODO: Call API to save services data
}

const saveCredentialsData = () => {
  console.log('Auto-saving credentials data:', credentialsData.value)
  showCredentialsSaved.value = true
  setTimeout(() => {
    showCredentialsSaved.value = false
  }, 2000)
  // TODO: Call API to save credentials data
}

const saveMatchingPreferences = () => {
  console.log('Auto-saving matching preferences:', {
    onlineAvailable: onlineAvailable.value,
    onlineTools: onlineTools.value,
    clientHomeAvailable: clientHomeAvailable.value,
    coachHomeAvailable: coachHomeAvailable.value,
    gymAvailable: gymAvailable.value,
    outdoorAvailable: outdoorAvailable.value,
    weeklyAvailability: weeklyAvailability.value,
  })
  showMatchingSaved.value = true
  setTimeout(() => {
    showMatchingSaved.value = false
  }, 2000)
  // TODO: Call API to save matching preferences
}

// Select all time slots function
const selectAllTimeSlots = () => {
  Object.keys(weeklyAvailability.value).forEach((dayKey) => {
    const day = dayKey as keyof typeof weeklyAvailability.value
    weeklyAvailability.value[day].morning = true
    weeklyAvailability.value[day].afternoon = true
    weeklyAvailability.value[day].evening = true
  })
}

// Clear all time slots function
const clearAllTimeSlots = () => {
  Object.keys(weeklyAvailability.value).forEach((dayKey) => {
    const day = dayKey as keyof typeof weeklyAvailability.value
    weeklyAvailability.value[day].morning = false
    weeklyAvailability.value[day].afternoon = false
    weeklyAvailability.value[day].evening = false
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Profile Header -->
      <div class="mb-8 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div class="px-4 py-6 sm:p-8">
          <div class="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <!-- Profile Photo -->
            <div class="relative group">
              <img
                :src="profileData.profilePhoto"
                :alt="`${profileData.firstName} ${profileData.lastName}`"
                class="h-24 w-24 rounded-full object-cover"
              />
              <div
                class="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <svg
                  class="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <input
                type="file"
                accept="image/*"
                @change="handlePhotoUpload"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <!-- Profile Info -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div class="flex-1">
                  <!-- Name (non-editable) -->
                  <h1 class="text-2xl font-bold text-gray-900">
                    {{ profileData.firstName }} {{ profileData.lastName }}
                  </h1>

                  <!-- Specialties (non-editable) -->
                  <div class="mt-1 flex flex-wrap gap-2">
                    <span
                      v-for="specialty in profileData.specialties"
                      :key="specialty"
                      class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                    >
                      {{ specialty }}
                    </span>
                    <span v-if="profileData.specialties.length === 0" class="text-sm text-gray-500">
                      Aucune spécialité sélectionnée
                    </span>
                  </div>

                  <!-- Description (editable with hover icon) -->
                  <div class="mt-2 group relative">
                    <div
                      v-if="!isEditingBio"
                      @click="isEditingBio = true"
                      class="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded -ml-2 transition-colors"
                    >
                      <p class="text-sm text-gray-600">
                        {{ profileData.bio || 'Cliquez pour ajouter une description...' }}
                      </p>
                      <!-- Edit icon -->
                      <svg
                        class="absolute top-1 right-1 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>

                    <div v-else class="relative">
                      <textarea
                        v-model="profileData.bio"
                        @blur="isEditingBio = false"
                        @keydown.escape="isEditingBio = false"
                        ref="bioTextarea"
                        class="w-full text-sm text-gray-600 bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows="2"
                        placeholder="Décrivez votre approche et votre expérience..."
                        autofocus
                      />
                    </div>
                  </div>
                </div>

                <!-- Status Badge -->
                <div class="mt-4 sm:mt-0">
                  <span
                    class="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                  >
                    <svg class="mr-1.5 h-2 w-2 fill-green-500" viewBox="0 0 6 6">
                      <circle cx="3" cy="3" r="3" />
                    </svg>
                    Profil actif
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <TabGroup>
        <TabList class="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab v-for="tab in tabs" :key="tab.id" as="template" v-slot="{ selected }">
            <button
              class="w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              :class="[
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-700 hover:bg-white/[0.12] hover:text-blue-800',
              ]"
            >
              <div class="flex items-center justify-center space-x-2">
                <component :is="tab.icon" class="h-5 w-5" />
                <span class="hidden sm:inline">{{ tab.name }}</span>
                <span class="sm:hidden">{{ tab.name.split(' ')[0] }}</span>
              </div>
            </button>
          </Tab>
        </TabList>

        <TabPanels class="mt-8">
          <!-- Profile Tab -->
          <TabPanel class="space-y-8">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <h2 class="text-lg font-medium text-gray-900">Informations personnelles</h2>
                    <p class="mt-1 text-sm text-gray-600">
                      Gérez vos informations de base et coordonnées de contact.
                    </p>
                  </div>
                  <!-- Auto-save indicator -->
                  <div
                    v-if="showProfileSaved"
                    class="flex items-center text-sm text-green-600 transition-opacity duration-300"
                  >
                    <CheckIcon class="mr-1 h-4 w-4" />
                    Sauvegardé
                  </div>
                </div>

                <!-- Personal Information Form -->
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <!-- First Name -->
                  <div>
                    <label
                      for="firstName"
                      class="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Prénom *
                    </label>
                    <input
                      id="firstName"
                      v-model="profileData.firstName"
                      type="text"
                      required
                      class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                      placeholder="Votre prénom"
                    />
                  </div>

                  <!-- Last Name -->
                  <div>
                    <label for="lastName" class="block text-sm font-medium leading-6 text-gray-900">
                      Nom *
                    </label>
                    <input
                      id="lastName"
                      v-model="profileData.lastName"
                      type="text"
                      required
                      class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                      placeholder="Votre nom"
                    />
                  </div>

                  <!-- Email -->
                  <div>
                    <label for="email" class="block text-sm font-medium leading-6 text-gray-900">
                      Email *
                    </label>
                    <input
                      id="email"
                      v-model="profileData.email"
                      type="email"
                      required
                      class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                      placeholder="votre.email@example.com"
                    />
                  </div>

                  <!-- Specialties with search (max 2) -->
                  <div class="sm:col-span-2">
                    <label
                      for="specialty"
                      class="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Spécialités * (maximum 2)
                    </label>
                    <div class="relative mt-2">
                      <input
                        id="specialty"
                        v-model="specialtySearch"
                        @input="filterSpecialties"
                        @focus="showSpecialtyDropdown = true"
                        @blur="handleSpecialtyBlur"
                        type="text"
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                        :placeholder="
                          profileData.specialties.length > 0
                            ? 'Ajouter une autre spécialité...'
                            : 'Rechercher une spécialité...'
                        "
                      />

                      <!-- Dropdown -->
                      <div
                        v-if="showSpecialtyDropdown && filteredSpecialties.length > 0"
                        class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                      >
                        <div
                          v-for="specialty in filteredSpecialties"
                          :key="specialty"
                          @click="selectSpecialty(specialty)"
                          class="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-blue-50 hover:text-blue-900"
                          :class="{
                            'bg-blue-100 text-blue-900':
                              profileData.specialties.includes(specialty),
                            'opacity-50':
                              profileData.specialties.length >= 2 &&
                              !profileData.specialties.includes(specialty),
                          }"
                        >
                          <span class="block truncate">{{ specialty }}</span>
                          <span
                            v-if="profileData.specialties.includes(specialty)"
                            class="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600"
                          >
                            <CheckIcon class="h-5 w-5" />
                          </span>
                          <span
                            v-else-if="profileData.specialties.length >= 2"
                            class="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-xs"
                          >
                            Max 2
                          </span>
                        </div>
                      </div>

                      <!-- Current selections display -->
                      <div
                        v-if="profileData.specialties.length > 0 && !showSpecialtyDropdown"
                        class="mt-2"
                      >
                        <div class="flex flex-wrap gap-2">
                          <span
                            v-for="specialty in profileData.specialties"
                            :key="specialty"
                            class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                          >
                            {{ specialty }}
                            <button
                              @click="selectSpecialty(specialty)"
                              type="button"
                              class="ml-2 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:bg-blue-500 focus:text-white focus:outline-none"
                            >
                              <svg
                                class="h-2 w-2"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 8 8"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-width="1.5"
                                  d="m1 1 6 6m0-6-6 6"
                                />
                              </svg>
                            </button>
                          </span>
                        </div>
                        <p class="mt-1 text-xs text-gray-500">
                          {{ profileData.specialties.length }}/2 spécialités sélectionnées
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Phone with verification -->
                  <div>
                    <label for="phone" class="block text-sm font-medium leading-6 text-gray-900">
                      Téléphone *
                    </label>
                    <div class="mt-2 flex rounded-md shadow-sm">
                      <input
                        id="phone"
                        v-model="profileData.phone"
                        type="tel"
                        required
                        class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                        placeholder="+596 696 12 34 56"
                      />
                      <button
                        v-if="!isPhoneVerified"
                        @click="sendVerificationCode"
                        type="button"
                        class="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        Vérifier
                      </button>
                      <span
                        v-else
                        class="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 ring-1 ring-inset ring-green-300"
                      >
                        <CheckIcon class="h-4 w-4" />
                        Vérifié
                      </span>
                    </div>
                  </div>

                  <!-- City -->
                  <div class="sm:col-span-2">
                    <label for="location" class="block text-sm font-medium leading-6 text-gray-900">
                      Ville *
                    </label>
                    <select
                      id="location"
                      v-model="profileData.location"
                      required
                      class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-xs sm:text-sm sm:leading-6 px-3"
                    >
                      <option value="">Sélectionnez votre ville</option>
                      <optgroup label="Martinique">
                        <option
                          v-for="city in cities.martinique"
                          :key="`martinique-${city}`"
                          :value="city"
                        >
                          {{ city }}
                        </option>
                      </optgroup>
                      <optgroup label="Guadeloupe">
                        <option
                          v-for="city in cities.guadeloupe"
                          :key="`guadeloupe-${city}`"
                          :value="city"
                        >
                          {{ city }}
                        </option>
                      </optgroup>
                      <optgroup label="Guyane">
                        <option v-for="city in cities.guyane" :key="`guyane-${city}`" :value="city">
                          {{ city }}
                        </option>
                      </optgroup>
                    </select>
                    <p class="mt-2 text-sm text-gray-500">
                      Sélectionnez la ville où vous exercez principalement votre activité de
                      coaching.
                    </p>
                  </div>
                </div>

                <!-- Phone Verification Modal -->
                <div v-if="showPhoneVerification" class="mt-6 rounded-md bg-blue-50 p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fill-rule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <div class="ml-3 flex-1">
                      <h3 class="text-sm font-medium text-blue-800">
                        Vérification du numéro de téléphone
                      </h3>
                      <div class="mt-2 text-sm text-blue-700">
                        <p>Un code de vérification a été envoyé au {{ profileData.phone }}.</p>
                      </div>
                      <div class="mt-4">
                        <div class="flex items-center space-x-3">
                          <input
                            v-model="verificationCode"
                            type="text"
                            maxlength="6"
                            placeholder="Code à 6 chiffres"
                            class="block w-32 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                          />
                          <button
                            @click="verifyPhone"
                            type="button"
                            class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                          >
                            Vérifier
                          </button>
                          <button
                            @click="showPhoneVerification = false"
                            type="button"
                            class="text-sm text-gray-600 hover:text-gray-800"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- Services Tab -->
          <TabPanel class="space-y-8">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-lg font-medium text-gray-900">Services proposés</h2>
                    <p class="mt-1 text-sm text-gray-600">
                      Gérez les services que vous proposez à vos clients.
                    </p>
                  </div>
                  <div class="flex items-center gap-3">
                    <!-- Auto-save indicator -->
                    <div
                      v-if="showServicesSaved"
                      class="flex items-center text-sm text-green-600 transition-opacity duration-300"
                    >
                      <CheckIcon class="mr-1 h-4 w-4" />
                      Sauvegardé
                    </div>
                    <!-- Add Service Button -->
                    <button
                      @click="openServiceModal()"
                      class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      <PlusIcon class="-ml-0.5 mr-1.5 h-4 w-4" />
                      Ajouter un service
                    </button>
                  </div>
                </div>

                <!-- Services Table -->
                <div class="mt-8">
                  <div v-if="services.length === 0" class="text-center py-12">
                    <BriefcaseIcon class="mx-auto h-12 w-12 text-gray-400" />
                    <h3 class="mt-2 text-sm font-semibold text-gray-900">Aucun service</h3>
                    <p class="mt-1 text-sm text-gray-500">
                      Commencez par ajouter votre premier service.
                    </p>
                    <div class="mt-6">
                      <button
                        @click="openServiceModal()"
                        class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                      >
                        <PlusIcon class="-ml-0.5 mr-1.5 h-4 w-4" />
                        Ajouter un service
                      </button>
                    </div>
                  </div>

                  <div
                    v-else
                    class="bg-white rounded-lg border border-gray-200"
                    style="overflow: visible; isolation: auto"
                  >
                    <div class="overflow-x-auto" style="isolation: auto">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th
                              class="px-4 py-2 text-left text-2xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Service
                            </th>
                            <th
                              class="px-4 py-2 text-left text-2xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Catégorie
                            </th>
                            <th
                              class="px-4 py-2 text-left text-2xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Prix
                            </th>
                            <th
                              class="px-4 py-2 text-left text-2xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Statut
                            </th>
                            <th class="relative px-4 py-2 w-16">
                              <span class="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr
                            v-for="service in services"
                            :key="service.id"
                            class="hover:bg-gray-50 group cursor-pointer focus:bg-blue-50 focus:outline-none"
                            tabindex="0"
                            @click="openServiceModal(service)"
                            @keydown="handleServiceKeydown($event, service.id)"
                            @mouseenter="hoveredServiceId = service.id"
                            @mouseleave="hoveredServiceId = null"
                          >
                            <td class="px-4 py-3 whitespace-nowrap">
                              <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                  <div>
                                    <div class="text-xs font-medium text-gray-900">
                                      {{ service.name }}
                                    </div>
                                    <div class="text-2xs text-gray-500 max-w-xs truncate">
                                      {{ service.description }}
                                    </div>
                                  </div>
                                </div>
                                <!-- Edit icon on hover -->
                                <PencilIcon
                                  class="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                              </div>
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap">
                              <div class="space-y-1">
                                <span
                                  class="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {{ service.category }}
                                </span>
                                <div v-if="service.subcategory" class="text-2xs text-gray-500">
                                  {{ service.subcategory }}
                                </div>
                              </div>
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                              <div class="flex flex-col">
                                <span>{{ formatPriceRange(service) }}</span>
                                <span class="text-2xs text-gray-500">
                                  par {{ service.priceType === 'hour' ? 'heure' : 'séance' }}
                                </span>
                              </div>
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap">
                              <button
                                @click.stop="toggleServiceStatus(service.id)"
                                :class="[
                                  service.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800',
                                  'inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium cursor-pointer hover:opacity-80',
                                ]"
                              >
                                {{ service.isActive ? 'Actif' : 'Inactif' }}
                              </button>
                            </td>
                            <td
                              class="px-4 py-3 whitespace-nowrap text-right text-xs font-medium relative"
                            >
                              <Menu as="div" class="relative inline-block text-left" @click.stop>
                                <MenuButton
                                  class="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                  <EllipsisVerticalIcon class="h-4 w-4" />
                                </MenuButton>
                                <MenuItems
                                  class="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                >
                                  <div class="py-1">
                                    <MenuItem v-slot="{ active }">
                                      <button
                                        @click="openServiceModal(service)"
                                        :class="[
                                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                          'group flex items-center px-3 py-1.5 text-xs w-full text-left',
                                        ]"
                                      >
                                        <PencilIcon
                                          class="mr-2 h-3 w-3 text-gray-400 group-hover:text-gray-500"
                                        />
                                        Modifier
                                      </button>
                                    </MenuItem>
                                    <MenuItem v-slot="{ active }">
                                      <button
                                        @click="deleteService(service.id)"
                                        :class="[
                                          active ? 'bg-gray-100 text-red-900' : 'text-red-700',
                                          'group flex items-center px-3 py-1.5 text-xs w-full text-left',
                                        ]"
                                      >
                                        <TrashIcon
                                          class="mr-2 h-3 w-3 text-red-400 group-hover:text-red-500"
                                        />
                                        Supprimer
                                      </button>
                                    </MenuItem>
                                  </div>
                                </MenuItems>
                              </Menu>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!-- Keyboard shortcuts help -->
                      <div class="mt-4 px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <p class="text-xs text-gray-500">
                          <strong>Raccourcis clavier :</strong>
                          Cliquez sur un service ou appuyez sur
                          <kbd
                            class="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded"
                            >Entrée</kbd
                          >
                          pour modifier •
                          <kbd
                            class="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded"
                            >Suppr</kbd
                          >
                          pour supprimer
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- Credentials Tab -->
          <TabPanel class="space-y-8">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-lg font-medium text-gray-900">Diplômes & certifications</h2>
                    <p class="mt-1 text-sm text-gray-600">
                      Ajoutez et gérez vos diplômes et certifications.
                    </p>
                  </div>
                  <!-- Auto-save indicator -->
                  <div
                    v-if="showCredentialsSaved"
                    class="flex items-center text-sm text-green-600 transition-opacity duration-300"
                  >
                    <CheckIcon class="mr-1 h-4 w-4" />
                    Sauvegardé
                  </div>
                </div>
                <div class="mt-6">
                  <p class="text-sm text-gray-500">
                    Cette section contiendra la gestion des diplômes : ajout, upload de fichiers,
                    statut de validation, suppression, etc.
                  </p>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- Matching Preferences Tab -->
          <TabPanel class="space-y-8">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div class="px-4 py-6 sm:p-8">
                <div class="max-w-2xl">
                  <div class="flex items-center justify-between">
                    <div>
                      <h2 class="text-base font-semibold leading-7 text-gray-900">
                        Préférences de coaching
                      </h2>
                      <p class="mt-1 text-sm leading-6 text-gray-600">
                        Configurez vos préférences pour le matching avec les clients. Ces
                        informations ne sont pas visibles publiquement.
                      </p>
                    </div>
                    <!-- Auto-save indicator -->
                    <div
                      v-if="showMatchingSaved"
                      class="flex items-center text-sm text-green-600 transition-opacity duration-300"
                    >
                      <CheckIcon class="mr-1 h-4 w-4" />
                      Sauvegardé
                    </div>
                  </div>

                  <!-- Meeting Types -->
                  <div class="mt-8">
                    <h3 class="text-sm font-medium text-gray-900 mb-4">Types de rendez-vous</h3>
                    <div class="space-y-4">
                      <!-- Online -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <VideoCameraIcon class="h-5 w-5 text-gray-400" />
                          <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">Coaching en ligne</h4>
                            <p class="text-sm text-gray-500">Séances par vidéoconférence</p>
                          </div>
                        </div>
                        <Switch
                          v-model="onlineAvailable"
                          :class="onlineAvailable ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                          <span
                            :class="onlineAvailable ? 'translate-x-5' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          />
                        </Switch>
                      </div>

                      <!-- Online Tools -->
                      <div v-if="onlineAvailable" class="ml-8 space-y-2">
                        <p class="text-sm text-gray-600">Outils préférés :</p>
                        <div class="flex flex-wrap gap-2">
                          <button
                            v-for="tool in [
                              'Zoom',
                              'Google Meet',
                              'Microsoft Teams',
                              'Skype',
                              'WhatsApp',
                            ]"
                            :key="tool"
                            @click="toggleOnlineTool(tool)"
                            :class="
                              onlineTools.includes(tool)
                                ? 'bg-blue-100 text-blue-800 ring-blue-600/20'
                                : 'bg-gray-100 text-gray-800 ring-gray-600/20'
                            "
                            class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset hover:bg-opacity-80"
                          >
                            {{ tool }}
                          </button>
                        </div>
                      </div>

                      <!-- Client's Home -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <HomeIcon class="h-5 w-5 text-gray-400" />
                          <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">Chez le client</h4>
                            <p class="text-sm text-gray-500">Vous vous déplacez chez le client</p>
                          </div>
                        </div>
                        <Switch
                          v-model="clientHomeAvailable"
                          :class="clientHomeAvailable ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                          <span
                            :class="clientHomeAvailable ? 'translate-x-5' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          />
                        </Switch>
                      </div>

                      <!-- Coach's Home -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <HomeIcon class="h-5 w-5 text-gray-400" />
                          <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">Chez vous</h4>
                            <p class="text-sm text-gray-500">Le client vient chez vous</p>
                          </div>
                        </div>
                        <Switch
                          v-model="coachHomeAvailable"
                          :class="coachHomeAvailable ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                          <span
                            :class="coachHomeAvailable ? 'translate-x-5' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          />
                        </Switch>
                      </div>

                      <!-- Gym -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <BuildingOfficeIcon class="h-5 w-5 text-gray-400" />
                          <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">En salle de sport</h4>
                            <p class="text-sm text-gray-500">Dans votre salle ou celle du client</p>
                          </div>
                        </div>
                        <Switch
                          v-model="gymAvailable"
                          :class="gymAvailable ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                          <span
                            :class="gymAvailable ? 'translate-x-5' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          />
                        </Switch>
                      </div>

                      <!-- Outdoor -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <SunIcon class="h-5 w-5 text-gray-400" />
                          <div class="ml-3">
                            <h4 class="text-sm font-medium text-gray-900">En extérieur</h4>
                            <p class="text-sm text-gray-500">Parcs, plages, terrains de sport...</p>
                          </div>
                        </div>
                        <Switch
                          v-model="outdoorAvailable"
                          :class="outdoorAvailable ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                          <span
                            :class="outdoorAvailable ? 'translate-x-5' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          />
                        </Switch>
                      </div>
                    </div>
                  </div>

                  <!-- Weekly Availability -->
                  <div class="mt-8">
                    <div class="flex items-center justify-between mb-4">
                      <h3 class="text-sm font-medium text-gray-900">
                        Disponibilités hebdomadaires
                      </h3>
                      <div class="flex space-x-2">
                        <button
                          @click="selectAllTimeSlots"
                          type="button"
                          class="text-xs px-3 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                        >
                          Tout sélectionner
                        </button>
                        <button
                          @click="clearAllTimeSlots"
                          type="button"
                          class="text-xs px-3 py-1 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
                        >
                          Tout décocher
                        </button>
                      </div>
                    </div>
                    <div class="grid grid-cols-1 gap-4">
                      <div
                        v-for="(day, dayKey) in weeklyAvailability"
                        :key="dayKey"
                        class="flex items-center justify-between border border-gray-200 rounded-lg p-3"
                      >
                        <div class="flex-1">
                          <h4 class="text-sm font-medium text-gray-900 capitalize">{{ dayKey }}</h4>
                        </div>
                        <div class="flex space-x-6">
                          <label class="flex items-center">
                            <input
                              v-model="day.morning"
                              type="checkbox"
                              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span class="ml-2 text-sm text-gray-700">Matin</span>
                          </label>
                          <label class="flex items-center">
                            <input
                              v-model="day.afternoon"
                              type="checkbox"
                              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span class="ml-2 text-sm text-gray-700">Après-midi</span>
                          </label>
                          <label class="flex items-center">
                            <input
                              v-model="day.evening"
                              type="checkbox"
                              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span class="ml-2 text-sm text-gray-700">Soir</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  </div>

  <!-- Service Modal -->
  <Dialog :open="showServiceModal" @close="closeServiceModal" class="relative z-50">
    <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
    <div class="fixed inset-0 flex w-screen items-center justify-center p-4">
      <DialogPanel
        class="max-w-4xl w-full bg-white rounded-xl shadow-lg max-h-[90vh] overflow-y-auto"
      >
        <div class="px-6 py-4 border-b border-gray-200">
          <DialogTitle class="text-lg font-semibold text-gray-900">
            {{ editingService ? 'Modifier le service' : 'Ajouter un service' }}
          </DialogTitle>
        </div>

        <div class="px-6 py-6 space-y-6">
          <!-- Service Name & Category -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label for="service-name" class="block text-sm font-medium text-gray-900">
                Nom du service *
              </label>
              <input
                id="service-name"
                v-model="serviceForm.name"
                type="text"
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Ex: Coaching Remise en Forme"
              />
            </div>
            <div>
              <label for="service-category" class="block text-sm font-medium text-gray-900">
                Catégorie *
              </label>
              <div class="relative mt-2">
                <input
                  id="service-category"
                  v-model="categorySearch"
                  type="text"
                  :placeholder="serviceForm.category || 'Rechercher une catégorie...'"
                  @focus="showCategoryDropdown = true"
                  @blur="handleCategoryBlur"
                  @input="showCategoryDropdown = true"
                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <!-- Category dropdown -->
                <div
                  v-if="showCategoryDropdown"
                  class="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                >
                  <div
                    v-for="category in filteredCategories"
                    :key="category"
                    @click="selectCategory(category)"
                    :class="[
                      'relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white',
                      serviceForm.category === category
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-900',
                    ]"
                  >
                    <span
                      :class="[
                        'block truncate',
                        serviceForm.category === category ? 'font-semibold' : 'font-normal',
                      ]"
                    >
                      {{ category }}
                    </span>
                    <span
                      v-if="serviceForm.category === category"
                      class="absolute inset-y-0 right-0 flex items-center pr-4 text-white"
                    >
                      <CheckIcon class="h-5 w-5" />
                    </span>
                  </div>
                  <div
                    v-if="filteredCategories.length === 0"
                    class="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-700"
                  >
                    Aucune catégorie trouvée
                  </div>
                </div>
                <!-- Selected category display -->
                <div
                  v-if="serviceForm.category && !showCategoryDropdown"
                  class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                >
                  <span class="text-gray-900 sm:text-sm">{{ serviceForm.category }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Subcategory -->
          <div v-if="serviceForm.category">
            <label for="service-subcategory" class="block text-sm font-medium text-gray-900">
              Sous-catégorie *
            </label>
            <div class="relative mt-2">
              <input
                id="service-subcategory"
                v-model="subcategorySearch"
                type="text"
                :placeholder="serviceForm.subcategory || 'Rechercher une sous-catégorie...'"
                @focus="showSubcategoryDropdown = true"
                @blur="handleSubcategoryBlur"
                @input="showSubcategoryDropdown = true"
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <!-- Subcategory dropdown -->
              <div
                v-if="showSubcategoryDropdown"
                class="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              >
                <div
                  v-for="subcategory in filteredSubcategories"
                  :key="subcategory"
                  @click="selectSubcategory(subcategory)"
                  :class="[
                    'relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white',
                    serviceForm.subcategory === subcategory
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-900',
                  ]"
                >
                  <span
                    :class="[
                      'block truncate',
                      serviceForm.subcategory === subcategory ? 'font-semibold' : 'font-normal',
                    ]"
                  >
                    {{ subcategory }}
                  </span>
                  <span
                    v-if="serviceForm.subcategory === subcategory"
                    class="absolute inset-y-0 right-0 flex items-center pr-4 text-white"
                  >
                    <CheckIcon class="h-5 w-5" />
                  </span>
                </div>
                <div
                  v-if="filteredSubcategories.length === 0"
                  class="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-700"
                >
                  Aucune sous-catégorie trouvée
                </div>
              </div>
              <!-- Selected subcategory display -->
              <div
                v-if="serviceForm.subcategory && !showSubcategoryDropdown"
                class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
              >
                <span class="text-gray-900 sm:text-sm">{{ serviceForm.subcategory }}</span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label for="service-description" class="block text-sm font-medium text-gray-900">
              Description
            </label>
            <textarea
              id="service-description"
              v-model="serviceForm.description"
              rows="3"
              class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Décrivez votre service..."
            />
          </div>

          <!-- Pricing -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-4">Tarification</label>

            <!-- Price Type Selection -->
            <div class="mb-4">
              <label class="block text-xs text-gray-500 mb-2">Type de tarification</label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input
                    v-model="serviceForm.priceType"
                    value="hour"
                    type="radio"
                    class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Par heure</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="serviceForm.priceType"
                    value="session"
                    type="radio"
                    class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Par séance</span>
                </label>
              </div>
            </div>

            <!-- Price Range Toggle -->
            <div class="mb-4">
              <label class="flex items-center">
                <input
                  v-model="serviceForm.isPriceRange"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span class="ml-2 text-sm text-gray-700">Proposer une fourchette de prix</span>
              </label>
            </div>

            <!-- Price Input(s) -->
            <div v-if="serviceForm.isPriceRange" class="grid grid-cols-2 gap-4">
              <div>
                <label for="price-min" class="block text-xs text-gray-500">
                  Prix minimum (€)
                </label>
                <input
                  id="price-min"
                  v-model.number="serviceForm.priceRange!.min"
                  type="number"
                  min="0"
                  step="0.01"
                  class="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <div>
                <label for="price-max" class="block text-xs text-gray-500">
                  Prix maximum (€)
                </label>
                <input
                  id="price-max"
                  v-model.number="serviceForm.priceRange!.max"
                  type="number"
                  min="0"
                  step="0.01"
                  class="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div v-else>
              <label for="price-single" class="block text-xs text-gray-500"> Prix (€) </label>
              <input
                id="price-single"
                v-model.number="serviceForm.price"
                type="number"
                min="0"
                step="0.01"
                class="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <!-- Delivery Modes -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Mode de livraison</label>
            <div class="space-y-2">
              <label v-for="mode in deliveryModeOptions" :key="mode" class="flex items-center">
                <input
                  :checked="serviceForm.deliveryModes?.includes(mode)"
                  @change="toggleMultiSelectOption(serviceForm.deliveryModes!, mode)"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span class="ml-3 text-sm text-gray-700">{{ mode }}</span>
              </label>
            </div>
          </div>

          <!-- Locations -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Lieux</label>
            <div class="space-y-2">
              <label v-for="location in locationOptions" :key="location" class="flex items-center">
                <input
                  :checked="serviceForm.locations?.includes(location)"
                  @change="toggleMultiSelectOption(serviceForm.locations!, location)"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span class="ml-3 text-sm text-gray-700">{{ location }}</span>
              </label>
            </div>
          </div>

          <!-- Age Groups -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Groupes d'âge</label>
            <div class="space-y-2">
              <label v-for="ageGroup in ageGroupOptions" :key="ageGroup" class="flex items-center">
                <input
                  :checked="serviceForm.ageGroups?.includes(ageGroup)"
                  @change="toggleMultiSelectOption(serviceForm.ageGroups!, ageGroup)"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span class="ml-3 text-sm text-gray-700">{{ ageGroup }}</span>
              </label>
            </div>
          </div>

          <!-- Session Types -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Types de séance</label>
            <div class="space-y-2">
              <label
                v-for="sessionType in sessionTypeOptions"
                :key="sessionType"
                class="flex items-center"
              >
                <input
                  :checked="serviceForm.sessionTypes?.includes(sessionType)"
                  @change="toggleMultiSelectOption(serviceForm.sessionTypes!, sessionType)"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span class="ml-3 text-sm text-gray-700">{{ sessionType }}</span>
              </label>
            </div>
          </div>

          <!-- Levels -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Niveaux</label>
            <div class="space-y-2">
              <label v-for="level in levelOptions" :key="level" class="flex items-center">
                <input
                  :checked="serviceForm.levels?.includes(level)"
                  @change="toggleMultiSelectOption(serviceForm.levels!, level)"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span class="ml-3 text-sm text-gray-700">{{ level }}</span>
              </label>
            </div>
          </div>

          <!-- Schedule -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-4">Disponibilités</label>
            <div class="space-y-3">
              <div
                v-for="(day, dayKey) in serviceForm.schedule"
                :key="dayKey"
                class="flex items-center justify-between border border-gray-200 rounded-lg p-3"
              >
                <div class="flex-1">
                  <h4 class="text-sm font-medium text-gray-900">
                    {{ dayLabels[dayKey as keyof typeof dayLabels] }}
                  </h4>
                </div>
                <div class="flex space-x-4">
                  <label class="flex items-center">
                    <input
                      v-model="day.morning"
                      type="checkbox"
                      class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">Matin</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="day.afternoon"
                      type="checkbox"
                      class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">Après-midi</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="day.evening"
                      type="checkbox"
                      class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">Soir</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            @click="closeServiceModal"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            @click="saveService"
            :disabled="!serviceForm.name || !serviceForm.category || !serviceForm.subcategory"
            :class="[
              !serviceForm.name || !serviceForm.category || !serviceForm.subcategory
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700',
              'px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
            ]"
          >
            {{ editingService ? 'Modifier' : 'Ajouter' }}
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>

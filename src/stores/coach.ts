import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Coach } from '@/types/coach'
import { coachApi } from '@/services/coachApi'

export const useCoachStore = defineStore('coach', () => {
  // State
  const coaches = ref<Coach[]>([])
  const currentCoach = ref<Coach | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(12)

  // Getters
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

  // Actions
  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  // Fetch coaches with filters
  const fetchCoaches = async (filters?: {
    search?: string
    specialties?: string[]
    location?: string
    minRating?: number
    page?: number
    limit?: number
  }) => {
    try {
      setLoading(true)
      clearError()

      const params = {
        page: filters?.page || currentPage.value,
        limit: filters?.limit || pageSize.value,
        ...filters,
      }

      const response = await coachApi.getCoaches(params)
      
      coaches.value = response.data
      total.value = response.total
      currentPage.value = response.page

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coaches')
      console.error('Error fetching coaches:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch coach by first name
  const fetchCoachByFirstName = async (firstName: string) => {
    try {
      setLoading(true)
      clearError()

      const coach = await coachApi.getCoachByFirstName(firstName)
      currentCoach.value = coach
      
      return coach
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Coach not found')
      console.error('Error fetching coach:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Update coach profile
  const updateCoach = async (id: string, data: Partial<Coach>) => {
    try {
      setLoading(true)
      clearError()

      const updatedCoach = await coachApi.updateCoach(id, data)
      
      // Update in coaches list
      const index = coaches.value.findIndex(coach => coach.id === id)
      if (index !== -1) {
        coaches.value[index] = updatedCoach
      }
      
      // Update current coach if it's the same one
      if (currentCoach.value?.id === id) {
        currentCoach.value = updatedCoach
      }

      return updatedCoach
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update coach')
      console.error('Error updating coach:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Upload coach photo
  const uploadCoachPhoto = async (id: string, file: File, onProgress?: (progress: number) => void) => {
    try {
      setLoading(true)
      clearError()

      const result = await coachApi.uploadPhoto(id, file, onProgress)
      
      // Update coach photo in state
      if (currentCoach.value?.id === id) {
        currentCoach.value.photo = result.photoUrl
      }
      
      const coachIndex = coaches.value.findIndex(coach => coach.id === id)
      if (coachIndex !== -1) {
        coaches.value[coachIndex].photo = result.photoUrl
      }

      return result.photoUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo')
      console.error('Error uploading photo:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get similar coaches
  const getSimilarCoaches = async (coachId: string, limit = 4) => {
    try {
      const similarCoaches = await coachApi.getSimilarCoaches(coachId, limit)
      return similarCoaches
    } catch (err) {
      console.error('Error fetching similar coaches:', err)
      return []
    }
  }

  // Search coaches
  const searchCoaches = async (searchTerm: string) => {
    await fetchCoaches({ search: searchTerm, page: 1 })
  }

  // Filter by specialties
  const filterBySpecialties = async (specialties: string[]) => {
    await fetchCoaches({ specialties, page: 1 })
  }

  // Reset store
  const reset = () => {
    coaches.value = []
    currentCoach.value = null
    loading.value = false
    error.value = null
    total.value = 0
    currentPage.value = 1
  }

  return {
    // State
    coaches,
    currentCoach,
    loading,
    error,
    total,
    currentPage,
    pageSize,
    
    // Getters
    isLoading,
    hasError,
    totalPages,
    
    // Actions
    fetchCoaches,
    fetchCoachByFirstName,
    updateCoach,
    uploadCoachPhoto,
    getSimilarCoaches,
    searchCoaches,
    filterBySpecialties,
    setLoading,
    setError,
    clearError,
    reset,
  }
})

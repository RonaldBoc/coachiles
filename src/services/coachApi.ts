import { api } from '@/utils/api'
import type { Coach } from '@/types/coach'

// API response types
export interface CoachResponse {
  data: Coach[]
  total: number
  page: number
  limit: number
}

export interface CoachCreateRequest {
  firstName: string
  email: string
  phone: string
  bio: string
  location: string
  specialties: string[]
  certifications: string[]
  experience: number
  availability: string
}

export interface CoachUpdateRequest extends Partial<CoachCreateRequest> {
  photo?: string
}

// Coach API service
export const coachApi = {
  // Get all coaches with pagination and filters
  getCoaches: (params?: {
    page?: number
    limit?: number
    search?: string
    specialties?: string[]
    location?: string
    minRating?: number
  }): Promise<CoachResponse> => {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.specialties?.length) {
      params.specialties.forEach((specialty) => searchParams.append('specialties[]', specialty))
    }
    if (params?.location) searchParams.append('location', params.location)
    if (params?.minRating) searchParams.append('minRating', params.minRating.toString())

    return api.get<CoachResponse>(`/coaches?${searchParams.toString()}`)
  },

  // Get coach by firstName (for public profiles)
  getCoachByFirstName: (firstName: string): Promise<Coach> => {
    return api.get<Coach>(`/coaches/by-name/${firstName.toLowerCase()}`)
  },

  // Get coach by ID (for admin/auth purposes)
  getCoachById: (id: string): Promise<Coach> => {
    return api.get<Coach>(`/coaches/${id}`)
  },

  // Create new coach profile
  createCoach: (data: CoachCreateRequest): Promise<Coach> => {
    return api.post<Coach>('/coaches', data)
  },

  // Update coach profile
  updateCoach: (id: string, data: CoachUpdateRequest): Promise<Coach> => {
    return api.patch<Coach>(`/coaches/${id}`, data)
  },

  // Upload coach photo
  uploadPhoto: (
    id: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<{ photoUrl: string }> => {
    return api.upload<{ photoUrl: string }>(`/coaches/${id}/photo`, file, onProgress)
  },

  // Update coach specialties
  updateSpecialties: (id: string, specialties: string[]): Promise<Coach> => {
    return api.patch<Coach>(`/coaches/${id}/specialties`, { specialties })
  },

  // Update coach certifications
  updateCertifications: (id: string, certifications: string[]): Promise<Coach> => {
    return api.patch<Coach>(`/coaches/${id}/certifications`, { certifications })
  },

  // Deactivate coach account
  deactivateCoach: (id: string): Promise<void> => {
    return api.patch<void>(`/coaches/${id}/deactivate`)
  },

  // Get coaches with similar specialties
  getSimilarCoaches: (coachId: string, limit: number = 4): Promise<Coach[]> => {
    return api.get<Coach[]>(`/coaches/${coachId}/similar?limit=${limit}`)
  },
}

export default coachApi

// Error handling utilities for API responses

export interface ApiError {
  message: string
  code?: string | number
  details?: unknown
}

export class ApiException extends Error {
  public code?: string | number
  public details?: unknown

  constructor(message: string, code?: string | number, details?: unknown) {
    super(message)
    this.name = 'ApiException'
    this.code = code
    this.details = details
  }
}

// Handle common API errors
export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiException) {
    return {
      message: error.message,
      code: error.code,
      details: error.details,
    }
  }

  // Axios error handling
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as {
      response?: { status: number; data?: { message?: string; errors?: unknown } }
      request?: unknown
    }

    if (axiosError.response) {
      // Server responded with error status
      const status = axiosError.response.status
      const data = axiosError.response.data

      switch (status) {
        case 400:
          return {
            message: data?.message || 'Invalid request data',
            code: 'BAD_REQUEST',
            details: data?.errors || data,
          }
        case 401:
          return {
            message: 'You are not authorized to perform this action',
            code: 'UNAUTHORIZED',
          }
        case 403:
          return {
            message: 'Access forbidden',
            code: 'FORBIDDEN',
          }
        case 404:
          return {
            message: data?.message || 'Resource not found',
            code: 'NOT_FOUND',
          }
        case 409:
          return {
            message: data?.message || 'Resource already exists',
            code: 'CONFLICT',
          }
        case 422:
          return {
            message: data?.message || 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: data?.errors || data,
          }
        case 429:
          return {
            message: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT',
          }
        case 500:
          return {
            message: 'Internal server error. Please try again later.',
            code: 'SERVER_ERROR',
          }
        default:
          return {
            message: data?.message || `Request failed with status ${status}`,
            code: status.toString(),
            details: data,
          }
      }
    } else if (axiosError.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection and try again.',
        code: 'NETWORK_ERROR',
      }
    }
  }

  // Generic error handling
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'GENERIC_ERROR',
    }
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    details: error,
  }
}

// Get user-friendly error messages
export const getFriendlyErrorMessage = (error: ApiError): string => {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Problème de connexion. Vérifiez votre connexion internet.'
    case 'UNAUTHORIZED':
      return 'Session expirée. Veuillez vous reconnecter.'
    case 'FORBIDDEN':
      return "Vous n'avez pas les permissions nécessaires."
    case 'NOT_FOUND':
      return 'Ressource introuvable.'
    case 'VALIDATION_ERROR':
      return 'Veuillez vérifier les informations saisies.'
    case 'RATE_LIMIT':
      return 'Trop de requêtes. Veuillez patienter.'
    case 'SERVER_ERROR':
      return 'Erreur serveur. Veuillez réessayer plus tard.'
    case 'CONFLICT':
      return 'Cette ressource existe déjà.'
    default:
      return error.message || 'Une erreur inattendue est survenue.'
  }
}

// Validation error helper
export const getValidationErrors = (error: ApiError): Record<string, string[]> => {
  if (error.code === 'VALIDATION_ERROR' && typeof error.details === 'object' && error.details) {
    return error.details as Record<string, string[]>
  }
  return {}
}

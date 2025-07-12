// Development configuration for mock vs real API
export const config = {
  // Toggle between mock data and real API
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true' || import.meta.env.DEV,
  
  // API configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Feature flags
  features: {
    enableProfessionalPhotos: true,
    enableAdvancedFilters: true,
    enableCoachAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enablePayments: import.meta.env.VITE_ENABLE_PAYMENTS === 'true',
  },
}

export default config

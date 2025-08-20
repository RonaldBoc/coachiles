/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_USE_MOCK_DATA?: string
  readonly VITE_ENABLE_ANALYTICS?: string
  readonly VITE_ENABLE_PAYMENTS?: string
  // Comma-separated list of superadmin emails for local development fallback
  readonly VITE_SUPERADMINS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

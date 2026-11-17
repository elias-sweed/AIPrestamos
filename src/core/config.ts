export const APP_NAME = 'AIP Gest'
export const APP_DESCRIPTION = 'Control de Préstamos de Equipos AIP'

export function getSupabaseUrl(): string | undefined {
  return import.meta.env.VITE_SUPABASE_URL
}

export function getSupabaseAnonKey(): string | undefined {
  return import.meta.env.VITE_SUPABASE_ANON_KEY
}

export function isConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey())
}

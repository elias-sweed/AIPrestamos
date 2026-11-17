import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseAnonKey } from '../../core/config'

let _client: SupabaseClient | null = null

export function getSupabaseClientRemote(): SupabaseClient {
  if (_client) return _client
  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()
  if (!url || !anonKey) {
    throw new Error('Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
  }
  _client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'aipgest-auth' },
  })
  return _client
}

export const supabase = getSupabaseClientRemote()

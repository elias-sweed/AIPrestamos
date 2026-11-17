import { Store } from './store'
import { getSupabaseClient } from '../core/supabaseClient'
import type { UserRole } from '../domain/entities/userRole'
import { userRoleFromString } from '../domain/entities/userRole'

export interface AuthState {
  user: { id: string; email: string | null; userMetadata: Record<string, any> } | null
  role: UserRole
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initial: AuthState = {
  user: null,
  role: 'practicante',
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

export class AuthStore extends Store<AuthState> {
  private supabase = getSupabaseClient()

  constructor() {
    super(initial)
    this._init()
  }

  private async _init() {
    try {
      const { data } = await this.supabase.auth.getSession()
      await this._setFromSession(data.session)
    } catch (e) {
      this.value = { ...this.value, error: 'Error al cargar la sesión', isLoading: false }
    }

    this.supabase.auth.onAuthStateChange(async (_event, session) => {
      await this._setFromSession(session)
    })
  }

  private async _setFromSession(session: any) {
    const user = session?.user
    let role: UserRole = 'practicante'

    if (user) {
      // Primero intentar obtener el rol de user_metadata
      const metadataRole = user.user_metadata?.rol
      if (metadataRole) {
        role = userRoleFromString(metadataRole)
      } else {
      // Si no está en metadata, consultar la tabla usuarios
        try {
          const { data: perfil } = await this.supabase
            .from('usuarios')
            .select('rol')
            .eq('id', user.id)
            .maybeSingle()
          if (perfil?.rol) {
            role = userRoleFromString(perfil.rol)
          }
        } catch (_) {
          // Si falla la consulta, mantener practicante por defecto
        }
      }
    }

    this.value = {
      user: user ? { id: user.id, email: user.email, userMetadata: user.user_metadata ?? {} } : null,
      role,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
    }
  }

  async login(email: string, password: string): Promise<{ error: string | null }> {
    this.value = { ...this.value, isLoading: true, error: null }
    try {
      const { error } = await this.supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return { error: null }
    } catch (e: any) {
      const msg = this._mapError(e.message)
      this.value = { ...this.value, isLoading: false, error: msg }
      return { error: msg }
    } finally {
      this.value = { ...this.value, isLoading: false }
    }
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut()
    this.value = { ...initial, isLoading: false }
  }

  private _mapError(message: string): string {
    const m = message.toLowerCase()
    if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos'
    if (m.includes('email not confirmed')) return 'Correo no confirmado. Revisa tu bandeja de entrada.'
    if (m.includes('failed to fetch') || m.includes('network')) return 'Error de conexión. Verifica tu internet.'
    return 'Error de inicio de sesión. Intente nuevamente.'
  }

  getRole(): UserRole {
    return this.value.role
  }
}

export const authStore = new AuthStore()

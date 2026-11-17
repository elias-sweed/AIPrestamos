export type UserRole = 'encargado_aip' | 'practicante'

export function userRoleFromString(value?: string | null): UserRole {
  return value === 'encargado_aip' ? 'encargado_aip' : 'practicante'
}

export const ROLE_LABELS: Record<UserRole, string> = {
  encargado_aip: 'Encargado AIP',
  practicante: 'Practicante',
}

export const PERMISSIONS = {
  canManageEquipos: (role: UserRole) => role === 'encargado_aip',
  canManageDocentes: (role: UserRole) => role === 'encargado_aip',
  canManageUsuarios: (role: UserRole) => role === 'encargado_aip',
  canEditEquipo: (role: UserRole) => role === 'encargado_aip',
  canEditDocente: (role: UserRole) => role === 'encargado_aip',
  canDeleteDocente: (role: UserRole) => role === 'encargado_aip',
  canChangeEquipoEstado: (role: UserRole) => role === 'encargado_aip',
  canViewFullDashboard: (role: UserRole) => role === 'encargado_aip',
  canViewRecentActivity: (role: UserRole) => role === 'encargado_aip',
  canViewEquiposMantenimiento: (role: UserRole) => role === 'encargado_aip',
  canViewReportes: (role: UserRole) => role === 'encargado_aip',
  canCreatePrestamo: () => true,
  canCreateDevolucion: () => true,
} as const

// Rutas restringidas para practicante (equipos, docentes, reportes)
export const RESTRICTED_ROUTES = ['/dashboard/equipos', '/dashboard/docentes', '/dashboard/reportes']

export function canAccess(location: string, role: UserRole): boolean {
  if (role === 'encargado_aip') return true
  return !RESTRICTED_ROUTES.some((r) => location.startsWith(r))
}

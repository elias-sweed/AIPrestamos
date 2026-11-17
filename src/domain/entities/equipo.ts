export type EquipoEstado = 'disponible' | 'prestado' | 'mantenimiento' | 'dado_de_baja'
export type EquipoTipo = 'laptop_dell' | 'laptop_hp' | 'cargador' | 'extension' | 'otro_accesorio'

export interface Equipo {
  id: string
  codigoPatrimonial: string
  tipo: EquipoTipo
  marca?: string | null
  modelo?: string | null
  numeroSerie?: string | null
  estado: EquipoEstado
  observaciones?: string | null
  imagenUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface EquipoPrestamoInfo {
  id: string
  equipoId: string
  equipoCodigo: string
  equipoNombre: string
  equipoTipo: string
  fechaDevolucionReal?: string | null
  observacionesDevolucion?: string | null
}

export function equipoNombre(e: Equipo): string {
  if (e.marca && e.modelo) return `${e.marca} ${e.modelo}`
  if (e.marca) return e.marca
  if (e.modelo) return e.modelo
  return e.codigoPatrimonial
}

export const ESTADO_LABELS: Record<EquipoEstado, string> = {
  disponible: 'Disponible',
  prestado: 'Prestado',
  mantenimiento: 'Mantenimiento',
  dado_de_baja: 'Dado de baja',
}

export const TIPO_LABELS: Record<EquipoTipo, string> = {
  laptop_dell: 'Laptop Dell',
  laptop_hp: 'Laptop HP',
  cargador: 'Cargador',
  extension: 'Extensión',
  otro_accesorio: 'Otro accesorio',
}

export function estadoColor(estado: EquipoEstado): string {
  switch (estado) {
    case 'disponible': return '#2E7D32'
    case 'prestado': return '#1565C0'
    case 'mantenimiento': return '#E65100'
    case 'dado_de_baja': return '#C62828'
  }
}

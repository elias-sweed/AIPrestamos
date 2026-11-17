export type Turno = 'mañana' | 'tarde'

export interface Docente {
  id: string
  nombres: string
  apellidos: string
  grado?: string | null
  seccion?: string | null
  turno?: Turno | null
  activo: boolean
  createdAt: string
  updatedAt: string
}

export function nombreCompleto(d: Docente): string {
  return `${d.nombres} ${d.apellidos}`
}

export function turnoLabel(turno?: Turno | null): string {
  if (turno === 'mañana') return 'Mañana'
  if (turno === 'tarde') return 'Tarde'
  return '—'
}

export type PrestamoEstado = 'activo' | 'parcial' | 'devuelto'

export interface EquipoPrestamoInfo {
  id: string
  equipoId: string
  equipoCodigo: string
  equipoNombre: string
  equipoTipo: string
  fechaDevolucionReal?: string | null
  observacionesDevolucion?: string | null
}

export interface Prestamo {
  id: string
  docenteId: string
  docenteNombre: string
  encargadoId: string
  encargadoNombre: string
  fechaHoraInicio: string
  fechaHoraFinEstimada?: string | null
  estado: PrestamoEstado
  observaciones?: string | null
  createdAt: string
  updatedAt: string
  equipos: EquipoPrestamoInfo[]
}

export function cantidadEquipos(p: Prestamo): number {
  return p.equipos.length
}

export function equiposDevueltos(p: Prestamo): number {
  return p.equipos.filter((e) => e.fechaDevolucionReal).length
}

export function equiposPendientes(p: Prestamo): number {
  return p.equipos.filter((e) => !e.fechaDevolucionReal).length
}

export const ESTADO_LABELS: Record<PrestamoEstado, string> = {
  activo: 'Activo',
  parcial: 'Parcial',
  devuelto: 'Devuelto',
}

export function estadoColor(estado: PrestamoEstado): string {
  switch (estado) {
    case 'activo': return '#1565C0'
    case 'parcial': return '#E65100'
    case 'devuelto': return '#2E7D32'
  }
}

import type { Equipo } from '../../domain/entities/equipo'

export interface EquipoRepository {
  getEquipos({ search, estado }?: { search?: string; estado?: string }): Promise<Equipo[]>
  getEquipoById(id: string): Promise<Equipo>
  createEquipo(equipo: Omit<Equipo, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Equipo>
  updateEquipo(equipo: Equipo): Promise<Equipo>
  cambiarEstado(id: string, nuevoEstado: string): Promise<void>
  syncStatus(): { connected: boolean; pending: number }
}

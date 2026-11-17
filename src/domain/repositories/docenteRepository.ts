import type { Docente } from '../../domain/entities/docente'

export interface DocenteRepository {
  getDocentes({ search, soloActivos }?: { search?: string; soloActivos?: boolean }): Promise<Docente[]>
  getDocenteById(id: string): Promise<Docente>
  createDocente(docente: Omit<Docente, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Docente>
  updateDocente(docente: Docente): Promise<Docente>
  desactivarDocente(id: string): Promise<void>
  eliminarDocente(id: string): Promise<void>
  syncStatus(): { connected: boolean; pending: number }
}

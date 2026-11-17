import type { Prestamo } from '../../domain/entities/prestamo'

export interface PrestamoRepository {
  getPrestamos({ estado }?: { estado?: string }): Promise<Prestamo[]>
  getPrestamoById(id: string): Promise<Prestamo>
  createPrestamo(
    prestamoData: { docenteId: string; encargadoId: string; observaciones?: string | null },
    equipos: { equipoId: string }[],
  ): Promise<Prestamo>
  updatePrestamo(id: string, data: Record<string, unknown>): Promise<Prestamo>
  addEquipos(prestamoId: string, equipoIds: string[]): Promise<void>
  removeEquipo(prestamoEquipoId: string): Promise<void>
  deletePrestamo(id: string): Promise<void>
}

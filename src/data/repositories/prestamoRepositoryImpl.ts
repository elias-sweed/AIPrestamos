import type { PrestamoRepository } from '../../domain/repositories/prestamoRepository'
import { prestamoRemote } from '../remote/prestamoRemoteDatasource'

export const prestamoRepositoryImpl: PrestamoRepository = {
  async getPrestamos({ estado } = {}) {
    return prestamoRemote.getPrestamos({ estado })
  },

  async getPrestamoById(id) {
    return prestamoRemote.getPrestamoById(id)
  },

  async createPrestamo(prestamoData: { docenteId: string; encargadoId: string; observaciones?: string | null }, equipos: { equipoId: string; fechaDevolucionReal?: string | null }[]) {
    return prestamoRemote.createPrestamo(
      {
        docente_id: prestamoData.docenteId,
        encargado_id: prestamoData.encargadoId,
        observaciones: prestamoData.observaciones ?? null,
      },
      equipos.map((e) => ({ equipo_id: e.equipoId, fecha_devolucion_real: e.fechaDevolucionReal ?? null }))
    )
  },

  async updatePrestamo(id, data) {
    return prestamoRemote.updatePrestamo(id, data)
  },

  async addEquipos(prestamoId, equipoIds) {
    return prestamoRemote.addEquipos(prestamoId, equipoIds)
  },

  async removeEquipo(prestamoEquipoId) {
    return prestamoRemote.removeEquipo(prestamoEquipoId)
  },

  async deletePrestamo(_id: string) {
    throw new Error('Prestamo deletion not implemented')
  },
}

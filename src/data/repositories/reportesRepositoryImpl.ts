import type { ReportesRepository } from '../../domain/repositories/reportesRepository'
import { reportesRemote } from '../remote/reportesRemoteDatasource'
import { reportCacheLocal } from '../local/reportCacheLocal'

export const reportesRepositoryImpl: ReportesRepository = {
  async getGeneral() {
    const cacheKey = 'reporte_general'
    try {
      const data = await reportesRemote.getGeneral()
      await reportCacheLocal.upsert(cacheKey, data)
      return data
    } catch (_) {
      const cached = await reportCacheLocal.get<any>(cacheKey)
      if (cached) return cached
      throw _
    }
  },

  async getDiario(fecha: string) {
    const cacheKey = `reporte_diario_${fecha}`
    try {
      const data = await reportesRemote.getDiario(fecha)
      await reportCacheLocal.upsert(cacheKey, data)
      return data
    } catch (_) {
      const cached = await reportCacheLocal.get<any>(cacheKey)
      if (cached) return cached
      throw _
    }
  },

  async getPorDocente(docenteId: string) {
    return reportesRemote.getPorDocente(docenteId)
  },

  async getPorEquipo(equipoId: string) {
    return reportesRemote.getPorEquipo(equipoId)
  },

  async getRangoFechas(inicio: string, fin: string) {
    return reportesRemote.getRangoFechas(inicio, fin)
  },
}

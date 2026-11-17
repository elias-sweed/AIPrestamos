import type { ReporteGeneral } from '../../domain/entities/reportes'
import type { ReporteDiario } from '../../domain/entities/reportes'
import type { ReporteDocente } from '../../domain/entities/reportes'
import type { ReporteEquipo } from '../../domain/entities/reportes'
import type { ReporteRangoFechas } from '../../domain/entities/reportes'

export interface ReportesRepository {
  getGeneral(): Promise<ReporteGeneral>
  getDiario(fecha: string): Promise<ReporteDiario>
  getPorDocente(docenteId: string): Promise<ReporteDocente>
  getPorEquipo(equipoId: string): Promise<ReporteEquipo>
  getRangoFechas(inicio: string, fin: string): Promise<ReporteRangoFechas>
}

export interface ReporteGeneral {
  totalPrestamos: number
  prestamosActivos: number
  prestamosDevueltos: number
  prestamosParciales: number
  totalEquipos: number
  equiposDisponibles: number
  equiposPrestados: number
  equiposMantenimiento: number
  totalDocentes: number
  docentesActivos: number
  docentesInactivos: number
  prestamosPorMes: { mes: string; cantidad: number }[]
  equiposMasPrestados: { equipo: string; cantidad: number }[]
  docentesConMasPrestamos: { docente: string; cantidad: number }[]
}

export interface ReporteDiario {
  fecha: string
  prestamosCreados: number
  devolucionesRegistradas: number
  equiposPrestados: number
  equiposDevueltos: number
}

export interface ReporteDocente {
  docenteId: string
  docenteNombre: string
  totalPrestamos: number
  prestamosActivos: number
  prestamosDevueltos: number
  equiposPrestados: number
}

export interface ReporteEquipo {
  equipoId: string
  codigoPatrimonial: string
  nombre: string
  tipo: string
  totalPrestamos: number
  vecesPrestado: number
  estadoActual: string
}

export interface ReporteRangoFechas {
  fechaInicio: string
  fechaFin: string
  prestamos: PrestamoResumen[]
  resumen: {
    totalPrestamos: number
    prestamosActivos: number
    prestamosDevueltos: number
    equiposPrestados: number
    equiposDevueltos: number
  }
}

export interface PrestamoResumen {
  id: string
  docenteNombre: string
  fecha: string
  estado: string
  cantidadEquipos: number
}

export interface ChartData {
  label: string
  value: number
}

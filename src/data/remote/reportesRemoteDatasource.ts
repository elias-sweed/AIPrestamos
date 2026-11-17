import { supabase } from './supabaseClient'

export const reportesRemote = {
  async getGeneral() {
    const [prestamos, equipos, docentes] = await Promise.all([
      supabase.from('prestamos').select('estado, created_at'),
      supabase.from('equipos').select('estado, codigo_patrimonial, tipo, marca, modelo'),
      supabase.from('docentes').select('activo, nombre_completo'),
    ])
    const p = prestamos.data ?? []
    const e = equipos.data ?? []
    const d = docentes.data ?? []
    const porMes: Record<string, number> = {}
    p.forEach((x) => {
      const mes = (x.created_at ?? '').slice(0, 7)
      porMes[mes] = (porMes[mes] || 0) + 1
    })
    return {
      totalPrestamos: p.length,
      prestamosActivos: p.filter((x: any) => x.estado === 'activo').length,
      prestamosDevueltos: p.filter((x: any) => x.estado === 'devuelto').length,
      prestamosParciales: p.filter((x: any) => x.estado === 'parcial').length,
      totalEquipos: e.length,
      equiposDisponibles: e.filter((x: any) => x.estado === 'disponible').length,
      equiposPrestados: e.filter((x: any) => x.estado === 'prestado').length,
      equiposMantenimiento: e.filter((x: any) => x.estado === 'mantenimiento').length,
      totalDocentes: d.length,
      docentesActivos: d.filter((x: any) => x.activo).length,
      docentesInactivos: d.filter((x: any) => !x.activo).length,
      prestamosPorMes: Object.entries(porMes).map(([mes, cantidad]) => ({ mes, cantidad })),
      equiposMasPrestados: [],
      docentesConMasPrestamos: [],
    }
  },

  async getDiario(fecha: string) {
    const { data, error } = await supabase
      .from('prestamos')
      .select('estado, created_at, updated_at')
      .gte('created_at', `${fecha}T00:00:00`)
      .lte('created_at', `${fecha}T23:59:59`)
    if (error) throw error
    const p = data ?? []
    return {
      fecha,
      prestamosCreados: p.length,
      devolucionesRegistradas: p.filter((x: any) => x.estado === 'devuelto').length,
      equiposPrestados: p.filter((x: any) => x.estado === 'activo' || x.estado === 'parcial').length,
      equiposDevueltos: p.filter((x: any) => x.estado === 'devuelto').length,
    }
  },

  async getPorDocente(docenteId: string) {
    const { data, error } = await supabase
      .from('prestamos')
      .select('estado, created_at')
      .eq('docente_id', docenteId)
    if (error) throw error
    const p = data ?? []
    return {
      docenteId,
      docenteNombre: '',
      totalPrestamos: p.length,
      prestamosActivos: p.filter((x: any) => x.estado === 'activo').length,
      prestamosDevueltos: p.filter((x: any) => x.estado === 'devuelto').length,
      equiposPrestados: 0,
    }
  },

  async getPorEquipo(equipoId: string) {
    const { data, error } = await supabase
      .from('prestamo_equipos')
      .select('*, prestamos(estado)')
      .eq('equipo_id', equipoId)
    if (error) throw error
    const pe = data ?? []
    return {
      equipoId,
      codigoPatrimonial: '',
      nombre: '',
      tipo: '',
      totalPrestamos: pe.length,
      vecesPrestado: pe.length,
      estadoActual: '',
    }
  },

  async getRangoFechas(inicio: string, fin: string) {
    const { data, error } = await supabase
      .from('prestamos')
      .select('*, docentes:docente_id(nombre_completo)')
      .gte('created_at', `${inicio}T00:00:00`)
      .lte('created_at', `${fin}T23:59:59`)
      .order('created_at', { ascending: false })
    if (error) throw error
    const p = data ?? []
    return {
      fechaInicio: inicio,
      fechaFin: fin,
      prestamos: p.map((e: any) => ({
        id: e.id,
        docenteNombre: e.docentes?.nombre_completo ?? '',
        fecha: e.created_at,
        estado: e.estado,
        cantidadEquipos: 0,
      })),
      resumen: {
        totalPrestamos: p.length,
        prestamosActivos: p.filter((x: any) => x.estado === 'activo').length,
        prestamosDevueltos: p.filter((x: any) => x.estado === 'devuelto').length,
        equiposPrestados: 0,
        equiposDevueltos: 0,
      },
    }
  },
}

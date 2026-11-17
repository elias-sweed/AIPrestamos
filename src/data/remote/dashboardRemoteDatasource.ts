import { supabase } from './supabaseClient'

export const dashboardRemote = {
  async getStats() {
    const [prestamos, equipos, docentes] = await Promise.all([
      supabase.from('prestamos').select('estado'),
      supabase.from('equipos').select('estado'),
      supabase.from('docentes').select('activo'),
    ])
    const p = prestamos.data ?? []
    const e = equipos.data ?? []
    const d = docentes.data ?? []
    return {
      prestamosActivos: p.filter((x: any) => x.estado === 'activo').length,
      equiposDisponibles: e.filter((x: any) => x.estado === 'disponible').length,
      equiposPrestados: e.filter((x: any) => x.estado === 'prestado').length,
      equiposMantenimiento: e.filter((x: any) => x.estado === 'mantenimiento').length,
      totalDocentes: d.length,
      docentesActivos: d.filter((x: any) => x.activo).length,
    }
  },

  async getRecentActivity() {
    const { data, error } = await supabase
      .from('prestamos')
      .select('*, docentes:docente_id(nombre_completo)')
      .order('created_at', { ascending: false })
      .limit(10)
    if (error) throw error
    return (data as any[] ?? []).map((e) => ({
      id: e.id,
      tipo: 'prestamo_creado',
      descripcion: `Préstamo creado para ${e.docentes?.nombre_completo ?? 'docente'}`,
      fecha: e.created_at,
      prestamoId: e.id,
    }))
  },
}

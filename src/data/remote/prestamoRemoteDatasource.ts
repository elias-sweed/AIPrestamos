import { supabase } from './supabaseClient'

export const prestamoRemote = {
  async getPrestamos({ estado }: { estado?: string } = {}) {
    let q = supabase.from('prestamos').select(`
      *,
      docentes:docente_id(nombre_completo),
      usuarios:encargado_id(nombre_completo),
      prestamo_equipos(*, equipos( codigo_patrimonial, marca, modelo, tipo ))
    `)
    if (estado) q = q.eq('estado', estado)
    const { data, error } = await q.order('fecha_hora_inicio', { ascending: false })
    if (error) throw error
    return (data as any[] ?? []).map((e) => ({
      id: e.id,
      docenteId: e.docente_id,
      docenteNombre: e.docentes?.nombre_completo ?? '',
      encargadoId: e.encargado_id,
      encargadoNombre: e.usuarios?.nombre_completo ?? '',
      fechaHoraInicio: e.fecha_hora_inicio,
      fechaHoraFinEstimada: e.fecha_hora_fin_estimada ?? null,
      estado: e.estado,
      observaciones: e.observaciones ?? null,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
      equipos: (e.prestamo_equipos ?? []).map((pe: any) => ({
        id: pe.id,
        equipoId: pe.equipo_id,
        equipoCodigo: pe.equipos?.codigo_patrimonial ?? '',
        equipoNombre: pe.equipos ? (pe.equipos.marca && pe.equipos.modelo ? `${pe.equipos.marca} ${pe.equipos.modelo}` : pe.equipos.marca || pe.equipos.modelo || pe.equipos.codigo_patrimonial) : '',
        equipoTipo: pe.equipos?.tipo ?? '',
        fechaDevolucionReal: pe.fecha_devolucion_real ?? null,
        observacionesDevolucion: pe.observaciones_devolucion ?? null,
      })),
    }))
  },

  async getPrestamoById(id: string) {
    const { data, error } = await supabase
      .from('prestamos')
      .select(`
        *,
        docentes:docente_id(nombre_completo),
        usuarios:encargado_id(nombre_completo),
        prestamo_equipos(*, equipos( codigo_patrimonial, marca, modelo, tipo ))
      `)
      .eq('id', id)
      .single()
    if (error) throw error
    const e = data
    return {
      id: e.id,
      docenteId: e.docente_id,
      docenteNombre: e.docentes?.nombre_completo ?? '',
      encargadoId: e.encargado_id,
      encargadoNombre: e.usuarios?.nombre_completo ?? '',
      fechaHoraInicio: e.fecha_hora_inicio,
      fechaHoraFinEstimada: e.fecha_hora_fin_estimada ?? null,
      estado: e.estado,
      observaciones: e.observaciones ?? null,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
      equipos: (e.prestamo_equipos ?? []).map((pe: any) => ({
        id: pe.id,
        equipoId: pe.equipo_id,
        equipoCodigo: pe.equipos?.codigo_patrimonial ?? '',
        equipoNombre: pe.equipos ? (pe.equipos.marca && pe.equipos.modelo ? `${pe.equipos.marca} ${pe.equipos.modelo}` : pe.equipos.marca || pe.equipos.modelo || pe.equipos.codigo_patrimonial) : '',
        equipoTipo: pe.equipos?.tipo ?? '',
        fechaDevolucionReal: pe.fecha_devolucion_real ?? null,
        observacionesDevolucion: pe.observaciones_devolucion ?? null,
      })),
    }
  },

  async createPrestamo(prestamoJson: Record<string, unknown>, equiposJson: Record<string, unknown>[]) {
    const { data, error } = await supabase
      .from('prestamos')
      .insert(prestamoJson)
      .select(`
        *,
        docentes:docente_id(nombre_completo),
        usuarios:encargado_id(nombre_completo)
      `)
      .single()
    if (error) throw error
    const prestamo = data
    if (equiposJson.length > 0) {
      const rows = equiposJson.map((e) => ({ ...e, prestamo_id: prestamo.id, fecha_devolucion_real: null }))
      const { error: e2 } = await supabase.from('prestamo_equipos').insert(rows)
      if (e2) {
        await supabase.from('prestamos').delete().eq('id', prestamo.id)
        throw e2
      }
    }
    return prestamo
  },

  async updatePrestamo(id: string, data: Record<string, unknown>) {
    const { data: res, error } = await supabase
      .from('prestamos')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        docentes:docente_id(nombre_completo),
        usuarios:encargado_id(nombre_completo),
        prestamo_equipos(*, equipos( codigo_patrimonial, marca, modelo, tipo ))
      `)
      .single()
    if (error) throw error
    return res
  },

  async addEquipos(prestamoId: string, equipoIds: string[]) {
    if (equipoIds.length === 0) return
    const rows = equipoIds.map((id) => ({ prestamo_id: prestamoId, equipo_id: id, fecha_devolucion_real: null }))
    const { error } = await supabase.from('prestamo_equipos').insert(rows)
    if (error) throw error
  },

  async removeEquipo(prestamoEquipoId: string) {
    const { error } = await supabase.from('prestamo_equipos').delete().eq('id', prestamoEquipoId)
    if (error) throw error
  },
}

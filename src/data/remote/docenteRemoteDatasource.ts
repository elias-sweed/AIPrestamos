import { supabase } from './supabaseClient'

export const docenteRemote = {
  async getDocentes({ search, soloActivos }: { search?: string; soloActivos?: boolean } = {}) {
    let q = supabase.from('docentes').select('*')
    if (soloActivos) q = q.eq('activo', true)
    if (search) {
      q = q.or(`nombre_completo.ilike.%${search}%,grado.ilike.%${search}%,seccion.ilike.%${search}%`)
    }
    const { data, error } = await q.order('nombre_completo')
    if (error) throw error
    return (data as any[] ?? []).map((e) => {
      let grado: string | null = null
      let seccion: string | null = null
      let turno: string | null = null
      if (e.departamento) {
        try {
          const meta = typeof e.departamento === 'string' ? JSON.parse(e.departamento) : e.departamento
          grado = meta.grado ?? null
          seccion = meta.seccion ?? null
          turno = meta.turno ?? null
        } catch {}
      }
      const nombreCompleto = e.nombre_completo ?? ''
      const parts = nombreCompleto.trim().split(' ')
      return {
        id: e.id,
        nombres: parts[0] ?? '',
        apellidos: parts.length > 1 ? parts.slice(1).join(' ') : '',
        grado,
        seccion,
        turno,
        activo: e.activo ?? true,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
      }
    })
  },

  async getDocenteById(id: string) {
    const { data, error } = await supabase.from('docentes').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async createDocente(json: Record<string, unknown>) {
    const { data, error } = await supabase.from('docentes').insert(json).select().single()
    if (error) throw error
    return data
  },

  async updateDocente(id: string, json: Record<string, unknown>) {
    const { data, error } = await supabase.from('docentes').update(json).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async desactivarDocente(id: string) {
    const { error } = await supabase.from('docentes').update({ activo: false }).eq('id', id)
    if (error) throw error
  },

  async eliminarDocente(id: string) {
    const { error } = await supabase.from('docentes').delete().eq('id', id)
    if (error) throw error
  },
}

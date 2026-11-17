import { supabase } from './supabaseClient'

export const equipoRemote = {
  async getEquipos({ search, estado }: { search?: string; estado?: string } = {}) {
    let q = supabase.from('equipos').select('*')
    if (estado) q = q.eq('estado', estado)
    if (search) {
      q = q.or(`codigo_patrimonial.ilike.%${search}%,marca.ilike.%${search}%,modelo.ilike.%${search}%`)
    }
    const { data, error } = await q.order('codigo_patrimonial')
    if (error) throw error
    return (data as any[] ?? []).map((e) => ({
      id: e.id,
      codigoPatrimonial: e.codigo_patrimonial,
      tipo: e.tipo,
      marca: e.marca ?? null,
      modelo: e.modelo ?? null,
      numeroSerie: e.numero_serie ?? null,
      estado: e.estado,
      observaciones: e.observaciones ?? null,
      imagenUrl: e.imagen_url ?? null,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    }))
  },

  async getEquipoById(id: string) {
    const { data, error } = await supabase.from('equipos').select('*').eq('id', id).single()
    if (error) throw error
    const e = data
    return {
      id: e.id,
      codigoPatrimonial: e.codigo_patrimonial,
      tipo: e.tipo,
      marca: e.marca ?? null,
      modelo: e.modelo ?? null,
      numeroSerie: e.numero_serie ?? null,
      estado: e.estado,
      observaciones: e.observaciones ?? null,
      imagenUrl: e.imagen_url ?? null,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    }
  },

  async createEquipo(json: Record<string, unknown>) {
    const { data, error } = await supabase.from('equipos').insert(json).select().single()
    if (error) throw error
    return data
  },

  async updateEquipo(id: string, json: Record<string, unknown>) {
    const { data, error } = await supabase.from('equipos').update(json).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async cambiarEstado(id: string, nuevoEstado: string) {
    const { error } = await supabase.from('equipos').update({ estado: nuevoEstado }).eq('id', id)
    if (error) throw error
  },
}

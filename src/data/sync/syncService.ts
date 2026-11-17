import { supabase } from '../../data/remote/supabaseClient'
import { equipoLocal, docenteLocal, syncQueueLocal } from '../local'
import { ConnectivityService } from './connectivityService'

const connectivity = new ConnectivityService()

export class SyncService {
  private _syncing = false

  async syncEquipos(): Promise<void> {
    if (!connectivity.isOnline) return
    try {
      const { data, error } = await supabase.from('equipos').select('*').order('updated_at')
      if (error) throw error
      const equipos = (data as any[] ?? []).map((e) => ({
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
        syncedAt: new Date().toISOString(),
      }))
      await equipoLocal.upsertAll(equipos as any)
    } catch (_) {
      // silencioso: se usa caché local
    }
  }

  async syncDocentes(): Promise<void> {
    if (!connectivity.isOnline) return
    try {
      const { data, error } = await supabase.from('docentes').select('*').order('updated_at')
      if (error) throw error
      const docentes = (data as any[] ?? []).map((e) => {
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
        return {
          id: e.id,
          nombres: (e.nombre_completo ?? '').split(' ')[0] ?? '',
          apellidos: ((e.nombre_completo ?? '') as string).trim().split(' ').slice(1).join(' ') ?? '',
          grado,
          seccion,
          turno,
          activo: e.activo ?? true,
          createdAt: e.created_at,
          updatedAt: e.updated_at,
          syncedAt: new Date().toISOString(),
        }
      })
      await docenteLocal.upsertAll(docentes as any)
    } catch (_) {
      // silencioso
    }
  }

  async processQueue(): Promise<void> {
    if (!connectivity.isOnline) return
    const queue = await syncQueueLocal.getAll()
    for (const entry of queue) {
      if (entry.retryCount >= 5) continue
      try {
        const payload = JSON.parse(entry.payload) as Record<string, unknown>
        switch (entry.operation) {
          case 'CREATE':
            await supabase.from(entry.entity).insert(payload)
            break
          case 'UPDATE':
            await supabase.from(entry.entity).update(payload).eq('id', entry.entityId)
            break
          case 'DELETE':
            await supabase.from(entry.entity).delete().eq('id', entry.entityId)
            break
          case 'CAMBIAR_ESTADO':
            await supabase.from('equipos').update({ estado: payload.estado }).eq('id', entry.entityId)
            break
          case 'DESACTIVAR_DOCENTE':
            await supabase.from('docentes').update({ activo: false }).eq('id', entry.entityId)
            break
          case 'ELIMINAR_DOCENTE':
            await supabase.from('docentes').delete().eq('id', entry.entityId)
            break
        }
        await syncQueueLocal.remove(entry.id)
      } catch (e) {
        await syncQueueLocal.incrementRetry(entry.id, String(e))
      }
    }
  }

  async pendingCount(): Promise<number> {
    return syncQueueLocal.pendingCount()
  }

  get isOnline(): boolean {
    return connectivity.isOnline
  }

  get syncing(): boolean {
    return this._syncing
  }

  set syncing(v: boolean) {
    this._syncing = v
  }
}

export const syncService = new SyncService()

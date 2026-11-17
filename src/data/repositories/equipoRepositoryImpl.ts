import type { EquipoRepository } from '../../domain/repositories/equipoRepository'
import type { Equipo } from '../../domain/entities/equipo'
import { equipoLocal } from '../local/equipoLocal'
import { equipoRemote } from '../remote/equipoRemoteDatasource'
import { syncQueueLocal } from '../local/syncQueueLocal'
import { ConnectivityService } from '../sync/connectivityService'

const connectivity = new ConnectivityService()

export const equipoRepositoryImpl: EquipoRepository = {
  async getEquipos({ search, estado } = {}) {
    if (connectivity.isOnline) {
      try {
        const lista: any = await equipoRemote.getEquipos({ search, estado })
        await equipoLocal.upsertAll(lista)
        return lista
      } catch (_) {
        return equipoLocal.getAll()
      }
    }
    return equipoLocal.getAll()
  },

  async getEquipoById(id: string): Promise<Equipo> {
    const cached = await equipoLocal.getById(id)
    if (cached) return cached
    const equipo: any = await equipoRemote.getEquipoById(id)
    await equipoLocal.insert(equipo)
    return equipo
  },

  async createEquipo(equipo: Omit<Equipo, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Equipo> {
    const now = new Date().toISOString()
    const model: Equipo = { ...equipo, id: equipo.id || crypto.randomUUID(), createdAt: now, updatedAt: now }
    await equipoLocal.insert(model)
    if (connectivity.isOnline) {
      try {
        const created: any = await equipoRemote.createEquipo(model as unknown as Record<string, unknown>)
        await equipoLocal.markSynced(created.id)
        return { ...model, ...created }
      } catch (_) {
        await syncQueueLocal.enqueue({
          entity: 'equipos',
          entityId: model.id,
          operation: 'CREATE',
          payload: JSON.stringify(model),
          createdAt: now,
        })
        return model
      }
    } else {
      await syncQueueLocal.enqueue({
        entity: 'equipos',
        entityId: model.id,
        operation: 'CREATE',
        payload: JSON.stringify(model),
        createdAt: now,
      })
      return model
    }
  },

  async updateEquipo(equipo: Equipo): Promise<Equipo> {
    await equipoLocal.update(equipo)
    if (connectivity.isOnline) {
      try {
        const updated: any = await equipoRemote.updateEquipo(equipo.id, equipo as unknown as Record<string, unknown>)
        await equipoLocal.markSynced(updated.id)
        return updated
      } catch (_) {
        await syncQueueLocal.enqueue({
          entity: 'equipos',
          entityId: equipo.id,
          operation: 'UPDATE',
          payload: JSON.stringify(equipo),
          createdAt: new Date().toISOString(),
        })
        return equipo
      }
    } else {
      await syncQueueLocal.enqueue({
        entity: 'equipos',
        entityId: equipo.id,
        operation: 'UPDATE',
        payload: JSON.stringify(equipo),
        createdAt: new Date().toISOString(),
      })
      return equipo
    }
  },

  async cambiarEstado(id: string, nuevoEstado: string): Promise<void> {
    if (connectivity.isOnline) {
      try {
        await equipoRemote.cambiarEstado(id, nuevoEstado)
      } catch (_) {
        await syncQueueLocal.enqueue({
          entity: 'equipos',
          entityId: id,
          operation: 'CAMBIAR_ESTADO',
          payload: JSON.stringify({ id, estado: nuevoEstado }),
          createdAt: new Date().toISOString(),
        })
      }
    } else {
      await syncQueueLocal.enqueue({
        entity: 'equipos',
        entityId: id,
        operation: 'CAMBIAR_ESTADO',
        payload: JSON.stringify({ id, estado: nuevoEstado }),
        createdAt: new Date().toISOString(),
      })
    }
  },

  syncStatus() {
    return { connected: connectivity.isOnline, pending: 0 }
  },
}

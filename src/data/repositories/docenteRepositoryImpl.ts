import type { DocenteRepository } from '../../domain/repositories/docenteRepository'
import type { Docente } from '../../domain/entities/docente'
import { docenteLocal } from '../local/docenteLocal'
import { docenteRemote } from '../remote/docenteRemoteDatasource'
import { syncQueueLocal } from '../local/syncQueueLocal'
import { ConnectivityService } from '../sync/connectivityService'

const connectivity = new ConnectivityService()

export const docenteRepositoryImpl: DocenteRepository = {
  async getDocentes({ search, soloActivos } = {}) {
    if (connectivity.isOnline) {
      try {
        const lista: any = await docenteRemote.getDocentes({ search, soloActivos })
        await docenteLocal.upsertAll(lista)
        return lista
      } catch (_) {
        return docenteLocal.getAll()
      }
    }
    return docenteLocal.getAll()
  },

  async getDocenteById(id: string): Promise<Docente> {
    const cached = await docenteLocal.getById(id)
    if (cached) return cached
    const docente: any = await docenteRemote.getDocenteById(id)
    await docenteLocal.insert(docente)
    return docente
  },

  async createDocente(docente: Omit<Docente, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Docente> {
    const now = new Date().toISOString()
    const model: Docente = { ...docente, id: docente.id || crypto.randomUUID(), createdAt: now, updatedAt: now }
    await docenteLocal.insert(model)
    if (connectivity.isOnline) {
      try {
        const created: any = await docenteRemote.createDocente(model as unknown as Record<string, unknown>)
        await docenteLocal.markSynced(created.id)
        return { ...model, ...created }
      } catch (_) {
        await syncQueueLocal.enqueue({
          entity: 'docentes',
          entityId: model.id,
          operation: 'CREATE',
          payload: JSON.stringify(model),
          createdAt: now,
        })
        return model
      }
    } else {
      await syncQueueLocal.enqueue({
        entity: 'docentes',
        entityId: model.id,
        operation: 'CREATE',
        payload: JSON.stringify(model),
        createdAt: now,
      })
      return model
    }
  },

  async updateDocente(docente: Docente): Promise<Docente> {
    await docenteLocal.update(docente)
    if (connectivity.isOnline) {
      try {
        const updated: any = await docenteRemote.updateDocente(docente.id, docente as unknown as Record<string, unknown>)
        await docenteLocal.markSynced(updated.id)
        return updated
      } catch (_) {
        await syncQueueLocal.enqueue({
          entity: 'docentes',
          entityId: docente.id,
          operation: 'UPDATE',
          payload: JSON.stringify(docente),
          createdAt: new Date().toISOString(),
        })
        return docente
      }
    } else {
      await syncQueueLocal.enqueue({
        entity: 'docentes',
        entityId: docente.id,
        operation: 'UPDATE',
        payload: JSON.stringify(docente),
        createdAt: new Date().toISOString(),
      })
      return docente
    }
  },

  async desactivarDocente(id: string): Promise<void> {
    if (connectivity.isOnline) {
      try {
        await docenteRemote.desactivarDocente(id)
      } catch (_) {
        await syncQueueLocal.enqueue({
          entity: 'docentes',
          entityId: id,
          operation: 'DESACTIVAR_DOCENTE',
          payload: JSON.stringify({ id, activo: false }),
          createdAt: new Date().toISOString(),
        })
      }
    } else {
      await syncQueueLocal.enqueue({
        entity: 'docentes',
        entityId: id,
        operation: 'DESACTIVAR_DOCENTE',
        payload: JSON.stringify({ id, activo: false }),
        createdAt: new Date().toISOString(),
      })
    }
  },

  async eliminarDocente(id: string): Promise<void> {
    if (connectivity.isOnline) {
      try {
        await docenteRemote.eliminarDocente(id)
      } catch (_) {
        await syncQueueLocal.enqueue({
          entity: 'docentes',
          entityId: id,
          operation: 'ELIMINAR_DOCENTE',
          payload: JSON.stringify({ id }),
          createdAt: new Date().toISOString(),
        })
      }
    } else {
      await syncQueueLocal.enqueue({
        entity: 'docentes',
        entityId: id,
        operation: 'ELIMINAR_DOCENTE',
        payload: JSON.stringify({ id }),
        createdAt: new Date().toISOString(),
      })
    }
  },

  syncStatus() {
    return { connected: connectivity.isOnline, pending: 0 }
  },
}

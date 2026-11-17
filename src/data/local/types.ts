import type { Equipo } from '../../domain/entities/equipo'
import type { Docente } from '../../domain/entities/docente'

export interface EquipoRow extends Equipo {
  syncedAt?: string | null
}

export interface DocenteRow extends Docente {
  syncedAt?: string | null
}

export interface SyncQueueEntry {
  id: number
  entity: string
  entityId: string
  operation: string
  payload: string
  createdAt: string
  retryCount: number
  lastError?: string | null
}

export interface ReportCacheEntry {
  key: string
  data: string
  updatedAt: string
}

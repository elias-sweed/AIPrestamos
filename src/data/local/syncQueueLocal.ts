import { db, STORE } from './localDb'
import type { SyncQueueEntry } from './types'

const DBA = db as any
let _counter = 0

async function nextId(): Promise<number> {
  _counter += 1
  return _counter
}

export const syncQueueLocal = {
  async getAll(): Promise<SyncQueueEntry[]> {
    return (await DBA.get(STORE.syncQueue)) ?? []
  },

  async enqueue(entry: Omit<SyncQueueEntry, 'id' | 'retryCount' | 'lastError'> & { createdAt?: string }): Promise<void> {
    const rows = (await DBA.get(STORE.syncQueue)) ?? []
    const newEntry: SyncQueueEntry = {
      ...entry,
      id: await nextId(),
      retryCount: 0,
      lastError: null,
      createdAt: entry.createdAt || new Date().toISOString(),
    }
    rows.push(newEntry)
    await DBA.set(STORE.syncQueue, rows)
  },

  async remove(id: number): Promise<void> {
    const rows = (await DBA.get(STORE.syncQueue)) ?? []
    await DBA.set(STORE.syncQueue, rows.filter((x: any) => x.id !== id))
  },

  async incrementRetry(id: number, error: string): Promise<void> {
    const rows = (await DBA.get(STORE.syncQueue)) ?? []
    const entry = rows.find((x: any) => x.id === id)
    if (!entry) return
    entry.retryCount += 1
    entry.lastError = error
    await DBA.set(STORE.syncQueue, rows)
  },

  async pendingCount(): Promise<number> {
    return (await DBA.get(STORE.syncQueue))?.length ?? 0
  },
}

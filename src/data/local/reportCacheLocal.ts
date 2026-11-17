import { db, STORE } from './localDb'
import type { ReportCacheEntry } from './types'

const DBA = db as any

export const reportCacheLocal = {
  async upsert(key: string, data: unknown): Promise<void> {
    const rows = (await DBA.get(STORE.reportCache)) ?? []
    const idx = rows.findIndex((r: any) => r.key === key)
    const entry: ReportCacheEntry = {
      key,
      data: JSON.stringify(data),
      updatedAt: new Date().toISOString(),
    }
    if (idx >= 0) rows[idx] = entry
    else rows.push(entry)
    await DBA.set(STORE.reportCache, rows)
  },

  async get<T = unknown>(key: string): Promise<T | null> {
    const rows = (await DBA.get(STORE.reportCache)) ?? []
    const r = rows.find((x: any) => x.key === key)
    if (!r) return null
    try {
      return JSON.parse(r.data) as T
    } catch {
      return null
    }
  },

  async remove(key: string): Promise<void> {
    const rows = (await DBA.get(STORE.reportCache)) ?? []
    await DBA.set(STORE.reportCache, rows.filter((x: any) => x.key !== key))
  },

  async clearAll(): Promise<void> {
    await DBA.set(STORE.reportCache, [])
  },
}

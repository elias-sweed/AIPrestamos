import { db, STORE } from './localDb'
import type { DocenteRow } from './types'
import type { Docente } from '../../domain/entities/docente'

const DBA = db as any

export const docenteLocal = {
  async getAll(): Promise<Docente[]> {
    const rows = (await DBA.get(STORE.docentes)) ?? []
    return rows.map((r: any) => ({
      id: r.id,
      nombres: r.nombres,
      apellidos: r.apellidos,
      grado: r.grado ?? null,
      seccion: r.seccion ?? null,
      turno: r.turno ?? null,
      activo: r.activo,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))
  },

  async getById(id: string): Promise<Docente | null> {
    const rows = (await DBA.get(STORE.docentes)) ?? []
    const r = rows.find((x: any) => x.id === id)
    if (!r) return null
    return {
      id: r.id,
      nombres: r.nombres,
      apellidos: r.apellidos,
      grado: r.grado ?? null,
      seccion: r.seccion ?? null,
      turno: r.turno ?? null,
      activo: r.activo,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }
  },

  async insert(docente: DocenteRow): Promise<void> {
    const rows = (await DBA.get(STORE.docentes)) ?? []
    const idx = rows.findIndex((x: any) => x.id === docente.id)
    if (idx >= 0) rows[idx] = docente
    else rows.push(docente)
    await DBA.set(STORE.docentes, rows)
  },

  async upsertAll(docentes: Docente[]): Promise<void> {
    const rows = (await DBA.get(STORE.docentes)) ?? []
    const byId = new Map(rows.map((r: any) => [r.id, r]))
    for (const d of docentes) {
      byId.set(d.id, { ...d, syncedAt: new Date().toISOString() })
    }
    await DBA.set(STORE.docentes, Array.from(byId.values()))
  },

  async markSynced(id: string): Promise<void> {
    const rows = (await DBA.get(STORE.docentes)) ?? []
    const r = rows.find((x: any) => x.id === id)
    if (r) {
      r.syncedAt = new Date().toISOString()
      await DBA.set(STORE.docentes, rows)
    }
  },

  async deleteById(id: string): Promise<void> {
    const rows = (await DBA.get(STORE.docentes)) ?? []
    await DBA.set(STORE.docentes, rows.filter((x: any) => x.id !== id))
  },

  async update(docente: DocenteRow): Promise<void> {
    await this.insert(docente)
  },
}

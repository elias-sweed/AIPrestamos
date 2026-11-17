import { db, STORE } from './localDb'
import type { EquipoRow } from './types'
import type { Equipo } from '../../domain/entities/equipo'

const DBA = db as any

export const equipoLocal = {
  async getAll(): Promise<Equipo[]> {
    const rows = (await DBA.get(STORE.equipos)) ?? []
    return rows.map((r: any) => ({
      id: r.id,
      codigoPatrimonial: r.codigoPatrimonial,
      tipo: r.tipo,
      marca: r.marca ?? null,
      modelo: r.modelo ?? null,
      numeroSerie: r.numeroSerie ?? null,
      estado: r.estado,
      observaciones: r.observaciones ?? null,
      imagenUrl: r.imagenUrl ?? null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))
  },

  async getById(id: string): Promise<Equipo | null> {
    const rows = (await DBA.get(STORE.equipos)) ?? []
    const r = rows.find((x: any) => x.id === id)
    if (!r) return null
    return {
      id: r.id,
      codigoPatrimonial: r.codigoPatrimonial,
      tipo: r.tipo,
      marca: r.marca ?? null,
      modelo: r.modelo ?? null,
      numeroSerie: r.numeroSerie ?? null,
      estado: r.estado,
      observaciones: r.observaciones ?? null,
      imagenUrl: r.imagenUrl ?? null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }
  },

  async insert(equipo: EquipoRow): Promise<void> {
    const rows = (await DBA.get(STORE.equipos)) ?? []
    const idx = rows.findIndex((x: any) => x.id === equipo.id)
    if (idx >= 0) rows[idx] = equipo
    else rows.push(equipo)
    await DBA.set(STORE.equipos, rows)
  },

  async upsertAll(equipos: Equipo[]): Promise<void> {
    const rows = (await DBA.get(STORE.equipos)) ?? []
    const byId = new Map(rows.map((r: any) => [r.id, r]))
    for (const e of equipos) {
      byId.set(e.id, { ...e, syncedAt: new Date().toISOString() })
    }
    await DBA.set(STORE.equipos, Array.from(byId.values()))
  },

  async markSynced(id: string): Promise<void> {
    const rows = (await DBA.get(STORE.equipos)) ?? []
    const r = rows.find((x: any) => x.id === id)
    if (r) {
      r.syncedAt = new Date().toISOString()
      await DBA.set(STORE.equipos, rows)
    }
  },

  async deleteById(id: string): Promise<void> {
    const rows = (await DBA.get(STORE.equipos)) ?? []
    await DBA.set(STORE.equipos, rows.filter((x: any) => x.id !== id))
  },

  async update(equipo: EquipoRow): Promise<void> {
    await this.insert(equipo)
  },
}

export interface SyncRepository {
  syncEquipos(): Promise<void>
  syncDocentes(): Promise<void>
  processQueue(): Promise<void>
  pendingCount(): Promise<number>
  isOnline(): boolean
}

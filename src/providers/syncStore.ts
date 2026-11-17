import { Store } from './store'
import { syncService } from '../data/sync'

export interface SyncStatus {
  connected: boolean
  syncing: boolean
  pending: number
}

const initial: SyncStatus = { connected: true, syncing: false, pending: 0 }

export class SyncStore extends Store<SyncStatus> {
  constructor() {
    super(initial)
    this._start()
  }

  private async _start() {
    this._refresh()
    syncService.syncing = false
  }

  async _refresh() {
    const pending = await syncService.pendingCount()
    this.value = { connected: syncService.isOnline, syncing: syncService.syncing, pending }
  }

  async syncNow() {
    syncService.syncing = true
    this.value = { ...this.value, syncing: true }
    try {
      await syncService.syncEquipos()
      await syncService.syncDocentes()
      await syncService.processQueue()
      await this._refresh()
    } finally {
      syncService.syncing = false
      this.value = { ...this.value, syncing: false }
    }
  }
}

export const syncStore = new SyncStore()

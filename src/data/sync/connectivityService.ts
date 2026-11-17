import { BehaviorSubject } from 'rxjs'

export class ConnectivityService {
  private _onlineSubject = new BehaviorSubject<boolean>(typeof navigator !== 'undefined' && navigator.onLine)

  constructor() {
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('online', () => this._onlineSubject.next(true))
      window.addEventListener('offline', () => this._onlineSubject.next(false))
    }
  }

  get onConnectivityChanged() {
    return this._onlineSubject.asObservable()
  }

  get isOnline(): boolean {
    return this._onlineSubject.value
  }

  dispose(): void {
    this._onlineSubject.complete()
  }
}

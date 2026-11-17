export class Store<T> {
  private _value: T
  private _listeners: Array<(v: T) => void> = []

  constructor(initial: T) {
    this._value = initial
  }

  get value(): T {
    return this._value
  }

  set value(v: T) {
    this._value = v
    this._listeners.forEach((fn) => fn(v))
  }

  subscribe(fn: (v: T) => void) {
    this._listeners.push(fn)
    return () => {
      this._listeners = this._listeners.filter((l) => l !== fn)
    }
  }
}

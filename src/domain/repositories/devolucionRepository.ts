export interface DevolucionRepository {
  registrarDevolucion(params: {
    prestamoId: string
    practicanteId: string
    prestamoEquipoIds: string[]
    observaciones?: string | null
  }): Promise<void>
}

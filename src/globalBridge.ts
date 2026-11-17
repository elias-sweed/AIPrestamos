import { authStore } from './providers/authStore'
import { SignatureService } from './data/services/signatureService'
import { devolucionRepositoryImpl } from './data/repositories/devolucionRepositoryImpl'
import { docenteRepositoryImpl } from './data/repositories/docenteRepositoryImpl'
import { equipoRepositoryImpl } from './data/repositories/equipoRepositoryImpl'
import { prestamoRepositoryImpl } from './data/repositories/prestamoRepositoryImpl'

export function installGlobalBridge() {
  const user = authStore.value.user
  const role = authStore.value.role

  ;(window as any).__aipUserId = user?.id || ''
  ;(window as any).__aipUserRole = role
  ;(window as any).__aipUserNombre = user?.userMetadata?.nombre_completo || ''

  ;(window as any).__aipUploadSignature = async (params: {
    imageBytes: Uint8Array
    prestamoId: string
    userId: string
    role: string
    nombreCompleto: string
    devolucionId?: string | null
  }) => {
    return SignatureService.uploadSignature(params)
  }

  ;(window as any).__aipRegistrarDevolucion = async (params: {
    prestamoId: string
    practicanteId: string
    prestamoEquipoIds: string[]
    observaciones?: string | null
  }) => {
    return devolucionRepositoryImpl.registrarDevolucion(params)
  }

  ;(window as any).__aipGetDocentes = async () => {
    return docenteRepositoryImpl.getDocentes()
  }

  ;(window as any).__aipGetEquipos = async () => {
    return equipoRepositoryImpl.getEquipos()
  }

  ;(window as any).__aipGetPrestamosActivos = async () => {
    const lista = await prestamoRepositoryImpl.getPrestamos({ estado: 'activo' })
    return lista
  }

  // Mantener actualizado el usuario cuando cambie la sesión
  authStore.subscribe((state) => {
    const u = state.user
    ;(window as any).__aipUserId = u?.id || ''
    ;(window as any).__aipUserRole = state.role
    ;(window as any).__aipUserNombre = u?.userMetadata?.nombre_completo || ''
  })
}

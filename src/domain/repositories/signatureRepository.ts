export interface SignatureRepository {
  uploadSignature(params: {
    imageBytes: Uint8Array
    prestamoId: string
    userId: string
    role: string
    nombreCompleto: string
    devolucionId?: string | null
  }): Promise<string>
}

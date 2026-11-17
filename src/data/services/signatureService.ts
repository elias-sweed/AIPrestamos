import { supabase } from '../remote/supabaseClient'

export class SignatureService {
  private static _bucket = 'firmas'

  static async uploadSignature(params: {
    imageBytes: Uint8Array
    prestamoId: string
    userId: string
    role: string
    nombreCompleto: string
    devolucionId?: string | null
  }): Promise<string> {
    const { imageBytes, prestamoId, userId, role, nombreCompleto, devolucionId } = params
    const context = devolucionId ? 'devoluciones' : 'prestamos'
    const contextId = devolucionId ?? prestamoId
    const timestamp = Date.now()
    const path = `${context}/${contextId}/${role}_${timestamp}.png`

    const { error: uploadError } = await supabase.storage.from(this._bucket).upload(path, imageBytes, {
      contentType: 'image/png',
      upsert: false,
    })
    if (uploadError) throw uploadError

    const { error: insertError } = await supabase.from('firmas_digitales').insert({
      prestamo_id: devolucionId ? null : prestamoId,
      devolucion_id: devolucionId ?? null,
      usuario_id: userId,
      rol: role,
      nombre_completo: nombreCompleto,
      storage_path: path,
      mime_type: 'image/png',
    })
    if (insertError) throw insertError

    return path
  }
}

import type { DevolucionRepository } from '../../domain/repositories/devolucionRepository'
import { supabase } from '../remote/supabaseClient'

export const devolucionRepositoryImpl: DevolucionRepository = {
  async registrarDevolucion({ prestamoId, prestamoEquipoIds, observaciones }: { prestamoId: string; prestamoEquipoIds: string[]; observaciones?: string | null }) {
    const ahora = new Date().toISOString()
    const updates = prestamoEquipoIds.map((id) =>
      supabase.from('prestamo_equipos').update({ fecha_devolucion_real: ahora, observaciones_devolucion: observaciones ?? null }).eq('id', id),
    )
    await Promise.all(updates)

    // Verificar si todos los equipos del préstamo están devueltos
    const { data: pe } = await supabase.from('prestamo_equipos').select('fecha_devolucion_real').eq('prestamo_id', prestamoId)
    const pendientes = (pe ?? []).filter((x: any) => !x.fecha_devolucion_real)
    const nuevoEstado = pendientes.length === 0 ? 'devuelto' : 'parcial'

    await supabase.from('prestamos').update({ estado: nuevoEstado, updated_at: ahora }).eq('id', prestamoId)
  },
}

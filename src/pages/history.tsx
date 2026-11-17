import * as React from 'react'
import { prestamoRepositoryImpl } from '../data/repositories/prestamoRepositoryImpl'
import { EmptyView } from '../components/ui/emptyView'
import { ErrorView } from '../components/ui/errorView'
import { Loading } from '../components/ui/loading'

export const HistoryPage = () => {
  const [prestamos, setPrestamos] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await prestamoRepositoryImpl.getPrestamos()
        setPrestamos(data)
      } catch (_) {
        setError('No se pudieron cargar el historial.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const retry = () => {
    setLoading(true)
    setError(null)
    prestamoRepositoryImpl.getPrestamos().then((d) => setPrestamos(d)).finally(() => setLoading(false))
  }

  if (loading) return <Loading />
  if (error) return <ErrorView onRetry={retry} message={error} />
  if (prestamos.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold text-[#212121] mb-4">Historial</h2>
        <EmptyView icon="🕒" title="Sin historial de préstamos" />
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-[#212121] mb-4">Historial de Préstamos</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E0E0E0] text-xs text-[#616161]">
              <th className="pb-3 font-medium">Docente</th>
              <th className="pb-3 font-medium">Fecha</th>
              <th className="pb-3 font-medium">Estado</th>
              <th className="pb-3 font-medium">Equipos</th>
            </tr>
          </thead>
          <tbody>
            {prestamos.map((p) => (
              <tr key={p.id} className="border-b border-[#E0E0E0] hover:bg-[#F5F5F5]">
                <td className="py-3 text-sm font-medium text-[#212121]">{p.docenteNombre}</td>
                <td className="py-3 text-sm text-[#616161]">{new Date(p.fechaHoraInicio).toLocaleDateString('es-ES')}</td>
                <td className="py-3 text-sm">{p.estado}</td>
                <td className="py-3 text-sm text-[#616161]">{p.cantidadEquipos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

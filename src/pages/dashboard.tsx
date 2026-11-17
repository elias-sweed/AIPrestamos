import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { authStore } from '../providers/authStore'
import { syncStore } from '../providers/syncStore'
import { PERMISSIONS } from '../domain/entities/userRole'
import { dashboardRepositoryImpl } from '../data/repositories/dashboardRepositoryImpl'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Loading } from '../components/ui/loading'

export const DashboardPage = () => {
  const navigate = useNavigate()
  const role = authStore.value.role
  const canViewFull = PERMISSIONS.canViewFullDashboard(role)
  const [stats, setStats] = React.useState<{
    prestamosActivos: number
    equiposDisponibles: number
    equiposPrestados: number
    equiposMantenimiento: number
    totalDocentes: number
  } | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      try {
        const s = await dashboardRepositoryImpl.getStats()
        setStats(s)
      } catch (_) {
        // usar valores por defecto
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Loading />

  const metrics = [
    { icon: '📋', count: stats?.prestamosActivos ?? 0, label: 'Activos', color: '#1565C0' },
    { icon: '📱', count: stats?.equiposDisponibles ?? 0, label: 'Disponibles', color: '#2E7D32' },
    { icon: '🔄', count: stats?.equiposPrestados ?? 0, label: 'Prestados', color: '#E65100' },
  ]
  if (canViewFull) {
    metrics.push({ icon: '🔧', count: stats?.equiposMantenimiento ?? 0, label: 'Mantenimiento', color: '#F57C00' })
  }

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F5] overflow-hidden">
      <header className="h-14 bg-[#FFFFFF] border-b border-[#E0E0E0] flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#1565C0] flex items-center justify-center text-white text-xs">A</div>
          <span className="font-semibold text-[#212121] text-sm">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#616161] hidden sm:block">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="w-8 h-8 rounded-full bg-[#1565C0] flex items-center justify-center text-white text-xs font-bold">
            {authStore.value.user?.email?.split('@')[0][0].toUpperCase() ?? '?'}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {metrics.map((m) => (
            <Card key={m.label} padding="sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-[#616161]">{m.label}</div>
                  <div className="text-2xl font-bold text-[#212121]">{m.count}</div>
                </div>
                <div className={`w-8 h-8 rounded bg-[${m.color}]20 flex items-center justify-center text-[${m.color}]`}>
                  {m.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Préstamos activos hoy */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-[#212121] mb-2">Préstamos activos hoy</h3>
          <div className="bg-[#FFFFFF] rounded border border-[#E0E0E0] p-3">
            <p className="text-[#616161] text-sm">Cargando préstamos activos...</p>
          </div>
        </div>

        {canViewFull && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#212121] mb-2">Actividad reciente</h3>
            <div className="bg-[#FFFFFF] rounded border border-[#E0E0E0] p-3">
              <p className="text-[#616161] text-sm">Sin actividad reciente.</p>
            </div>
          </div>
        )}

        {/* Acción rápida */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-[#212121] mb-2">Acción rápida</h3>
          <div className="space-y-2">
            <Button
              onClick={() => navigate('/dashboard/prestamos/nuevo')}
              variant="primary"
              fullWidth
              className="h-11 text-sm"
            >
              📋 Nuevo Préstamo
            </Button>
            <Button
              onClick={() => navigate('/dashboard/prestamos')}
              variant="success"
              fullWidth
              className="h-11 text-sm"
            >
              🔄 Registrar Devolución
            </Button>
          </div>
        </div>

        {/* Estado de sincronización */}
        <div className="bg-[#FFFFFF] rounded border border-[#E0E0E0] p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${syncStore.value.connected ? 'bg-[#2E7D32]' : 'bg-[#C62828]'}`}
            ></div>
            <span className="text-xs text-[#616161]">
              {syncStore.value.connected ? 'Conectado' : 'Sin conexión'}
            </span>
          </div>
          {syncStore.value.pending > 0 && (
            <span className="text-xs text-[#E65100] font-medium">{syncStore.value.pending} pendiente(s) de sincronizar</span>
          )}
        </div>
      </div>
    </div>
  )
}

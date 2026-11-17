import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { authStore } from '../providers/authStore'
import { PERMISSIONS } from '../domain/entities/userRole'
import { equipoRepositoryImpl } from '../data/repositories/equipoRepositoryImpl'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { EmptyView } from '../components/ui/emptyView'
import { ErrorView } from '../components/ui/errorView'
import { Loading } from '../components/ui/loading'

export const EquipmentPage = () => {
  const navigate = useNavigate()
  const role = authStore.value.role
  const canManage = PERMISSIONS.canManageEquipos(role)
  const [search, setSearch] = React.useState('')
  const [filter, setFilter] = React.useState<string | null>(null)
  const [equipos, setEquipos] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await equipoRepositoryImpl.getEquipos({ search: search || undefined, estado: filter || undefined })
        setEquipos(data)
      } catch (_) {
        setError('No se pudieron cargar los equipos.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search, filter])

  const retry = () => {
    setLoading(true)
    setError(null)
    equipoRepositoryImpl.getEquipos({ search: search || undefined, estado: filter || undefined })
      .then((d) => setEquipos(d))
      .finally(() => setLoading(false))
  }

  const filters: Array<{ value: string | null; label: string }> = [
    { value: null, label: 'Todos' },
    { value: 'disponible', label: 'Disponible' },
    { value: 'prestado', label: 'Prestado' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'dado_de_baja', label: 'Dado de baja' },
  ]

  const estadoColor = (estado: string) => {
    switch (estado) {
      case 'disponible': return '#2E7D32'
      case 'prestado': return '#1565C0'
      case 'mantenimiento': return '#E65100'
      case 'dado_de_baja': return '#C62828'
      default: return '#9E9E9E'
    }
  }

  const filtered = equipos.filter((e) =>
    e.codigoPatrimonial.toLowerCase().includes(search.toLowerCase()) ||
    e.nombre.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Loading />
  if (error) return <ErrorView onRetry={retry} message={error} />
  if (filtered.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#E0E0E0]">Equipos</h2>
          {canManage && (
            <Button onClick={() => navigate('/dashboard/equipos/nuevo')} variant="primary" className="h-10 text-sm px-4">+ Nuevo</Button>
          )}
        </div>
        <EmptyView
          icon="📦"
          title="No hay equipos registrados"
          action={
            canManage && (
              <Button onClick={() => navigate('/dashboard/equipos/nuevo')} variant="primary" fullWidth className="w-auto max-w-xs">
                Registrar primer equipo
              </Button>
            )
          }
        />
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#E0E0E0]">Equipos</h2>
        {canManage && (
          <Button onClick={() => navigate('/dashboard/equipos/nuevo')} variant="primary" className="h-10 text-sm px-4">+ Nuevo</Button>
        )}
      </div>

      <Input
        label="Buscar por código o nombre"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="text-[#00F2FF]"
      />

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.label}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === f.value
                ? 'bg-[#1565C0]/20 border-[#1565C0] text-[#00F2FF]'
                : 'border-white/10 text-[#90CAF9] bg-black/40 hover:bg-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((e) => (
          <Card key={e.id} padding="md">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#E0E0E0]">{e.codigoPatrimonial}</div>
                <div className="text-sm text-[#90CAF9]">{e.nombre}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className={`text-[10px] border-[${estadoColor(e.estado)}] text-[${estadoColor(e.estado)}]`}>
                  {e.estado}
                </Badge>
                <Button
                  onClick={() => navigate(`/dashboard/equipos/${e.id}`)}
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                >
                  Ver
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const EquipoDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const role = authStore.value.role
  const canManage = PERMISSIONS.canManageEquipos(role)
  const [equipo, setEquipo] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      try {
        const e = await equipoRepositoryImpl.getEquipoById(id!)
        setEquipo(e)
      } catch (_) {} finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading) return <Loading />
  if (!equipo) return <div className="p-4 text-center">No encontrado</div>

  return (
    <div className="p-4">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#E0E0E0]">{equipo.codigoPatrimonial}</h2>
        {canManage && (
          <Button onClick={() => navigate(`/dashboard/equipos/${id}/editar`)} variant="outline" className="h-10 text-sm px-4">
            Editar
          </Button>
        )}
      </header>

      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-[#E0E0E0]">{equipo.codigoPatrimonial}</div>
            <div className="text-sm text-[#90CAF9]">{equipo.nombre}</div>
          </div>
          <div className={`px-3 py-1 rounded text-[10px] font-medium ${
            equipo.estado === 'disponible' ? 'bg-[#2E7D32]/20 text-[#81C784] border-[#81C784]/30' :
            equipo.estado === 'prestado' ? 'bg-[#1565C0]/20 text-[#64B5F6] border-[#64B5F6]/30' :
            equipo.estado === 'mantenimiento' ? 'bg-[#E65100]/20 text-[#FFB74D] border-[#FFB74D]/30' :
            'bg-white/5 text-[#90CAF9] border-white/10'
          }`}>
            {equipo.estado}
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-bold text-[#E0E0E0] mb-3">Información del equipo</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#90CAF9]">Tipo</span>
            <span className="text-[#E0E0E0]">{equipo.tipo}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#90CAF9]">Marca</span>
            <span className="text-[#E0E0E0]">{equipo.marca ?? '—'}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#90CAF9]">Modelo</span>
            <span className="text-[#E0E0E0]">{equipo.modelo ?? '—'}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#90CAF9]">Número de serie</span>
            <span className="text-[#E0E0E0]">{equipo.numeroSerie ?? '—'}</span>
          </div>
          {equipo.observaciones && (
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-[#90CAF9]">Observaciones</span>
              <span className="text-[#E0E0E0]">{equipo.observaciones}</span>
            </div>
          )}
        </div>
      </Card>

      {canManage && (
        <div className="mt-6">
          <Button
            onClick={() => equipoRepositoryImpl.cambiarEstado(equipo.id, 'disponible')}
            variant="success"
            className="h-10 text-sm px-4"
          >
            Marcar como Disponible
          </Button>
          <Button
            onClick={() => equipoRepositoryImpl.cambiarEstado(equipo.id, 'prestado')}
            variant="primary"
            className="h-10 text-sm px-4 ml-2"
          >
            Marcar como Prestado
          </Button>
          <Button
            onClick={() => equipoRepositoryImpl.cambiarEstado(equipo.id, 'mantenimiento')}
            variant="warning"
            className="h-10 text-sm px-4 ml-2"
          >
            Mantenimiento
          </Button>
        </div>
      )}
    </div>
  )
}

export const EquipoFormPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = React.useState({
    codigoPatrimonial: '',
    tipo: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    observaciones: '',
    estado: 'disponible',
  })
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const tipos = [
    { value: 'laptop_dell', label: 'Laptop Dell' },
    { value: 'laptop_hp', label: 'Laptop HP' },
    { value: 'cargador', label: 'Cargador' },
    { value: 'extension', label: 'Extensión' },
    { value: 'otro_accesorio', label: 'Otro accesorio' },
  ]

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)
    try {
      if (!formData.codigoPatrimonial.trim()) {
        setError('El código patrimonial es requerido')
        setIsSaving(false)
        return
      }
      if (!formData.tipo) {
        setError('Selecciona un tipo de equipo')
        setIsSaving(false)
        return
      }

      await equipoRepositoryImpl.createEquipo({
        codigoPatrimonial: formData.codigoPatrimonial.trim(),
        tipo: formData.tipo as any,
        marca: formData.marca.trim() || null,
        modelo: formData.modelo.trim() || null,
        numeroSerie: formData.numeroSerie.trim() || null,
        estado: formData.estado as any,
        observaciones: formData.observaciones.trim() || null,
      })

      navigate('/dashboard/equipos')
    } catch (e: any) {
      setError(e.message || 'Error al registrar el equipo')
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-[#E0E0E0] mb-4">Registrar Equipo</h2>
      <Card>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Código patrimonial"
            value={formData.codigoPatrimonial}
            onChange={(e) => setFormData({ ...formData, codigoPatrimonial: e.target.value })}
            placeholder="Ej: EQ-001"
            className="text-[#00F2FF]"
          />
          <Input
            label="Tipo"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            placeholder="Selecciona un tipo"
            className="text-[#00F2FF]"
          />
          {tipos.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setFormData({ ...formData, tipo: t.value })}
              className={`w-full px-4 py-2 rounded border text-sm text-left transition-colors ${
                formData.tipo === t.value
                  ? 'bg-[#1565C0]/20 border-[#1565C0] text-[#00F2FF]'
                  : 'border-white/10 text-[#90CAF9] hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
          <Input
            label="Marca"
            value={formData.marca}
            onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
            placeholder="Dell, HP..."
            className="text-[#00F2FF]"
          />
          <Input
            label="Modelo"
            value={formData.modelo}
            onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
            placeholder="Latitude 5430"
            className="text-[#00F2FF]"
          />
          <Input
            label="Número de serie"
            value={formData.numeroSerie}
            onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
            placeholder="SN123456"
            className="text-[#00F2FF]"
          />
          <Input
            label="Observaciones"
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            placeholder="Observaciones del equipo"
            className="text-[#00F2FF]"
          />
          {error && (
            <div className="rounded border border-[#FF5252]/50 bg-[#FF5252]/10 p-3 text-[#FFBABA] text-sm shadow-[0_0_15px_rgba(255,82,82,0.3)]">
              {error}
            </div>
          )}
          <Button type="submit" variant="primary" fullWidth className="h-10" disabled={isSaving}>
            {isSaving ? 'Registrando...' : 'Registrar Equipo'}
          </Button>
        </form>
      </Card>
      <div className="mt-4">
        <Button onClick={() => navigate('/dashboard/equipos')} variant="outline" className="h-10 text-sm px-4">
          Cancelar
        </Button>
      </div>
    </div>
  )
}

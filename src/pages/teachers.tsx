import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { authStore } from '../providers/authStore'
import { PERMISSIONS } from '../domain/entities/userRole'
import { docenteRepositoryImpl } from '../data/repositories/docenteRepositoryImpl'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { EmptyView } from '../components/ui/emptyView'
import { ErrorView } from '../components/ui/errorView'
import { Loading } from '../components/ui/loading'

export const TeachersPage = () => {
  const navigate = useNavigate()
  const role = authStore.value.role
  const canManage = PERMISSIONS.canManageDocentes(role)
  const [search, setSearch] = React.useState('')
  const [soloActivos, setSoloActivos] = React.useState(false)
  const [docentes, setDocentes] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await docenteRepositoryImpl.getDocentes({ search: search || undefined, soloActivos })
        setDocentes(data)
      } catch (_) {
        setError('No se pudieron cargar los docentes.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search, soloActivos])

  const retry = () => {
    setLoading(true)
    setError(null)
    docenteRepositoryImpl.getDocentes({ search: search || undefined, soloActivos })
      .then((d) => setDocentes(d))
      .finally(() => setLoading(false))
  }

  const filtered = docentes.filter((d) =>
    d.nombreCompleto.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Loading />
  if (error) return <ErrorView onRetry={retry} message={error} />
  if (filtered.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#E0E0E0]">Docentes</h2>
          {canManage && (
            <Button onClick={() => navigate('/dashboard/docentes/nuevo')} variant="primary" className="h-10 text-sm px-4">+ Nuevo</Button>
          )}
        </div>
        <EmptyView
          icon="👤"
          title="No hay docentes registrados"
          action={
            canManage && (
              <Button onClick={() => navigate('/dashboard/docentes/nuevo')} variant="primary" fullWidth className="w-auto max-w-xs">
                Registrar primer docente
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
        <h2 className="text-lg font-bold text-[#E0E0E0]">Docentes</h2>
        {canManage && (
          <Button onClick={() => navigate('/dashboard/docentes/nuevo')} variant="primary" className="h-10 text-sm px-4">+ Nuevo</Button>
        )}
      </div>

      <Input
        label="Buscar docente"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="text-[#00F2FF]"
      />

      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={soloActivos}
            onChange={(e) => setSoloActivos(e.target.checked)}
            className="w-4 h-4 text-[#00F2FF] rounded"
          />
          Solo activos
        </label>
      </div>

      <div className="space-y-3">
        {filtered.map((d) => (
          <Card key={d.id} padding="md">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#E0E0E0]">{d.nombreCompleto}</div>
                <div className="text-sm text-[#90CAF9]">
                  {[d.grado, d.seccion, d.turno].filter(Boolean).join(' · ')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  d.activo ? 'bg-[#2E7D32]/20 text-[#81C784] border-[#81C784]/30' : 'bg-white/5 text-[#90CAF9] border-white/10'
                }`}>
                  {d.activo ? 'Activo' : 'Inactivo'}
                </div>
                <Button onClick={() => navigate(`/dashboard/docentes/${d.id}`)} variant="ghost" className="h-8 px-2 text-xs">Ver</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const DocenteDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const role = authStore.value.role
  const canManage = PERMISSIONS.canManageDocentes(role)
  const [docente, setDocente] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      try {
        const d = await docenteRepositoryImpl.getDocenteById(id!)
        setDocente(d)
      } catch (_) {} finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading) return <Loading />
  if (!docente) return <div className="p-4 text-center">No encontrado</div>

  return (
    <div className="p-4">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#E0E0E0]">{docente.nombreCompleto}</h2>
        {canManage && (
          <Button onClick={() => navigate(`/dashboard/docentes/${id}/editar`)} variant="outline" className="h-10 text-sm px-4">
            Editar
          </Button>
        )}
      </header>

      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-[#E0E0E0]">{docente.nombreCompleto}</div>
            <div className="text-sm text-[#90CAF9]">{docente.grado ?? ''} {docente.seccion ?? ''} {docente.turno ?? ''}</div>
          </div>
          <div className={`px-3 py-1 rounded text-[10px] font-medium ${
            docente.activo ? 'bg-[#2E7D32]/20 text-[#81C784] border-[#81C784]/30' : 'bg-white/5 text-[#90CAF9] border-white/10'
          }`}>
            {docente.activo ? 'Activo' : 'Inactivo'}
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-bold text-[#E0E0E0] mb-3">Información del docente</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#90CAF9]">Nombres</span>
            <span className="text-[#E0E0E0]">{docente.nombres}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#90CAF9]">Apellidos</span>
            <span className="text-[#E0E0E0]">{docente.apellidos}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#90CAF9]">Grado</span>
            <span className="text-[#E0E0E0]">{docente.grado ?? '—'}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#90CAF9]">Sección</span>
            <span className="text-[#E0E0E0]">{docente.seccion ?? '—'}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#90CAF9]">Turno</span>
            <span className="text-[#E0E0E0]">{docente.turno === 'mañana' ? 'Mañana' : docente.turno === 'tarde' ? 'Tarde' : '—'}</span>
          </div>
        </div>
      </Card>

      {canManage && docente.activo && (
        <div className="mt-6">
          <Button
            onClick={() => docenteRepositoryImpl.desactivarDocente(docente.id).then(() => navigate('/dashboard/docentes'))}
            variant="error"
            className="h-10 text-sm px-4"
          >
            Desactivar Docente
          </Button>
        </div>
      )}
    </div>
  )
}

export const DocenteFormPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = React.useState({
    nombres: '',
    apellidos: '',
    grado: '',
    seccion: '',
    turno: 'mañana',
    activo: true,
  })
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const turnos = [
    { value: 'mañana', label: 'Mañana' },
    { value: 'tarde', label: 'Tarde' },
  ]

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)
    try {
      if (!formData.nombres.trim()) {
        setError('Los nombres son requeridos')
        setIsSaving(false)
        return
      }
      if (!formData.apellidos.trim()) {
        setError('Los apellidos son requeridos')
        setIsSaving(false)
        return
      }

      await docenteRepositoryImpl.createDocente({
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        grado: formData.grado.trim() || null,
        seccion: formData.seccion.trim() || null,
        turno: formData.turno as any,
        activo: formData.activo,
      })

      navigate('/dashboard/docentes')
    } catch (e: any) {
      setError(e.message || 'Error al registrar el docente')
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-[#E0E0E0] mb-4">Registrar Docente</h2>
      <Card>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nombres"
            value={formData.nombres}
            onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
            className="text-[#00F2FF]"
          />
          <Input
            label="Apellidos"
            value={formData.apellidos}
            onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
            className="text-[#00F2FF]"
          />
          <Input
            label="Grado"
            value={formData.grado}
            onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
            placeholder="Ej: Primaria"
            className="text-[#00F2FF]"
          />
          <Input
            label="Sección"
            value={formData.seccion}
            onChange={(e) => setFormData({ ...formData, seccion: e.target.value })}
            placeholder="Ej: A"
            className="text-[#00F2FF]"
          />
          <div className="mb-2">
            <label className="block text-xs font-medium text-[#90CAF9] mb-1">Turno</label>
            <div className="flex gap-2">
              {turnos.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, turno: t.value })}
                  className={`flex-1 px-4 py-2 rounded border text-sm transition-colors ${
                    formData.turno === t.value
                      ? 'bg-[#1565C0]/20 border-[#1565C0] text-[#00F2FF]'
                      : 'border-white/10 text-[#90CAF9] hover:bg-white/5'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 text-[#00F2FF] rounded"
            />
            <label className="text-sm text-[#E0E0E0]">Docente activo</label>
          </div>
          {error && (
            <div className="rounded border border-[#FF5252]/50 bg-[#FF5252]/10 p-3 text-[#FFBABA] text-sm shadow-[0_0_15px_rgba(255,82,82,0.3)]">
              {error}
            </div>
          )}
          <Button type="submit" variant="primary" fullWidth className="h-10" disabled={isSaving}>
            {isSaving ? 'Registrando...' : 'Registrar Docente'}
          </Button>
        </form>
      </Card>
      <div className="mt-4">
        <Button onClick={() => navigate('/dashboard/docentes')} variant="outline" className="h-10 text-sm px-4">
          Cancelar
        </Button>
      </div>
    </div>
  )
}

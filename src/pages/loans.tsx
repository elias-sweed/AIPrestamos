import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { prestamoRepositoryImpl } from '../data/repositories/prestamoRepositoryImpl'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { EmptyView } from '../components/ui/emptyView'
import { ErrorView } from '../components/ui/errorView'
import { Loading } from '../components/ui/loading'
import { Input } from '../components/ui/input'

export const LoansPage = () => {
  const navigate = useNavigate()
  const [prestamos, setPrestamos] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await prestamoRepositoryImpl.getPrestamos()
        setPrestamos(data)
      } catch (_) {
        setError('No se pudieron cargar los préstamos.')
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <EmptyView
          icon="📭"
          title="No hay préstamos activos"
          subtitle="Todos los equipos están disponibles."
          action={
            <Button onClick={() => navigate('/dashboard/prestamos/nuevo')} variant="primary" fullWidth className="w-auto max-w-xs">
              CREAR PRÉSTAMO
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#E0E0E0]">Préstamos</h2>
        <Button onClick={() => navigate('/dashboard/prestamos/nuevo')} variant="primary" className="h-10 text-sm px-4">
          + Nuevo
        </Button>
      </div>
      <div className="space-y-3">
        {prestamos.map((p) => (
          <Card key={p.id} padding="md">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#E0E0E0]">{p.docenteNombre}</div>
                <div className="text-xs text-[#90CAF9]">
                  {p.cantidadEquipos} equipos · {p.encargadoNombre} · {new Date(p.fechaHoraInicio).toLocaleDateString('es-ES')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={p.estado === 'activo' ? 'primary' : p.estado === 'parcial' ? 'warning' : 'success'}>
                  {p.estado}
                </Badge>
                <Button
                  onClick={() => navigate(`/dashboard/prestamos/${p.id}`)}
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

export const LoanCreatePage = () => {
  const navigate = useNavigate()
  const [step, setStep] = React.useState(0)
  const [selectedDocente, setSelectedDocente] = React.useState<any>(null)
  const [selectedEquipoIds, setSelectedEquipoIds] = React.useState<Set<string>>(new Set())
  const [searchDocente, setSearchDocente] = React.useState('')
  const [searchEquipo, setSearchEquipo] = React.useState('')
  const [docentes, setDocentes] = React.useState<any[]>([])
  const [equipos, setEquipos] = React.useState<any[]>([])
  const [loadingDocentes, setLoadingDocentes] = React.useState(true)
  const [loadingEquipos, setLoadingEquipos] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)

  const titles = ['Seleccionar docente', 'Seleccionar equipos', 'Firma digital']

  React.useEffect(() => {
    const load = async () => {
      try {
        const [d, e] = await Promise.all([
          (window as any).__aipGetDocentes?.() || [],
          (window as any).__aipGetEquipos?.() || [],
        ])
        setDocentes(d.filter((x: any) => x.activo))
        setEquipos(e.filter((x: any) => x.estado === 'disponible' || selectedEquipoIds.has(x.id)))
      } catch (_) {}
      finally {
        setLoadingDocentes(false)
        setLoadingEquipos(false)
      }
    }
    load()
  }, [])

  const next = () => setStep((s) => s + 1)
  const prev = () => setStep((s) => s - 1)

  const filteredDocentes = docentes.filter((d) => d.nombreCompleto.toLowerCase().includes(searchDocente.toLowerCase()))
  const filteredEquipos = equipos.filter((e) =>
    e.nombre.toLowerCase().includes(searchEquipo.toLowerCase()) ||
    e.codigoPatrimonial.toLowerCase().includes(searchEquipo.toLowerCase()),
  )

  const submit = async () => {
    if (!selectedDocente || selectedEquipoIds.size === 0) return
    setSubmitting(true)
    try {
      const prestamoData = {
        docenteId: selectedDocente.id,
        encargadoId: (window as any).__aipUserId || '',
        observaciones: null,
      }
      const equiposData = Array.from(selectedEquipoIds).map((id) => ({ equipoId: id, fechaDevolucionReal: null }))
      await prestamoRepositoryImpl.createPrestamo(prestamoData, equiposData)
      const sigBytes = (window as any).__aipSignatureBytes
      if (sigBytes) {
        try {
          await (window as any).__aipUploadSignature?.({
            imageBytes: sigBytes,
            prestamoId: '',
            userId: (window as any).__aipUserId || '',
            role: (window as any).__aipUserRole || 'encargado_aip',
            nombreCompleto: (window as any).__aipUserNombre || '',
          })
        } catch (_) {}
      }
      navigate('/dashboard/prestamos')
    } catch (e: any) {
      alert(e.message || 'Error al crear el préstamo')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4">
      <header className="mb-4">
        <h2 className="text-lg font-bold text-[#E0E0E0]">{titles[step]}</h2>
        <button onClick={() => navigate('/dashboard/prestamos')} className="text-xs text-[#00F2FF]">Cerrar</button>
      </header>

      <div className="h-1 bg-[#1a1a1a] rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#1565C0] to-[#00F2FF] transition-all"
          style={{ width: `${((step) / 2) * 100}%` }}
        ></div>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <Input label="Buscar docente" value={searchDocente} onChange={(e) => setSearchDocente(e.target.value)} className="text-[#00F2FF]" />
          <div className="flex-1 min-h-0 overflow-auto">
            {loadingDocentes ? <Loading /> : filteredDocentes.length === 0 ? (
              <p className="text-[#90CAF9] text-center py-4">No se encontraron docentes</p>
            ) : (
              <div className="space-y-1">
                {filteredDocentes.map((d) => {
                  const sel = selectedDocente?.id === d.id
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDocente(d)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded border transition-colors ${
                        sel ? 'bg-[#1565C0]/20 border-[#1565C0] text-[#00F2FF]' : 'border-white/10 text-[#90CAF9] hover:bg-white/5'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-[#E0E0E0]">{d.nombreCompleto}</div>
                        {d.grado && <div className="text-xs text-[#90CAF9]">{d.grado}</div>}
                      </div>
                      {sel && '✔'}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <Button onClick={next} disabled={!selectedDocente} variant="primary" fullWidth className="h-10">
            Continuar
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Input label="Buscar equipo" value={searchEquipo} onChange={(e) => setSearchEquipo(e.target.value)} className="text-[#00F2FF]" />
          <div className="flex-1 min-h-0 overflow-auto">
            {loadingEquipos ? <Loading /> : filteredEquipos.length === 0 ? (
              <p className="text-[#90CAF9] text-center py-4">No hay equipos disponibles</p>
            ) : (
              <div className="space-y-2">
                {filteredEquipos.map((e) => {
                  const sel = selectedEquipoIds.has(e.id)
                  return (
                    <label key={e.id} className="flex items-center justify-between px-4 py-3 rounded border cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={sel}
                          onChange={() => {
                            setSelectedEquipoIds((prev) => {
                              const next = new Set(prev)
                              if (sel) next.delete(e.id); else next.add(e.id)
                              return next
                            })
                          }}
                          className="w-4 h-4 text-[#00F2FF] rounded"
                        />
                        <div>
                          <div className="font-medium text-[#E0E0E0]">{e.nombre}</div>
                          <div className="text-xs text-[#90CAF9]">{e.codigoPatrimonial}</div>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={prev} variant="outline" className="flex-1 h-10 text-sm">Atrás</Button>
            <Button
              onClick={next}
              disabled={selectedEquipoIds.size === 0}
              variant="primary"
              className="flex-1 h-10 text-sm"
            >
              Continuar ({selectedEquipoIds.size})
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="p-4 rounded bg-[#1565C0]/10 border border-[#1565C0]/30">
            <div className="font-medium text-[#E0E0E0]">Docente: {selectedDocente?.nombreCompleto}</div>
            <div className="text-sm text-[#00F2FF]">{selectedEquipoIds.size} equipo(s) seleccionado(s)</div>
          </div>
          <div className="flex-1 border border-white/10 rounded p-4">
            <SignaturePadCapture onCapture={(bytes) => {
              ;(window as any).__aipSignatureBytes = bytes
            }} />
          </div>
          <div className="flex gap-2">
            <Button onClick={prev} variant="outline" className="flex-1 h-10 text-sm">Atrás</Button>
            <Button
              onClick={submit}
              disabled={submitting}
              variant="primary"
              className="flex-1 h-10 text-sm"
              loading={submitting}
            >
              CREAR PRÉSTAMO
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

const SignaturePadCapture = ({ onCapture }: { onCapture: (bytes: Uint8Array) => void }) => {
  const [drawing, setDrawing] = React.useState<boolean>(false)
  const [points, setPoints] = React.useState<Array<{ x: number; y: number }>>([])
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const start = (e: React.PointerEvent) => {
    setDrawing(true)
    e.preventDefault()
    const p = getPos(e)
    setPoints([p])
  }
  const move = (e: React.PointerEvent) => {
    if (!drawing) return
    e.preventDefault()
    const p = getPos(e)
    setPoints((prev) => [...prev, p])
  }
  const end = () => setDrawing(false)

  const getPos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const clear = () => {
    setPoints([])
    const ctx = canvasRef.current!.getContext('2d')!
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  const capture = async () => {
    const canvas = canvasRef.current!
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'))
    if (!blob) return
    const ab = await blob.arrayBuffer()
    onCapture(new Uint8Array(ab))
  }

  React.useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#00F2FF'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (let i = 1; i < points.length; i++) {
      ctx.beginPath()
      ctx.moveTo(points[i - 1].x, points[i - 1].y)
      ctx.lineTo(points[i].x, points[i].y)
      ctx.stroke()
    }
  }, [points])

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={300}
        height={150}
        className="border border-white/20 rounded bg-black/40 touch-action-none"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      ></canvas>
      <div className="mt-2 flex gap-2">
        <Button onClick={clear} variant="outline" className="h-9 text-xs px-3">Borrar</Button>
        <Button onClick={capture} variant="primary" className="h-9 text-xs px-3">Usar firma</Button>
      </div>
    </div>
  )
}

export const LoanDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [prestamo, setPrestamo] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      try {
        const p = await prestamoRepositoryImpl.getPrestamoById(id!)
        setPrestamo(p)
      } catch (_) {} finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading) return <Loading />
  if (!prestamo) return <div className="p-4 text-center">No encontrado</div>

  return (
    <div className="p-4">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#E0E0E0]">Préstamo</h2>
        {prestamo.estado === 'activo' && (
          <Button onClick={() => navigate(`/dashboard/prestamos/${id}/devolucion`)} variant="outline" className="h-10 text-sm px-4">
            Devolver
          </Button>
        )}
      </header>

      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-[#E0E0E0]">Información general</span>
          <Badge variant="primary" className="text-[10px]">{prestamo.estado}</Badge>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[#90CAF9]">Docente</span><span className="text-[#E0E0E0]">{prestamo.docenteNombre}</span></div>
          <div className="flex justify-between"><span className="text-[#90CAF9]">Encargado</span><span className="text-[#E0E0E0]">{prestamo.encargadoNombre}</span></div>
          <div className="flex justify-between"><span className="text-[#90CAF9]">Inicio</span><span className="text-[#E0E0E0]">{new Date(prestamo.fechaHoraInicio).toLocaleString('es-ES')}</span></div>
          <div className="flex justify-between"><span className="text-[#90CAF9]">Equipos</span><span className="text-[#E0E0E0]">{prestamo.equiposDevueltos}/{prestamo.cantidadEquipos} devueltos</span></div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-[#E0E0E0]">Equipos</span>
          {prestamo.estado === 'activo' && (
            <Button onClick={() => {}} variant="outline" className="h-9 text-xs px-2">Añadir equipos</Button>
          )}
        </div>
        <div className="space-y-2">
          {prestamo.equipos.map((pe: any) => (
            <div key={pe.id} className="flex items-center justify-between p-2 rounded border border-white/10">
              <div>
                <div className="font-medium text-[#E0E0E0]">{pe.equipoNombre}</div>
                <div className="text-xs text-[#90CAF9]">{pe.equipoCodigo} • {pe.equipoTipo}</div>
              </div>
              {pe.fechaDevolucionReal ? (
                <Badge variant="success" className="text-[10px]">Devuelto</Badge>
              ) : (
                <Button onClick={() => {}} variant="ghost" className="h-8 px-2 text-xs text-[#FF5252]">Quitar</Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export const LoanReturnPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [prestamo, setPrestamo] = React.useState<any>(null)
  const [step, setStep] = React.useState(0)
  const [selectedPeIds, setSelectedPeIds] = React.useState<Set<string>>(new Set())
  const [observaciones, setObservaciones] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    const load = async () => {
      try {
        const p = await prestamoRepositoryImpl.getPrestamoById(id!)
        setPrestamo(p)
      } catch (_) {} finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading) return <Loading />
  if (!prestamo) return <div className="p-4 text-center">No encontrado</div>

  const pendientes = prestamo.equipos.filter((e: any) => !e.fechaDevolucionReal)

  const submit = async () => {
    if (selectedPeIds.size === 0) {
      alert('Seleccione al menos un equipo para devolver.')
      return
    }
    setSubmitting(true)
    try {
      await (window as any).__aipRegistrarDevolucion?.({
        prestamoId: id!,
        practicanteId: (window as any).__aipUserId || '',
        prestamoEquipoIds: Array.from(selectedPeIds),
        observaciones: observaciones || null,
      })
      navigate('/dashboard/prestamos')
    } catch (e: any) {
      alert(e.message || 'Error al registrar la devolución')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4">
      <header className="mb-4">
        <h2 className="text-lg font-bold text-[#E0E0E0]">{step === 0 ? 'Seleccionar equipos' : 'Firma'}</h2>
        <button onClick={() => navigate(`/dashboard/prestamos/${id}`)} className="text-xs text-[#00F2FF]">Cerrar</button>
      </header>

      {step === 0 && (
        <div className="space-y-4">
          <div className="font-semibold text-[#E0E0E0]">Devolver: {prestamo.docenteNombre}</div>
          <div className="flex-1 min-h-0 overflow-auto space-y-2">
            {pendientes.map((pe: any) => {
              const sel = selectedPeIds.has(pe.id)
              return (
                <label key={pe.id} className="flex items-center justify-between px-4 py-3 rounded border cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={sel}
                      onChange={() => {
                        setSelectedPeIds((prev) => {
                          const next = new Set(prev)
                          if (sel) next.delete(pe.id); else next.add(pe.id)
                          return next
                        })
                      }}
                      className="w-4 h-4 text-[#00F2FF] rounded"
                    />
                    <div>
                      <div className="font-medium text-[#E0E0E0]">{pe.equipoNombre}</div>
                      <div className="text-xs text-[#90CAF9]">{pe.equipoCodigo}</div>
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
          <Input label="Observaciones (opcional)" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="text-[#00F2FF]" />
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/dashboard/prestamos/${id}`)} variant="outline" className="flex-1 h-10 text-sm">
              Cancelar
            </Button>
            <Button
              onClick={() => setStep(1)}
              disabled={selectedPeIds.size === 0}
              variant="primary"
              className="flex-1 h-10 text-sm"
            >
              Continuar ({selectedPeIds.size})
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="p-4 rounded bg-[#1565C0]/10 border border-[#1565C0]/30">
            <div className="font-medium text-[#E0E0E0]">Recibe: {prestamo.encargadoNombre}</div>
            <div className="text-sm text-[#00F2FF]">Entrega: {prestamo.docenteNombre}</div>
          </div>
          <div className="flex-1 border border-white/10 rounded p-4">
            <SignaturePadCapture onCapture={() => {}} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setStep(0)} variant="outline" className="flex-1 h-10 text-sm">Atrás</Button>
            <Button
              onClick={submit}
              disabled={submitting}
              variant="primary"
              className="flex-1 h-10 text-sm"
              loading={submitting}
            >
              CONFIRMAR
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

import * as React from 'react'
import { reportesRepositoryImpl } from '../data/repositories/reportesRepositoryImpl'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { EmptyView } from '../components/ui/emptyView'
import { ErrorView } from '../components/ui/errorView'
import { Loading } from '../components/ui/loading'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export const ReportesPage = () => {
  const [reporte, setReporte] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await reportesRepositoryImpl.getGeneral()
        setReporte(data)
      } catch (_) {
        setError('No se pudieron cargar los reportes.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const retry = () => {
    setLoading(true)
    setError(null)
    reportesRepositoryImpl.getGeneral().then((d) => setReporte(d)).finally(() => setLoading(false))
  }

  if (loading) return <Loading />
  if (error) return <ErrorView onRetry={retry} message={error} />
  if (!reporte) return <EmptyView icon="📊" title="Sin reportes" />

  const metric = (label: string, value: number, color: string, emoji: string) => (
    <div key={label} className="rounded border border-[#E0E0E0] bg-white p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-[#616161]">{label}</div>
          <div className="text-xl font-bold text-[#212121]">{value}</div>
        </div>
        <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: color + '20', color }}>
          {emoji}
        </div>
      </div>
    </div>
  )

  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.setTextColor('#1565C0')
    doc.text('AIP Gest - Reporte General', 14, 22)
    doc.setFontSize(11)
    doc.setTextColor('#616161')
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 34)

    const rows = [
      ['Total préstamos', reporte.totalPrestamos ?? 0],
      ['Préstamos activos', reporte.prestamosActivos ?? 0],
      ['Préstamos devueltos', reporte.prestamosDevueltos ?? 0],
      ['Préstamos parciales', reporte.prestamosParciales ?? 0],
      ['Total equipos', reporte.totalEquipos ?? 0],
      ['Equipos disponibles', reporte.equiposDisponibles ?? 0],
      ['Equipos prestados', reporte.equiposPrestados ?? 0],
      ['Equipos en mantenimiento', reporte.equiposMantenimiento ?? 0],
      ['Total docentes', reporte.totalDocentes ?? 0],
      ['Docentes activos', reporte.docentesActivos ?? 0],
      ['Docentes inactivos', reporte.docentesInactivos ?? 0],
    ]
    ;(doc as any).autoTable({
      head: [['Concepto', 'Cantidad']],
      body: rows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [21, 101, 192] },
    })
    doc.save('aip-gest-reporte-general.pdf')
  }

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'AIP Gest'
    workbook.title = 'Reporte General AIP Gest'
    const sheet = workbook.addWorksheet('Reporte General')
    sheet.columns = [
      { header: 'Concepto', key: 'concepto', width: 30 },
      { header: 'Cantidad', key: 'cantidad', width: 15 },
    ]
    const rows = [
      { concepto: 'Total préstamos', cantidad: reporte.totalPrestamos ?? 0 },
      { concepto: 'Préstamos activos', cantidad: reporte.prestamosActivos ?? 0 },
      { concepto: 'Préstamos devueltos', cantidad: reporte.prestamosDevueltos ?? 0 },
      { concepto: 'Préstamos parciales', cantidad: reporte.prestamosParciales ?? 0 },
      { concepto: 'Total equipos', cantidad: reporte.totalEquipos ?? 0 },
      { concepto: 'Equipos disponibles', cantidad: reporte.equiposDisponibles ?? 0 },
      { concepto: 'Equipos prestados', cantidad: reporte.equiposPrestados ?? 0 },
      { concepto: 'Equipos en mantenimiento', cantidad: reporte.equiposMantenimiento ?? 0 },
      { concepto: 'Total docentes', cantidad: reporte.totalDocentes ?? 0 },
      { concepto: 'Docentes activos', cantidad: reporte.docentesActivos ?? 0 },
      { concepto: 'Docentes inactivos', cantidad: reporte.docentesInactivos ?? 0 },
    ]
    sheet.addRows(rows)
    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), 'aip-gest-reporte-general.xlsx')
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-[#212121] mb-4">Reportes</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {metric('Préstamos', reporte.totalPrestamos ?? 0, '#1565C0', '📋')}
        {metric('Activos', reporte.prestamosActivos ?? 0, '#1565C0', '📋')}
        {metric('Devueltos', reporte.prestamosDevueltos ?? 0, '#2E7D32', '✅')}
        {metric('Equipos', reporte.totalEquipos ?? 0, '#2E7D32', '📱')}
        {metric('Disponibles', reporte.equiposDisponibles ?? 0, '#2E7D32', '📱')}
        {metric('Docentes', reporte.totalDocentes ?? 0, '#1565C0', '👤')}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-[#212121]">Exportar reporte</h3>
          <div className="flex gap-2">
            <Button onClick={exportarPDF} variant="outline" className="h-10 text-sm px-4">
              📄 Descargar PDF
            </Button>
            <Button onClick={exportarExcel} variant="outline" className="h-10 text-sm px-4">
              📊 Descargar Excel
            </Button>
          </div>
        </div>

        <Card>
          <div className="text-sm text-[#616161]">
            <p>Resumen general de préstamos y equipos.</p>
            <p className="mt-2">
              Total préstamos: <span className="font-semibold text-[#212121]">{reporte.totalPrestamos}</span> ·
              Activos: <span className="font-semibold text-[#212121]">{reporte.prestamosActivos}</span> ·
              Devueltos: <span className="font-semibold text-[#212121]">{reporte.prestamosDevueltos}</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

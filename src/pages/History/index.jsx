import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import AppLayout from '../../components/layout/AppLayout'
import StatusBadge from '../Dashboard/components/StatusBadge'
import { Toast } from '../../components/ui/Toast'

// TODO(sprint-next): reemplazar con llamada a GET /api/history
// La respuesta esperada es un array de { id, date, totalHours, status, iaReport }
const RECORDS = []

function HistoryPage({ records = RECORDS, itemsPerPage = 20 }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast, showToast, hideToast } = useToast()

  const [selectedReport, setSelectedReport] = useState(null)

  const fromDate = searchParams.get('from') || ''
  const toDate = searchParams.get('to') || ''
  const currentPage = Number(searchParams.get('page')) || 1

  const filteredRecords = records.filter((record) => {
    if (fromDate && record.date < fromDate) return false
    if (toDate && record.date > toDate) return false
    return true
  })

  const totalItems = filteredRecords.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

  const updateQueryParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries())
    const updated = { ...current, ...newParams }
    Object.keys(updated).forEach((key) => {
      if (!updated[key]) delete updated[key]
    })
    setSearchParams(updated)
  }

  const handleFilterChange = (e, type) => {
    const value = e.target.value
    if (type === 'from') {
      updateQueryParams({ from: value, page: '1' })
    } else {
      updateQueryParams({ to: value, page: '1' })
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateQueryParams({ page: String(newPage) })
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleDownload() {
    // TODO(sprint-next): implementar descarga via GET /api/history/:date/export
    showToast('Descarga disponible próximamente.', 'info')
  }

  function handleExportFinnegans() {
    // TODO(sprint-next): implementar integración via POST /api/history/:date/export-finnegans
    showToast('Integración con Finnegans disponible próximamente.', 'info')
  }

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Cabecera */}
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Historial de Reportes
          </h1>
          <p className="text-sm text-slate-400">
            Visualiza los reportes consolidados por la IA de tus actividades
            diarias.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-black">Desde</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => handleFilterChange(e, 'from')}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-black">Hasta</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => handleFilterChange(e, 'to')}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-blue-500"
            />
          </div>
          {(fromDate || toDate) && (
            <button
              onClick={() => updateQueryParams({ from: '', to: '', page: '1' })}
              className="mt-5 text-xs text-black hover:text-slate-600 underline transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Horas Totales</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-black">
                    No se encontraron reportes en este rango de fechas.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-200">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {record.totalHours}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center space-x-2">
                      <button
                        onClick={() => setSelectedReport(record)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                      >
                        Ver Reporte
                      </button>
                      <button
                        onClick={() => handleDownload(record)}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        Descargar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/30 px-6 py-4 text-sm text-slate-400">
              <div>
                Mostrando{' '}
                <span className="font-semibold text-slate-200">
                  {startIndex + 1}
                </span>{' '}
                al{' '}
                <span className="font-semibold text-slate-200">
                  {Math.min(endIndex, totalItems)}
                </span>{' '}
                de{' '}
                <span className="font-semibold text-slate-200">
                  {totalItems}
                </span>{' '}
                registros
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
                >
                  Anterior
                </button>
                <span className="text-xs text-slate-400">
                  Página{' '}
                  <span className="text-slate-200 font-medium">
                    {currentPage}
                  </span>{' '}
                  de {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal reporte IA */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-slate-100">
                  Reporte del {selectedReport.date}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Horas calculadas: {selectedReport.totalHours}</span>
                  <StatusBadge status={selectedReport.status} />
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-300 whitespace-pre-line border border-slate-800 leading-relaxed">
              {selectedReport.iaReport}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => handleExportFinnegans(selectedReport)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                Integrar con Finnegans
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={hideToast}
        />
      )}
    </AppLayout>
  )
}

export default HistoryPage

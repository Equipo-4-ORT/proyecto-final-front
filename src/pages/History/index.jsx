import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AppLayout from '../../components/layout/AppLayout'
import StatusBadge from '../Dashboard/components/StatusBadge'

// Generamos 25 registros mockeados para poder probar de verdad la paginación de 20 por página (Tarea 3.5.5.4)
const generateMockHistory = () => {
  const records = []
  const states = ['Aprobado', 'En revisión', 'Pendiente']
  for (let i = 1; i <= 25; i++) {
    const day = String(i).padStart(2, '0')
    records.push({
      id: i,
      date: `2026-05-${day}`,
      totalHours: `${7 + (i % 3)} h ${(i * 2) % 60} min`,
      status: states[i % states.length],
    })
  }
  return records.reverse() // De más nuevo a más viejo
}

const ALL_MOCK_DATA = generateMockHistory()

function HistoryPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  // 🟢 DERIVACIÓN DIRECTA DE ESTADOS (Adiós useState y useEffect conflictivos)
  const fromDate = searchParams.get('from') || ''
  const toDate = searchParams.get('to') || ''
  const currentPage = Number(searchParams.get('page')) || 1
  const itemsPerPage = 20

  // Aplicar filtros de fecha sobre el mock general
  const filteredRecords = ALL_MOCK_DATA.filter((record) => {
    if (fromDate && record.date < fromDate) return false
    if (toDate && record.date > toDate) return false
    return true
  })

  // Calcular índices de paginación
  const totalItems = filteredRecords.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

  // Handlers para actualizar los query params de la URL de forma limpia
  const updateQueryParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries())
    const updated = { ...current, ...newParams }

    // Limpiar claves vacías para que quede prolija la URL
    Object.keys(updated).forEach((key) => {
      if (!updated[key]) delete updated[key]
    })

    setSearchParams(updated)
  }

  const handleFilterChange = (e, type) => {
    const value = e.target.value
    if (type === 'from') {
      updateQueryParams({ from: value, page: '1' }) // Resetea a página 1 al filtrar
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

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Cabecera */}
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Historial de Reportes
          </h1>
          <p className="text-sm text-slate-400">
            Visualiza y gestiona las jornadas de trabajo registradas.
          </p>
        </div>

        {/* --- Tarea 3.5.5.3: Barra de Filtros --- */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Desde</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => handleFilterChange(e, 'from')}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Hasta</label>
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
              className="mt-5 text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* --- Tarea 3.5.5.2: Tabla con columnas del historial --- */}
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
                  <td colSpan="4" className="py-10 text-center text-slate-500">
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
                        onClick={() =>
                          navigate(`/dashboard?date=${record.date}`)
                        }
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() =>
                          alert(`Descargando reporte del día: ${record.date}`)
                        }
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

          {/* --- Tarea 3.5.5.4: Controles de Paginación 20/page --- */}
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
    </AppLayout>
  )
}

export default HistoryPage

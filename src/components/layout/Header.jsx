import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { CalendarDays, Download } from 'lucide-react'

import UserMenu from './UserMenu'
import Button from '../ui/Button'

import { getTodayDate } from '../../utils/dateHelpers'

function formatDate(date) {
  const currentDate = new Date(`${date}T00:00:00`)

  const day = currentDate.toLocaleDateString('es-AR', {
    day: '2-digit',
  })

  const month = currentDate.toLocaleDateString('es-AR', {
    month: 'long',
  })

  const year = currentDate.toLocaleDateString('es-AR', {
    year: 'numeric',
  })

  return `${day} de ${month.toLowerCase()}, ${year}`
}

function Header({
  user,
  onLogout,
  selectedDate,
  onDateChange,
  onExportExcel,
  generatingFrom = null,
}) {
  const location = useLocation() 
  const isSettings = location.pathname === '/settings'
  const today = getTodayDate()
  const dateInputRef = useRef(null)

  function openDatePicker() {
    dateInputRef.current?.showPicker()
  }

return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h2 className="text-4xl font-bold text-slate-900">
          {isSettings ? 'Configuración' : 'Dashboard'}
        </h2>

        <p className="text-slate-500 text-sm mt-1">
          {isSettings 
            ? 'Gestiona tus preferencias y horas de trabajo.' 
            : 'Gestión diaria de actividades y productividad.'}
        </p>
      </div>

      {!isSettings && (
        <div className="w-full lg:w-auto flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
          <button
            type="button"
            onClick={openDatePicker}
            className="relative w-full sm:w-auto h-14 px-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-center gap-3 text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <CalendarDays size={18} className="text-slate-500" />
            <span className="text-sm font-medium">
              {formatDate(selectedDate || today)}
            </span>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              max={today}
              onChange={(event) => onDateChange(event.target.value)}
              className="absolute opacity-0 pointer-events-none"
              tabIndex={-1}
            />
          </button>
          
          <Button
            variant="success"
            onClick={onExportExcel}
            disabled={!!generatingFrom}
            className="w-full sm:w-auto h-14 px-6 flex items-center justify-center gap-2 rounded-2xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingFrom === 'header' ? (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Generando...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Descargar Excel</span>
              </>
            )}
          </Button>

          <UserMenu user={user} onLogout={onLogout} />
        </div>
      )}

      {isSettings && (
        <div className="lg:w-auto">
           <UserMenu user={user} onLogout={onLogout} />
        </div>
      )}
    </header>
  )
}

export default Header
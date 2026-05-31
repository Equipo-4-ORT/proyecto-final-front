import { SOURCES } from '../../constants/sources'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, History, FileSpreadsheet } from 'lucide-react'

function Sidebar({ sourceCounts, onExportExcel, generatingFrom = null }) {
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-[var(--color-primary)] text-white p-5 flex-col">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">AutoLog</h1>
        <p className="text-blue-100 text-sm mt-2 leading-relaxed">
          Registro automático de jornada
        </p>
      </div>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-blue-200 mb-3">
          Navegación
        </p>

        <nav className="flex flex-col gap-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `
              flex items-center gap-3
              px-4 py-3 rounded-xl
              transition
              ${isActive ? 'bg-blue-950 text-white' : 'text-white hover:bg-blue-800'}
            `}
          >
            <LayoutDashboard size={18} />
            <span className="text-sm font-medium">Dashboard</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) => `
              flex items-center gap-3
              px-4 py-3 rounded-xl
              transition
              ${isActive ? 'bg-blue-950 text-white' : 'text-white hover:bg-blue-800'}
            `}
          >
            <History size={18} />
            <span className="text-sm font-medium">Historial</span>
          </NavLink>
        </nav>
      </div>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-blue-200 mb-3">
          Accesos rápidos
        </p>

        <button
          type="button"
          onClick={onExportExcel}
          disabled={!!generatingFrom}
          className="
            flex items-center gap-3
            px-4 py-3 rounded-xl
            text-white
            hover:bg-blue-800
            transition
            w-full
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {generatingFrom === 'sidebar' ? (
            <>
              <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span className="text-sm font-medium">Generando...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet size={18} />
              <span className="text-sm font-medium">Exportar</span>
            </>
          )}
        </button>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-blue-200 mb-3">
          Fuentes activas
        </p>

        <div className="flex flex-col gap-2">
          {Object.entries(SOURCES).map(([key, source]) => {
            const Icon = source.icon

            return (
              <div
                key={key}
                className="
                  flex items-center justify-between
                  px-4 py-3 rounded-xl
                  text-white
                  hover:bg-blue-800
                  transition
                "
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span className="text-sm font-medium">{source.label}</span>
                </div>

                <span
                  className={`
                    ${source.sidebarColor}
                    text-white text-xs font-semibold
                    px-2 py-1 rounded-lg
                  `}
                >
                  {sourceCounts[key]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-auto rounded-2xl bg-blue-950/60 p-4 border border-blue-800">
        <p className="text-sm font-semibold">MVP AutoLog</p>
        <p className="text-xs text-blue-100 mt-1 leading-relaxed">
          Google Workspace + Jira
        </p>
      </div>
    </aside>
  )
}

export default Sidebar

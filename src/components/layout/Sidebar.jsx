import { NavLink } from "react-router-dom"
import {LayoutDashboard,ShieldCheck,FileSpreadsheet} from "lucide-react"
import { SOURCES } from "../../constants/sources"

//Navigation config: ajustar visibilidad según roles cuando se implemente autenticación
const links = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Admin",
    path: "/admin",
    icon: ShieldCheck,
  },
]

const quickActions = [
  {
    label: "Exportar",
    icon: FileSpreadsheet,
  },
]

//Reemplazar por datos provenientes del backend cuando estén dispo
const sourceCounts = {
  calendar: 4,
  jira: 6,
  slides: 3,
}

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-950 text-white p-5 flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          AutoLog
        </h1>

        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Registro automático de jornada
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon

          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }
                `
              }
            >
              <Icon size={19} />
              <span className="text-sm font-medium">
                {link.label}
              </span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-8">
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">
          Accesos rápidos
        </p>

        <div className="flex flex-col gap-1">
          {quickActions.map((action) => {
            const Icon = action.icon

            return (
              <button
                key={action.label}
                type="button"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:bg-slate-900 hover:text-white transition"
              >
                <Icon size={18} />
                <span className="text-sm font-medium">
                  {action.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-8">
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">
          Fuentes activas
        </p>

        <div className="flex flex-col gap-2">
          {Object.entries(SOURCES).map(([key, source]) => {
            const Icon = source.icon

            return (
              <div
                key={key}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-300"
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span className="text-sm font-medium">
                    {source.label}
                  </span>
                </div>

                <span className={`${source.color} text-white text-xs font-semibold px-2 py-1 rounded-lg`}>
                  {sourceCounts[key]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-auto rounded-xl bg-slate-900 p-4 border border-slate-800">
        <p className="text-sm font-semibold">
          MVP AutoLog
        </p>

        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Google Workspace + Jira
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
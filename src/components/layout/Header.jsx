import { Bell, ChevronDown } from "lucide-react"

//Reemplazar por datos provenientes del backend cuando estén dispo
const currentUser = {
  name: "Usuario",
  email: "user@autolog.com",
}

function Header() {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h2>

        <p className="text-slate-500 text-sm mt-1">
          Gestión diaria de actividades y productividad.
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl text-sm font-medium">
          4 actividades sincronizadas
        </div>

        <button className="relative w-11 h-11 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
          <Bell size={20} className="text-slate-600" />

          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
        </button>

        <button className="flex items-center gap-3 hover:bg-slate-50 rounded-2xl px-3 py-2 transition">
          <div className="w-11 h-11 rounded-full bg-slate-300" />

          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800">
              {currentUser.name}
            </p>

            <p className="text-xs text-slate-500">
              {currentUser.email}
            </p>
          </div>

          <ChevronDown size={18} className="text-slate-500" />
        </button>
      </div>
    </header>
  )
}

export default Header
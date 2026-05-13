import { useRef } from "react"
import { CalendarDays, Download } from "lucide-react"
import UserMenu from "./UserMenu"
import Button from "../ui/Button"
import { getTodayDate } from "../../utils/dateHelpers"

//Reemplazar por datos provenientes del backend cuando estén dispo
const currentUser = {
  name: "Usuario",
  email: "user@autolog.com",
}

function formatDate(date) {
  const currentDate = new Date(`${date}T00:00:00`)
  const day = currentDate.toLocaleDateString("es-AR", {
    day: "2-digit",
  })
  const month = currentDate.toLocaleDateString("es-AR", {
    month: "long",
  })
  const year = currentDate.toLocaleDateString("es-AR", {
    year: "numeric",
  })
return `${day} de ${month.toLowerCase()}, ${year}`
}

function Header({
  selectedDate,
  onDateChange,
  onExportExcel,
  workdayHours,
  defaultActivityHours,
  onWorkdayHoursChange,
  onDefaultActivityHoursChange,
}) {
  const today = getTodayDate()
  const dateInputRef = useRef(null)

  function openDatePicker() {
    dateInputRef.current?.showPicker()
  }

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h2 className="text-4xl font-bold text-slate-900">
          Dashboard
        </h2>

        <p className="text-slate-500 text-sm mt-1">
          Gestión diaria de actividades y productividad.
        </p>
      </div>

      <div className="w-full lg:w-auto flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
        <button
          type="button"
          onClick={openDatePicker}
          className="
            relative
            w-full sm:w-auto
            h-14 px-5
            rounded-2xl
            border border-slate-200
            bg-white
            flex items-center justify-center gap-3
            text-slate-700
            hover:bg-slate-50
            transition
            shadow-sm
          "
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
          className="
            w-full sm:w-auto
            h-14 px-6
            flex items-center justify-center gap-2
            rounded-2xl
            shadow-sm
          "
        >
          <Download size={18} />

          <span>
            Descargar Excel
          </span>
        </Button>

        <UserMenu
          user={currentUser}
          workdayHours={workdayHours}
          defaultActivityHours={defaultActivityHours}
          onWorkdayHoursChange={onWorkdayHoursChange}
          onDefaultActivityHoursChange={onDefaultActivityHoursChange}
        />
      </div>
    </header>
  )
}

export default Header
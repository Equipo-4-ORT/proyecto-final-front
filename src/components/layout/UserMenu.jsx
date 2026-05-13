import { useEffect, useRef, useState } from "react"
import { ChevronDown, Info, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

function SettingNumberField({
  label,
  value,
  onChange,
  helperText,
  onDecrease,
  onIncrease,
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
          {label}
        </label>

        <div className="relative group">
          <Info size={15} className="text-slate-400 cursor-help" />

          <div
            className="
              hidden lg:group-hover:block
              absolute right-0 top-6
              w-64
              rounded-xl
              bg-slate-900
              px-3 py-2
              text-xs text-white
              shadow-lg
              z-50
            "
          >
            {helperText}
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500 leading-relaxed lg:hidden">
        {helperText}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrease}
          className="
            w-11 h-11
            rounded-xl
            border border-slate-200
            bg-white
            text-slate-600
            hover:bg-slate-100
            transition
            flex items-center justify-center
            text-xl font-semibold
          "
        >
          −
        </button>

        <input
          type="number"
          min={1}
          max={10}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="
            w-full
            rounded-xl
            border border-slate-200
            px-4 py-2.5
            text-center
            outline-none
            focus:ring-4
            focus:ring-blue-100
            focus:border-blue-500
          "
        />

        <button
          type="button"
          onClick={onIncrease}
          className="
            w-11 h-11
            rounded-xl
            border border-slate-200
            bg-white
            text-slate-600
            hover:bg-slate-100
            transition
            flex items-center justify-center
            text-xl font-semibold
          "
        >
          +
        </button>
      </div>
    </div>
  )
}

function UserMenu({
  user,
  workdayHours,
  defaultActivityHours,
  onWorkdayHoursChange,
  onDefaultActivityHoursChange,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const menuRef = useRef(null)

  function toggleMenu() {
    setIsOpen((prev) => !prev)
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  function clampHours(value) {
    const numericValue = Number(value)

    if (!numericValue) {
      return 1
    }

    return Math.min(Math.max(numericValue, 1), 10)
  }

  function increaseValue(currentValue, onChange) {
    onChange(clampHours(currentValue + 1))
  }

  function decreaseValue(currentValue, onChange) {
    onChange(clampHours(currentValue - 1))
  }

  function handleLogout() {
    //Eliminar token
    navigate("/login")
  }

  return (
    <div ref={menuRef} className="relative ml-2">
      <button
        type="button"
        onClick={toggleMenu}
        className="
          flex items-center gap-3
          rounded-2xl
          px-3 py-2
          hover:bg-slate-100
          transition
        "
      >
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">
            {user.name}
          </p>

          <p className="text-xs text-slate-500">
            {user.email}
          </p>
        </div>

        <ChevronDown
          size={18}
          className={`
            text-slate-500 transition
            ${isOpen ? "rotate-180" : ""}
          `}
        />
      </button>

      {isOpen && (
        <div
          className="
            absolute right-0 top-[calc(100%+10px)]
            w-[min(340px,calc(100vw-32px))]
            rounded-2xl
            border border-slate-200
            bg-white
            shadow-xl
            p-5
            z-50
          "
        >
          <h3 className="text-lg font-bold text-slate-800">
            Configuración
          </h3>

          <div className="mt-5 space-y-5">
            <SettingNumberField
              label="Jornada laboral diaria"
              value={workdayHours}
              onChange={(value) =>
                onWorkdayHoursChange(clampHours(value))
              }
              onDecrease={() =>
                decreaseValue(workdayHours, onWorkdayHoursChange)
              }
              onIncrease={() =>
                increaseValue(workdayHours, onWorkdayHoursChange)
              }
              helperText="Se usa para calcular el porcentaje de productividad del día según tu jornada laboral."
            />

            <SettingNumberField
              label="Duración estimada por actividad"
              value={defaultActivityHours}
              onChange={(value) =>
                onDefaultActivityHoursChange(clampHours(value))
              }
              onDecrease={() =>
                decreaseValue(defaultActivityHours, onDefaultActivityHoursChange)
              }
              onIncrease={() =>
                increaseValue(defaultActivityHours, onDefaultActivityHoursChange)
              }
              helperText="Se usa cuando una actividad no tiene hora de fin. El sistema estima su duración con este valor."
            />
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <button
              type="button"
              onClick={handleLogout}
              className="
                w-full
                flex items-center justify-center gap-2
                rounded-xl
                border border-red-200
                px-4 py-3
                text-red-600
                hover:bg-red-50
                transition
              "
            >
              <LogOut size={18} />

              <span className="font-medium">
                Cerrar sesión
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
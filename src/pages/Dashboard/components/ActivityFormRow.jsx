import { Check, X } from "lucide-react"
import Button from "../../../components/ui/Button"
import TextInput from "../../../components/ui/TextInput"
import { SOURCES } from "../../../constants/sources"

function ActivityFormRow({
  isAdding,
  formData,
  errors,
  onChange,
  onAdd,
  onCancel,
  onStartAdding,
}) {
  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-9 gap-2 items-start">
        {!isAdding ? (
          <Button
            variant="primaryDark"
            className="sm:col-span-2 xl:col-span-2"
            onClick={onStartAdding}
          >
            + Agregar actividad
          </Button>
        ) : (
          <div className="sm:col-span-2 xl:col-span-2 flex flex-col sm:flex-row gap-2">
            <Button
              variant="success"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={onAdd}
            >
              <Check size={18} />
              <span>Agregar</span>
            </Button>

            <Button
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700"
              onClick={onCancel}
            >
              <X size={18} />
              <span>Cancelar</span>
            </Button>
          </div>
        )}

        <div>
          <select
            value={formData.source}
            onChange={(event) =>
              onChange("source", event.target.value)
            }
            disabled={!isAdding}
            className={`
              w-full
              border
              ${errors.source ? "!border-red-500" : "border-slate-200"}
              bg-white
              rounded-xl
              px-4 py-2.5
              text-slate-700
              outline-none
              transition
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-100
              disabled:bg-slate-100
              disabled:text-slate-400
            `}
          >
            <option value="">
              Fuente
            </option>

            {Object.entries(SOURCES).map(([key, source]) => (
              <option key={key} value={key}>
                {source.label}
              </option>
            ))}
          </select>

          {errors.source && (
            <p className="text-sm text-red-500 mt-1">
              {errors.source}
            </p>
          )}
        </div>

        <div>
          <TextInput
            placeholder="Título"
            value={formData.title}
            disabled={!isAdding}
            onChange={(event) =>
              onChange("title", event.target.value)
            }
          />
        </div>

        <div className="sm:col-span-2 xl:col-span-2">
          <TextInput
            placeholder="Descripción"
            value={formData.description}
            disabled={!isAdding}
            onChange={(event) =>
              onChange("description", event.target.value)
            }
          />
        </div>

        <div>
          <TextInput
            type="time"
            placeholder="Inicio"
            value={formData.start}
            disabled={!isAdding}
            className={
              errors.start
                ? "!border-red-500 focus:!border-red-500 focus:ring-red-100"
                : ""
            }
            onChange={(event) =>
              onChange("start", event.target.value)
            }
          />

          {errors.start && (
            <p className="text-sm text-red-500 mt-1">
              {errors.start}
            </p>
          )}
        </div>

        <div>
          <TextInput
            type="time"
            placeholder="Fin"
            value={formData.end}
            disabled={!isAdding}
            className={
              errors.end
                ? "!border-red-500 focus:!border-red-500 focus:ring-red-100"
                : ""
            }
            onChange={(event) =>
              onChange("end", event.target.value)
            }
          />

          {errors.end && (
            <p className="text-sm text-red-500 mt-1">
              {errors.end}
            </p>
          )}
        </div>

        <div>
          <TextInput
            placeholder="Notas"
            value={formData.notes}
            disabled={!isAdding}
            onChange={(event) =>
              onChange("notes", event.target.value)
            }
          />
        </div>
      </div>
    </div>
  )
}

export default ActivityFormRow
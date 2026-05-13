import { Check, Pencil, Trash2, X } from "lucide-react"
import Badge from "../../../components/ui/Badge"
import TextInput from "../../../components/ui/TextInput"
import { getSource } from "../../../constants/sources"
import { formatDuration, getActivityDurationMinutes, getActivityEndTime, } from "../utils/dashboardCalculations"

function getOptionalTextClass(value) {
  return value
    ? "text-slate-600"
    : "text-slate-400 italic"
}

function getEndTimeClass(value) {
  return value
    ? "text-slate-800"
    : "text-slate-400 italic"
}

function ActivityMobileCard({
  activity,
  defaultActivityHours,
  isEditing,
  editingData,
  editingErrors,
  onStartEdit,
  onCancelEdit,
  onEditingChange,
  onSaveEdit,
  onDeleteClick,
}) {
  const source = getSource(activity.source)
  const Icon = source.icon

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-slate-500" />

          <Badge color={source.badgeColor}>
            {source.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={onSaveEdit}
                className="
                  w-9 h-9 rounded-xl border border-slate-200
                  flex items-center justify-center
                  text-emerald-600
                  hover:bg-emerald-50
                  transition
                "
                aria-label="Guardar edición"
              >
                <Check size={16} />
              </button>

              <button
                type="button"
                onClick={onCancelEdit}
                className="
                  w-9 h-9 rounded-xl border border-slate-200
                  flex items-center justify-center
                  text-red-500
                  hover:bg-red-50 hover:text-red-700
                  transition
                "
                aria-label="Cancelar edición"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onStartEdit(activity)}
                className="
                  w-9 h-9 rounded-xl border border-slate-200
                  flex items-center justify-center
                  text-blue-500
                  hover:bg-blue-50 hover:text-blue-600
                  transition
                "
                aria-label="Editar actividad"
              >
                <Pencil size={16} />
              </button>

              <button
                type="button"
                onClick={() => onDeleteClick(activity)}
                className="
                  w-9 h-9 rounded-xl border border-slate-200
                  flex items-center justify-center
                  text-red-500
                  hover:bg-red-50 hover:text-red-700
                  transition
                "
                aria-label="Eliminar actividad"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {isEditing ? (
          <>
            <TextInput
              value={editingData.title}
              onChange={(event) =>
                onEditingChange("title", event.target.value)
              }
              placeholder="Título"
            />

            <TextInput
              value={editingData.description}
              onChange={(event) =>
                onEditingChange("description", event.target.value)
              }
              placeholder="Descripción"
            />

            <div className="grid grid-cols-2 gap-2">
              <TextInput
                type="time"
                value={editingData.start}
                className={
                  editingErrors.start
                    ? "!border-red-500 focus:!border-red-500 focus:ring-red-100"
                    : ""
                }
                onChange={(event) =>
                  onEditingChange("start", event.target.value)
                }
              />

              <TextInput
                type="time"
                value={editingData.end}
                className={
                  editingErrors.end
                    ? "!border-red-500 focus:!border-red-500 focus:ring-red-100"
                    : ""
                }
                onChange={(event) =>
                  onEditingChange("end", event.target.value)
                }
              />
            </div>

            <TextInput
              value={editingData.notes}
              onChange={(event) =>
                onEditingChange("notes", event.target.value)
              }
              placeholder="Notas"
            />
          </>
        ) : (
          <>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Título
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {activity.title || "Título..."}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Descripción
              </p>

              <p
                className={`mt-1 ${getOptionalTextClass(activity.description)}`}
              >
                {activity.description || "Descripción..."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-3">
              <div>
                <p className="text-xs text-slate-400">
                  Inicio
                </p>

                <p className="font-semibold text-slate-800">
                  {activity.start}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Fin
                </p>

                <p
                  className={`font-semibold ${getEndTimeClass(activity.end)}`}
                >
                  {activity.end || getActivityEndTime(activity, defaultActivityHours)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Duración
                </p>

                <p className="font-semibold text-slate-800">
                  {formatDuration(
                    getActivityDurationMinutes(activity, defaultActivityHours)
                  )}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Notas
              </p>

              <p
                className={`mt-1 ${getOptionalTextClass(activity.notes)}`}
              >
                {activity.notes || "Notas..."}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ActivityMobileCard
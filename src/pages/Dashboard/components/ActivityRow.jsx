import { Check, Pencil, Trash2, X } from "lucide-react"
import Badge from "../../../components/ui/Badge"
import TextInput from "../../../components/ui/TextInput"
import { getSource } from "../../../constants/sources"
import StatusBadge from './StatusBadge'

import {
  formatDuration,
  getActivityDurationMinutes,
  getActivityEndTime,
} from "../utils/dashboardCalculations"

function ActivityRow({
  readOnly = false,
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
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
      <td className="px-4 py-3 text-slate-500">
        {activity.id}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-slate-500" />

          <Badge color={source.badgeColor}>
            {source.label}
          </Badge>
        </div>
      </td>

      <td className="px-4 py-3">
        {isEditing ? (
          <TextInput
            value={editingData.title}
            onChange={(event) =>
              onEditingChange("title", event.target.value)
            }
            placeholder="Título"
            className="min-w-[120px]"
          />
        ) : (
          <div
            className={`${
              activity.title
                ? "text-slate-700 not-italic"
                : "text-slate-400 italic"
            }`}
          >
            {activity.title || "Título..."}
          </div>
        )}
      </td>

      <td className="px-4 py-3">
        {isEditing ? (
          <TextInput
            value={editingData.description}
            onChange={(event) =>
              onEditingChange("description", event.target.value)
            }
            placeholder="Descripción"
            className="min-w-[180px]"
          />
        ) : (
          <div
            className={`${
              activity.description
                ? "text-slate-700 not-italic"
                : "text-slate-400 italic"
            }`}
          >
            {activity.description || "Descripción..."}
          </div>
        )}
      </td>

      <td className="px-4 py-3">
        {isEditing ? (
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
        ) : (
          activity.start
        )}
      </td>

      <td className="px-4 py-3">
        {isEditing ? (
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
        ) : (
          activity.end || (
            <span className="text-slate-400 italic">
              {getActivityEndTime(
                activity,
                defaultActivityHours
              )}
            </span>
          )
        )}
      </td>

      <td className="px-4 py-3 font-semibold">
        {formatDuration(
          getActivityDurationMinutes(
            activity,
            defaultActivityHours
          )
        )}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={activity.status} />
      </td>

      <td className="px-4 py-3">
        {isEditing ? (
          <TextInput
            value={editingData.notes}
            onChange={(event) =>
              onEditingChange("notes", event.target.value)
            }
            placeholder="Notas"
            className="min-w-[140px]"
          />
        ) : (
          <div
            className={`${
              activity.notes
                ? "text-slate-700 not-italic"
                : "text-slate-400 italic"
            }`}
          >
            {activity.notes || "Notas..."}
          </div>
        )}
      </td>

      <td className="px-4 py-3">
        {!readOnly && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={onSaveEdit}
                  className="
                    w-9 h-9 rounded-xl border border-slate-200
                    flex items-center justify-center
                    text-slate-500
                    hover:bg-emerald-50 hover:text-emerald-600
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
                    text-slate-500
                    hover:bg-red-50 hover:text-red-600
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
                    text-slate-500
                    hover:bg-slate-50 hover:text-blue-600
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
                    text-slate-500
                    hover:bg-red-50 hover:text-red-600
                    transition
                  "
                  aria-label="Eliminar actividad"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}

export default ActivityRow
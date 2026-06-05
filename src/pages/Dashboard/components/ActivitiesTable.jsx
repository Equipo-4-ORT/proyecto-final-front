import { useState } from 'react'
import Card from '../../../components/ui/Card'
import ActivityRow from './ActivityRow'
import ActivityFormRow from './ActivityFormRow'
import ActivityMobileCard from './ActivityMobileCard'
import { validateActivity } from '../utils/activityValidation'
import { getActivityDurationMinutes } from '../utils/dashboardCalculations'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'

const initialFormData = {
  source: '',
  title: '',
  description: '',
  start: '',
  end: '',
  notes: '',
}

function getTimeValue(time) {
  if (!time || !time.includes(':')) {
    return Number.MAX_SAFE_INTEGER
  }
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return Number.MAX_SAFE_INTEGER
  }

  return hours * 60 + minutes
}

function ActivitiesTable({
  activities,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  defaultActivityHours,
  readOnly = false,
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [formErrors, setFormErrors] = useState({})
  const [actionError, setActionError] = useState(null)
  const [editingActivityId, setEditingActivityId] = useState(null)
  const [editingData, setEditingData] = useState(initialFormData)
  const [editingErrors, setEditingErrors] = useState({})
  const [deletingActivity, setDeletingActivity] = useState(null)

  function handleChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    setFormErrors((prev) => ({
      ...prev,
      [field]: '',
    }))

    setActionError(null)
  }

  function handleStartEdit(activity) {
    setEditingActivityId(activity.id)
    setEditingErrors({})
    setEditingData({
      source: activity.source,
      title: activity.title || '',
      description: activity.description || '',
      start: activity.start || '',
      end: activity.end || '',
      notes: activity.notes || '',
    })
  }

  function handleCancelEdit() {
    setEditingActivityId(null)
    setEditingData(initialFormData)
    setEditingErrors({})
  }

  function handleEditingChange(field, value) {
    setEditingData((prev) => ({
      ...prev,
      [field]: value,
    }))

    setEditingErrors((prev) => ({
      ...prev,
      [field]: '',
    }))
  }

  function handleSaveEdit() {
    const errors = validateActivity(editingData)
    if (Object.keys(errors).length > 0) {
      setEditingErrors(errors)
      return
    }

    setEditingErrors({})
    setActionError(null)
    handleSaveEditWithApi(editingActivityId)
  }

  function handleOpenDelete(activity) {
    setDeletingActivity(activity)
  }

  function handleCloseDelete() {
    setDeletingActivity(null)
  }

  async function handleConfirmDelete() {
    const target = deletingActivity
    if (!target) return

    setDeletingActivity(null)

    if (editingActivityId === target.id) {
      setEditingActivityId(null)
      setEditingData(initialFormData)
      setEditingErrors({})
    }

    setActionError(null)

    const result = await onDeleteActivity(target.id)
    if (result && result.ok === false) {
      setActionError(result.message || 'No pudimos eliminar la actividad.')
    }
  }

  async function handleAddActivity() {
    const errors = validateActivity(formData)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setActionError(null)
    setIsSubmitting(true)
    try {
      const result = await onAddActivity(formData)
      if (result && result.ok === false) {
        setActionError(result.message || 'No pudimos crear la actividad.')
        return
      }
      setFormData(initialFormData)
      setIsAdding(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSaveEditWithApi(targetId) {
    const result = await onUpdateActivity(targetId, editingData)
    if (result && result.ok === false) {
      setActionError(result.message || 'No pudimos actualizar la actividad.')
      return
    }
    setEditingActivityId(null)
    setEditingData(initialFormData)
    setEditingErrors({})
  }

  const sortedActivities = [...activities].sort(
    (firstActivity, secondActivity) => {
      const startDifference =
        getTimeValue(firstActivity.start) - getTimeValue(secondActivity.start)
      if (startDifference !== 0) {
        return startDifference
      }

      return (
        getActivityDurationMinutes(firstActivity, defaultActivityHours) -
        getActivityDurationMinutes(secondActivity, defaultActivityHours)
      )
    },
  )

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-slate-800">Actividades del día</h2>

      <div className="hidden lg:block mt-5 rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[420px]">
          <table className="min-w-[1100px] w-full border-collapse bg-white text-sm">
            <thead className="bg-[var(--color-primary)] text-white text-sm sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Fuente</th>
                <th className="text-left px-4 py-3">Título</th>
                <th className="text-left px-4 py-3">Descripción</th>
                <th className="text-left px-4 py-3">Inicio</th>
                <th className="text-left px-4 py-3">Fin</th>
                <th className="text-left px-4 py-3">Duración hs</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-left px-4 py-3">Notas</th>
                {!readOnly && <th className="text-left px-4 py-3">Acciones</th>}
              </tr>
            </thead>

            <tbody>
              {sortedActivities.map((activity, index) => (
                <ActivityRow
                  key={activity.id}
                  rowNumber={index + 1}
                  activity={activity}
                  defaultActivityHours={defaultActivityHours}
                  isEditing={editingActivityId === activity.id}
                  editingData={editingData}
                  editingErrors={editingErrors}
                  onStartEdit={handleStartEdit}
                  onCancelEdit={handleCancelEdit}
                  onEditingChange={handleEditingChange}
                  onSaveEdit={handleSaveEdit}
                  onDeleteClick={handleOpenDelete}
                  readOnly={readOnly}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:hidden mt-5 space-y-4">
        {sortedActivities.map((activity) => (
          <ActivityMobileCard
            key={activity.id}
            activity={activity}
            defaultActivityHours={defaultActivityHours}
            isEditing={editingActivityId === activity.id}
            editingData={editingData}
            editingErrors={editingErrors}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onEditingChange={handleEditingChange}
            onSaveEdit={handleSaveEdit}
            onDeleteClick={handleOpenDelete}
            readOnly={readOnly}
          />
        ))}
      </div>

      {!readOnly && (
        <>
          <ActivityFormRow
            isAdding={isAdding}
            formData={formData}
            errors={formErrors}
            isSubmitting={isSubmitting}
            onChange={handleChange}
            onAdd={handleAddActivity}
            onCancel={() => {
              setIsAdding(false)
              setFormData(initialFormData)
              setFormErrors({})
              setActionError(null)
            }}
            onStartAdding={() => setIsAdding(true)}
          />

          {actionError && (
            <p
              role="alert"
              className="mt-2 text-sm text-red-600"
            >
              {actionError}
            </p>
          )}
        </>
      )}

      <Modal
        isOpen={Boolean(deletingActivity)}
        onClose={handleCloseDelete}
        title="Eliminar actividad"
        actions={
          <>
            <Button variant="outline" onClick={handleCloseDelete}>
              Cancelar
            </Button>

            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleConfirmDelete}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-slate-600 leading-relaxed">
          ¿Seguro que querés eliminar esta actividad?
        </p>

        {deletingActivity?.title && (
          <p className="mt-3 font-semibold text-slate-800">
            {deletingActivity.title}
          </p>
        )}
      </Modal>
    </Card>
  )
}

export default ActivitiesTable

import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import TextInput from '../components/ui/TextInput'
import {
  getUserSettings,
  updateUserSettings,
} from '../services/userSettingsApi'
import { Toast } from '../components/ui/Toast'

function Settings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    preventOverlap: false,
    defaultDuration: '1',
  })

  useEffect(() => {
    getUserSettings()
      .then((data) => {
        setFormData({
          startTime: data.workStartTime || '',
          endTime: data.workEndTime || '',
          preventOverlap: data.avoidOverlaps || false,
          defaultDuration: data.defaultDuration?.toString() || '1',
        })
      })
      .catch((err) => console.error('Error al cargar:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleDurationChange = (e) => {
    let value = e.target.value

    const numericValue = value.replace(/[^0-9]/g, '')

    const limitedValue = numericValue.slice(0, 2)

    if (limitedValue === '') {
      setFormData({ ...formData, defaultDuration: '' })
      return
    }

    if (parseInt(limitedValue) <= 24) {
      setFormData({ ...formData, defaultDuration: limitedValue })
    }
  }

  const handleSave = async () => {
    if (
      formData.startTime &&
      formData.endTime &&
      formData.startTime >= formData.endTime
    ) {
      setToast({
        message: 'La hora de inicio debe ser menor a la hora de fin.',
        variant: 'error',
      })
      return
    }

    const finalDuration =
      formData.defaultDuration === '' ? '1' : formData.defaultDuration

    const duration = Number(finalDuration)

    setFormData({ ...formData, defaultDuration: finalDuration })

    if (duration < 1 || duration > 24) {
      setToast({
        message: 'La duración debe ser entre 1 y 24 horas.',
        variant: 'error',
      })
      return
    }

    setSaving(true)
    try {
      await updateUserSettings({
        workStartTime: formData.startTime,
        workEndTime: formData.endTime,
        avoidOverlaps: formData.preventOverlap,
        defaultDuration: duration,
      })
      setToast({
        message: 'Configuración actualizada con éxito',
        variant: 'success',
      })
    } catch (error) {
      console.error('Error al guardar:', error)
      setToast({
        message: 'Hubo un error al guardar los cambios.',
        variant: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-10 text-center">Cargando...</div>

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto">
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Configuración</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Inicio
              </label>
              <TextInput
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Fin
              </label>
              <TextInput
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Duración default actividad (horas)
            </label>
            <TextInput
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.defaultDuration}
              onChange={handleDurationChange}
              placeholder="1"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.preventOverlap}
              onChange={(e) =>
                setFormData({ ...formData, preventOverlap: e.target.checked })
              }
            />
            <span className="text-sm text-slate-700">
              Evitar solapamientos al consolidar
            </span>
          </label>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </Card>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </AppLayout>
  )
}

export default Settings

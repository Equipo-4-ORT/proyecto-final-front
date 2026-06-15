import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import AppLayout from '../components/layout/AppLayout'
import Toast from '../components/common/Toast'
import { SOURCES } from '../constants/sources'
import { useActivities } from '../hooks/useActivities'
import DashboardStats from './Dashboard/components/DashboardStats'
import ReportView from './Dashboard/components/ReportView'
import SourceSummary from './Dashboard/components/SourceSummary'
import JiraCallbackBanner from './Dashboard/components/JiraCallbackBanner'
import JiraIntegrationCard from './Dashboard/components/JiraIntegrationCard'

import {
  getCalendarEventCount,
  getProductivityPercentage,
  getSourceCounts,
  getSourceSummary,
  getTotalHours,
  DEFAULT_ACTIVITY_HOURS,
  DEFAULT_WORKDAY_HOURS,
} from './Dashboard/utils/dashboardCalculations'

import {
  apiToActivity,
  activityToApiPayload,
  buildOptimisticActivity,
  buildOptimisticUpdate,
  buildUpdatePayload,
  filterByLocalDate,
} from './Dashboard/utils/activityMapper'

import {
  createActivity,
  deleteActivity,
  updateActivity,
} from '../services/activitiesApi'
import { getApiErrorMessage } from '../utils/apiErrors'
import { getTodayDate } from '../utils/dateHelpers'
import { generateReport } from '../services/reportsService'

function getStoredNumber(key, fallbackValue) {
  const storedValue = localStorage.getItem(key)

  if (!storedValue) {
    return fallbackValue
  }

  const parsedValue = Number(storedValue)

  return Number.isNaN(parsedValue) ? fallbackValue : parsedValue
}

const ACTIVITY_ERROR_MESSAGES = {
  validation_error: 'Revisá los datos: hay campos requeridos o fechas inválidas.',
  unauthenticated: 'Sesión expirada. Volvé a iniciar sesión.',
  activity_not_found: 'La actividad ya no existe.',
  activity_forbidden: 'No tenés permisos sobre esta actividad.',
}

function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  console.log("DEBUG 1 - Objeto User:", user);
  console.log("DEBUG 2 - defaultDuration del User:", user?.defaultDuration);


  const [searchParams] = useSearchParams()
  const urlDate = searchParams.get('date')

  const [activities, setActivities] = useState([])
  const [selectedDate, setSelectedDate] = useState(urlDate || getTodayDate())
  const [loadError, setLoadError] = useState(null)

  const activitiesRef = useRef(activities)

  useEffect(() => {
    activitiesRef.current = activities
  }, [activities])

  const [workdayHours, setWorkdayHours] = useState(() =>
    getStoredNumber('workdayHours', DEFAULT_WORKDAY_HOURS),
  )

  const [defaultActivityHours, setDefaultActivityHours] = useState(() =>
    user?.defaultDuration || getStoredNumber('defaultActivityHours', DEFAULT_ACTIVITY_HOURS),
  )

  useEffect(() => {
    if (user?.defaultDuration) {
      setDefaultActivityHours(user.defaultDuration)
    }
  }, [user?.defaultDuration])

  const [generatingFrom, setGeneratingFrom] = useState(null)
  const [toast, setToast] = useState(null)

  const {
    data: dayActivities,
    isLoading,
    error,
  } = useActivities(selectedDate)

  useEffect(() => {
    localStorage.setItem('workdayHours', workdayHours)
  }, [workdayHours])

 useEffect(() => {
    if (user?.defaultDuration) {
      setDefaultActivityHours(user.defaultDuration)
    }
  }, [user?.defaultDuration])

  useEffect(() => {
    if (dayActivities) {
      const timer = setTimeout(() => {
        setActivities(dayActivities)
        setLoadError(null)
      }, 0)
      return () => clearTimeout(timer)
    }

    if (error) {
      const timer = setTimeout(() => {
        setLoadError('No pudimos sincronizar las actividades con el servidor.')
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [dayActivities, error])

  const handleAddActivity = useCallback(
    async (formData) => {
      const tempId = crypto.randomUUID()
      const optimistic = buildOptimisticActivity(formData, tempId, selectedDate)

      setActivities((prev) => [...prev, optimistic])

      try {
        console.log("DEBUG 3 - Estado defaultActivityHours:", defaultActivityHours);

        const payload = activityToApiPayload(
          formData,
          selectedDate,
          defaultActivityHours,
        )

        console.log("DEBUG 4 - Payload Final:", payload);

        const created = await createActivity(payload)
        const mapped = apiToActivity(created)
        setActivities((prev) =>
          prev.map((activity) => (activity.id === tempId ? mapped : activity)),
        )
        return { ok: true, activity: mapped }
      } catch (err) {
        setActivities((prev) =>
          prev.filter((activity) => activity.id !== tempId),
        )
        const message = getApiErrorMessage(
          err,
          ACTIVITY_ERROR_MESSAGES,
          'No pudimos crear la actividad.',
        )
        return { ok: false, message }
      }
    },
    [selectedDate, defaultActivityHours],
  )

  const handleUpdateActivity = useCallback(
    async (id, editingData) => {
      const original = activitiesRef.current.find((activity) => activity.id === id)
      if (!original) {
        return { ok: false, message: 'La actividad ya no existe.' }
      }

      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === id
            ? buildOptimisticUpdate(activity, editingData)
            : activity,
        ),
      )

      try {
        const payload = buildUpdatePayload(editingData, original, defaultActivityHours)
        const updated = await updateActivity(id, payload)
        const mapped = apiToActivity(updated)
        setActivities((prev) =>
          prev.map((activity) => (activity.id === id ? mapped : activity)),
        )
        return { ok: true, activity: mapped }
      } catch (err) {
        setActivities((prev) =>
          prev.map((activity) => (activity.id === id ? original : activity)),
        )
        const message = getApiErrorMessage(
          err,
          ACTIVITY_ERROR_MESSAGES,
          'No pudimos actualizar la actividad.',
        )
        return { ok: false, message }
      }
    },
    [defaultActivityHours],
  )

  const handleDeleteActivity = useCallback(
    async (id) => {
      const originalIndex = activitiesRef.current.findIndex(
        (activity) => activity.id === id,
      )
      if (originalIndex === -1) {
        return { ok: false, message: 'La actividad ya no existe.' }
      }
      const original = activitiesRef.current[originalIndex]

      setActivities((prev) => prev.filter((activity) => activity.id !== id))

      try {
        await deleteActivity(id)
        return { ok: true }
      } catch (err) {
        setActivities((prev) => {
          const next = [...prev]
          const insertAt = Math.min(originalIndex, next.length)
          next.splice(insertAt, 0, original)
          return next
        })
        const message = getApiErrorMessage(
          err,
          ACTIVITY_ERROR_MESSAGES,
          'No pudimos eliminar la actividad.',
        )
        return { ok: false, message }
      }
    },
    [],
  )

  const visibleActivities = filterByLocalDate(activities, selectedDate)

  const totalActivities = visibleActivities.length
  const totalHours = getTotalHours(visibleActivities, defaultActivityHours)
  const calendarEventCount = getCalendarEventCount(visibleActivities)
  const productivityPercentage = getProductivityPercentage(
    totalHours,
    workdayHours,
  )
  const sourceSummary = getSourceSummary(
    visibleActivities,
    SOURCES,
    defaultActivityHours,
  )
  const sourceCounts = getSourceCounts(visibleActivities, SOURCES)

  function handleExportExcel(source) {
    if (generatingFrom) return

    setGeneratingFrom(source)
    setToast({
      type: 'info',
      message: 'Generando el informe... Esto puede tardar hasta un minuto.',
    })

    generateReport({
      date: selectedDate,
    })
      .then((result) => {
        const sheetUrl = result?.xlsxUrl
        if (sheetUrl) {
          // Intento abrir en una pestaña nueva por conveniencia. Tras una espera
          // larga el navegador suele bloquear el pop-up (no hay gesto directo del
          // usuario), así que el link del Toast es el camino confiable.
          window.open(sheetUrl, '_blank', 'noopener,noreferrer')
          setToast({
            type: 'success',
            message: 'Informe generado exitosamente.',
            actionHref: sheetUrl,
            actionLabel: 'Abrir Google Sheet',
          })
        } else {
          setToast({
            type: 'success',
            message:
              'Informe generado, pero no pudimos crear el Google Sheet. Reconectá tu cuenta de Google e intentá de nuevo.',
          })
        }
      })
      .catch((error) => {
        console.error('Error al generar el informe:', error)
        let errorMessage =
          'Error al generar el informe. Por favor, intenta de nuevo.'

        if (error.code === 'ECONNABORTED') {
          errorMessage =
            'Error al generar el informe. La solicitud tardó demasiado tiempo (máx 2 minutos). Intenta de nuevo.'
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        }

        setToast({
          type: 'error',
          message: errorMessage,
        })
      })
      .finally(() => {
        setGeneratingFrom(null)
      })
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (isLoading) {
    return (
      <AppLayout
        user={user}
        onLogout={handleLogout}
        sourceCounts={{}}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onExportExcel={handleExportExcel}
        workdayHours={workdayHours}
        defaultActivityHours={defaultActivityHours}
        onWorkdayHoursChange={setWorkdayHours}
        onDefaultActivityHoursChange={setDefaultActivityHours}
      >
        <div className="py-10 text-center text-slate-500">
          Cargando reporte...
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout
        user={user}
        onLogout={handleLogout}
        sourceCounts={{}}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onExportExcel={handleExportExcel}
        workdayHours={workdayHours}
        defaultActivityHours={defaultActivityHours}
        onWorkdayHoursChange={setWorkdayHours}
        onDefaultActivityHoursChange={setDefaultActivityHours}
      >
        <div className="py-10 text-center text-red-500">
          Error al cargar el reporte.
        </div>
      </AppLayout>
    )
  }

  return (
    <>
      <AppLayout
        user={user}
        onLogout={handleLogout}
        sourceCounts={sourceCounts}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onExportExcel={handleExportExcel}
        generatingFrom={generatingFrom}
        workdayHours={workdayHours}
        defaultActivityHours={defaultActivityHours}
        onWorkdayHoursChange={setWorkdayHours}
        onDefaultActivityHoursChange={setDefaultActivityHours}
      >
        <JiraCallbackBanner />

        <JiraIntegrationCard />

        <DashboardStats
          totalActivities={totalActivities}
          calendarEventCount={calendarEventCount}
          totalHours={totalHours}
          productivityPercentage={productivityPercentage}
          workdayHours={workdayHours}
        />

        {loadError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {loadError}
          </div>
        )}

        <ReportView
          activities={visibleActivities}
          onAddActivity={handleAddActivity}
          onUpdateActivity={handleUpdateActivity}
          onDeleteActivity={handleDeleteActivity}
          defaultActivityHours={defaultActivityHours}
        />

        <SourceSummary
          sourceSummary={sourceSummary}
          workdayHours={workdayHours}
        />
      </AppLayout>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          actionHref={toast.actionHref}
          actionLabel={toast.actionLabel}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}

export default Dashboard

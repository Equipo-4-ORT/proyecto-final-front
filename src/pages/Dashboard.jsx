import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { useActivityData } from '../contexts/ActivityContext' 
import AppLayout from '../components/layout/AppLayout'
import Toast from '../components/common/Toast'
import { SOURCES } from '../constants/sources'
import DashboardStats from './Dashboard/components/DashboardStats'
import ReportView from './Dashboard/components/ReportView'
import SourceSummary from './Dashboard/components/SourceSummary'
import JiraCallbackBanner from './Dashboard/components/JiraCallbackBanner'
import JiraIntegrationCard from './Dashboard/components/JiraIntegrationCard'

import {
  getCalendarEventCount,
  getProductivityPercentage,
  getSourceSummary,
  getTotalHours,
  DEFAULT_ACTIVITY_HOURS,
  DEFAULT_WORKDAY_HOURS,
} from './Dashboard/utils/dashboardCalculations'

import {
  apiToActivity,
  activityToApiPayload,
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
  if (!storedValue) return fallbackValue
  const parsedValue = Number(storedValue)
  return Number.isNaN(parsedValue) ? fallbackValue : parsedValue
}

const ACTIVITY_ERROR_MESSAGES = {
  validation_error:
    'Revisá los datos: hay campos requeridos o fechas inválidas.',
  unauthenticated: 'Sesión expirada. Volvé a iniciar sesión.',
  activity_not_found: 'La actividad ya no existe.',
  activity_forbidden: 'No tenés permisos sobre esta actividad.',
}

function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const {
    activities: contextActivities,
    setDate: setContextDate,
    isLoading: isContextLoading,
    error: contextError,
    refreshActivities,
  } = useActivityData()

  const [searchParams] = useSearchParams()
  const urlDate = searchParams.get('date')

  const [selectedDate, setSelectedDate] = useState(urlDate || getTodayDate())
  const activities = contextActivities || []
  const activitiesRef = useRef(activities)

  const [activitiesState, setActivities] = useState(activities)
  const [loadError, setLoadError] = useState(null)

  const handleDateChange = (newDate) => {
  setSelectedDate(newDate); 
  setContextDate(newDate);  
};

  useEffect(() => {
    activitiesRef.current = activities
    setActivities(activities)
  }, [activities])

  const [workdayHours, setWorkdayHours] = useState(() =>
    getStoredNumber('workdayHours', DEFAULT_WORKDAY_HOURS),
  )
  const [defaultActivityHours, setDefaultActivityHours] = useState(() =>
    getStoredNumber('defaultActivityHours', DEFAULT_ACTIVITY_HOURS),
  )

  const [generatingFrom, setGeneratingFrom] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    localStorage.setItem('workdayHours', workdayHours)
  }, [workdayHours])

  useEffect(() => {
    localStorage.setItem('defaultActivityHours', defaultActivityHours)
  }, [defaultActivityHours])

  const handleAddActivity = useCallback(
  async (formData) => {
    setLoadError(null) 
    try {
      const payload = activityToApiPayload(
        formData,
        selectedDate,
        defaultActivityHours,
      )
      await createActivity(payload)
      await refreshActivities()
      return { ok: true }
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        ACTIVITY_ERROR_MESSAGES,
        'No pudimos crear la actividad.',
      )
      setLoadError(message) 
      return { ok: false, message }
    }
  },
  [selectedDate, defaultActivityHours, refreshActivities],
)

  const handleUpdateActivity = useCallback(
    async (id, editingData) => {
      setLoadError(null)
      const original = activitiesRef.current.find((a) => a.id === id)
      
      try {
        const payload = buildUpdatePayload(
          editingData,
          original,
          defaultActivityHours,
        )
        await updateActivity(id, payload)
        await refreshActivities()
        return { ok: true }
      } catch (err) {
        const message = getApiErrorMessage(
          err,
          ACTIVITY_ERROR_MESSAGES,
          'No pudimos actualizar la actividad.',
        )
        setLoadError(message) 
        return {
          ok: false,
          message,
        }
      }
    },
    [defaultActivityHours, refreshActivities],
  )

  const handleDeleteActivity = useCallback(
    async (id) => {
      setLoadError(null) 
      try {
        await deleteActivity(id)
        await refreshActivities()
        return { ok: true }
      } catch (err) {
        const message = getApiErrorMessage(
          err,
          ACTIVITY_ERROR_MESSAGES,
          'No pudimos eliminar la actividad.',
        )
        setLoadError(message) 
        return {
          ok: false,
          message,
        }
      }
    },
    [refreshActivities],
  )

  const visibleActivities = filterByLocalDate(activitiesState, selectedDate)
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

  if (isContextLoading)
    return <div className="py-10 text-center">Cargando reporte...</div>
  if (contextError)
    return (
      <div className="py-10 text-center text-red-500">
        Error al cargar el reporte.
      </div>
    )

  return (
    <AppLayout
      user={user}
      onLogout={handleLogout}
      selectedDate={selectedDate}
      onDateChange={handleDateChange}
      onExportExcel={handleExportExcel}
      generatingFrom={generatingFrom}
      workdayHours={workdayHours}
      defaultActivityHours={defaultActivityHours}
      onWorkdayHoursChange={setWorkdayHours}
      onDefaultActivityHoursChange={setDefaultActivityHours}
    >
      <JiraCallbackBanner />
      <JiraIntegrationCard onSynced={refreshActivities} />
      
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
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 my-4"
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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          actionHref={toast.actionHref}
          actionLabel={toast.actionLabel}
          onClose={() => setToast(null)}
        />
      )}
    </AppLayout>
  )
}

export default Dashboard

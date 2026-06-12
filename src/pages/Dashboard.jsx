import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { useActivityData } from '../contexts/ActivityContext' // <--- IMPORTANTE: Agregá este import
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

  // Consumimos el contexto
  const {
    activities: contextActivities,
    isLoading,
    error,
    refreshActivities,
  } = useActivityData()

  const [searchParams] = useSearchParams()
  const urlDate = searchParams.get('date')

  const [selectedDate, setSelectedDate] = useState(urlDate || getTodayDate())
  const activities = contextActivities || []
  const activitiesRef = useRef(activities)

  useEffect(() => {
    activitiesRef.current = activities
  }, [activities])

  const [workdayHours, setWorkdayHours] = useState(() =>
    getStoredNumber('workdayHours', DEFAULT_WORKDAY_HOURS),
  )
  const [defaultActivityHours, setDefaultActivityHours] = useState(() =>
    getStoredNumber('defaultActivityHours', DEFAULT_ACTIVITY_HOURS),
  )

  const [generatingFrom, setGeneratingFrom] = useState(null)
  const [toast, setToast] = useState(null)

  const handleAddActivity = useCallback(
    async (formData) => {
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
        return {
          ok: false,
          message: getApiErrorMessage(
            err,
            ACTIVITY_ERROR_MESSAGES,
            'No pudimos crear la actividad.',
          ),
        }
      }
    },
    [selectedDate, defaultActivityHours, refreshActivities],
  )

  const handleUpdateActivity = useCallback(
    async (id, editingData) => {
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
        return {
          ok: false,
          message: getApiErrorMessage(
            err,
            ACTIVITY_ERROR_MESSAGES,
            'No pudimos actualizar la actividad.',
          ),
        }
      }
    },
    [defaultActivityHours, refreshActivities],
  )

  const handleDeleteActivity = useCallback(
    async (id) => {
      try {
        await deleteActivity(id)
        await refreshActivities()
        return { ok: true }
      } catch (err) {
        return {
          ok: false,
          message: getApiErrorMessage(
            err,
            ACTIVITY_ERROR_MESSAGES,
            'No pudimos eliminar la actividad.',
          ),
        }
      }
    },
    [refreshActivities],
  )

  // Cálculos de UI
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

  function handleExportExcel(source) {
    if (generatingFrom) return
    setGeneratingFrom(source)
    generateReport({ date: selectedDate, activities: visibleActivities })
      .then(() =>
        setToast({ type: 'success', message: 'Informe generado exitosamente' }),
      )
      .catch(() =>
        setToast({ type: 'error', message: 'Error al generar el informe.' }),
      )
      .finally(() => setGeneratingFrom(null))
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (isLoading)
    return <div className="py-10 text-center">Cargando reporte...</div>
  if (error)
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
      onDateChange={setSelectedDate}
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
          onClose={() => setToast(null)}
        />
      )}
    </AppLayout>
  )
}

export default Dashboard

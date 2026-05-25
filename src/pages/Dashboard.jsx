import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import AppLayout from '../components/layout/AppLayout'
import Loading from '../components/common/Loading'
import { SOURCES } from '../constants/sources'
import { useReport } from '../hooks/useReport'
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
    getStoredNumber('defaultActivityHours', DEFAULT_ACTIVITY_HOURS),
  )

  const { data: report, isLoading, error } = useReport(selectedDate)

  useEffect(() => {
    localStorage.setItem('workdayHours', workdayHours)
  }, [workdayHours])

  useEffect(() => {
    localStorage.setItem('defaultActivityHours', defaultActivityHours)
  }, [defaultActivityHours])

  useEffect(() => {
    if (report?.activities) {
      const timer = setTimeout(() => {
        setActivities(report.activities)
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
  }, [report, error])

  const handleAddActivity = useCallback(
    async (formData) => {
      const tempId = crypto.randomUUID()
      const optimistic = buildOptimisticActivity(formData, tempId, selectedDate)

      setActivities((prev) => [...prev, optimistic])

      try {
        const payload = activityToApiPayload(
          formData,
          selectedDate,
          defaultActivityHours,
        )
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

  function handleExportExcel() {
    console.log('Exportar Excel', {
      selectedDate,
      activities: visibleActivities,
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
    <AppLayout
      user={user}
      onLogout={handleLogout}
      sourceCounts={sourceCounts}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      onExportExcel={handleExportExcel}
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
  )
}

export default Dashboard
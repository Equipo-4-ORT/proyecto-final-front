import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import EmptyState from './Dashboard/components/EmptyState'
import AppLayout from '../components/layout/AppLayout'
import Toast from '../components/common/Toast'
import { SOURCES } from '../constants/sources'

import DashboardStats from './Dashboard/components/DashboardStats'
import ReportView from './Dashboard/components/ReportView'
import SourceSummary from './Dashboard/components/SourceSummary'

import {
  getCalendarEventCount,
  getProductivityPercentage,
  getSourceCounts,
  getSourceSummary,
  getTotalHours,
  DEFAULT_ACTIVITY_HOURS,
  DEFAULT_WORKDAY_HOURS,
} from './Dashboard/utils/dashboardCalculations'

import { initialActivities } from './Dashboard/mocks/activities'
import { getTodayDate } from '../utils/dateHelpers'
import { reportsApi } from '../services/api'

function getStoredNumber(key, fallbackValue) {
  const storedValue = localStorage.getItem(key)

  if (!storedValue) {
    return fallbackValue
  }

  const parsedValue = Number(storedValue)

  return Number.isNaN(parsedValue) ? fallbackValue : parsedValue
}

function Dashboard() {
  const navigate = useNavigate()

  const { user, logout } = useAuth()

  const [activities, setActivities] = useState(initialActivities)

  const [selectedDate, setSelectedDate] = useState(getTodayDate())

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

  const totalActivities = activities.length

  const totalHours = getTotalHours(activities, defaultActivityHours)

  const calendarEventCount = getCalendarEventCount(activities)

  const productivityPercentage = getProductivityPercentage(
    totalHours,
    workdayHours,
  )

  const sourceSummary = getSourceSummary(
    activities,
    SOURCES,
    defaultActivityHours,
  )

  const sourceCounts = getSourceCounts(activities, SOURCES)

  function handleExportExcel(source) {
    if (generatingFrom) return

    setGeneratingFrom(source)
    setToast(null)

    reportsApi
      .generateReport({
        date: selectedDate,
        activities,
      })
      .then(() => {
        setToast({
          type: 'success',
          message: 'Informe generado exitosamente',
        })
      })
      .catch((error) => {
        console.error('Error al generar el informe:', error)
        let errorMessage =
          'Error al generar el informe. Por favor, intenta de nuevo.'

        if (error.code === 'ECONNABORTED') {
          errorMessage =
            'Error al generar el informe. La solicitud tardó demasiado tiempo (máx 90 segundos). Intenta de nuevo.'
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

  function handleGenerateReport() {
    // TODO: llamar al backend para generar el informe (GET /activities + procesamiento IA)
    console.log('Generar informe')
  }

  function handleLogout() {
    logout()

    navigate('/login')
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
        <DashboardStats
          totalActivities={totalActivities}
          calendarEventCount={calendarEventCount}
          totalHours={totalHours}
          productivityPercentage={productivityPercentage}
          workdayHours={workdayHours}
        />
        {activities.length === 0 ? (
          <EmptyState onGenerate={handleGenerateReport} />
        ) : (
          <ReportView
            activities={activities}
            setActivities={setActivities}
            defaultActivityHours={defaultActivityHours}
          />
        )}

        <SourceSummary
          sourceSummary={sourceSummary}
          workdayHours={workdayHours}
        />
      </AppLayout>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}

export default Dashboard

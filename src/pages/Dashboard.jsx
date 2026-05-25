import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import EmptyState from './Dashboard/components/EmptyState'
import AppLayout from '../components/layout/AppLayout'
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

import { getTodayDate } from '../utils/dateHelpers'

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

  const [activities, setActivities] = useState([])
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  const { data: report, isLoading, error } = useReport(selectedDate)

  const [workdayHours, setWorkdayHours] = useState(() =>
    getStoredNumber('workdayHours', DEFAULT_WORKDAY_HOURS),
  )

  const [defaultActivityHours, setDefaultActivityHours] = useState(() =>
    getStoredNumber('defaultActivityHours', DEFAULT_ACTIVITY_HOURS),
  )

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

  const displayedActivities =
    report?.activities?.length > 0 ? report.activities : activities

  function handleExportExcel() {
    // TODO: reemplazar por llamada al backend — POST /reports/export con selectedDate y activities
    console.log('Exportar Excel', {
      selectedDate,
      activities,
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
      {activities.length === 0 ? (
        <EmptyState onGenerate={handleGenerateReport} />
      ) : (
        <ReportView
  activities={displayedActivities}
  setActivities={setActivities}
  defaultActivityHours={defaultActivityHours}
/>
      )}

      <SourceSummary
        sourceSummary={sourceSummary}
        workdayHours={workdayHours}
      />
    </AppLayout>
  )
}

export default Dashboard

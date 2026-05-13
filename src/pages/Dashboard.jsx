import { useEffect, useState } from "react"
import AppLayout from "../components/layout/AppLayout"
import Loading from "../components/common/Loading"
import { SOURCES } from "../constants/sources"
import DashboardStats from "./Dashboard/components/DashboardStats"
import { getMeetCount, getProductivityPercentage, getSourceCounts, getSourceSummary, getTotalHours, DEFAULT_ACTIVITY_HOURS, DEFAULT_WORKDAY_HOURS, } from "./Dashboard/utils/dashboardCalculations"
import ActivitiesTable from "./Dashboard/components/ActivitiesTable"
import SourceSummary from "./Dashboard/components/SourceSummary"
import { initialActivities } from "./Dashboard/mocks/activities"
import { getTodayDate } from "../utils/dateHelpers"

function getStoredNumber(key, fallbackValue) {
  const storedValue = localStorage.getItem(key)
  if (!storedValue) {
    return fallbackValue
  }
  const parsedValue = Number(storedValue)

  return Number.isNaN(parsedValue) ? fallbackValue : parsedValue
}

function Dashboard() {
  const [activities, setActivities] = useState(initialActivities)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  const [workdayHours, setWorkdayHours] = useState(() => getStoredNumber("workdayHours", DEFAULT_WORKDAY_HOURS))
  const [defaultActivityHours, setDefaultActivityHours] = useState(() => getStoredNumber("defaultActivityHours", DEFAULT_ACTIVITY_HOURS))

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])
  useEffect(() => {
    localStorage.setItem("workdayHours", workdayHours)
  }, [workdayHours])
  useEffect(() => {
    localStorage.setItem("defaultActivityHours", defaultActivityHours)
  }, [defaultActivityHours])

  const totalActivities = activities.length
  const totalHours = getTotalHours(activities, defaultActivityHours)
  const meetCount = getMeetCount(activities)
  const productivityPercentage = getProductivityPercentage(totalHours,workdayHours)
  const sourceSummary = getSourceSummary(activities, SOURCES, defaultActivityHours)
  const sourceCounts = getSourceCounts(activities, SOURCES)

  function handleExportExcel() {
    //Reemplazar por llamada al backend cuando esté dispo
    console.log("Exportar Excel", {
      selectedDate,
      activities,
    })
  }

  if (isLoading) {
    return (
      <AppLayout
        sourceCounts={{}}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onExportExcel={handleExportExcel}
        workdayHours={workdayHours}
        defaultActivityHours={defaultActivityHours}
        onWorkdayHoursChange={setWorkdayHours}
        onDefaultActivityHoursChange={setDefaultActivityHours}
      >
        <Loading message="Cargando dashboard..." />
      </AppLayout>
    )
  }

  return (
    <AppLayout
      sourceCounts={sourceCounts}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      onExportExcel={handleExportExcel}
      workdayHours={workdayHours}
      defaultActivityHours={defaultActivityHours}
      onWorkdayHoursChange={setWorkdayHours}
      onDefaultActivityHoursChange={setDefaultActivityHours}
    >
      <DashboardStats
        totalActivities={totalActivities}
        meetCount={meetCount}
        totalHours={totalHours}
        productivityPercentage={productivityPercentage}
        workdayHours={workdayHours}
      />
      <ActivitiesTable
        activities={activities}
        setActivities={setActivities}
        defaultActivityHours={defaultActivityHours}
      />
      <SourceSummary sourceSummary={sourceSummary} workdayHours={workdayHours}/>
    </AppLayout>
  )
}

export default Dashboard
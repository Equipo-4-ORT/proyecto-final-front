import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"

import AppLayout from "../components/layout/AppLayout"
import { SOURCES } from "../constants/sources"

import DashboardStats from "./Dashboard/components/DashboardStats"
import ActivitiesTable from "./Dashboard/components/ActivitiesTable"
import SourceSummary from "./Dashboard/components/SourceSummary"

import {
  getCalendarEventCount,
  getProductivityPercentage,
  getSourceCounts,
  getSourceSummary,
  getTotalHours,
  DEFAULT_ACTIVITY_HOURS,
  DEFAULT_WORKDAY_HOURS,
} from "./Dashboard/utils/dashboardCalculations"

import { initialActivities } from "./Dashboard/mocks/activities"
import { getTodayDate } from "../utils/dateHelpers"

function getStoredNumber(key, fallbackValue) {
  const storedValue = localStorage.getItem(key)

  if (!storedValue) {
    return fallbackValue
  }

  const parsedValue = Number(storedValue)

  return Number.isNaN(parsedValue)
    ? fallbackValue
    : parsedValue
}

function Dashboard() {
  const navigate = useNavigate()

  const { user, logout } = useAuth()

  const [activities, setActivities] = useState(initialActivities)

  const [selectedDate, setSelectedDate] = useState(
    getTodayDate()
  )

  const [workdayHours, setWorkdayHours] = useState(() =>
    getStoredNumber(
      "workdayHours",
      DEFAULT_WORKDAY_HOURS
    )
  )

  const [defaultActivityHours, setDefaultActivityHours] =
    useState(() =>
      getStoredNumber(
        "defaultActivityHours",
        DEFAULT_ACTIVITY_HOURS
      )
    )

  useEffect(() => {
    localStorage.setItem(
      "workdayHours",
      workdayHours
    )
  }, [workdayHours])

  useEffect(() => {
    localStorage.setItem(
      "defaultActivityHours",
      defaultActivityHours
    )
  }, [defaultActivityHours])

  const totalActivities = activities.length

  const totalHours = getTotalHours(
    activities,
    defaultActivityHours
  )

  const calendarEventCount =
    getCalendarEventCount(activities)

  const productivityPercentage =
    getProductivityPercentage(
      totalHours,
      workdayHours
    )

  const sourceSummary = getSourceSummary(
    activities,
    SOURCES,
    defaultActivityHours
  )

  const sourceCounts = getSourceCounts(
    activities,
    SOURCES
  )

  function handleExportExcel() {
    // Reemplazar por backend después
    console.log("Exportar Excel", {
      selectedDate,
      activities,
    })
  }

  function handleLogout() {
    logout()

    navigate("/login")
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
      onDefaultActivityHoursChange={
        setDefaultActivityHours
      }
    >
      <DashboardStats
        totalActivities={totalActivities}
        calendarEventCount={calendarEventCount}
        totalHours={totalHours}
        productivityPercentage={
          productivityPercentage
        }
        workdayHours={workdayHours}
      />

      <ActivitiesTable
        activities={activities}
        setActivities={setActivities}
        defaultActivityHours={
          defaultActivityHours
        }
      />

      <SourceSummary
        sourceSummary={sourceSummary}
        workdayHours={workdayHours}
      />
    </AppLayout>
  )
}

export default Dashboard
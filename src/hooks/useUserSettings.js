import { useState, useEffect } from 'react'
import { getUserSettings } from '../services/userSettingsApi'
import {
  DEFAULT_ACTIVITY_HOURS,
  DEFAULT_WORKDAY_HOURS,
  parseTimeToMinutes,
} from '../pages/Dashboard/utils/dashboardCalculations'

function deriveWorkdayHours(startTime, endTime) {
  if (!startTime || !endTime) return null
  const diffHours = (parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime)) / 60
  return diffHours > 0 ? diffHours : null
}

/**
 * Lee las preferencias del usuario desde el backend (GET /api/users/me/settings)
 * y las traduce a los valores que usa el dashboard para sus cálculos.
 * Si el backend no responde, se mantienen los valores por defecto.
 */
export function useUserSettings() {
  const [workdayHours, setWorkdayHours] = useState(DEFAULT_WORKDAY_HOURS)
  const [defaultActivityHours, setDefaultActivityHours] = useState(DEFAULT_ACTIVITY_HOURS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    getUserSettings()
      .then((settings) => {
        if (!isMounted || !settings) return

        const derivedWorkday = deriveWorkdayHours(
          settings.workStartTime,
          settings.workEndTime,
        )
        if (derivedWorkday) setWorkdayHours(derivedWorkday)

        const duration = Number(settings.defaultDuration)
        if (duration > 0) setDefaultActivityHours(duration)
      })
      .catch((err) => {
        console.error('useUserSettings: no se pudieron cargar las preferencias', err)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { workdayHours, defaultActivityHours, isLoading }
}

import { useCallback, useState, useEffect } from 'react'
import { listActivities } from '../services/activitiesApi'
import { apiToActivity } from '../pages/Dashboard/utils/activityMapper'
import { getUserTimeZone } from '../utils/dateHelpers'

export function useActivities(selectedDate) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadIndex, setReloadIndex] = useState(0)

  const refetch = useCallback(() => {
    setReloadIndex((index) => index + 1)
  }, [])

  useEffect(() => {
    let isMounted = true

    const initializeFetch = () => {
      if (isMounted) {
        setIsLoading(true)
        setError(null)
      }
    }

    initializeFetch()

    listActivities({ date: selectedDate, timezone: getUserTimeZone() })
      .then((serverActivities) => {
        if (!isMounted) return
        setData(serverActivities.map(apiToActivity))
        setIsLoading(false)
      })
      .catch((err) => {
        if (!isMounted) return
        console.error(
          'useActivities: error al cargar las actividades del día',
          selectedDate,
        )
        setError(err)
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedDate, reloadIndex])

  return { data, isLoading, error, refetch }
}

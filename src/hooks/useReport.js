import { useState, useEffect } from 'react'
import { getReportByDate } from '../services/reportsService'

export function useReport(selectedDate) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const initializeFetch = () => {
      if (isMounted) {
        setIsLoading(true)
        setError(null)
      }
    };

    initializeFetch()

    getReportByDate(selectedDate)
      .then((reportData) => {
        if (isMounted) {
          setData(reportData)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Error crítico e inesperado en useReport:", err)
          setError(err)
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedDate])

  return { data, isLoading, error }
}
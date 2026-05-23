import { useCallback, useEffect, useState } from "react"
import {
  buildTodayWindow,
  disconnectJira,
  getJiraAuthUrl,
  getJiraStatus,
  triggerJiraSync,
} from "../services/jiraApi"

const extractErrorCode = (error) => {
  const data = error?.response?.data
  if (data && typeof data === "object") {
    if (typeof data.code === "string") return data.code
    if (typeof data.error === "string") return data.error
  }
  return "unknown_error"
}

export function useJiraConnection() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionInFlight, setActionInFlight] = useState(null)
  const [error, setError] = useState(null)
  const [lastSyncResult, setLastSyncResult] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getJiraStatus()
      setStatus(data)
    } catch (err) {
      setError({ scope: "status", code: extractErrorCode(err) })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const connect = useCallback(async () => {
    setActionInFlight("connect")
    setError(null)
    try {
      const url = await getJiraAuthUrl()
      // Navegación imperativa intencional: Atlassian requiere salir de la SPA
      // para completar el flujo OAuth. No se puede usar useNavigate aquí.
      window.location.href = url
    } catch (err) {
      setError({ scope: "connect", code: extractErrorCode(err) })
      setActionInFlight(null)
    }
  }, [])

  const disconnect = useCallback(async () => {
    setActionInFlight("disconnect")
    setError(null)
    try {
      await disconnectJira()
      await refresh()
    } catch (err) {
      setError({ scope: "disconnect", code: extractErrorCode(err) })
    } finally {
      setActionInFlight(null)
    }
  }, [refresh])

  const syncToday = useCallback(async () => {
    setActionInFlight("sync")
    setError(null)
    setLastSyncResult(null)
    try {
      const window = buildTodayWindow()
      const result = await triggerJiraSync(window)
      setLastSyncResult(result)
      await refresh()
    } catch (err) {
      setError({ scope: "sync", code: extractErrorCode(err) })
    } finally {
      setActionInFlight(null)
    }
  }, [refresh])

  return {
    status,
    loading,
    actionInFlight,
    error,
    lastSyncResult,
    connect,
    disconnect,
    syncToday,
    refresh,
  }
}

import { AlertTriangle, Link2, Link2Off, RefreshCw } from "lucide-react"
import Badge from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import Card from "../../../components/ui/Card"
import { useJiraConnection } from "../../../hooks/useJiraConnection"

const ERROR_MESSAGES = {
  not_connected: "La conexión con Jira no está activa. Reconectá tu cuenta.",
  reconnect_required: "La conexión a Jira expiró. Reconectá tu cuenta.",
  invalid_window: "Rango de fechas inválido.",
  user_not_found: "No encontramos tu usuario.",
  token_exchange_failed: "Atlassian rechazó la autenticación. Probá de nuevo.",
  upstream_timeout: "Atlassian tardó demasiado en responder.",
  upstream_error: "Error al comunicarse con Atlassian.",
  unauthenticated: "Sesión expirada. Volvé a iniciar sesión.",
  unknown_error: "Ocurrió un error inesperado.",
}

const formatDateTime = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

function ConnectionBadge({ status }) {
  if (!status) return null
  if (status.reconnectRequired) {
    return <Badge color="amber">Reconexión requerida</Badge>
  }
  if (status.connected) {
    return <Badge color="green">Conectado</Badge>
  }
  return <Badge color="slate">No conectado</Badge>
}

function ErrorMessage({ error }) {
  if (!error) return null
  const message = ERROR_MESSAGES[error.code] || ERROR_MESSAGES.unknown_error
  return (
    <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  )
}

function SyncResult({ result }) {
  if (!result) return null
  return (
    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
      Sincronización completa: {result.imported} importadas, {result.skippedDuplicates} duplicadas.
    </div>
  )
}

function JiraIntegrationCard() {
  const {
    status,
    loading,
    actionInFlight,
    error,
    lastSyncResult,
    connect,
    disconnect,
    syncToday,
  } = useJiraConnection()

  const isConnected = Boolean(status?.connected)
  const reconnectRequired = Boolean(status?.reconnectRequired)
  const canSync = isConnected && !reconnectRequired
  const lastSyncLabel = formatDateTime(status?.lastSyncAt)

  return (
    <Card className="p-4 sm:p-6 mb-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Link2 size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Jira</h3>
            <p className="text-sm text-slate-500">
              Importá tu actividad de Jira al dashboard.
            </p>
          </div>
        </div>
        <ConnectionBadge status={status} />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando estado de la conexión…</p>
      ) : (
        <div className="space-y-3">
          {isConnected && status?.siteUrl && (
            <p className="text-sm text-slate-600">
              Site: <span className="font-medium text-slate-800">{status.siteUrl}</span>
            </p>
          )}

          {isConnected && (
            <p className="text-sm text-slate-600">
              Última sincronización:{" "}
              <span className="font-medium text-slate-800">
                {lastSyncLabel || "todavía no sincronizaste"}
              </span>
            </p>
          )}

          <ErrorMessage error={error} />
          <SyncResult result={lastSyncResult} />

          <div className="flex flex-wrap gap-2 pt-1">
            {(!isConnected || reconnectRequired) && (
              <Button
                variant="primary"
                onClick={connect}
                disabled={actionInFlight === "connect"}
              >
                {actionInFlight === "connect" ? "Redirigiendo…" : "Conectar Jira"}
              </Button>
            )}

            {canSync && (
              <Button
                variant="primary"
                onClick={syncToday}
                disabled={actionInFlight === "sync"}
                className="inline-flex items-center gap-2"
              >
                <RefreshCw
                  size={16}
                  className={actionInFlight === "sync" ? "animate-spin" : ""}
                />
                {actionInFlight === "sync" ? "Sincronizando…" : "Sincronizar hoy"}
              </Button>
            )}

            {isConnected && (
              <Button
                variant="outline"
                onClick={disconnect}
                disabled={actionInFlight === "disconnect"}
                className="inline-flex items-center gap-2"
              >
                <Link2Off size={16} />
                {actionInFlight === "disconnect" ? "Desconectando…" : "Desconectar"}
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

export default JiraIntegrationCard

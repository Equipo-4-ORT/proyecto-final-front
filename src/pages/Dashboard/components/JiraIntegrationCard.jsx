import { AlertTriangle, Link2, Link2Off } from "lucide-react"
import Badge from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import Card from "../../../components/ui/Card"
import { useJiraConnection } from "../../../hooks/useJiraConnection"

const ERROR_MESSAGES = {
  not_connected: "La conexión con Jira no está activa. Reconectá tu cuenta.",
  reconnect_required: "La conexión a Jira expiró. Reconectá tu cuenta.",
  user_not_found: "No encontramos tu usuario.",
  token_exchange_failed: "Atlassian rechazó la autenticación. Probá de nuevo.",
  upstream_timeout: "Atlassian tardó demasiado en responder.",
  upstream_error: "Error al comunicarse con Atlassian.",
  unauthenticated: "Sesión expirada. Volvé a iniciar sesión.",
  unknown_error: "Ocurrió un error inesperado.",
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
    <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  )
}

function JiraIntegrationCard() {
  const { status, loading, actionInFlight, error, connect, disconnect } =
    useJiraConnection()

  const isConnected = Boolean(status?.connected)
  const reconnectRequired = Boolean(status?.reconnectRequired)

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Link2 size={18} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800">Jira</h3>
              {!loading && <ConnectionBadge status={status} />}
            </div>
            {loading ? (
              <p className="text-xs text-slate-500">Cargando estado…</p>
            ) : isConnected && status?.siteUrl ? (
              <p className="text-xs text-slate-500 truncate">{status.siteUrl}</p>
            ) : (
              <p className="text-xs text-slate-500">
                Conectá tu cuenta para importar tu actividad de Jira.
              </p>
            )}
          </div>
        </div>

        {!loading && (
          <div className="flex flex-wrap gap-2">
            {(!isConnected || reconnectRequired) && (
              <Button
                variant="primary"
                onClick={connect}
                disabled={actionInFlight === "connect"}
              >
                {actionInFlight === "connect" ? "Redirigiendo…" : "Conectar Jira"}
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
        )}
      </div>

      {!loading && <ErrorMessage error={error} />}
    </Card>
  )
}

export default JiraIntegrationCard

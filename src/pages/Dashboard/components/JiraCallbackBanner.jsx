import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { CheckCircle2, Info, X, XCircle } from "lucide-react"

const VALID_JIRA_PARAMS = new Set(["connected", "cancelled", "error"])

const REASON_MESSAGES = {
  token_exchange_failed: "Atlassian rechazó la autenticación. Probá de nuevo.",
  invalid_state: "El enlace de autorización expiró. Reintentá la conexión.",
  no_jira_site: "No encontramos un site de Jira en esa cuenta de Atlassian.",
  user_not_found: "No encontramos tu usuario en el sistema.",
  persistence_failed: "No pudimos guardar la conexión. Intentá de nuevo.",
}

const buildMessage = (jiraParam, reasonParam) => {
  if (jiraParam === "connected") {
    return { variant: "success", text: "¡Listo! Tu cuenta de Jira está conectada." }
  }
  if (jiraParam === "cancelled") {
    return { variant: "info", text: "Cancelaste la conexión con Jira." }
  }
  if (jiraParam === "error") {
    return {
      variant: "error",
      text: REASON_MESSAGES[reasonParam] || "No pudimos conectar con Jira.",
    }
  }
  return null
}

const VARIANT_STYLES = {
  success: {
    container: "bg-emerald-50 border-emerald-200 text-emerald-800",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-800",
    icon: Info,
    iconClass: "text-blue-600",
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-800",
    icon: XCircle,
    iconClass: "text-red-600",
  },
}

function JiraCallbackBanner() {
  const location = useLocation()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  const message = useMemo(() => {
    const params = new URLSearchParams(location.search)
    const jiraParam = params.get("jira")
    if (!jiraParam || !VALID_JIRA_PARAMS.has(jiraParam)) return null
    return buildMessage(jiraParam, params.get("reason"))
  }, [location.search])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (!params.has("jira")) return

    params.delete("jira")
    params.delete("reason")
    const remaining = params.toString()
    const cleanUrl = `${location.pathname}${remaining ? `?${remaining}` : ""}`
    navigate(cleanUrl, { replace: true })
  }, [location.pathname, location.search, navigate])

  if (!message || dismissed) return null

  const style = VARIANT_STYLES[message.variant]
  const Icon = style.icon

  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-2xl border p-4 mb-6 ${style.container}`}
    >
      <Icon size={20} className={`mt-0.5 shrink-0 ${style.iconClass}`} />
      <p className="flex-1 text-sm font-medium">{message.text}</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="rounded-full p-1 hover:bg-black/5 transition"
        aria-label="Cerrar"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export default JiraCallbackBanner

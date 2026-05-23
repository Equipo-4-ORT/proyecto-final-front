import api from "./api"

function isValidAtlassianAuthUrl(raw) {
  try {
    const parsed = new URL(raw)
    return parsed.protocol === "https:" && parsed.hostname === "auth.atlassian.com"
  } catch {
    return false
  }
}

export async function getJiraStatus() {
  const { data } = await api.get("/api/jira/status")
  return data
}

export async function getJiraAuthUrl() {
  const { data } = await api.get("/api/jira/auth")
  const url = typeof data?.authorizationUrl === "string" ? data.authorizationUrl : ""

  if (!isValidAtlassianAuthUrl(url)) {
    throw new Error("URL de autorización inválida")
  }

  return url
}

export async function disconnectJira() {
  await api.delete("/api/jira/connection")
}

export async function triggerJiraSync({ dateStart, dateEnd }) {
  const { data } = await api.post("/api/jira/sync", { dateStart, dateEnd })
  return data
}

export function buildTodayWindow(now = new Date()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  return { dateStart: start.toISOString(), dateEnd: now.toISOString() }
}

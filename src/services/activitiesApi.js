import api from "./api"

export async function listActivities(filters = {}) {
  const params = {}
  if (filters.date) params.date = filters.date
  if (filters.timezone) params.timezone = filters.timezone
  if (filters.source) params.source = filters.source

  const { data } =
    Object.keys(params).length > 0
      ? await api.get("/api/activities", { params })
      : await api.get("/api/activities")

  return Array.isArray(data) ? data : []
}

export async function createActivity(payload) {
  const { data } = await api.post("/api/activities", payload)
  return data
}

export async function updateActivity(id, payload) {
  const safeId = encodeURIComponent(id)
  const { data } = await api.put(`/api/activities/${safeId}`, payload)
  return data
}

export async function deleteActivity(id) {
  const safeId = encodeURIComponent(id)
  await api.delete(`/api/activities/${safeId}`)
}

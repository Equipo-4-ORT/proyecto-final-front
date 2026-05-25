import { DEFAULT_ACTIVITY_HOURS } from "./dashboardCalculations"

function pad2(value) {
  return String(value).padStart(2, "0")
}

export function getLocalDateString(isoDate) {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return ""
  }
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function getLocalTimeString(isoDate) {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return ""
  }
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

function combineDateAndTime(dateString, timeString) {
  const [year, month, day] = dateString.split("-").map(Number)
  const [hours, minutes] = timeString.split(":").map(Number)
  const local = new Date(year, month - 1, day, hours, minutes, 0, 0)
  return local.toISOString()
}

export function apiToActivity(serverActivity) {
  const metadata =
    serverActivity.metadata && typeof serverActivity.metadata === "object"
      ? serverActivity.metadata
      : {}
  const isManual = serverActivity.source === "manual"

  return {
    id: serverActivity.id,
    source: isManual ? metadata.category || "manual" : serverActivity.source,
    title: serverActivity.activityType || metadata.title || "",
    description: metadata.description || "",
    start: getLocalTimeString(serverActivity.startTime),
    end: getLocalTimeString(serverActivity.endTime),
    status: metadata.status || "pending",
    notes: metadata.notes || "",
    startTime: serverActivity.startTime,
  }
}

function buildActivityPayload(dateString, formLikeData, sourceFallback, status, defaultActivityHours) {
  const startTime = combineDateAndTime(dateString, formLikeData.start)

  let endTime
  if (formLikeData.end) {
    endTime = combineDateAndTime(dateString, formLikeData.end)
  } else {
    const startDate = new Date(startTime)
    endTime = new Date(startDate.getTime() + defaultActivityHours * 60 * 60 * 1000).toISOString()
  }

  const title = formLikeData.title?.trim() || ""
  const description = formLikeData.description?.trim() || ""
  const notes = formLikeData.notes?.trim() || ""

  return {
    activityType: title || sourceFallback,
    startTime,
    endTime,
    metadata: {
      category: sourceFallback,
      title,
      description,
      notes,
      status,
    },
  }
}

export function activityToApiPayload(
  formData,
  selectedDate,
  defaultActivityHours = DEFAULT_ACTIVITY_HOURS,
) {
  return buildActivityPayload(selectedDate, formData, formData.source, "pending", defaultActivityHours)
}

export function buildOptimisticActivity(formData, id, selectedDate) {
  const startTime = combineDateAndTime(selectedDate, formData.start)
  return {
    id,
    source: formData.source,
    title: formData.title?.trim() || "",
    description: formData.description?.trim() || "",
    start: formData.start,
    end: formData.end || "",
    status: "pending",
    notes: formData.notes?.trim() || "",
    startTime,
    _pending: true,
  }
}

export function buildUpdatePayload(
  editingData,
  originalActivity,
  defaultActivityHours = DEFAULT_ACTIVITY_HOURS,
) {
  const dateString = getLocalDateString(originalActivity.startTime)
  return buildActivityPayload(
    dateString,
    editingData,
    originalActivity.source,
    originalActivity.status || "pending",
    defaultActivityHours,
  )
}

export function buildOptimisticUpdate(activity, editingData) {
  return {
    ...activity,
    title: editingData.title?.trim() || "",
    description: editingData.description?.trim() || "",
    start: editingData.start,
    end: editingData.end || "",
    notes: editingData.notes?.trim() || "",
    _pending: true,
  }
}

export function filterByLocalDate(activities, selectedDate) {
  return activities.filter((activity) => {
    if (!activity.startTime) return false
    return getLocalDateString(activity.startTime) === selectedDate
  })
}

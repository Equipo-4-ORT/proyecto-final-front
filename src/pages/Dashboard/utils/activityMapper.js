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

export function activityToApiPayload(
  formData,
  selectedDate,
  defaultActivityHours = DEFAULT_ACTIVITY_HOURS,
) {
  const startTime = combineDateAndTime(selectedDate, formData.start)

  let endTime
  if (formData.end) {
    endTime = combineDateAndTime(selectedDate, formData.end)
  } else {
    const startDate = new Date(startTime)
    const endDate = new Date(
      startDate.getTime() + defaultActivityHours * 60 * 60 * 1000,
    )
    endTime = endDate.toISOString()
  }

  const title = formData.title?.trim() || ""
  const description = formData.description?.trim() || ""
  const notes = formData.notes?.trim() || ""

  return {
    activityType: title || formData.source,
    startTime,
    endTime,
    metadata: {
      category: formData.source,
      title,
      description,
      notes,
      status: "pending",
    },
  }
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
  const startTime = combineDateAndTime(dateString, editingData.start)

  let endTime
  if (editingData.end) {
    endTime = combineDateAndTime(dateString, editingData.end)
  } else {
    const startDate = new Date(startTime)
    const endDate = new Date(
      startDate.getTime() + defaultActivityHours * 60 * 60 * 1000,
    )
    endTime = endDate.toISOString()
  }

  const title = editingData.title?.trim() || ""
  const description = editingData.description?.trim() || ""
  const notes = editingData.notes?.trim() || ""

  return {
    activityType: title || originalActivity.source,
    startTime,
    endTime,
    metadata: {
      category: originalActivity.source,
      title,
      description,
      notes,
      status: originalActivity.status || "pending",
    },
  }
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
    if (!activity.startTime) {
      return true
    }
    return getLocalDateString(activity.startTime) === selectedDate
  })
}

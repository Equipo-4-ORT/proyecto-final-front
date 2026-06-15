export const DEFAULT_WORKDAY_HOURS = 9

export function parseTimeToMinutes(time) {
  if (!time || !time.includes(":")) {
    return 0
  }
  const [hours, minutes] = time.split(":").map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0
  }

  return hours * 60 + minutes
}

export function getActivityEndTime(activity) {
  // El backend garantiza endTime en toda actividad persistida; el front ya no
  // estima duración. Si por algún motivo no hubiera fin, devolvemos el inicio.
  return activity.end || activity.start
}

export function getActivityDurationMinutes(activity) {
  const startMinutes = parseTimeToMinutes(activity.start)
  const endMinutes = activity.end ? parseTimeToMinutes(activity.end) : startMinutes

  return Math.max(endMinutes - startMinutes, 0)
}

export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${remainingMinutes} min`
}

export function getTotalMinutes(activities) {
  return activities.reduce((total, activity) => {
    return total + getActivityDurationMinutes(activity)
  }, 0)
}

export function getTotalHours(activities) {
  return getTotalMinutes(activities) / 60
}

export function getCalendarEventCount(activities) {
  return activities.filter((activity) => activity.source === "calendar").length
}

// Largo de la jornada laboral (en horas) a partir de la configuración del usuario
// (workStartTime/workEndTime en "HH:MM"). El backend siempre provee estos valores
// (tienen @default "09:00"/"18:00"), pero si faltaran caemos al default. Soporta
// jornadas que cruzan la medianoche (ej. turno noche 21:00 → 02:00 = 5 h).
export function getWorkdayHours(workStartTime, workEndTime) {
  if (!workStartTime || !workEndTime) {
    return DEFAULT_WORKDAY_HOURS
  }
  const start = parseTimeToMinutes(workStartTime)
  const end = parseTimeToMinutes(workEndTime)
  let minutes = end - start
  if (minutes <= 0) {
    minutes += 24 * 60
  }

  return minutes / 60
}

export function getProductivityPercentage(totalHours, workdayHours = DEFAULT_WORKDAY_HOURS,) {
  const percentage = Math.round((totalHours / workdayHours) * 100)

  return Math.min(Math.max(percentage, 0), 100)
}

export function getSourceSummary(activities, sources) {
  const totalMinutes = getTotalMinutes(activities)

  return Object.entries(sources).map(([sourceKey, source]) => {
    const sourceActivities = activities.filter(
      (activity) => activity.source === sourceKey
    )

    const sourceMinutes = getTotalMinutes(sourceActivities)

    const percentage = totalMinutes > 0
      ? Math.round((sourceMinutes / totalMinutes) * 100)
      : 0

    return {
      key: sourceKey,
      ...source,
      activities: sourceActivities.length,
      minutes: sourceMinutes,
      hours: sourceMinutes / 60,
      percentage,
    }
  })
}

export function getSourceCounts(activities, sources) {
  const counts = {}
  Object.keys(sources).forEach((sourceKey) => {
    counts[sourceKey] = activities.filter(
      (activity) => activity.source === sourceKey
    ).length
  })

  return counts
}
export const DEFAULT_WORKDAY_HOURS = 8
export const DEFAULT_ACTIVITY_HOURS = 1

function parseTimeToMinutes(time) {
  if (!time || !time.includes(":")) {
    return 0
  }
  const [hours, minutes] = time.split(":").map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0
  }

  return hours * 60 + minutes
}

function formatMinutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

export function getActivityEndTime( activity, defaultActivityHours = DEFAULT_ACTIVITY_HOURS,) {
  if (activity.end) {
    return activity.end
  }
  const startMinutes = parseTimeToMinutes(activity.start)
  const estimatedEndMinutes = startMinutes + defaultActivityHours * 60

  return formatMinutesToTime(estimatedEndMinutes)
}

export function getActivityDurationMinutes( activity, defaultActivityHours = DEFAULT_ACTIVITY_HOURS, ) {
  const startMinutes = parseTimeToMinutes(activity.start)
  let endMinutes
  if (activity.end) {
    endMinutes = parseTimeToMinutes(activity.end)
  } else {
    endMinutes = startMinutes + defaultActivityHours * 60
  }

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

export function getTotalMinutes(activities, defaultActivityHours = DEFAULT_ACTIVITY_HOURS, ) {
  return activities.reduce((total, activity) => {
    return total + getActivityDurationMinutes(activity, defaultActivityHours)
  }, 0)
}

export function getTotalHours(activities,defaultActivityHours = DEFAULT_ACTIVITY_HOURS) {
  return getTotalMinutes(activities, defaultActivityHours) / 60
}

export function getMeetCount(activities) {
  return activities.filter((activity) => {
    return activity.source === "calendar" && activity.title?.toLowerCase().includes("reun")
  }).length
}

export function getProductivityPercentage(totalHours, workdayHours = DEFAULT_WORKDAY_HOURS,) {
  const percentage = Math.round((totalHours / workdayHours) * 100)

  return Math.min(Math.max(percentage, 0), 100)
}

export function getSourceSummary(activities, sources, defaultActivityHours = DEFAULT_ACTIVITY_HOURS) {
  const totalMinutes = getTotalMinutes(activities, defaultActivityHours)

  return Object.entries(sources).map(([sourceKey, source]) => {
    const sourceActivities = activities.filter(
      (activity) => activity.source === sourceKey
    )

    const sourceMinutes = getTotalMinutes(sourceActivities, defaultActivityHours)

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
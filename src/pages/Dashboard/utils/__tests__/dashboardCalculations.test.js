import { describe, it, expect } from "vitest"
import {
  DEFAULT_ACTIVITY_HOURS,
  DEFAULT_WORKDAY_HOURS,
  parseTimeToMinutes,
  getActivityEndTime,
  getActivityDurationMinutes,
  formatDuration,
  getTotalMinutes,
  getTotalHours,
  getCalendarEventCount,
  getProductivityPercentage,
  getSourceSummary,
  getSourceCounts,
} from "../dashboardCalculations"

const SOURCES = {
  calendar: { label: "Calendar", chartColor: "#f97316", sidebarColor: "bg-orange-500" },
  jira: { label: "Jira", chartColor: "#7c3aed", sidebarColor: "bg-violet-600" },
}

describe("parseTimeToMinutes", () => {
  it("converts HH:MM to total minutes", () => {
    expect(parseTimeToMinutes("09:30")).toBe(570)
  })

  it("returns 0 when time is empty", () => {
    expect(parseTimeToMinutes("")).toBe(0)
  })

  it("returns 0 when time has no colon", () => {
    expect(parseTimeToMinutes("0930")).toBe(0)
  })

  it("returns 0 when time has non-numeric parts", () => {
    expect(parseTimeToMinutes("ab:cd")).toBe(0)
  })

  it("handles 00:00 and 23:59 boundaries", () => {
    expect(parseTimeToMinutes("00:00")).toBe(0)
    expect(parseTimeToMinutes("23:59")).toBe(23 * 60 + 59)
  })
})

describe("getActivityEndTime", () => {
  it("returns the explicit end when present", () => {
    expect(getActivityEndTime({ start: "09:00", end: "10:30" })).toBe("10:30")
  })

  it("estimates end using defaultActivityHours when end is missing", () => {
    expect(getActivityEndTime({ start: "09:00", end: "" }, 2)).toBe("11:00")
  })

  it("uses DEFAULT_ACTIVITY_HOURS when no default is provided", () => {
    expect(getActivityEndTime({ start: "09:00", end: "" })).toBe(
      `${String(9 + DEFAULT_ACTIVITY_HOURS).padStart(2, "0")}:00`,
    )
  })

  it("pads single-digit hours and minutes", () => {
    expect(getActivityEndTime({ start: "08:05", end: "" }, 1)).toBe("09:05")
  })
})

describe("getActivityDurationMinutes", () => {
  it("returns end - start when both are present", () => {
    expect(
      getActivityDurationMinutes({ start: "09:00", end: "10:30" }),
    ).toBe(90)
  })

  it("uses defaultActivityHours when end is missing", () => {
    expect(
      getActivityDurationMinutes({ start: "09:00", end: "" }, 2),
    ).toBe(120)
  })

  it("never returns a negative duration", () => {
    expect(
      getActivityDurationMinutes({ start: "10:00", end: "09:00" }),
    ).toBe(0)
  })
})

describe("formatDuration", () => {
  it("formats less than 60 minutes as 'N min'", () => {
    expect(formatDuration(45)).toBe("45 min")
  })

  it("formats exact hours as 'N h'", () => {
    expect(formatDuration(120)).toBe("2 h")
  })

  it("formats hours with remainder as 'N h M min'", () => {
    expect(formatDuration(95)).toBe("1 h 35 min")
  })

  it("formats zero as '0 min'", () => {
    expect(formatDuration(0)).toBe("0 min")
  })
})

describe("getTotalMinutes & getTotalHours", () => {
  const activities = [
    { start: "09:00", end: "10:00" }, // 60
    { start: "10:00", end: "11:30" }, // 90
    { start: "12:00", end: "" }, // default 1h = 60
  ]

  it("sums durations across activities", () => {
    expect(getTotalMinutes(activities)).toBe(210)
  })

  it("uses custom default activity hours", () => {
    expect(getTotalMinutes(activities, 2)).toBe(60 + 90 + 120)
  })

  it("returns 0 for empty input", () => {
    expect(getTotalMinutes([])).toBe(0)
  })

  it("getTotalHours divides minutes by 60", () => {
    expect(getTotalHours(activities)).toBe(210 / 60)
  })
})

describe("getCalendarEventCount", () => {
  it("counts only activities with source 'calendar'", () => {
    const activities = [
      { source: "calendar", title: "Reunión" },
      { source: "calendar", title: "Meeting" },
      { source: "calendar", title: "1:1" },
      { source: "jira", title: "Reunión" },
      { source: "docs", title: "Notas" },
    ]
    expect(getCalendarEventCount(activities)).toBe(3)
  })

  it("returns 0 when no calendar activities", () => {
    expect(getCalendarEventCount([{ source: "jira" }])).toBe(0)
  })
})

describe("getProductivityPercentage", () => {
  it("rounds the percentage", () => {
    expect(getProductivityPercentage(4, 8)).toBe(50)
  })

  it("clamps to 100 when above workday", () => {
    expect(getProductivityPercentage(20, 8)).toBe(100)
  })

  it("clamps to 0 when negative", () => {
    expect(getProductivityPercentage(-2, 8)).toBe(0)
  })

  it("uses DEFAULT_WORKDAY_HOURS by default", () => {
    expect(getProductivityPercentage(DEFAULT_WORKDAY_HOURS)).toBe(100)
  })
})

describe("getSourceSummary", () => {
  it("computes minutes, hours and percentage per source", () => {
    const activities = [
      { source: "calendar", start: "09:00", end: "10:00" }, // 60
      { source: "jira", start: "10:00", end: "11:00" }, // 60
      { source: "jira", start: "11:00", end: "12:00" }, // 60
    ]
    const result = getSourceSummary(activities, SOURCES)
    const calendar = result.find((row) => row.key === "calendar")
    const jira = result.find((row) => row.key === "jira")

    expect(calendar.minutes).toBe(60)
    expect(calendar.activities).toBe(1)
    expect(calendar.percentage).toBe(33)
    expect(jira.minutes).toBe(120)
    expect(jira.activities).toBe(2)
    expect(jira.percentage).toBe(67)
    expect(jira.hours).toBe(2)
  })

  it("returns 0% percentages when there are no activities", () => {
    const result = getSourceSummary([], SOURCES)
    expect(result.every((row) => row.percentage === 0)).toBe(true)
    expect(result.every((row) => row.activities === 0)).toBe(true)
  })
})

describe("getSourceCounts", () => {
  it("returns the count per source key", () => {
    const activities = [
      { source: "calendar" },
      { source: "jira" },
      { source: "jira" },
    ]
    expect(getSourceCounts(activities, SOURCES)).toEqual({
      calendar: 1,
      jira: 2,
    })
  })

  it("returns 0 for sources without activities", () => {
    expect(getSourceCounts([], SOURCES)).toEqual({ calendar: 0, jira: 0 })
  })
})

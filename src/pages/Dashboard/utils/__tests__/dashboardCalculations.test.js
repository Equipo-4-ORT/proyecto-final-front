import { describe, it, expect } from "vitest"
import {
  DEFAULT_WORKDAY_HOURS,
  parseTimeToMinutes,
  getActivityEndTime,
  getActivityDurationMinutes,
  formatDuration,
  getTotalMinutes,
  getTotalHours,
  getCalendarEventCount,
  getProductivityPercentage,
  getWorkdayHours,
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

  it("falls back to start when end is missing (the front no longer estimates)", () => {
    expect(getActivityEndTime({ start: "09:00", end: "" })).toBe("09:00")
  })
})

describe("getActivityDurationMinutes", () => {
  it("returns end - start when both are present", () => {
    expect(
      getActivityDurationMinutes({ start: "09:00", end: "10:30" }),
    ).toBe(90)
  })

  it("returns 0 when end is missing (the front no longer estimates)", () => {
    expect(
      getActivityDurationMinutes({ start: "09:00", end: "" }),
    ).toBe(0)
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
    { start: "12:00", end: "" }, // sin fin → 0
  ]

  it("sums durations across activities (end-less ones count as 0)", () => {
    expect(getTotalMinutes(activities)).toBe(150)
  })

  it("returns 0 for empty input", () => {
    expect(getTotalMinutes([])).toBe(0)
  })

  it("getTotalHours divides minutes by 60", () => {
    expect(getTotalHours(activities)).toBe(150 / 60)
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

describe("getWorkdayHours", () => {
  it("computes the hours between start and end", () => {
    expect(getWorkdayHours("09:00", "18:00")).toBe(9)
  })

  it("handles a workday that crosses midnight", () => {
    expect(getWorkdayHours("21:00", "02:00")).toBe(5)
  })

  it("falls back to DEFAULT_WORKDAY_HOURS when a time is missing", () => {
    expect(getWorkdayHours("", "18:00")).toBe(DEFAULT_WORKDAY_HOURS)
    expect(getWorkdayHours("09:00", "")).toBe(DEFAULT_WORKDAY_HOURS)
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

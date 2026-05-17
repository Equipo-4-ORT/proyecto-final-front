import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { getTodayDate } from "../dateHelpers"

describe("getTodayDate", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns today's date in YYYY-MM-DD format", () => {
    vi.setSystemTime(new Date(2026, 4, 13, 12, 0, 0))
    expect(getTodayDate()).toBe("2026-05-13")
  })

  it("pads month and day to two digits", () => {
    vi.setSystemTime(new Date(2026, 0, 9, 12, 0, 0))
    expect(getTodayDate()).toBe("2026-01-09")
  })

  it("handles year-end boundary", () => {
    vi.setSystemTime(new Date(2025, 11, 31, 23, 30, 0))
    expect(getTodayDate()).toBe("2025-12-31")
  })
})

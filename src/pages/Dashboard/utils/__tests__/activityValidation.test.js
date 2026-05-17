import { describe, it, expect } from "vitest"
import { validateActivity } from "../activityValidation"

describe("validateActivity", () => {
  it("returns no errors for a valid activity", () => {
    const errors = validateActivity({
      source: "calendar",
      start: "09:00",
      end: "10:00",
    })
    expect(errors).toEqual({})
  })

  it("returns no errors when end is empty", () => {
    const errors = validateActivity({
      source: "calendar",
      start: "09:00",
      end: "",
    })
    expect(errors).toEqual({})
  })

  it("requires a source", () => {
    const errors = validateActivity({ source: "", start: "09:00", end: "" })
    expect(errors.source).toBeTruthy()
  })

  it("requires a start time", () => {
    const errors = validateActivity({ source: "calendar", start: "", end: "" })
    expect(errors.start).toBeTruthy()
  })

  it("rejects when end equals start", () => {
    const errors = validateActivity({
      source: "calendar",
      start: "09:00",
      end: "09:00",
    })
    expect(errors.end).toBeTruthy()
  })

  it("rejects when end is before start", () => {
    const errors = validateActivity({
      source: "calendar",
      start: "10:00",
      end: "09:00",
    })
    expect(errors.end).toBeTruthy()
  })

  it("uses minute-based comparison (not string)", () => {
    // String comparison would let "9:00" > "10:00" because "9" > "1" lexicographically.
    const errors = validateActivity({
      source: "calendar",
      start: "9:00",
      end: "10:00",
    })
    expect(errors.end).toBeUndefined()
  })

  it("collects multiple errors at once", () => {
    const errors = validateActivity({ source: "", start: "", end: "" })
    expect(errors.source).toBeTruthy()
    expect(errors.start).toBeTruthy()
  })
})

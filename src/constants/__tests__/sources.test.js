import { describe, it, expect } from "vitest"
import { SOURCES, UNKNOWN_SOURCE, getSource } from "../sources"

describe("SOURCES catalog", () => {
  it("defines the expected source keys", () => {
    expect(Object.keys(SOURCES)).toEqual(
      expect.arrayContaining(["calendar", "jira", "slides", "docs", "sheets"]),
    )
  })

  it("each entry has label, icon, badgeColor, sidebarColor, chartColor", () => {
    Object.values(SOURCES).forEach((source) => {
      expect(source.label).toEqual(expect.any(String))
      expect(source.icon).toBeDefined()
      expect(source.badgeColor).toEqual(expect.any(String))
      expect(source.sidebarColor).toEqual(expect.any(String))
      expect(source.chartColor).toEqual(expect.any(String))
    })
  })
})

describe("getSource", () => {
  it("returns the matching source", () => {
    expect(getSource("calendar")).toBe(SOURCES.calendar)
  })

  it("returns UNKNOWN_SOURCE when the key does not exist", () => {
    expect(getSource("inexistente")).toBe(UNKNOWN_SOURCE)
  })

  it("returns UNKNOWN_SOURCE when the key is undefined", () => {
    expect(getSource(undefined)).toBe(UNKNOWN_SOURCE)
  })

  it("UNKNOWN_SOURCE has the expected shape", () => {
    expect(UNKNOWN_SOURCE.label).toBe("Desconocida")
    expect(UNKNOWN_SOURCE.icon).toBeDefined()
    expect(UNKNOWN_SOURCE.badgeColor).toBe("slate")
  })
})

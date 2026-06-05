import { describe, it, expect } from "vitest"
import {
  apiToActivity,
  activityToApiPayload,
  buildUpdatePayload,
  buildOptimisticActivity,
  buildOptimisticUpdate,
  filterByLocalDate,
} from "../activityMapper"

// Fixed date for deterministic tests: 2026-03-15 09:00 local
const ISO_START = "2026-03-15T12:00:00.000Z" // UTC noon → local 09:00 in UTC-3
const ISO_END = "2026-03-15T13:00:00.000Z"
const LOCAL_DATE = "2026-03-15"

describe("filterByLocalDate", () => {
  it("includes activities whose startTime matches the selected date", () => {
    const activities = [{ id: 1, startTime: ISO_START }]
    expect(filterByLocalDate(activities, LOCAL_DATE)).toHaveLength(1)
  })

  it("excludes activities whose startTime does not match the selected date", () => {
    const activities = [{ id: 1, startTime: "2026-03-16T12:00:00.000Z" }]
    expect(filterByLocalDate(activities, LOCAL_DATE)).toHaveLength(0)
  })

  it("excludes activities without startTime (never shows on any date)", () => {
    const activities = [{ id: 1, startTime: null }, { id: 2 }]
    expect(filterByLocalDate(activities, LOCAL_DATE)).toHaveLength(0)
  })

  it("handles mixed activities correctly", () => {
    const activities = [
      { id: 1, startTime: ISO_START },
      { id: 2, startTime: "2026-03-16T12:00:00.000Z" },
      { id: 3, startTime: null },
    ]
    const result = filterByLocalDate(activities, LOCAL_DATE)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })
})

describe("apiToActivity", () => {
  it("maps a server activity to the UI shape", () => {
    const server = {
      id: "abc-123",
      source: "manual",
      activityType: "Stand-up",
      startTime: ISO_START,
      endTime: ISO_END,
      metadata: {
        category: "calendar",
        title: "Stand-up",
        description: "Daily meeting",
        notes: "Breve",
        status: "approved",
      },
    }
    const result = apiToActivity(server)
    expect(result.id).toBe("abc-123")
    expect(result.source).toBe("calendar")
    expect(result.title).toBe("Stand-up")
    expect(result.description).toBe("Daily meeting")
    expect(result.status).toBe("approved")
    expect(result.notes).toBe("Breve")
    expect(result.startTime).toBe(ISO_START)
  })

  it("prefers metadata.title over activityType when both present (Jira enriched)", () => {
    const server = {
      id: "1",
      source: "jira",
      activityType: "transition",
      startTime: ISO_START,
      endTime: ISO_END,
      metadata: { title: "Arreglar el login · In Progress → Done (PROJ-42)" },
    }
    expect(apiToActivity(server).title).toBe("Arreglar el login · In Progress → Done (PROJ-42)")
  })

  it("uses activityType as title when metadata.title is absent (backwards compat, rows viejos)", () => {
    const server = {
      id: "1",
      source: "jira",
      activityType: "JIRA-42",
      startTime: ISO_START,
      endTime: ISO_END,
      metadata: {},
    }
    expect(apiToActivity(server).title).toBe("JIRA-42")
  })

  it("defaults status to pending when metadata has no status", () => {
    const server = {
      id: "1",
      source: "jira",
      activityType: "",
      startTime: ISO_START,
      endTime: ISO_END,
      metadata: {},
    }
    expect(apiToActivity(server).status).toBe("pending")
  })

  it("handles missing metadata gracefully", () => {
    const server = {
      id: "1",
      source: "jira",
      activityType: "Task",
      startTime: ISO_START,
      endTime: ISO_END,
    }
    const result = apiToActivity(server)
    expect(result.description).toBe("")
    expect(result.notes).toBe("")
    expect(result.status).toBe("pending")
  })
})

describe("activityToApiPayload", () => {
  it("builds the correct payload shape", () => {
    const formData = {
      source: "calendar",
      title: "Reunión",
      description: "Daily",
      start: "09:00",
      end: "10:00",
      notes: "Notas",
    }
    const payload = activityToApiPayload(formData, LOCAL_DATE, 1)

    expect(payload.activityType).toBe("Reunión")
    expect(payload.metadata.category).toBe("calendar")
    expect(payload.metadata.title).toBe("Reunión")
    expect(payload.metadata.description).toBe("Daily")
    expect(payload.metadata.notes).toBe("Notas")
    expect(payload.metadata.status).toBe("pending")
    expect(typeof payload.startTime).toBe("string")
    expect(typeof payload.endTime).toBe("string")
  })

  it("calculates endTime from defaultActivityHours when end is empty", () => {
    const formData = { source: "jira", title: "Task", description: "", start: "09:00", end: "", notes: "" }
    const payload = activityToApiPayload(formData, LOCAL_DATE, 2)

    const start = new Date(payload.startTime)
    const end = new Date(payload.endTime)
    const diffHours = (end - start) / (1000 * 60 * 60)
    expect(diffHours).toBeCloseTo(2)
  })

  it("falls back to source as activityType when title is empty", () => {
    const formData = { source: "jira", title: "  ", description: "", start: "09:00", end: "10:00", notes: "" }
    const payload = activityToApiPayload(formData, LOCAL_DATE, 1)
    expect(payload.activityType).toBe("jira")
  })

  it("trims whitespace from text fields", () => {
    const formData = { source: "jira", title: "  Task  ", description: "  Desc  ", start: "09:00", end: "10:00", notes: "  Note  " }
    const payload = activityToApiPayload(formData, LOCAL_DATE, 1)
    expect(payload.metadata.title).toBe("Task")
    expect(payload.metadata.description).toBe("Desc")
    expect(payload.metadata.notes).toBe("Note")
  })
})

describe("buildUpdatePayload", () => {
  const original = {
    id: "abc",
    source: "calendar",
    status: "review",
    startTime: ISO_START,
  }

  it("extracts the date from originalActivity.startTime", () => {
    const editingData = { title: "Editada", description: "", start: "09:00", end: "10:00", notes: "" }
    const payload = buildUpdatePayload(editingData, original, 1)
    expect(typeof payload.startTime).toBe("string")
    expect(typeof payload.endTime).toBe("string")
  })

  it("preserves original source in metadata.category", () => {
    const editingData = { title: "X", description: "", start: "09:00", end: "10:00", notes: "" }
    const payload = buildUpdatePayload(editingData, original, 1)
    expect(payload.metadata.category).toBe("calendar")
  })

  it("preserves original status in metadata.status", () => {
    const editingData = { title: "X", description: "", start: "09:00", end: "10:00", notes: "" }
    const payload = buildUpdatePayload(editingData, original, 1)
    expect(payload.metadata.status).toBe("review")
  })

  it("defaults to pending status when original has none", () => {
    const noStatus = { ...original, status: undefined }
    const editingData = { title: "X", description: "", start: "09:00", end: "10:00", notes: "" }
    const payload = buildUpdatePayload(editingData, noStatus, 1)
    expect(payload.metadata.status).toBe("pending")
  })
})

describe("buildOptimisticActivity", () => {
  it("sets _pending flag", () => {
    const formData = { source: "jira", title: "Task", description: "", start: "09:00", end: "10:00", notes: "" }
    const result = buildOptimisticActivity(formData, "temp-id", LOCAL_DATE)
    expect(result._pending).toBe(true)
    expect(result.id).toBe("temp-id")
    expect(result.status).toBe("pending")
  })
})

describe("buildOptimisticUpdate", () => {
  it("merges editingData into activity and sets _pending", () => {
    const activity = { id: "1", source: "jira", title: "Old", description: "Old desc", start: "09:00", end: "10:00", notes: "", status: "approved", startTime: ISO_START }
    const editingData = { title: "New", description: "New desc", start: "10:00", end: "11:00", notes: "Updated" }
    const result = buildOptimisticUpdate(activity, editingData)
    expect(result.title).toBe("New")
    expect(result.description).toBe("New desc")
    expect(result._pending).toBe(true)
    expect(result.status).toBe("approved")
    expect(result.startTime).toBe(ISO_START)
  })
})

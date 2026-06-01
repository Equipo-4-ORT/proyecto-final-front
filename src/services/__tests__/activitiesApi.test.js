import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from "../api"
import {
  createActivity,
  deleteActivity,
  listActivities,
  updateActivity,
} from "../activitiesApi"

describe("activitiesApi", () => {
  beforeEach(() => vi.clearAllMocks())

  describe("listActivities", () => {
    it("calls GET /api/activities and returns the data array", async () => {
      api.get.mockResolvedValue({ data: [{ id: "1" }, { id: "2" }] })
      const result = await listActivities()
      expect(api.get).toHaveBeenCalledWith("/api/activities")
      expect(result).toEqual([{ id: "1" }, { id: "2" }])
    })

    it("passes date and timezone as query params when filtering by day", async () => {
      api.get.mockResolvedValue({ data: [{ id: "1" }] })
      const result = await listActivities({
        date: "2026-05-30",
        timezone: "America/Argentina/Buenos_Aires",
      })
      expect(api.get).toHaveBeenCalledWith("/api/activities", {
        params: {
          date: "2026-05-30",
          timezone: "America/Argentina/Buenos_Aires",
        },
      })
      expect(result).toEqual([{ id: "1" }])
    })

    it("returns an empty array when the response data is not an array", async () => {
      api.get.mockResolvedValue({ data: null })
      const result = await listActivities()
      expect(result).toEqual([])
    })

    it("returns an empty array when data is an object instead of array", async () => {
      api.get.mockResolvedValue({ data: { error: "unexpected" } })
      const result = await listActivities()
      expect(result).toEqual([])
    })
  })

  describe("createActivity", () => {
    it("calls POST /api/activities with the payload and returns the created activity", async () => {
      const payload = { activityType: "Stand-up", startTime: "2026-03-15T12:00:00Z" }
      const created = { id: "abc", ...payload }
      api.post.mockResolvedValue({ data: created })

      const result = await createActivity(payload)

      expect(api.post).toHaveBeenCalledWith("/api/activities", payload)
      expect(result).toEqual(created)
    })
  })

  describe("updateActivity", () => {
    it("calls PUT /api/activities/:id with the payload and returns the updated activity", async () => {
      const id = "abc-123"
      const payload = { activityType: "Edited" }
      const updated = { id, ...payload }
      api.put.mockResolvedValue({ data: updated })

      const result = await updateActivity(id, payload)

      expect(api.put).toHaveBeenCalledWith(`/api/activities/${id}`, payload)
      expect(result).toEqual(updated)
    })

    it("URL-encodes the id before sending", async () => {
      api.put.mockResolvedValue({ data: {} })
      await updateActivity("id with spaces", {})
      expect(api.put).toHaveBeenCalledWith(
        `/api/activities/${encodeURIComponent("id with spaces")}`,
        {},
      )
    })
  })

  describe("deleteActivity", () => {
    it("calls DELETE /api/activities/:id", async () => {
      api.delete.mockResolvedValue({})
      await deleteActivity("xyz-456")
      expect(api.delete).toHaveBeenCalledWith("/api/activities/xyz-456")
    })

    it("URL-encodes the id before sending", async () => {
      api.delete.mockResolvedValue({})
      await deleteActivity("id/with/slashes")
      expect(api.delete).toHaveBeenCalledWith(
        `/api/activities/${encodeURIComponent("id/with/slashes")}`,
      )
    })
  })
})

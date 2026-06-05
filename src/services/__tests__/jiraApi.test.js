import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from "../api"
import {
  buildTodayWindow,
  disconnectJira,
  getJiraAuthUrl,
  getJiraStatus,
  triggerJiraSync,
} from "../jiraApi"

describe("jiraApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("getJiraStatus", () => {
    it("GET /api/jira/status y devuelve data", async () => {
      const payload = { connected: true, siteUrl: "https://acme.atlassian.net", lastSyncAt: null, reconnectRequired: false }
      api.get.mockResolvedValueOnce({ data: payload })

      const result = await getJiraStatus()

      expect(api.get).toHaveBeenCalledWith("/api/jira/status")
      expect(result).toEqual(payload)
    })

    it("propaga errores del API", async () => {
      const err = new Error("net")
      api.get.mockRejectedValueOnce(err)
      await expect(getJiraStatus()).rejects.toBe(err)
    })
  })

  describe("getJiraAuthUrl", () => {
    it("devuelve la URL si empieza con https://auth.atlassian.com/", async () => {
      api.get.mockResolvedValueOnce({ data: { authorizationUrl: "https://auth.atlassian.com/authorize?x=1" } })

      const url = await getJiraAuthUrl()

      expect(api.get).toHaveBeenCalledWith("/api/jira/auth")
      expect(url).toBe("https://auth.atlassian.com/authorize?x=1")
    })

    it("rechaza URL que no apunte a auth.atlassian.com", async () => {
      api.get.mockResolvedValueOnce({ data: { authorizationUrl: "https://malicious.example/authorize" } })
      await expect(getJiraAuthUrl()).rejects.toThrow(/inválida/i)
    })

    it("rechaza si authorizationUrl no es string", async () => {
      api.get.mockResolvedValueOnce({ data: { authorizationUrl: 42 } })
      await expect(getJiraAuthUrl()).rejects.toThrow(/inválida/i)
    })

    it("rechaza si la respuesta no trae authorizationUrl", async () => {
      api.get.mockResolvedValueOnce({ data: {} })
      await expect(getJiraAuthUrl()).rejects.toThrow(/inválida/i)
    })
  })

  describe("disconnectJira", () => {
    it("DELETE /api/jira/connection", async () => {
      api.delete.mockResolvedValueOnce({})
      await disconnectJira()
      expect(api.delete).toHaveBeenCalledWith("/api/jira/connection")
    })
  })

  describe("triggerJiraSync", () => {
    it("POST /api/jira/sync con el body de la ventana y devuelve data", async () => {
      const body = { dateStart: "2026-05-19T00:00:00.000Z", dateEnd: "2026-05-19T12:00:00.000Z" }
      const payload = { imported: 5, skippedDuplicates: 2, durationMs: 100 }
      api.post.mockResolvedValueOnce({ data: payload })

      const result = await triggerJiraSync(body)

      expect(api.post).toHaveBeenCalledWith("/api/jira/sync", body)
      expect(result).toEqual(payload)
    })
  })

  describe("buildTodayWindow", () => {
    it("construye [00:00 local, ahora) como ISO 8601", () => {
      const now = new Date("2026-05-19T15:30:00")
      const { dateStart, dateEnd } = buildTodayWindow(now)

      const start = new Date(dateStart)
      const end = new Date(dateEnd)

      expect(start.getHours()).toBe(0)
      expect(start.getMinutes()).toBe(0)
      expect(start.getSeconds()).toBe(0)
      expect(start.getMilliseconds()).toBe(0)
      expect(end.getTime()).toBe(now.getTime())
      expect(dateStart).toMatch(/T\d{2}:\d{2}/)
      expect(dateEnd).toMatch(/T\d{2}:\d{2}/)
    })

    it("usa new Date() por default si no se pasa now", () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2026-05-19T10:15:00"))

      const { dateEnd } = buildTodayWindow()
      expect(new Date(dateEnd).getTime()).toBe(Date.now())
    })
  })
})

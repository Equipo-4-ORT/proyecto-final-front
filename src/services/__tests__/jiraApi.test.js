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
  disconnectJira,
  getJiraAuthUrl,
  getJiraStatus,
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
})

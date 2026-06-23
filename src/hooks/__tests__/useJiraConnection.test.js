import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../../services/jiraApi", () => ({
  getJiraStatus: vi.fn(),
  getJiraAuthUrl: vi.fn(),
  disconnectJira: vi.fn(),
}))

import * as jiraApi from "../../services/jiraApi"
import { useJiraConnection } from "../useJiraConnection"

const STATUS_DISCONNECTED = { connected: false, siteUrl: null, lastSyncAt: null, reconnectRequired: false }
const STATUS_CONNECTED = {
  connected: true,
  siteUrl: "https://acme.atlassian.net",
  lastSyncAt: "2026-05-19T12:00:00.000Z",
  reconnectRequired: false,
}

describe("useJiraConnection", () => {
  let originalLocation

  beforeEach(() => {
    vi.clearAllMocks()
    originalLocation = window.location
    delete window.location
    window.location = { href: "" }
  })

  afterEach(() => {
    window.location = originalLocation
  })

  it("carga el estado inicial via getJiraStatus", async () => {
    jiraApi.getJiraStatus.mockResolvedValueOnce(STATUS_DISCONNECTED)

    const { result } = renderHook(() => useJiraConnection())

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.status).toEqual(STATUS_DISCONNECTED)
    expect(result.current.error).toBeNull()
  })

  it("captura error de getJiraStatus con scope=status", async () => {
    jiraApi.getJiraStatus.mockRejectedValueOnce({ response: { data: { code: "user_not_found" } } })

    const { result } = renderHook(() => useJiraConnection())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toEqual({ scope: "status", code: "user_not_found" })
  })

  it("usa 'unknown_error' cuando el error no trae code legible", async () => {
    jiraApi.getJiraStatus.mockRejectedValueOnce(new Error("boom"))

    const { result } = renderHook(() => useJiraConnection())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toEqual({ scope: "status", code: "unknown_error" })
  })

  describe("connect", () => {
    it("redirige a la URL de Atlassian", async () => {
      jiraApi.getJiraStatus.mockResolvedValue(STATUS_DISCONNECTED)
      jiraApi.getJiraAuthUrl.mockResolvedValueOnce("https://auth.atlassian.com/authorize?x=1")

      const { result } = renderHook(() => useJiraConnection())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.connect()
      })

      expect(window.location.href).toBe("https://auth.atlassian.com/authorize?x=1")
    })

    it("expone error con scope=connect si falla", async () => {
      jiraApi.getJiraStatus.mockResolvedValue(STATUS_DISCONNECTED)
      jiraApi.getJiraAuthUrl.mockRejectedValueOnce({ response: { data: { code: "unauthenticated" } } })

      const { result } = renderHook(() => useJiraConnection())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.connect()
      })

      expect(result.current.error).toEqual({ scope: "connect", code: "unauthenticated" })
      expect(result.current.actionInFlight).toBeNull()
    })
  })

  describe("disconnect", () => {
    it("llama disconnectJira y refresca el estado", async () => {
      jiraApi.getJiraStatus.mockResolvedValueOnce(STATUS_CONNECTED)
      jiraApi.disconnectJira.mockResolvedValueOnce()
      jiraApi.getJiraStatus.mockResolvedValueOnce(STATUS_DISCONNECTED)

      const { result } = renderHook(() => useJiraConnection())
      await waitFor(() => expect(result.current.status?.connected).toBe(true))

      await act(async () => {
        await result.current.disconnect()
      })

      expect(jiraApi.disconnectJira).toHaveBeenCalled()
      expect(result.current.status).toEqual(STATUS_DISCONNECTED)
      expect(result.current.actionInFlight).toBeNull()
    })

    it("expone error con scope=disconnect si falla", async () => {
      jiraApi.getJiraStatus.mockResolvedValue(STATUS_CONNECTED)
      jiraApi.disconnectJira.mockRejectedValueOnce({ response: { data: { code: "upstream_error" } } })

      const { result } = renderHook(() => useJiraConnection())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.disconnect()
      })

      expect(result.current.error).toEqual({ scope: "disconnect", code: "upstream_error" })
    })
  })
})

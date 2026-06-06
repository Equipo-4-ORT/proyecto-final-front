import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

import api from "../api"
import { getUserSettings, updateUserSettings } from "../userSettingsApi"

describe("userSettingsApi", () => {
  beforeEach(() => vi.clearAllMocks())

  it("getUserSettings fetches and unwraps the settings payload", async () => {
    const settings = { workStartTime: "09:00", workEndTime: "18:00", avoidOverlaps: true }
    api.get.mockResolvedValue({ data: settings })

    const result = await getUserSettings()

    expect(api.get).toHaveBeenCalledWith("/api/users/me/settings")
    expect(result).toEqual(settings)
  })

  it("updateUserSettings sends the payload and unwraps the response", async () => {
    const payload = { workStartTime: "08:00", workEndTime: "17:00", avoidOverlaps: false, defaultDuration: 2 }
    api.put.mockResolvedValue({ data: { ...payload, id: "1" } })

    const result = await updateUserSettings(payload)

    expect(api.put).toHaveBeenCalledWith("/api/users/me/settings", payload)
    expect(result).toEqual({ ...payload, id: "1" })
  })

  it("propagates errors from the API", async () => {
    api.get.mockRejectedValue(new Error("Network error"))

    await expect(getUserSettings()).rejects.toThrow("Network error")
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { AuthContext } from "../../contexts/auth-context"
import Settings from "../Settings"
import { getUserSettings, updateUserSettings } from "../../services/userSettingsApi"
import { ActivityContext } from '../../contexts/ActivityContextDef'; 

vi.mock("../../services/userSettingsApi", () => ({
  getUserSettings: vi.fn(),
  updateUserSettings: vi.fn(),
}))

const authValue = {
  user: { name: "Martín", email: "martin@example.com" },
  logout: vi.fn(),
}

const renderSettings = () => render(
  <MemoryRouter>
    <AuthContext.Provider value={authValue}>
      <ActivityContext.Provider value={{ activities: [], sourceCounts: {}, isLoading: false }}>
        <Settings />
      </ActivityContext.Provider>
    </AuthContext.Provider>
  </MemoryRouter>
)

const SETTINGS = {
  workStartTime: "09:00",
  workEndTime: "18:00",
  avoidOverlaps: true,
  defaultDuration: 2,
}

describe("Settings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, "alert").mockImplementation(() => {})
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "log").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("shows a loading state until the settings resolve", async () => {
    getUserSettings.mockResolvedValue(SETTINGS)
    renderSettings()

    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
    await screen.findByRole("heading", { name: /configuración/i })
  })

  it("populates the form with the fetched settings", async () => {
    getUserSettings.mockResolvedValue(SETTINGS)
    renderSettings()

    await screen.findByRole("heading", { name: /configuración/i })
    expect(screen.getByDisplayValue("09:00")).toBeInTheDocument()
    expect(screen.getByDisplayValue("18:00")).toBeInTheDocument()
    expect(screen.getByRole("spinbutton")).toHaveValue(2)
    expect(screen.getByRole("checkbox")).toBeChecked()
  })

  it("renders empty defaults when loading the settings fails", async () => {
    getUserSettings.mockRejectedValue(new Error("network"))
    renderSettings()

    await screen.findByRole("heading", { name: /configuración/i })
    expect(console.error).toHaveBeenCalled()
    expect(screen.getByRole("checkbox")).not.toBeChecked()
  })

  it("saves the edited settings and confirms success", async () => {
    getUserSettings.mockResolvedValue(SETTINGS)
    updateUserSettings.mockResolvedValue({})
    renderSettings()

    await screen.findByRole("heading", { name: /configuración/i })

    fireEvent.change(screen.getByDisplayValue("09:00"), { target: { value: "08:30" } })
    fireEvent.click(screen.getByRole("checkbox"))
    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(updateUserSettings).toHaveBeenCalledWith({
        workStartTime: "08:30",
        workEndTime: "18:00",
        avoidOverlaps: false,
        defaultDuration: 2,
      })
    })
    expect(await screen.findByText(/éxito/i)).toBeInTheDocument()
  })

  it("alerts the user when saving fails", async () => {
    getUserSettings.mockResolvedValue(SETTINGS)
    updateUserSettings.mockRejectedValue(new Error("boom"))
    renderSettings()

    await screen.findByRole("heading", { name: /configuración/i })
    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }))

    expect(await screen.findByText(/error/i)).toBeInTheDocument()
    expect(console.error).toHaveBeenCalled()
  })
})

import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

vi.mock("../../hooks/useJiraConnection", () => ({
  useJiraConnection: () => ({
    status: { connected: false, siteUrl: null, lastSyncAt: null, reconnectRequired: false },
    loading: false,
    actionInFlight: null,
    error: null,
    lastSyncResult: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    syncToday: vi.fn(),
    refresh: vi.fn(),
  }),
}))

import Dashboard from "../Dashboard"
import { AuthProvider } from "../../contexts/AuthContext"

describe("Dashboard", () => {
  it("renders the Dashboard heading in the header", () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(
      screen.getByRole("heading", {
        name: /^dashboard$/i,
        level: 2,
      }),
    ).toBeInTheDocument()
  })
})

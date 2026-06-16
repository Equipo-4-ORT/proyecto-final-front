import { render, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, test, expect, beforeEach, vi } from 'vitest'

import Callback from "../Callback"

const mockNavigate = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const refreshUser = vi.fn()
vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({ refreshUser }),
}))

// Renderiza Callback dentro de un router con la URL dada, para que
// useSearchParams lea el ?redirect= como en producción.
const renderAt = (url) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Callback />
    </MemoryRouter>,
  )

describe("Callback", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("sin ?redirect= navega al default /dashboard", async () => {
    refreshUser.mockResolvedValue({ id: "1", role: "EMPLOYEE" })

    renderAt("/callback")

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard"))
    expect(refreshUser).toHaveBeenCalledTimes(1)
  })

  test("respeta ?redirect=/admin para el rol ADMIN", async () => {
    refreshUser.mockResolvedValue({ id: "1", role: "ADMIN" })

    renderAt("/callback?redirect=/admin")

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/admin"))
  })

  test("ignora un ?redirect= fuera de la allowlist y usa el default", async () => {
    refreshUser.mockResolvedValue({ id: "1", role: "EMPLOYEE" })

    renderAt("/callback?redirect=https://evil.com")

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard"))
  })

  test("si /auth/me falla, navega a /login?error=auth_failed", async () => {
    refreshUser.mockRejectedValue(new Error("no session"))

    renderAt("/callback")

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/login?error=auth_failed"),
    )
  })
})

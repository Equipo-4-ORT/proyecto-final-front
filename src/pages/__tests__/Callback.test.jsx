import { render, waitFor } from "@testing-library/react"
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

describe("Callback", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("hidrata la sesión (refreshUser) y navega a /dashboard", async () => {
    refreshUser.mockResolvedValue({ id: "1", role: "EMPLOYEE" })

    render(<Callback />)

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard"))
    expect(refreshUser).toHaveBeenCalledTimes(1)
  })

  test("si /auth/me falla, navega a /login?error=auth_failed", async () => {
    refreshUser.mockRejectedValue(new Error("no session"))

    render(<Callback />)

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/login?error=auth_failed"),
    )
  })
})

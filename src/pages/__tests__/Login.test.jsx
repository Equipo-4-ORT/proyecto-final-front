import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import Login from "../Login"

describe("Login", () => {
  it("renders the Sign in with Google button", () => {
    render(<Login />)
    expect(
      screen.getByRole("button", { name: /sign in with google/i })
    ).toBeInTheDocument()
  })

  describe("handleLogin", () => {
    beforeEach(() => {
      Object.defineProperty(window, "location", {
        value: { href: "" },
        writable: true,
        configurable: true,
      })
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it("redirects to Google auth when mock login is disabled", () => {
      render(<Login />)
      fireEvent.click(screen.getByRole("button", { name: /sign in with google/i }))
      expect(window.location.href).toContain("/auth/google")
    })

    it("redirects to mock callback when mock login is enabled", () => {
      vi.stubEnv("VITE_USE_MOCK_LOGIN", "true")
      render(<Login />)
      fireEvent.click(screen.getByRole("button", { name: /sign in with google/i }))
      expect(window.location.href).toBe("/callback?token=fake-jwt-123")
    })
  })
})

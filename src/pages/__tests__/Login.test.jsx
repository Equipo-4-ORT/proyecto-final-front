import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import Login from "../Login"

function renderLogin(search = "") {
  return render(
    <MemoryRouter initialEntries={[`/login${search}`]}>
      <Login />
    </MemoryRouter>
  )
}

describe("Login", () => {
  it("renders the Continuar con Google button", () => {
    renderLogin()
    expect(
      screen.getByRole("button", { name: /continuar con google/i })
    ).toBeInTheDocument()
  })

  it("shows the error message when the account is disabled", () => {
    renderLogin("?error=user_not_active")
    expect(
      screen.getByText(/tu cuenta está deshabilitada/i)
    ).toBeInTheDocument()
  })

  it("shows the error message when the account is not registered", () => {
    renderLogin("?error=unauthorized_user")
    expect(
      screen.getByText(/tu cuenta no está habilitada/i)
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

    it("redirects to Google auth when clicking the button", () => {
      vi.stubEnv("VITE_API_URL", "http://localhost:3000")

      renderLogin()

      fireEvent.click(
        screen.getByRole("button", { name: /continuar con google/i })
      )

      expect(window.location.href).toContain("/auth/google")
    })
  })
})

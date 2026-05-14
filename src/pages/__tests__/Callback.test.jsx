import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { vi } from "vitest"

import Callback from "../Callback"
import { AuthProvider } from "../../contexts/AuthContext"

const mockNavigate = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderCallback(search = "") {
  window.history.pushState({}, "Callback", `/callback${search}`)

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/callback${search}`]}>
        <Callback />
      </MemoryRouter>
    </AuthProvider>
  )
}

describe("Callback", () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
  })

  test("saves token and navigates to dashboard when JWT is valid", () => {
    renderCallback("?token=valid.jwt.token")

    expect(localStorage.getItem("token")).toBe(
      "valid.jwt.token"
    )

    expect(mockNavigate).toHaveBeenCalledWith(
      "/dashboard"
    )
  })

  test("navigates to login when token format is invalid", () => {
    renderCallback("?token=invalidtoken")

    expect(localStorage.getItem("token")).toBeNull()

    expect(mockNavigate).toHaveBeenCalledWith(
      "/login"
    )
  })

  test("navigates to login when token is missing", () => {
    renderCallback()

    expect(mockNavigate).toHaveBeenCalledWith(
      "/login"
    )
  })
})
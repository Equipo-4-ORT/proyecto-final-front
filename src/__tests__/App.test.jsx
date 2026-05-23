import { render, screen } from "@testing-library/react"
import App from "../App"
import {
  describe,
  test,
  expect,
  beforeEach,
  vi,
} from 'vitest'

// El front no llega al backend en los tests: solo necesitamos que la ruta
// /admin no rompa al montar el panel.
vi.mock("../services/api", () => ({
  default: {},
  adminApi: {
    getUsers: vi.fn(() => Promise.resolve([])),
    createUser: vi.fn(),
    toggleStatus: vi.fn(),
  },
}))

// El rol viaja en mayúscula en el JWT real (enum Role { EMPLOYEE ADMIN } del
// backend); PrivateRoute compara contra "ADMIN", así que el mock debe coincidir.
const MOCK_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJkZXZAdGVzdC5jb20iLCJyb2xlIjoiQURNSU4iLCJleHAiOjk5OTk5OTk5OTl9.testsignature"

function renderAt(route) {
  window.history.pushState({}, "Test page", route)

  return render(<App />)
}

describe("App routing", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test("renders Login at /login", () => {
    renderAt("/login")

    expect(
      screen.getByRole("button", {
        name: /continuar con google/i,
      })
    ).toBeInTheDocument()
  })

  test("redirects protected routes to login when no token exists", () => {
    renderAt("/dashboard")

    expect(
      screen.getByRole("button", {
        name: /continuar con google/i,
      })
    ).toBeInTheDocument()
  })

  test("renders Dashboard when token exists", () => {
    localStorage.setItem("token", MOCK_JWT)

    renderAt("/dashboard")

    expect(
      screen.getByRole("heading", {
        name: /dashboard/i,
      })
    ).toBeInTheDocument()
  })

  test("renders Admin when token exists", async () => {
    localStorage.setItem("token", MOCK_JWT)

    renderAt("/admin")

    expect(
      await screen.findByRole("heading", {
        name: /panel de administración/i,
        level: 1,
      })
    ).toBeInTheDocument()
  })

  test("renders NotFound on unknown routes", () => {
    renderAt("/unknown-route")

    expect(screen.getByText(/404/i)).toBeInTheDocument()
  })
})

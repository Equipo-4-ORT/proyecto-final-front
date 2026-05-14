import { render, screen } from "@testing-library/react"
import App from "../App"

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
        name: /sign in with google/i,
      })
    ).toBeInTheDocument()
  })

  test("redirects protected routes to login when no token exists", () => {
    renderAt("/dashboard")

    expect(
      screen.getByRole("button", {
        name: /sign in with google/i,
      })
    ).toBeInTheDocument()
  })

  test("renders Dashboard when token exists", () => {
    localStorage.setItem("token", "valid.jwt.token")

    renderAt("/dashboard")

    expect(
      screen.getByRole("heading", {
        name: /dashboard/i,
      })
    ).toBeInTheDocument()
  })

  test("renders Admin when token exists", () => {
    localStorage.setItem("token", "valid.jwt.token")

    renderAt("/admin")

    expect(
      screen.getByRole("heading", {
        name: /admin/i,
      })
    ).toBeInTheDocument()
  })

  test("renders NotFound on unknown routes", () => {
    renderAt("/unknown-route")

    expect(screen.getByText(/404/i)).toBeInTheDocument()
  })
})

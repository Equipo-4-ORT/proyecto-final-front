import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import App from "../App"

const renderAt = (path) => {
  window.history.pushState({}, "", path)
  return render(<App />)
}

describe("App routing", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/")
  })

  it("renders the home heading at /", () => {
    renderAt("/")
    expect(
      screen.getByRole("heading", { name: /home/i, level: 1 })
    ).toBeInTheDocument()
  })

  it("renders Login at /login", () => {
    renderAt("/login")
    expect(
      screen.getByRole("button", { name: /sign in with google/i })
    ).toBeInTheDocument()
  })

  it("renders Dashboard at /dashboard", () => {
    renderAt("/dashboard")
    expect(
      screen.getByRole("heading", { name: /dashboard/i, level: 1 })
    ).toBeInTheDocument()
  })

  it("renders Admin at /admin", () => {
    renderAt("/admin")
    expect(
      screen.getByRole("heading", { name: /admin/i, level: 1 })
    ).toBeInTheDocument()
  })

  it("renders NotFound on unknown routes", () => {
    renderAt("/this-route-does-not-exist")
    expect(
      screen.getByRole("heading", { name: /404/, level: 1 })
    ).toBeInTheDocument()
  })
})

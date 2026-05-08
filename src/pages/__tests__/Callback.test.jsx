import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import Callback from "../Callback"

const mockNavigate = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return { ...actual, useNavigate: () => mockNavigate }
})

const renderCallback = (search = "") =>
  render(
    <MemoryRouter initialEntries={[`/callback${search}`]}>
      <Routes>
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </MemoryRouter>
  )

describe("Callback", () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    localStorage.clear()
  })

  it("renders processing message", () => {
    renderCallback("?token=valid.jwt.token")
    expect(screen.getByRole("heading", { name: /procesando/i })).toBeInTheDocument()
  })

  it("saves token and navigates to dashboard when JWT is valid", () => {
    renderCallback("?token=valid.jwt.token")
    expect(localStorage.getItem("token")).toBe("valid.jwt.token")
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true })
  })

  it("navigates to login when token format is invalid", () => {
    renderCallback("?token=invalidtoken")
    expect(localStorage.getItem("token")).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith("/login")
  })

  it("navigates to login when token is missing", () => {
    renderCallback()
    expect(mockNavigate).toHaveBeenCalledWith("/login")
  })
})

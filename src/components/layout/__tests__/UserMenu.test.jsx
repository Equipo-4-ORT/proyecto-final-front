import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import UserMenu from "../UserMenu"

const mockNavigate = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return { ...actual, useNavigate: () => mockNavigate }
})

const defaultProps = {
  user: { name: "Martín", email: "martin@example.com" },
  onLogout: vi.fn(),
}

const renderMenu = (overrides = {}) =>
  render(
    <MemoryRouter>
      <UserMenu {...defaultProps} {...overrides} />
    </MemoryRouter>,
  )

describe("UserMenu", () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    defaultProps.onLogout.mockClear()
  })

  it("renders user info closed by default", () => {
    renderMenu()
    expect(screen.getByText("Martín")).toBeInTheDocument()
    expect(screen.getByText("martin@example.com")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /configuración/i })).toBeNull()
  })

  it("opens the menu when clicking the trigger", () => {
    renderMenu()
    fireEvent.click(screen.getByRole("button", { name: /martín/i }))
    expect(screen.getByRole("button", { name: /configuración/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /cerrar sesión/i })).toBeInTheDocument()
  })

  it("closes the menu when clicking outside", () => {
    renderMenu()
    fireEvent.click(screen.getByRole("button", { name: /martín/i }))
    expect(screen.getByRole("button", { name: /configuración/i })).toBeInTheDocument()
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole("button", { name: /configuración/i })).toBeNull()
  })

  it("navigates to /settings when clicking Configuración", () => {
    renderMenu()
    fireEvent.click(screen.getByRole("button", { name: /martín/i }))
    fireEvent.click(screen.getByRole("button", { name: /configuración/i }))
    expect(mockNavigate).toHaveBeenCalledWith("/settings")
  })

  it("calls onLogout and navigates to /login on logout", () => {
    const onLogout = vi.fn()
    renderMenu({ onLogout })
    fireEvent.click(screen.getByRole("button", { name: /martín/i }))
    fireEvent.click(screen.getByRole("button", { name: /cerrar sesión/i }))
    expect(onLogout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith("/login")
  })
})

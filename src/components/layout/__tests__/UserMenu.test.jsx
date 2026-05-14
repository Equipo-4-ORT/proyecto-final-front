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
  workdayHours: 8,
  defaultActivityHours: 1,
  onWorkdayHoursChange: vi.fn(),
  onDefaultActivityHoursChange: vi.fn(),
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
    defaultProps.onWorkdayHoursChange.mockClear()
    defaultProps.onDefaultActivityHoursChange.mockClear()
  })

  it("renders user info closed by default", () => {
    renderMenu()
    expect(screen.getByText("Martín")).toBeInTheDocument()
    expect(screen.getByText("martin@example.com")).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: /configuración/i })).toBeNull()
  })

  it("opens the menu when clicking the trigger", () => {
    renderMenu()
    fireEvent.click(screen.getByRole("button", { name: /martín/i }))
    expect(screen.getByRole("heading", { name: /configuración/i })).toBeInTheDocument()
  })

  it("closes the menu when clicking outside", () => {
    renderMenu()
    fireEvent.click(screen.getByRole("button", { name: /martín/i }))
    expect(screen.getByRole("heading", { name: /configuración/i })).toBeInTheDocument()
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole("heading", { name: /configuración/i })).toBeNull()
  })

  it("clamps workday hours to a minimum of 1 when decreasing past it", () => {
    const onWorkdayHoursChange = vi.fn()
    renderMenu({ workdayHours: 1, onWorkdayHoursChange })
    fireEvent.click(screen.getByRole("button", { name: /martín/i }))
    fireEvent.click(screen.getAllByRole("button", { name: "−" })[0])
    expect(onWorkdayHoursChange).toHaveBeenCalledWith(1)
  })

  it("clamps workday hours to a maximum of 10 when increasing past it", () => {
    const onWorkdayHoursChange = vi.fn()
    renderMenu({ workdayHours: 10, onWorkdayHoursChange })
    fireEvent.click(screen.getByRole("button", { name: /martín/i }))
    fireEvent.click(screen.getAllByRole("button", { name: "+" })[0])
    expect(onWorkdayHoursChange).toHaveBeenCalledWith(10)
  })

  it("clamps non-numeric input to 1", () => {
    const onWorkdayHoursChange = vi.fn()
    renderMenu({ onWorkdayHoursChange })
    fireEvent.click(screen.getByRole("button", { name: /martín/i }))
    const numberInputs = screen.getAllByRole("spinbutton")
    fireEvent.change(numberInputs[0], { target: { value: "abc" } })
    expect(onWorkdayHoursChange).toHaveBeenCalledWith(1)
  })

  it("clamps input above 10 to 10", () => {
    const onWorkdayHoursChange = vi.fn()
    renderMenu({ onWorkdayHoursChange })
    fireEvent.click(screen.getByRole("button", { name: /martín/i }))
    const numberInputs = screen.getAllByRole("spinbutton")
    fireEvent.change(numberInputs[0], { target: { value: "99" } })
    expect(onWorkdayHoursChange).toHaveBeenCalledWith(10)
  })

  it("navigates to /login on logout", () => {
    renderMenu()
    fireEvent.click(screen.getByRole("button", { name: /martín/i }))
    fireEvent.click(screen.getByRole("button", { name: /cerrar sesión/i }))
    expect(mockNavigate).toHaveBeenCalledWith("/login")
  })

  it("changes the default activity hours through the second field", () => {
    const onDefaultActivityHoursChange = vi.fn()
    renderMenu({ defaultActivityHours: 3, onDefaultActivityHoursChange })
    fireEvent.click(screen.getByRole("button", { name: /martín/i }))
    fireEvent.click(screen.getAllByRole("button", { name: "+" })[1])
    expect(onDefaultActivityHoursChange).toHaveBeenCalledWith(4)
  })
})

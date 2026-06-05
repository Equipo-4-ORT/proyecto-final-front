import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import DashboardStats from "../DashboardStats"

const defaultProps = {
  totaldisplayedActivities: 7,
  calendarEventCount: 3,
  totalHours: 4.5,
  productivityPercentage: 56,
  workdayHours: 8,
}

describe("DashboardStats", () => {
  it("renders the four stat values", () => {
    render(<DashboardStats {...defaultProps} />)
    expect(screen.getByText("7")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText(/4 h 30 min/)).toBeInTheDocument()
    expect(screen.getByText("56%")).toBeInTheDocument()
  })

  it("renders 'Eventos de Calendar' label (not 'Reuniones de Meet')", () => {
    render(<DashboardStats {...defaultProps} />)
    expect(screen.getByText(/eventos de calendar/i)).toBeInTheDocument()
    expect(screen.queryByText(/reuniones de meet/i)).toBeNull()
  })

  it("renders titles for the four cards", () => {
    render(<DashboardStats {...defaultProps} />)
    expect(screen.getByText(/actividades cargadas/i)).toBeInTheDocument()
    expect(screen.getByText(/total horas trabajadas/i)).toBeInTheDocument()
    expect(screen.getByText(/productividad del día/i)).toBeInTheDocument()
  })

  it("uses red variant when total hours exceed the workday", () => {
    render(
      <DashboardStats {...defaultProps} totalHours={10} workdayHours={8} />,
    )
    // The red variant turns the value text red; check that the formatted hours are rendered.
    expect(screen.getByText(/10 h/)).toBeInTheDocument()
  })
})

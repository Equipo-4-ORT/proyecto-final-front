import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import ReportView from "../ReportView"

vi.mock("../ActivitiesTable", () => ({
  default: () => <div data-testid="activities-table" />,
}))

const noop = vi.fn()
const defaultProps = {
  activities: [],
  onAddActivity: noop,
  onUpdateActivity: noop,
  onDeleteActivity: noop,
  defaultActivityHours: 1,
}

describe("ReportView", () => {
  it("renders the Reporte diario heading", () => {
    render(<ReportView {...defaultProps} />)
    expect(screen.getByRole("heading", { name: /reporte diario/i })).toBeInTheDocument()
  })

  it("renders the ActivitiesTable", () => {
    render(<ReportView {...defaultProps} />)
    expect(screen.getByTestId("activities-table")).toBeInTheDocument()
  })

  it("shows pending status when there are no activities", () => {
    render(<ReportView {...defaultProps} activities={[]} />)
    expect(screen.getByText(/pendiente/i)).toBeInTheDocument()
  })

  it("shows approved status when all activities are approved", () => {
    const activities = [
      { id: 1, status: "approved" },
      { id: 2, status: "approved" },
    ]
    render(<ReportView {...defaultProps} activities={activities} />)
    expect(screen.getByText(/aprobado/i)).toBeInTheDocument()
  })

  it("shows review status when any activity is in review, even if others are pending", () => {
    const activities = [
      { id: 1, status: "pending" },
      { id: 2, status: "review" },
    ]
    render(<ReportView {...defaultProps} activities={activities} />)
    expect(screen.getByText(/en revisión/i)).toBeInTheDocument()
  })

  it("shows pending status when activities exist but none are approved or in review", () => {
    const activities = [{ id: 1, status: "pending" }]
    render(<ReportView {...defaultProps} activities={activities} />)
    expect(screen.getByText(/pendiente/i)).toBeInTheDocument()
  })
})

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
}

describe("ReportView", () => {
  it("renders the ActivitiesTable", () => {
    render(<ReportView {...defaultProps} />)
    expect(screen.getByTestId("activities-table")).toBeInTheDocument()
  })

  it("does not render the Reporte diario heading", () => {
    render(<ReportView {...defaultProps} />)
    expect(screen.queryByRole("heading", { name: /reporte diario/i })).toBeNull()
  })
})

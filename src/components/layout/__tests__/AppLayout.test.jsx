import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import AppLayout from "../AppLayout"

const defaultProps = {
  sourceCounts: { calendar: 0, jira: 0, slides: 0, docs: 0, sheets: 0 },
  selectedDate: "2026-05-13",
  onDateChange: () => {},
  onExportExcel: () => {},
  workdayHours: 8,
  defaultActivityHours: 1,
  onWorkdayHoursChange: () => {},
  onDefaultActivityHoursChange: () => {},
}

describe("AppLayout", () => {
  it("renders children inside the main slot", () => {
    render(
      <MemoryRouter>
        <AppLayout {...defaultProps}>
          <p>child content</p>
        </AppLayout>
      </MemoryRouter>,
    )
    expect(screen.getByText("child content")).toBeInTheDocument()
  })

  it("renders sidebar and header", () => {
    render(
      <MemoryRouter>
        <AppLayout {...defaultProps}>x</AppLayout>
      </MemoryRouter>,
    )
    expect(screen.getByText("AutoLog")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /^dashboard$/i, level: 2 })).toBeInTheDocument()
  })
})

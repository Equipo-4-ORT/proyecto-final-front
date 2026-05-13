import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts")
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div data-testid="rc">{children}</div>,
  }
})

import TimeDistributionChart from "../TimeDistributionChart"

const data = [
  { label: "Calendar", minutes: 60, chartColor: "#f97316" },
  { label: "Jira", minutes: 120, chartColor: "#7c3aed" },
]

describe("TimeDistributionChart", () => {
  it("shows an empty state when all entries are zero minutes", () => {
    render(
      <TimeDistributionChart
        data={[{ label: "x", minutes: 0, chartColor: "#000" }]}
        workdayHours={8}
      />,
    )
    expect(screen.getByText(/no hay datos para mostrar/i)).toBeInTheDocument()
  })

  it("renders rows for each non-empty entry and the totals block", () => {
    render(<TimeDistributionChart data={data} workdayHours={8} />)
    expect(screen.getByText("Calendar")).toBeInTheDocument()
    expect(screen.getByText("Jira")).toBeInTheDocument()
    expect(screen.getByText(/horas totales/i)).toBeInTheDocument()
    // 60 + 120 = 180 min = 3 h total (floored).
    expect(screen.getByText("3 h")).toBeInTheDocument()
  })

  it("clamps percentage when workdayHours is 0 to avoid division by zero", () => {
    render(<TimeDistributionChart data={data} workdayHours={0} />)
    // Both percentages should be 0%.
    const zeroPercentages = screen.getAllByText("0%")
    expect(zeroPercentages.length).toBeGreaterThanOrEqual(2)
  })
})

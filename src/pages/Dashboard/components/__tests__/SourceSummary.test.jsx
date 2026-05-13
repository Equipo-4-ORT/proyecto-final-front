import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts")
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div data-testid="rc">{children}</div>,
  }
})

import SourceSummary from "../SourceSummary"
import { CalendarDays, ListTodo } from "lucide-react"

const sourceSummary = [
  {
    key: "calendar",
    label: "Calendar",
    icon: CalendarDays,
    sidebarColor: "bg-orange-500",
    chartColor: "#f97316",
    activities: 3,
    minutes: 90,
    hours: 1.5,
    percentage: 60,
  },
  {
    key: "jira",
    label: "Jira",
    icon: ListTodo,
    sidebarColor: "bg-violet-600",
    chartColor: "#7c3aed",
    activities: 2,
    minutes: 60,
    hours: 1,
    percentage: 40,
  },
]

describe("SourceSummary", () => {
  it("renders one card per source with its formatted duration", () => {
    render(<SourceSummary sourceSummary={sourceSummary} workdayHours={8} />)
    expect(screen.getByText("Calendar")).toBeInTheDocument()
    expect(screen.getByText("Jira")).toBeInTheDocument()
    expect(screen.getByText(/1 h 30 min/)).toBeInTheDocument()
    expect(screen.getByText(/1 h$/)).toBeInTheDocument()
    expect(screen.getByText(/3 actividades/i)).toBeInTheDocument()
    expect(screen.getByText(/2 actividades/i)).toBeInTheDocument()
  })

  it("renders the chart container", () => {
    render(<SourceSummary sourceSummary={sourceSummary} workdayHours={8} />)
    expect(screen.getByText(/distribución de tiempo/i)).toBeInTheDocument()
  })
})

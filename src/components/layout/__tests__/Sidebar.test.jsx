import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import Sidebar from "../Sidebar"

const sourceCounts = { calendar: 3, jira: 2, slides: 0, docs: 1, sheets: 4 }

describe("Sidebar", () => {
  it("renders the app heading", () => {
    render(<Sidebar sourceCounts={sourceCounts} onExportExcel={() => {}} />)
    expect(screen.getByRole("heading", { name: /autolog/i })).toBeInTheDocument()
  })

  it("renders one row per source with its count", () => {
    render(<Sidebar sourceCounts={sourceCounts} onExportExcel={() => {}} />)
    expect(screen.getByText("Calendar")).toBeInTheDocument()
    expect(screen.getByText("Jira")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("4")).toBeInTheDocument()
  })

  it("invokes onExportExcel when clicking the export button", () => {
    const onExportExcel = vi.fn()
    render(<Sidebar sourceCounts={sourceCounts} onExportExcel={onExportExcel} />)
    fireEvent.click(screen.getByRole("button", { name: /exportar/i }))
    expect(onExportExcel).toHaveBeenCalledTimes(1)
  })
})

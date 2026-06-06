import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { AuthContext } from "../../../contexts/auth-context"
import AppLayout from "../AppLayout"

const defaultProps = {
  sourceCounts: { calendar: 0, jira: 0, slides: 0, docs: 0, sheets: 0 },
  selectedDate: "2026-05-13",
  onDateChange: () => {},
  onExportExcel: () => {},
}

const authValue = {
  user: { name: "Martín", email: "martin@example.com" },
  logout: () => {},
}

const renderLayout = (children) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>
        <AppLayout {...defaultProps}>{children}</AppLayout>
      </AuthContext.Provider>
    </MemoryRouter>,
  )

describe("AppLayout", () => {
  it("renders children inside the main slot", () => {
    renderLayout(<p>child content</p>)
    expect(screen.getByText("child content")).toBeInTheDocument()
  })

  it("renders sidebar and header", () => {
    renderLayout("x")
    expect(screen.getByText("AutoLog")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /^dashboard$/i, level: 2 })).toBeInTheDocument()
  })
})

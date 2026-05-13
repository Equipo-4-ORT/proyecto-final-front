import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Dashboard from "../Dashboard"

describe("Dashboard", () => {
  it("renders the Dashboard heading", () => {
    render(<Dashboard />)
    expect(
      screen.getByRole("heading", { name: /dashboard/i, level: 1 })
    ).toBeInTheDocument()
  })
})

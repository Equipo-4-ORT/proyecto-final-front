import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

import Dashboard from "../Dashboard"
import { AuthProvider } from "../../contexts/AuthContext"

describe("Dashboard", () => {
  it("renders the Dashboard heading in the header", () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(
      screen.getByRole("heading", {
        name: /^dashboard$/i,
        level: 2,
      }),
    ).toBeInTheDocument()
  })
})

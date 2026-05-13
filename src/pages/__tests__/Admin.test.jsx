import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Admin from "../Admin"

describe("Admin", () => {
  it("renders the Admin heading", () => {
    render(<Admin />)
    expect(
      screen.getByRole("heading", { name: /admin/i, level: 1 })
    ).toBeInTheDocument()
  })
})

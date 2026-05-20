import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import Admin from "../Admin"

vi.mock('../../services/api', () => ({
  default: { post: vi.fn() },
}))

describe("Admin", () => {
  it("renders the Admin heading", () => {
    render(<Admin />)
    expect(
      screen.getByRole("heading", { name: /admin/i, level: 1 })
    ).toBeInTheDocument()
  })
})

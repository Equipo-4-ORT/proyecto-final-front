import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import NotFound from "../NotFound"

describe("NotFound", () => {
  it("renders the 404 heading", () => {
    render(<NotFound />)
    expect(
      screen.getByRole("heading", { name: /404/, level: 1 })
    ).toBeInTheDocument()
  })
})

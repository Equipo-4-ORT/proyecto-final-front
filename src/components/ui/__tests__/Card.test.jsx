import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Card from "../Card"

describe("Card", () => {
  it("renders children", () => {
    render(
      <Card>
        <p>Card body</p>
      </Card>,
    )
    expect(screen.getByText("Card body")).toBeInTheDocument()
  })

  it("merges custom className with base classes", () => {
    render(<Card className="p-6 custom-class">x</Card>)
    const container = screen.getByText("x").parentElement
    expect(container.className).toContain("custom-class")
    expect(container.className).toContain("rounded-2xl")
  })
})

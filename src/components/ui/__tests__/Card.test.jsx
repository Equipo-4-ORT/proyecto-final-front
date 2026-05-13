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
    const cardDiv = screen.getByText("x")
    expect(cardDiv.className).toContain("custom-class")
    expect(cardDiv.className).toContain("rounded-2xl")
  })
})

import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Badge from "../Badge"

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Hello</Badge>)
    expect(screen.getByText("Hello")).toBeInTheDocument()
  })

  it("uses the requested color classes", () => {
    render(<Badge color="orange">tag</Badge>)
    expect(screen.getByText("tag").className).toMatch(/bg-orange-100/)
    expect(screen.getByText("tag").className).toMatch(/text-orange-700/)
  })

  it("falls back to slate when color is not in the map", () => {
    render(<Badge color="nonexistent">unknown</Badge>)
    expect(screen.getByText("unknown").className).toMatch(/bg-slate-100/)
    expect(screen.getByText("unknown").className).toMatch(/text-slate-700/)
  })

  it("defaults to slate when no color is passed", () => {
    render(<Badge>default</Badge>)
    expect(screen.getByText("default").className).toMatch(/bg-slate-100/)
  })
})

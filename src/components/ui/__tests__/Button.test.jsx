import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import Button from "../Button"

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument()
  })

  it("defaults to type='button'", () => {
    render(<Button>X</Button>)
    expect(screen.getByRole("button")).toHaveAttribute("type", "button")
  })

  it("forwards arbitrary props (aria-label)", () => {
    render(<Button aria-label="close">×</Button>)
    expect(screen.getByLabelText("close")).toBeInTheDocument()
  })

  it("calls onClick", () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole("button"))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it.each([
    ["primary", "bg-blue-600"],
    ["primaryDark", "bg-[var(--color-primary)]"],
    ["success", "bg-emerald-600"],
    ["outline", "bg-white"],
    ["ghost", "text-slate-600"],
  ])("applies %s variant classes", (variant, expectedClass) => {
    render(<Button variant={variant}>v</Button>)
    expect(screen.getByRole("button").className).toContain(expectedClass)
  })

  it("merges className with variant classes", () => {
    render(<Button className="extra-class">v</Button>)
    expect(screen.getByRole("button").className).toContain("extra-class")
  })
})

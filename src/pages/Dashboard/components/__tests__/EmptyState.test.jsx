import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import EmptyState from "../EmptyState"

describe("EmptyState", () => {
  it("renders the heading and description", () => {
    render(<EmptyState onGenerate={vi.fn()} />)
    expect(screen.getByRole("heading", { name: /no hay actividades/i })).toBeInTheDocument()
    expect(screen.getByText(/generá un informe automático/i)).toBeInTheDocument()
  })

  it("renders the generate button", () => {
    render(<EmptyState onGenerate={vi.fn()} />)
    expect(screen.getByRole("button", { name: /generar informe/i })).toBeInTheDocument()
  })

  it("calls onGenerate when the button is clicked", () => {
    const onGenerate = vi.fn()
    render(<EmptyState onGenerate={onGenerate} />)
    fireEvent.click(screen.getByRole("button", { name: /generar informe/i }))
    expect(onGenerate).toHaveBeenCalledTimes(1)
  })
})

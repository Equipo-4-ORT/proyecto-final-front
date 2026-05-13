import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Loading from "../Loading"

describe("Loading", () => {
  it("renders the default message", () => {
    render(<Loading />)
    expect(screen.getByText("Cargando...")).toBeInTheDocument()
  })

  it("renders a custom message", () => {
    render(<Loading message="Buscando datos..." />)
    expect(screen.getByText("Buscando datos...")).toBeInTheDocument()
  })
})

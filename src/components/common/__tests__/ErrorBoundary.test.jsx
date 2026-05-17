import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import ErrorBoundary from "../ErrorBoundary"

function Boom() {
  throw new Error("boom!")
}

describe("ErrorBoundary", () => {
  let consoleErrorSpy

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <p>Healthy child</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText("Healthy child")).toBeInTheDocument()
  })

  it("renders the fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByRole("heading", { name: /algo salió mal/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /recargar/i })).toBeInTheDocument()
  })

  it("calls window.location.reload when the user clicks Recargar", () => {
    const reload = vi.fn()
    Object.defineProperty(window, "location", {
      value: { reload },
      writable: true,
      configurable: true,
    })

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    fireEvent.click(screen.getByRole("button", { name: /recargar/i }))
    expect(reload).toHaveBeenCalledTimes(1)
  })
})

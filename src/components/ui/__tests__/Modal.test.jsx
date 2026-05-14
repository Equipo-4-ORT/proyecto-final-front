import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import Modal from "../Modal"

const defaultProps = {
  isOpen: true,
  title: "Confirmar acción",
  onClose: vi.fn(),
  children: <p>Body content</p>,
  actions: <button type="button">OK</button>,
}

describe("Modal", () => {
  it("does not render when isOpen is false", () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("renders title, children and actions when open", () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /confirmar acción/i })).toBeInTheDocument()
    expect(screen.getByText("Body content")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /ok/i })).toBeInTheDocument()
  })

  it("exposes aria-modal and aria-labelledby tied to the heading", () => {
    render(<Modal {...defaultProps} />)
    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveAttribute("aria-modal", "true")
    const labelId = dialog.getAttribute("aria-labelledby")
    expect(labelId).toBeTruthy()
    expect(document.getElementById(labelId)).toHaveTextContent("Confirmar acción")
  })

  it("calls onClose when the Escape key is pressed", () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    fireEvent.keyDown(document, { key: "Escape" })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("does not call onClose for other keys", () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    fireEvent.keyDown(document, { key: "Enter" })
    expect(onClose).not.toHaveBeenCalled()
  })

  it("calls onClose when clicking the backdrop", () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByRole("presentation"))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("does not call onClose when clicking inside the dialog content", () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByRole("dialog"))
    expect(onClose).not.toHaveBeenCalled()
  })

  it("locks body scroll while open and restores it on unmount", () => {
    document.body.style.overflow = "auto"
    const { unmount } = render(<Modal {...defaultProps} />)
    expect(document.body.style.overflow).toBe("hidden")
    unmount()
    expect(document.body.style.overflow).toBe("auto")
  })

  it("does not break when onClose is not provided (Escape)", () => {
    render(<Modal {...defaultProps} onClose={undefined} />)
    expect(() => fireEvent.keyDown(document, { key: "Escape" })).not.toThrow()
  })

  it("does not break when onClose is not provided (backdrop)", () => {
    render(<Modal {...defaultProps} onClose={undefined} />)
    expect(() => fireEvent.click(screen.getByRole("presentation"))).not.toThrow()
  })
})

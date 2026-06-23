import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import ActivityMobileCard from "../ActivityMobileCard"

const baseActivity = {
  id: 1,
  source: "jira",
  title: "Bug",
  description: "AUTO-1",
  start: "09:00",
  end: "10:00",
  notes: "important",
}

const noopHandlers = {
  onStartEdit: () => {},
  onCancelEdit: () => {},
  onEditingChange: () => {},
  onSaveEdit: () => {},
  onDeleteClick: () => {},
}

const renderCard = (props = {}) =>
  render(
    <ActivityMobileCard
      activity={baseActivity}
      isEditing={false}
      editingData={{}}
      editingErrors={{}}
      {...noopHandlers}
      {...props}
    />,
  )

describe("ActivityMobileCard", () => {
  it("renders the activity details in read mode", () => {
    renderCard()
    expect(screen.getByText("Bug")).toBeInTheDocument()
    expect(screen.getByText("AUTO-1")).toBeInTheDocument()
    expect(screen.getByText("09:00")).toBeInTheDocument()
    expect(screen.getByText("10:00")).toBeInTheDocument()
    expect(screen.getByText("important")).toBeInTheDocument()
  })

  it("renders the unknown-source placeholder", () => {
    renderCard({ activity: { ...baseActivity, source: "spotify" } })
    expect(screen.getByText("Desconocida")).toBeInTheDocument()
  })

  it("falls back to the start time as end when end is missing", () => {
    renderCard({ activity: { ...baseActivity, end: "" } })
    // Sin estimación: Inicio y Fin muestran ambos el inicio.
    expect(screen.getAllByText("09:00")).toHaveLength(2)
  })

  it("invokes onStartEdit and onDeleteClick", () => {
    const onStartEdit = vi.fn()
    const onDeleteClick = vi.fn()
    renderCard({ onStartEdit, onDeleteClick })
    fireEvent.click(screen.getByRole("button", { name: /editar actividad/i }))
    fireEvent.click(screen.getByRole("button", { name: /eliminar actividad/i }))
    expect(onStartEdit).toHaveBeenCalled()
    expect(onDeleteClick).toHaveBeenCalled()
  })

  it("renders edit-mode inputs and propagates changes", () => {
    const onEditingChange = vi.fn()
    renderCard({
      isEditing: true,
      editingData: { title: "x", description: "y", start: "09:00", end: "10:00", notes: "z" },
      onEditingChange,
    })
    fireEvent.change(screen.getByPlaceholderText(/título/i), {
      target: { value: "new title" },
    })
    expect(onEditingChange).toHaveBeenCalledWith("title", "new title")
  })

  it("renders empty placeholders for optional fields when read-only", () => {
    renderCard({
      activity: { ...baseActivity, description: "", notes: "" },
    })
    expect(screen.getByText(/descripción\.\.\./i)).toBeInTheDocument()
    expect(screen.getByText(/notas\.\.\./i)).toBeInTheDocument()
  })
})

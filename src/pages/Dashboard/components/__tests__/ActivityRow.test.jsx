import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import ActivityRow from "../ActivityRow"

const baseActivity = {
  id: 1,
  source: "calendar",
  title: "Reunión",
  description: "Daily",
  start: "09:00",
  end: "10:00",
  notes: "",
}

const noopHandlers = {
  onStartEdit: () => {},
  onCancelEdit: () => {},
  onEditingChange: () => {},
  onSaveEdit: () => {},
  onDeleteClick: () => {},
}

function renderRow(props = {}) {
  return render(
    <table>
      <tbody>
        <ActivityRow
          rowNumber={1}
          activity={baseActivity}
          defaultActivityHours={1}
          isEditing={false}
          editingData={{}}
          editingErrors={{}}
          {...noopHandlers}
          {...props}
        />
      </tbody>
    </table>,
  )
}

describe("ActivityRow", () => {
  it("renders activity columns in read mode", () => {
    renderRow()
    expect(screen.getByText("Reunión")).toBeInTheDocument()
    expect(screen.getByText("Daily")).toBeInTheDocument()
    expect(screen.getByText("09:00")).toBeInTheDocument()
    expect(screen.getByText("10:00")).toBeInTheDocument()
  })

  it("renders the rowNumber prop in the first cell", () => {
    renderRow({ rowNumber: 5 })
    expect(screen.getByText("5")).toBeInTheDocument()
  })

  it("renders an unknown-source placeholder instead of hiding the row", () => {
    renderRow({ activity: { ...baseActivity, source: "spotify" } })
    expect(screen.getByText("Desconocida")).toBeInTheDocument()
  })

  it("renders 'Título...' / 'Descripción...' / 'Notas...' placeholders for empty optional fields", () => {
    renderRow({
      activity: { ...baseActivity, title: "", description: "", notes: "" },
    })
    expect(screen.getByText(/título\.\.\./i)).toBeInTheDocument()
    expect(screen.getByText(/descripción\.\.\./i)).toBeInTheDocument()
    expect(screen.getByText(/notas\.\.\./i)).toBeInTheDocument()
  })

  it("renders the estimated end time when end is missing", () => {
    renderRow({
      activity: { ...baseActivity, end: "" },
      defaultActivityHours: 2,
    })
    expect(screen.getByText("11:00")).toBeInTheDocument()
  })

  it("invokes onStartEdit when clicking the edit button", () => {
    const onStartEdit = vi.fn()
    renderRow({ onStartEdit })
    fireEvent.click(screen.getByRole("button", { name: /editar actividad/i }))
    expect(onStartEdit).toHaveBeenCalledWith(baseActivity)
  })

  it("invokes onDeleteClick when clicking the delete button", () => {
    const onDeleteClick = vi.fn()
    renderRow({ onDeleteClick })
    fireEvent.click(screen.getByRole("button", { name: /eliminar actividad/i }))
    expect(onDeleteClick).toHaveBeenCalledWith(baseActivity)
  })

  it("renders save and cancel actions in edit mode", () => {
    renderRow({
      isEditing: true,
      editingData: {
        title: "edited",
        description: "",
        start: "09:00",
        end: "10:00",
        notes: "",
      },
    })
    expect(screen.getByRole("button", { name: /guardar edición/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /cancelar edición/i })).toBeInTheDocument()
  })

  it("calls onSaveEdit and onCancelEdit while editing", () => {
    const onSaveEdit = vi.fn()
    const onCancelEdit = vi.fn()
    renderRow({
      isEditing: true,
      editingData: { title: "", description: "", start: "09:00", end: "10:00", notes: "" },
      onSaveEdit,
      onCancelEdit,
    })
    fireEvent.click(screen.getByRole("button", { name: /guardar edición/i }))
    fireEvent.click(screen.getByRole("button", { name: /cancelar edición/i }))
    expect(onSaveEdit).toHaveBeenCalled()
    expect(onCancelEdit).toHaveBeenCalled()
  })

  it("propagates field changes through onEditingChange", () => {
    const onEditingChange = vi.fn()
    renderRow({
      isEditing: true,
      editingData: { title: "old", description: "", start: "09:00", end: "10:00", notes: "" },
      onEditingChange,
    })
    fireEvent.change(screen.getByPlaceholderText(/título/i), {
      target: { value: "new" },
    })
    expect(onEditingChange).toHaveBeenCalledWith("title", "new")
  })
})

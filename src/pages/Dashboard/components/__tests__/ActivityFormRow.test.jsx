import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import ActivityFormRow from "../ActivityFormRow"

const emptyFormData = {
  source: "",
  title: "",
  description: "",
  start: "",
  end: "",
  notes: "",
}

const filledFormData = {
  source: "jira",
  title: "Bug fix",
  description: "AUTO-1",
  start: "09:00",
  end: "10:00",
  notes: "note",
}

const noopHandlers = {
  onChange: () => {},
  onAdd: () => {},
  onCancel: () => {},
  onStartAdding: () => {},
}

const renderForm = (props = {}) =>
  render(
    <ActivityFormRow
      isAdding={false}
      formData={emptyFormData}
      errors={{}}
      {...noopHandlers}
      {...props}
    />,
  )

describe("ActivityFormRow", () => {
  it("renders the '+ Agregar actividad' button when not adding", () => {
    renderForm()
    expect(screen.getByRole("button", { name: /\+ agregar actividad/i })).toBeInTheDocument()
  })

  it("invokes onStartAdding when clicking the add button", () => {
    const onStartAdding = vi.fn()
    renderForm({ onStartAdding })
    fireEvent.click(screen.getByRole("button", { name: /agregar actividad/i }))
    expect(onStartAdding).toHaveBeenCalled()
  })

  it("renders Agregar and Cancelar actions while adding", () => {
    renderForm({ isAdding: true, formData: filledFormData })
    expect(screen.getByRole("button", { name: /^agregar$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^cancelar$/i })).toBeInTheDocument()
  })

  it("invokes onAdd and onCancel", () => {
    const onAdd = vi.fn()
    const onCancel = vi.fn()
    renderForm({ isAdding: true, formData: filledFormData, onAdd, onCancel })
    fireEvent.click(screen.getByRole("button", { name: /^agregar$/i }))
    fireEvent.click(screen.getByRole("button", { name: /^cancelar$/i }))
    expect(onAdd).toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalled()
  })

  it("propagates field changes via onChange", () => {
    const onChange = vi.fn()
    renderForm({ isAdding: true, onChange })
    fireEvent.change(screen.getByPlaceholderText(/título/i), {
      target: { value: "T" },
    })
    expect(onChange).toHaveBeenCalledWith("title", "T")

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "jira" },
    })
    expect(onChange).toHaveBeenCalledWith("source", "jira")
  })

  it("renders inline error messages when provided", () => {
    renderForm({
      isAdding: true,
      errors: {
        source: "Seleccioná una fuente",
        start: "Indicá una hora de inicio",
        end: "La hora de fin debe ser mayor a la de inicio",
      },
    })
    expect(screen.getByText(/seleccioná una fuente/i)).toBeInTheDocument()
    expect(screen.getByText(/indicá una hora de inicio/i)).toBeInTheDocument()
    expect(screen.getByText(/la hora de fin debe ser mayor/i)).toBeInTheDocument()
  })
})

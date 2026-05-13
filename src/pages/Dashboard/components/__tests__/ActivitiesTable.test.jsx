import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, within } from "@testing-library/react"
import { useState } from "react"
import ActivitiesTable from "../ActivitiesTable"

const seed = [
  { id: 1, source: "calendar", title: "Reunión", description: "Daily", start: "09:00", end: "10:00", notes: "" },
  { id: 2, source: "jira", title: "Bug fix", description: "AUTO-1", start: "11:00", end: "12:00", notes: "" },
]

function Harness({ initial = seed, onChange }) {
  const [activities, setActivities] = useState(initial)
  return (
    <ActivitiesTable
      activities={activities}
      setActivities={(updater) => {
        setActivities((prev) => {
          const next = typeof updater === "function" ? updater(prev) : updater
          onChange?.(next)
          return next
        })
      }}
      defaultActivityHours={1}
    />
  )
}

describe("ActivitiesTable", () => {
  it("sorts activities by start time, then by duration", () => {
    const initial = [
      { id: 1, source: "jira", title: "Long", description: "", start: "09:00", end: "11:00", notes: "" },
      { id: 2, source: "jira", title: "Short", description: "", start: "09:00", end: "09:30", notes: "" },
      { id: 3, source: "calendar", title: "Late", description: "", start: "12:00", end: "13:00", notes: "" },
    ]
    render(<Harness initial={initial} />)
    const titlesInOrder = screen.getAllByText(/^(Long|Short|Late)$/i)
    // First occurrence is desktop table, second is mobile cards (both rendered by RTL).
    // Just assert the relative order in the table body.
    const tableSection = screen.getByRole("table")
    const rows = within(tableSection).getAllByRole("row").slice(1) // skip header
    expect(within(rows[0]).getByText("Short")).toBeInTheDocument()
    expect(within(rows[1]).getByText("Long")).toBeInTheDocument()
    expect(within(rows[2]).getByText("Late")).toBeInTheDocument()
    expect(titlesInOrder.length).toBeGreaterThan(0)
  })

  it("blocks adding when the form is invalid (no source, no start)", () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    fireEvent.click(screen.getByRole("button", { name: /\+ agregar actividad/i }))
    fireEvent.click(screen.getByRole("button", { name: /^agregar$/i }))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText(/seleccioná una fuente/i)).toBeInTheDocument()
    expect(screen.getByText(/indicá una hora de inicio/i)).toBeInTheDocument()
  })

  it("adds a valid activity and assigns the next id", () => {
    let latest
    render(<Harness onChange={(next) => (latest = next)} />)
    fireEvent.click(screen.getByRole("button", { name: /\+ agregar actividad/i }))
    fireEvent.change(screen.getByDisplayValue(""), { target: { value: "calendar" } })
    fireEvent.change(screen.getAllByPlaceholderText(/título/i)[0], { target: { value: "Nueva" } })
    // Find the start/end inputs inside the form row by type=time using DOM query.
    const timeInputs = document.querySelectorAll('input[type="time"]')
    fireEvent.change(timeInputs[timeInputs.length - 2], { target: { value: "13:00" } })
    fireEvent.change(timeInputs[timeInputs.length - 1], { target: { value: "14:00" } })
    fireEvent.click(screen.getByRole("button", { name: /^agregar$/i }))

    expect(latest).toHaveLength(3)
    expect(latest.at(-1)).toMatchObject({ id: 3, source: "calendar", title: "Nueva", start: "13:00", end: "14:00" })
  })

  it("starts with id 1 when the list is empty", () => {
    let latest
    render(<Harness initial={[]} onChange={(next) => (latest = next)} />)
    fireEvent.click(screen.getByRole("button", { name: /\+ agregar actividad/i }))
    fireEvent.change(screen.getByDisplayValue(""), { target: { value: "jira" } })
    const timeInputs = document.querySelectorAll('input[type="time"]')
    fireEvent.change(timeInputs[0], { target: { value: "09:00" } })
    fireEvent.click(screen.getByRole("button", { name: /^agregar$/i }))
    expect(latest[0].id).toBe(1)
  })

  it("opens, confirms and removes the activity via the delete modal", () => {
    let latest
    render(<Harness onChange={(next) => (latest = next)} />)
    // First desktop row delete buttons (table + mobile both render delete buttons).
    fireEvent.click(screen.getAllByRole("button", { name: /eliminar actividad/i })[0])
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /eliminar actividad/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /^eliminar$/i }))

    expect(latest).toHaveLength(1)
    expect(latest[0].id).toBe(2)
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("cancels the delete without changing state", () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    fireEvent.click(screen.getAllByRole("button", { name: /eliminar actividad/i })[0])
    fireEvent.click(screen.getByRole("button", { name: /^cancelar$/i }))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("closes the delete modal when pressing Escape", () => {
    render(<Harness />)
    fireEvent.click(screen.getAllByRole("button", { name: /eliminar actividad/i })[0])
    fireEvent.keyDown(document, { key: "Escape" })
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("edits an activity and saves the new values", () => {
    let latest
    render(<Harness onChange={(next) => (latest = next)} />)
    fireEvent.click(screen.getAllByRole("button", { name: /editar actividad/i })[0])
    const titleInput = screen.getAllByPlaceholderText(/título/i)[0]
    fireEvent.change(titleInput, { target: { value: "Reunión editada" } })
    fireEvent.click(screen.getAllByRole("button", { name: /guardar edición/i })[0])

    const updated = latest.find((activity) => activity.id === 1)
    expect(updated.title).toBe("Reunión editada")
  })

  it("blocks saving an edit when the time range is invalid", () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    fireEvent.click(screen.getAllByRole("button", { name: /editar actividad/i })[0])
    const editTimeInputs = document.querySelectorAll('input[type="time"]')
    // Edit row exposes two time inputs first.
    fireEvent.change(editTimeInputs[0], { target: { value: "12:00" } })
    fireEvent.change(editTimeInputs[1], { target: { value: "11:00" } })
    fireEvent.click(screen.getAllByRole("button", { name: /guardar edición/i })[0])
    expect(onChange).not.toHaveBeenCalled()
  })

  it("cancels an edit without changing state", () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    fireEvent.click(screen.getAllByRole("button", { name: /editar actividad/i })[0])
    fireEvent.click(screen.getAllByRole("button", { name: /cancelar edición/i })[0])
    expect(onChange).not.toHaveBeenCalled()
  })

  it("clears editing state when deleting the row currently being edited", () => {
    let latest
    render(<Harness onChange={(next) => (latest = next)} />)
    // Start editing id=1
    fireEvent.click(screen.getAllByRole("button", { name: /editar actividad/i })[0])
    expect(screen.getAllByRole("button", { name: /guardar edición/i })[0]).toBeInTheDocument()
    // Delete the same row
    fireEvent.click(screen.getAllByRole("button", { name: /eliminar actividad/i })[0])
    fireEvent.click(screen.getByRole("button", { name: /^eliminar$/i }))
    expect(latest.find((activity) => activity.id === 1)).toBeUndefined()
    // No more "guardar edición" buttons since the edited row is gone.
    expect(screen.queryByRole("button", { name: /guardar edición/i })).toBeNull()
  })

  it("cancel-add resets form state", () => {
    render(<Harness />)
    fireEvent.click(screen.getByRole("button", { name: /\+ agregar actividad/i }))
    fireEvent.change(screen.getAllByPlaceholderText(/título/i)[0], {
      target: { value: "tmp" },
    })
    fireEvent.click(screen.getByRole("button", { name: /^cancelar$/i }))
    expect(screen.getByRole("button", { name: /\+ agregar actividad/i })).toBeInTheDocument()
  })
})

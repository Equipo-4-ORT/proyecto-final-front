import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react"
import { useState } from "react"
import ActivitiesTable from "../ActivitiesTable"

const seed = [
  { id: 1, source: "calendar", title: "Reunión", description: "Daily", start: "09:00", end: "10:00", notes: "", status: "pending" },
  { id: 2, source: "jira", title: "Bug fix", description: "AUTO-1", start: "11:00", end: "12:00", notes: "", status: "pending" },
]

function Harness({ initial = seed, onChange }) {
  const [activities, setActivities] = useState(initial)

  const updateActivities = (updater) => {
    setActivities((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      onChange?.(next)
      return next
    })
  }

  const onAddActivity = async (formData) => {
    const newActivity = {
      id: crypto.randomUUID(),
      source: formData.source,
      title: formData.title?.trim() || "",
      description: formData.description?.trim() || "",
      start: formData.start,
      end: formData.end || "",
      status: "pending",
      notes: formData.notes?.trim() || "",
    }
    updateActivities((prev) => [...prev, newActivity])
    return { ok: true, activity: newActivity }
  }

  const onUpdateActivity = async (id, editingData) => {
    updateActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...editingData } : a)),
    )
    return { ok: true }
  }

  const onDeleteActivity = async (id) => {
    updateActivities((prev) => prev.filter((a) => a.id !== id))
    return { ok: true }
  }

  return (
    <ActivitiesTable
      activities={activities}
      onAddActivity={onAddActivity}
      onUpdateActivity={onUpdateActivity}
      onDeleteActivity={onDeleteActivity}
    />
  )
}

describe("ActivitiesTable", () => {
  it("sorts activities by start time, then by duration", () => {
    const initial = [
      { id: 1, source: "jira", title: "Long", description: "", start: "09:00", end: "11:00", notes: "", status: "pending" },
      { id: 2, source: "jira", title: "Short", description: "", start: "09:00", end: "09:30", notes: "", status: "pending" },
      { id: 3, source: "calendar", title: "Late", description: "", start: "12:00", end: "13:00", notes: "", status: "pending" },
    ]
    render(<Harness initial={initial} />)
    const titlesInOrder = screen.getAllByText(/^(Long|Short|Late)$/i)
    const tableSection = screen.getByRole("table")
    const rows = within(tableSection).getAllByRole("row").slice(1)
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

  it("adds a valid activity with a generated id", async () => {
    let latest
    render(<Harness onChange={(next) => (latest = next)} />)
    fireEvent.click(screen.getByRole("button", { name: /\+ agregar actividad/i }))
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "calendar" } })
    fireEvent.change(screen.getAllByPlaceholderText(/título/i)[0], { target: { value: "Nueva" } })
    const timeInputs = document.querySelectorAll('input[type="time"]')
    fireEvent.change(timeInputs[timeInputs.length - 2], { target: { value: "13:00" } })
    fireEvent.change(timeInputs[timeInputs.length - 1], { target: { value: "14:00" } })
    fireEvent.click(screen.getByRole("button", { name: /^agregar$/i }))

    await waitFor(() => expect(latest).toHaveLength(3))
    expect(latest.at(-1)).toMatchObject({
      source: "calendar",
      title: "Nueva",
      start: "13:00",
      end: "14:00",
    })
    expect(typeof latest.at(-1).id).toBe("string")
    expect(latest.at(-1).id.length).toBeGreaterThan(0)
  })

  it("creates the first activity when the list is empty", async () => {
    let latest
    render(<Harness initial={[]} onChange={(next) => (latest = next)} />)
    fireEvent.click(screen.getByRole("button", { name: /\+ agregar actividad/i }))
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "jira" } })
    const timeInputs = document.querySelectorAll('input[type="time"]')
    fireEvent.change(timeInputs[0], { target: { value: "09:00" } })
    fireEvent.click(screen.getByRole("button", { name: /^agregar$/i }))

    await waitFor(() => expect(latest).toHaveLength(1))
    expect(typeof latest[0].id).toBe("string")
  })

  it("opens, confirms and removes the activity via the delete modal", async () => {
    let latest
    render(<Harness onChange={(next) => (latest = next)} />)
    fireEvent.click(screen.getAllByRole("button", { name: /eliminar actividad/i })[0])
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /eliminar actividad/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /^eliminar$/i }))

    await waitFor(() => expect(latest).toHaveLength(1))
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

  it("edits an activity and saves the new values", async () => {
    let latest
    render(<Harness onChange={(next) => (latest = next)} />)
    fireEvent.click(screen.getAllByRole("button", { name: /editar actividad/i })[0])
    const titleInput = screen.getAllByPlaceholderText(/título/i)[0]
    fireEvent.change(titleInput, { target: { value: "Reunión editada" } })
    fireEvent.click(screen.getAllByRole("button", { name: /guardar edición/i })[0])

    await waitFor(() => expect(latest).toBeDefined())
    const updated = latest.find((activity) => activity.id === 1)
    expect(updated.title).toBe("Reunión editada")
  })

  it("blocks saving an edit when the time range is invalid", () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    fireEvent.click(screen.getAllByRole("button", { name: /editar actividad/i })[0])
    const editTimeInputs = document.querySelectorAll('input[type="time"]')
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

  it("keeps other rows' edit state untouched when deleting a different row", async () => {
    let latest
    render(<Harness onChange={(next) => (latest = next)} />)
    fireEvent.click(screen.getAllByRole("button", { name: /editar actividad/i })[0])
    fireEvent.click(screen.getAllByRole("button", { name: /eliminar actividad/i })[0])
    fireEvent.click(screen.getByRole("button", { name: /^eliminar$/i }))

    await waitFor(() => expect(latest).toBeDefined())
    expect(latest.find((activity) => activity.id === 2)).toBeUndefined()
    expect(screen.getAllByRole("button", { name: /guardar edición/i }).length).toBeGreaterThan(0)
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

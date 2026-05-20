import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

import JiraCallbackBanner from "../JiraCallbackBanner"

const renderWithQuery = (search = "") => {
  return render(
    <MemoryRouter initialEntries={[`/dashboard${search}`]}>
      <JiraCallbackBanner />
    </MemoryRouter>
  )
}

describe("JiraCallbackBanner", () => {
  let replaceStateSpy

  beforeEach(() => {
    replaceStateSpy = vi.spyOn(window.history, "replaceState")
    window.history.replaceState({}, "", "/dashboard")
  })

  it("no renderiza nada si no hay query param ?jira=", () => {
    const { container } = renderWithQuery()
    expect(container.firstChild).toBeNull()
  })

  it("muestra banner success cuando ?jira=connected", () => {
    renderWithQuery("?jira=connected")
    expect(screen.getByText(/tu cuenta de jira está conectada/i)).toBeInTheDocument()
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("muestra banner info cuando ?jira=cancelled", () => {
    renderWithQuery("?jira=cancelled")
    expect(screen.getByText(/cancelaste la conexión/i)).toBeInTheDocument()
  })

  it("muestra mensaje específico cuando ?jira=error&reason=invalid_state", () => {
    renderWithQuery("?jira=error&reason=invalid_state")
    expect(screen.getByText(/enlace de autorización expiró/i)).toBeInTheDocument()
  })

  it("muestra mensaje específico cuando ?jira=error&reason=no_jira_site", () => {
    renderWithQuery("?jira=error&reason=no_jira_site")
    expect(screen.getByText(/no encontramos un site de jira/i)).toBeInTheDocument()
  })

  it("muestra fallback cuando ?jira=error sin reason conocido", () => {
    renderWithQuery("?jira=error&reason=algo_raro")
    expect(screen.getByText(/no pudimos conectar con jira/i)).toBeInTheDocument()
  })

  it("limpia ?jira y ?reason de la URL con replaceState", () => {
    renderWithQuery("?jira=connected")
    expect(replaceStateSpy).toHaveBeenCalled()
    const lastCall = replaceStateSpy.mock.calls[replaceStateSpy.mock.calls.length - 1]
    expect(lastCall[2]).toBe("/dashboard")
  })

  it("preserva otros query params al limpiar", () => {
    renderWithQuery("?jira=connected&foo=bar")
    const lastCall = replaceStateSpy.mock.calls[replaceStateSpy.mock.calls.length - 1]
    expect(lastCall[2]).toBe("/dashboard?foo=bar")
  })

  it("se descarta al hacer click en el botón cerrar", () => {
    renderWithQuery("?jira=connected")
    expect(screen.getByText(/jira está conectada/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /cerrar/i }))

    expect(screen.queryByText(/jira está conectada/i)).toBeNull()
  })
})

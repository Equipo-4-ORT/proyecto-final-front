import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mockUseJiraConnection = vi.fn()

vi.mock("../../../../hooks/useJiraConnection", () => ({
  useJiraConnection: () => mockUseJiraConnection(),
}))

import JiraIntegrationCard from "../JiraIntegrationCard"

const baseHookValue = {
  status: null,
  loading: false,
  actionInFlight: null,
  error: null,
  connect: vi.fn(),
  disconnect: vi.fn(),
  refresh: vi.fn(),
}

const setup = (override = {}, props = {}) => {
  mockUseJiraConnection.mockReturnValue({ ...baseHookValue, ...override })
  return render(<JiraIntegrationCard {...props} />)
}

describe("JiraIntegrationCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("muestra estado de carga mientras loading=true", () => {
    setup({ loading: true })
    expect(screen.getByText(/cargando estado/i)).toBeInTheDocument()
  })

  it("no permite sincronizar manualmente en ningún estado", () => {
    setup({
      status: {
        connected: true,
        siteUrl: "https://acme.atlassian.net",
        reconnectRequired: false,
      },
    })
    expect(screen.queryByRole("button", { name: /sincronizar/i })).toBeNull()
  })

  describe("no conectado", () => {
    it("muestra badge 'No conectado' y botón 'Conectar Jira'", () => {
      setup({ status: { connected: false, siteUrl: null, reconnectRequired: false } })
      expect(screen.getByText(/no conectado/i)).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /conectar jira/i })).toBeInTheDocument()
      expect(screen.queryByRole("button", { name: /desconectar/i })).toBeNull()
    })

    it("invoca connect al hacer click en 'Conectar Jira'", () => {
      const connect = vi.fn()
      setup({ status: { connected: false, reconnectRequired: false }, connect })
      fireEvent.click(screen.getByRole("button", { name: /conectar jira/i }))
      expect(connect).toHaveBeenCalled()
    })

    it("deshabilita el botón mientras actionInFlight='connect'", () => {
      setup({ status: { connected: false, reconnectRequired: false }, actionInFlight: "connect" })
      const btn = screen.getByRole("button", { name: /redirigiendo/i })
      expect(btn).toBeDisabled()
    })
  })

  describe("conectado", () => {
    const connectedStatus = {
      connected: true,
      siteUrl: "https://acme.atlassian.net",
      reconnectRequired: false,
    }

    it("muestra badge 'Conectado' y el site", () => {
      setup({ status: connectedStatus })
      expect(screen.getByText(/^conectado$/i)).toBeInTheDocument()
      expect(screen.getByText("https://acme.atlassian.net")).toBeInTheDocument()
    })

    it("muestra 'Desconectar' y oculta 'Conectar Jira'", () => {
      setup({ status: connectedStatus })
      expect(screen.getByRole("button", { name: /desconectar/i })).toBeInTheDocument()
      expect(screen.queryByRole("button", { name: /^conectar jira$/i })).toBeNull()
    })

    it("invoca disconnect al hacer click en 'Desconectar'", () => {
      const disconnect = vi.fn()
      setup({ status: connectedStatus, disconnect })
      fireEvent.click(screen.getByRole("button", { name: /desconectar/i }))
      expect(disconnect).toHaveBeenCalled()
    })

    it("deshabilita 'Desconectar' mientras actionInFlight='disconnect'", () => {
      setup({ status: connectedStatus, actionInFlight: "disconnect" })
      const btn = screen.getByRole("button", { name: /desconectando/i })
      expect(btn).toBeDisabled()
    })
  })

  describe("reconnect required", () => {
    const reconnectStatus = {
      connected: true,
      siteUrl: "https://acme.atlassian.net",
      reconnectRequired: true,
    }

    it("muestra badge 'Reconexión requerida' y vuelve a mostrar 'Conectar Jira'", () => {
      setup({ status: reconnectStatus })
      expect(screen.getByText(/reconexión requerida/i)).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /conectar jira/i })).toBeInTheDocument()
    })
  })

  describe("errores", () => {
    it("muestra mensaje mapeado para code conocido", () => {
      setup({
        status: { connected: true, reconnectRequired: false, siteUrl: "https://x.atlassian.net" },
        error: { scope: "disconnect", code: "upstream_error" },
      })
      expect(screen.getByText(/error al comunicarse con atlassian/i)).toBeInTheDocument()
    })

    it("muestra mensaje fallback para code desconocido", () => {
      setup({
        status: { connected: true, reconnectRequired: false, siteUrl: "https://x.atlassian.net" },
        error: { scope: "disconnect", code: "something_else" },
      })
      expect(screen.getByText(/error inesperado/i)).toBeInTheDocument()
    })
  })
})

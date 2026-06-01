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
  lastSyncResult: null,
  connect: vi.fn(),
  disconnect: vi.fn(),
  syncToday: vi.fn(),
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

  describe("no conectado", () => {
    it("muestra badge 'No conectado' y botón 'Conectar Jira'", () => {
      setup({ status: { connected: false, siteUrl: null, lastSyncAt: null, reconnectRequired: false } })
      expect(screen.getByText(/no conectado/i)).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /conectar jira/i })).toBeInTheDocument()
      expect(screen.queryByRole("button", { name: /sincronizar/i })).toBeNull()
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
      lastSyncAt: "2026-05-19T12:00:00.000Z",
      reconnectRequired: false,
    }

    it("muestra badge 'Conectado', site y last sync", () => {
      setup({ status: connectedStatus })
      expect(screen.getByText(/^conectado$/i)).toBeInTheDocument()
      expect(screen.getByText("https://acme.atlassian.net")).toBeInTheDocument()
      expect(screen.getByText(/última sincronización/i)).toBeInTheDocument()
    })

    it("muestra 'Sincronizar hoy' y 'Desconectar', oculta 'Conectar Jira'", () => {
      setup({ status: connectedStatus })
      expect(screen.getByRole("button", { name: /sincronizar hoy/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /desconectar/i })).toBeInTheDocument()
      expect(screen.queryByRole("button", { name: /^conectar jira$/i })).toBeNull()
    })

    it("invoca syncToday al hacer click en 'Sincronizar hoy'", () => {
      const syncToday = vi.fn()
      setup({ status: connectedStatus, syncToday })
      fireEvent.click(screen.getByRole("button", { name: /sincronizar hoy/i }))
      expect(syncToday).toHaveBeenCalled()
    })

    it("invoca disconnect al hacer click en 'Desconectar'", () => {
      const disconnect = vi.fn()
      setup({ status: connectedStatus, disconnect })
      fireEvent.click(screen.getByRole("button", { name: /desconectar/i }))
      expect(disconnect).toHaveBeenCalled()
    })

    it("muestra 'todavía no sincronizaste' cuando lastSyncAt es null", () => {
      setup({ status: { ...connectedStatus, lastSyncAt: null } })
      expect(screen.getByText(/todavía no sincronizaste/i)).toBeInTheDocument()
    })

    it("muestra el resultado del último sync", () => {
      setup({
        status: connectedStatus,
        lastSyncResult: { imported: 5, skippedDuplicates: 2, durationMs: 100 },
      })
      expect(screen.getByText(/5 importadas, 2 duplicadas/i)).toBeInTheDocument()
    })

    it("deshabilita 'Sincronizar hoy' mientras actionInFlight='sync'", () => {
      setup({ status: connectedStatus, actionInFlight: "sync" })
      const btn = screen.getByRole("button", { name: /sincronizando/i })
      expect(btn).toBeDisabled()
    })
  })

  describe("onSynced", () => {
    const connectedStatus = {
      connected: true,
      siteUrl: "https://acme.atlassian.net",
      lastSyncAt: null,
      reconnectRequired: false,
    }

    it("invoca onSynced cuando hay un resultado de sincronización", () => {
      const onSynced = vi.fn()
      setup(
        {
          status: connectedStatus,
          lastSyncResult: { imported: 3, skippedDuplicates: 0 },
        },
        { onSynced },
      )
      expect(onSynced).toHaveBeenCalledTimes(1)
    })

    it("no invoca onSynced cuando todavía no hubo sincronización", () => {
      const onSynced = vi.fn()
      setup({ status: connectedStatus, lastSyncResult: null }, { onSynced })
      expect(onSynced).not.toHaveBeenCalled()
    })
  })

  describe("reconnect required", () => {
    const reconnectStatus = {
      connected: true,
      siteUrl: "https://acme.atlassian.net",
      lastSyncAt: null,
      reconnectRequired: true,
    }

    it("muestra badge 'Reconexión requerida' y vuelve a mostrar 'Conectar Jira'", () => {
      setup({ status: reconnectStatus })
      expect(screen.getByText(/reconexión requerida/i)).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /conectar jira/i })).toBeInTheDocument()
    })

    it("oculta el botón de 'Sincronizar hoy' cuando reconnectRequired=true", () => {
      setup({ status: reconnectStatus })
      expect(screen.queryByRole("button", { name: /sincronizar hoy/i })).toBeNull()
    })
  })

  describe("errores", () => {
    it("muestra mensaje mapeado para code conocido", () => {
      setup({
        status: { connected: true, reconnectRequired: false, siteUrl: "https://x.atlassian.net", lastSyncAt: null },
        error: { scope: "sync", code: "invalid_window" },
      })
      expect(screen.getByText(/rango de fechas inválido/i)).toBeInTheDocument()
    })

    it("muestra mensaje fallback para code desconocido", () => {
      setup({
        status: { connected: true, reconnectRequired: false, siteUrl: "https://x.atlassian.net", lastSyncAt: null },
        error: { scope: "sync", code: "something_else" },
      })
      expect(screen.getByText(/error inesperado/i)).toBeInTheDocument()
    })
  })
})

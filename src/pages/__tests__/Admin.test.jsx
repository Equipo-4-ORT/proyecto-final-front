import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import Admin from "../Admin"
import { adminApi } from "../../services/api"

vi.mock("../../services/api", () => ({
  default: {},
  adminApi: {
    getUsers: vi.fn(),
    createUser: vi.fn(),
    toggleStatus: vi.fn(),
  },
}))

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({ user: { email: "admin@test.com" }, logout: vi.fn() }),
}))

const USERS = [
  {
    id: "1",
    fullName: "María García",
    email: "mgarcia@empresa.com",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "2",
    fullName: "Juan Pérez",
    email: "jperez@empresa.com",
    role: "EMPLOYEE",
    status: "INACTIVE",
    createdAt: "2026-02-20T10:00:00.000Z",
  },
]

describe("Admin", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the heading", () => {
    adminApi.getUsers.mockResolvedValue([])
    render(<Admin />)
    expect(
      screen.getByRole("heading", { name: /panel de administración/i, level: 1 })
    ).toBeInTheDocument()
  })

  it("shows the empty state when there are no users", async () => {
    adminApi.getUsers.mockResolvedValue([])
    render(<Admin />)
    expect(
      await screen.findByText(/no hay usuarios registrados/i)
    ).toBeInTheDocument()
  })

  it("renders the users returned by the API", async () => {
    adminApi.getUsers.mockResolvedValue(USERS)
    render(<Admin />)
    expect(await screen.findByText("María García")).toBeInTheDocument()
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument()
  })

  it("shows an error message when fetching users fails", async () => {
    adminApi.getUsers.mockRejectedValue(new Error("network"))
    render(<Admin />)
    expect(
      await screen.findByText(/no se pudieron cargar los usuarios/i)
    ).toBeInTheDocument()
  })

  it("validates required fields before creating a user", async () => {
    adminApi.getUsers.mockResolvedValue([])
    render(<Admin />)
    await screen.findByText(/no hay usuarios registrados/i)

    fireEvent.click(screen.getByRole("button", { name: /nuevo usuario/i }))
    fireEvent.click(screen.getByRole("button", { name: /^guardar$/i }))

    expect(
      screen.getByText(/nombre y email son requeridos/i)
    ).toBeInTheDocument()
    expect(adminApi.createUser).not.toHaveBeenCalled()
  })

  it("creates a user and adds it to the table", async () => {
    adminApi.getUsers.mockResolvedValue([])
    const created = {
      id: "9",
      fullName: "Nuevo Usuario",
      email: "nuevo@empresa.com",
      role: "EMPLOYEE",
      status: "ACTIVE",
      createdAt: "2026-05-21T10:00:00.000Z",
    }
    adminApi.createUser.mockResolvedValue(created)

    render(<Admin />)
    await screen.findByText(/no hay usuarios registrados/i)

    fireEvent.click(screen.getByRole("button", { name: /nuevo usuario/i }))
    fireEvent.change(screen.getByLabelText(/nombre completo/i), {
      target: { value: "Nuevo Usuario" },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "nuevo@empresa.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: /^guardar$/i }))

    expect(await screen.findByText("Nuevo Usuario")).toBeInTheDocument()
    // El rol lo determina el backend: el front solo envía nombre y email.
    expect(adminApi.createUser).toHaveBeenCalledWith({
      fullName: "Nuevo Usuario",
      email: "nuevo@empresa.com",
    })
  })

  it("toggles a user's status", async () => {
    adminApi.getUsers.mockResolvedValue(USERS)
    adminApi.toggleStatus.mockResolvedValue({ ...USERS[0], status: "INACTIVE" })

    render(<Admin />)
    await screen.findByText("María García")

    fireEvent.click(screen.getByRole("button", { name: /deshabilitar/i }))

    await waitFor(() => {
      expect(adminApi.toggleStatus).toHaveBeenCalledWith("1")
    })
  })

  it("shows an error when toggling status fails", async () => {
    adminApi.getUsers.mockResolvedValue(USERS)
    adminApi.toggleStatus.mockRejectedValue(new Error("network"))

    render(<Admin />)
    await screen.findByText("María García")

    fireEvent.click(screen.getByRole("button", { name: /deshabilitar/i }))

    expect(
      await screen.findByText(/no se pudo actualizar el estado/i)
    ).toBeInTheDocument()
  })
})

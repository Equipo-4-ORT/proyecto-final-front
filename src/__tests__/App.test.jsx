import { render, screen } from "@testing-library/react"
import App from "../App"
import {
  describe,
  test,
  expect,
  beforeEach,
  vi,
} from 'vitest'

// La sesión ahora se hidrata con GET /auth/me (cookies HttpOnly), no con un token
// en localStorage. Mockeamos el cliente api: get('/auth/me') decide si hay sesión.
const apiMock = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock("../services/api", () => ({ default: apiMock }))

vi.mock("../services/adminApi", () => ({
  adminApi: {
    getUsers: vi.fn(() => Promise.resolve([])),
    createUser: vi.fn(),
    toggleStatus: vi.fn(),
  },
}))

// El rol viaja en mayúscula (enum Role { EMPLOYEE ADMIN }); PrivateRoute compara
// contra "ADMIN".
const employeeSession = { data: { user: { id: "1", email: "dev@test.com", role: "EMPLOYEE" } } }
const adminSession = { data: { user: { id: "1", email: "admin@test.com", role: "ADMIN" } } }

function renderAt(route) {
  window.history.pushState({}, "Test page", route)
  return render(<App />)
}

describe("App routing", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Por defecto: sin sesión (la hidratación falla con 401).
    apiMock.get.mockRejectedValue({ response: { status: 401 } })
    apiMock.post.mockResolvedValue({ data: { ok: true } })
  })

  test("renders Login at /login", async () => {
    renderAt("/login")

    expect(
      await screen.findByRole("button", { name: /continuar con google/i }),
    ).toBeInTheDocument()
  })

  test("redirects protected routes to login when there is no session", async () => {
    renderAt("/dashboard")

    expect(
      await screen.findByRole("button", { name: /continuar con google/i }),
    ).toBeInTheDocument()
  })

  test("renders Dashboard when there is an active session", async () => {
    apiMock.get.mockResolvedValue(employeeSession)

    renderAt("/dashboard")

    expect(
      await screen.findByRole("heading", { name: /dashboard/i }),
    ).toBeInTheDocument()
  })

  test("redirects non-admin away from /admin", async () => {
    // EMPLOYEE en /admin → PrivateRoute requiredRole ADMIN no matchea → /dashboard
    apiMock.get.mockResolvedValue(employeeSession)

    renderAt("/admin")

    expect(
      await screen.findByRole("heading", { name: /dashboard/i }),
    ).toBeInTheDocument()
  })

  test("renders Admin when the session is ADMIN", async () => {
    apiMock.get.mockResolvedValue(adminSession)

    renderAt("/admin")

    expect(
      await screen.findByRole("heading", { name: /panel de administración/i, level: 1 }),
    ).toBeInTheDocument()
  })

  test("renders NotFound on unknown routes", async () => {
    renderAt("/unknown-route")

    expect(await screen.findByText(/404/i)).toBeInTheDocument()
  })
})

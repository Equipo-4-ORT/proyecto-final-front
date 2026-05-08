import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Login from "../Login"

describe("Login", () => {
  it("renders the Login heading", () => {
    render(<Login />)
    expect(
      screen.getByRole("heading", { name: /login/i, level: 1 })
    ).toBeInTheDocument()
  })
})

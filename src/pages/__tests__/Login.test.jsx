import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Login from "../Login"

describe("Login", () => {
  it("renders the Sign in with Google button", () => {
    render(<Login />)
    expect(
      screen.getByRole("button", { name: /sign in with google/i })
    ).toBeInTheDocument()
  })
})

import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import TextInput from "../TextInput"

describe("TextInput", () => {
  it("defaults to type='text'", () => {
    render(<TextInput placeholder="name" />)
    expect(screen.getByPlaceholderText("name")).toHaveAttribute("type", "text")
  })

  it("forwards type prop", () => {
    render(<TextInput type="time" placeholder="t" />)
    expect(screen.getByPlaceholderText("t")).toHaveAttribute("type", "time")
  })

  it("merges className with base classes", () => {
    render(<TextInput placeholder="x" className="custom-class" />)
    expect(screen.getByPlaceholderText("x").className).toContain("custom-class")
    expect(screen.getByPlaceholderText("x").className).toContain("rounded-xl")
  })

  it("calls onChange", () => {
    const onChange = vi.fn()
    render(<TextInput placeholder="x" onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText("x"), { target: { value: "hi" } })
    expect(onChange).toHaveBeenCalled()
  })

  it("supports disabled", () => {
    render(<TextInput placeholder="x" disabled />)
    expect(screen.getByPlaceholderText("x")).toBeDisabled()
  })
})

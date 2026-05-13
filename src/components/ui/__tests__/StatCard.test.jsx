import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { CheckCircle } from "lucide-react"
import StatCard from "../StatCard"

describe("StatCard", () => {
  it("renders title, value and subtitle", () => {
    render(
      <StatCard title="Total" value="42" subtitle="last week" icon={CheckCircle} />,
    )
    expect(screen.getByText("Total")).toBeInTheDocument()
    expect(screen.getByText("42")).toBeInTheDocument()
    expect(screen.getByText("last week")).toBeInTheDocument()
  })

  it("renders without an icon when none is provided", () => {
    const { container } = render(<StatCard title="x" value="0" subtitle="y" />)
    expect(container.querySelector("svg")).toBeNull()
  })

  it.each(["blue", "green", "orange", "purple", "red"])(
    "applies %s color variant",
    (color) => {
      render(<StatCard title="t" value="v" subtitle="s" icon={CheckCircle} color={color} />)
      expect(screen.getByText("t")).toBeInTheDocument()
    },
  )
})

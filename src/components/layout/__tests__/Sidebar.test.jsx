import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from '../Sidebar'

const sourceCounts = { calendar: 3, jira: 2, slides: 0, docs: 1, sheets: 4 }

describe('Sidebar', () => {
  it('renders the app heading', () => {
    render(<Sidebar sourceCounts={sourceCounts} onExportExcel={() => {}} />)
    expect(
      screen.getByRole('heading', { name: /autolog/i }),
    ).toBeInTheDocument()
  })

  it('renders one row per source with its count', () => {
    render(<Sidebar sourceCounts={sourceCounts} onExportExcel={() => {}} />)
    expect(screen.getByText('Calendar')).toBeInTheDocument()
    expect(screen.getByText('Jira')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('invokes onExportExcel when clicking the export button', () => {
    const onExportExcel = vi.fn()
    render(
      <Sidebar sourceCounts={sourceCounts} onExportExcel={onExportExcel} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
    expect(onExportExcel).toHaveBeenCalledTimes(1)
  })

  it("disables the 'Exportar' button when generatingFrom='sidebar'", () => {
    render(
      <Sidebar
        sourceCounts={sourceCounts}
        onExportExcel={() => {}}
        generatingFrom="sidebar"
      />,
    )
    const exportBtn = screen.getByRole('button', { name: /generando/i })
    expect(exportBtn).toBeDisabled()
  })

  it("enables the 'Exportar' button when generatingFrom is null", () => {
    render(
      <Sidebar
        sourceCounts={sourceCounts}
        onExportExcel={() => {}}
        generatingFrom={null}
      />,
    )
    const exportBtn = screen.getByRole('button', { name: /exportar/i })
    expect(exportBtn).not.toBeDisabled()
  })

  it("shows spinner when generatingFrom='sidebar'", () => {
    render(
      <Sidebar
        sourceCounts={sourceCounts}
        onExportExcel={() => {}}
        generatingFrom="sidebar"
      />,
    )
    expect(screen.getByText(/generando\.\.\./i)).toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it("shows 'Exportar' text when generatingFrom is null", () => {
    render(
      <Sidebar
        sourceCounts={sourceCounts}
        onExportExcel={() => {}}
        generatingFrom={null}
      />,
    )
    expect(
      screen.getByRole('button', { name: /exportar/i }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/generando\.\.\./i)).not.toBeInTheDocument()
  })
})

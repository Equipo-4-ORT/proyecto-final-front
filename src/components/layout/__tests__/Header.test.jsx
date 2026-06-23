import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from '../Header'
import { getTodayDate } from '../../../utils/dateHelpers'

const defaultProps = {
  selectedDate: getTodayDate(),
  onDateChange: () => {},
  onExportExcel: () => {},
}

const renderHeader = (overrides = {}) =>
  render(
    <MemoryRouter>
      <Header {...defaultProps} {...overrides} />
    </MemoryRouter>,
  )

describe('Header', () => {
  it('renders the dashboard heading and tagline', () => {
    renderHeader()
    expect(
      screen.getByRole('heading', { name: /^dashboard$/i, level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByText(/gestión diaria/i)).toBeInTheDocument()
  })

  it("formats the selected date in Spanish 'AR' format", () => {
    renderHeader({ selectedDate: '2026-05-13' })
    expect(screen.getByText(/13 de mayo, 2026/i)).toBeInTheDocument()
  })

  it('calls onDateChange when the hidden date input changes', () => {
    const onDateChange = vi.fn()
    renderHeader({ onDateChange })
    const dateInput = document.querySelector('input[type="date"]')
    fireEvent.change(dateInput, { target: { value: '2026-05-20' } })
    expect(onDateChange).toHaveBeenCalledWith('2026-05-20')
  })

  it("triggers onExportExcel when clicking 'Descargar Excel'", () => {
    const onExportExcel = vi.fn()
    renderHeader({ onExportExcel })
    fireEvent.click(screen.getByRole('button', { name: /descargar excel/i }))
    expect(onExportExcel).toHaveBeenCalledTimes(1)
  })

  it('opens the native date picker when supported', () => {
    const showPicker = vi.fn()
    const original = HTMLInputElement.prototype.showPicker
    HTMLInputElement.prototype.showPicker = showPicker
    try {
      renderHeader({ selectedDate: '2026-05-13' })
      const formattedDateBtn = screen
        .getByText(/13 de mayo, 2026/i)
        .closest('button')
      fireEvent.click(formattedDateBtn)
      expect(showPicker).toHaveBeenCalledTimes(1)
    } finally {
      HTMLInputElement.prototype.showPicker = original
    }
  })

  it("disables the 'Descargar Excel' button when generatingFrom='header'", () => {
    renderHeader({ generatingFrom: 'header' })
    const excelBtn = screen.getByRole('button', { name: /generando/i })
    expect(excelBtn).toBeDisabled()
  })

  it("enables the 'Descargar Excel' button when generatingFrom is null", () => {
    renderHeader({ generatingFrom: null })
    const excelBtn = screen.getByRole('button', { name: /descargar excel/i })
    expect(excelBtn).not.toBeDisabled()
  })

  it("shows spinner when generatingFrom='header'", () => {
    renderHeader({ generatingFrom: 'header' })
    expect(screen.getByText(/generando\.\.\./i)).toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it("shows 'Descargar Excel' text when generatingFrom is null", () => {
    renderHeader({ generatingFrom: null })
    expect(
      screen.getByRole('button', { name: /descargar excel/i }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/generando\.\.\./i)).not.toBeInTheDocument()
  })
})

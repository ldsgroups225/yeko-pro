import { fireEvent, screen } from '@testing-library/dom'
import { render } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfirmationDialog } from '../ConfirmationDialog'

describe('confirmationDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Test Title',
    description: 'Test description',
    confirmationText: 'test confirmation',
    onConfirm: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default props', () => {
    render(<ConfirmationDialog {...defaultProps} />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText(/Test description/)).toBeInTheDocument()
    expect(screen.getByText(/test confirmation/)).toBeInTheDocument()
    expect(screen.getByText('Confirmer')).toBeInTheDocument()
    expect(screen.getByText('Annuler')).toBeInTheDocument()
  })

  it('disables confirm button when input does not match confirmation text', () => {
    render(<ConfirmationDialog {...defaultProps} />)

    const confirmButton = screen.getByText('Confirmer')
    expect(confirmButton).toBeDisabled()
  })

  it('enables confirm button when input matches confirmation text', () => {
    render(<ConfirmationDialog {...defaultProps} />)

    const input = screen.getByPlaceholderText('Tapez le texte de confirmation...')
    fireEvent.change(input, { target: { value: 'test confirmation' } })

    const confirmButton = screen.getByText('Confirmer')
    expect(confirmButton).not.toBeDisabled()
  })

  it('calls onConfirm when confirm button is clicked with correct input', () => {
    render(<ConfirmationDialog {...defaultProps} />)

    const input = screen.getByPlaceholderText('Tapez le texte de confirmation...')
    fireEvent.change(input, { target: { value: 'test confirmation' } })

    const confirmButton = screen.getByText('Confirmer')
    fireEvent.click(confirmButton)

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onOpenChange when cancel button is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />)

    const cancelButton = screen.getByText('Annuler')
    fireEvent.click(cancelButton)

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows loading state when isLoading is true', () => {
    render(<ConfirmationDialog {...defaultProps} isLoading={true} loadingText="Loading..." />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeDisabled()
  })

  it('prevents dialog from closing when loading', () => {
    render(<ConfirmationDialog {...defaultProps} isLoading={true} />)

    const cancelButton = screen.getByText('Annuler')
    fireEvent.click(cancelButton)

    expect(defaultProps.onOpenChange).not.toHaveBeenCalled()
  })

  it('clears input when dialog is closed', async () => {
    const { rerender } = render(<ConfirmationDialog {...defaultProps} />)

    const input = screen.getByPlaceholderText('Tapez le texte de confirmation...')
    fireEvent.change(input, { target: { value: 'test confirmation' } })

    expect(input).toHaveValue('test confirmation')

    // Close dialog
    rerender(<ConfirmationDialog {...defaultProps} open={false} />)

    // Reopen dialog
    rerender(<ConfirmationDialog {...defaultProps} open={true} />)

    const newInput = screen.getByPlaceholderText('Tapez le texte de confirmation...')
    expect(newInput).toHaveValue('')
  })

  it('applies destructive variant styling', () => {
    render(<ConfirmationDialog {...defaultProps} variant="destructive" />)

    const title = screen.getByText('Test Title')
    expect(title).toHaveClass('text-destructive')
  })

  it('uses custom button texts', () => {
    render(
      <ConfirmationDialog
        {...defaultProps}
        confirmText="Delete"
        cancelText="Cancel"
      />,
    )

    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })
})

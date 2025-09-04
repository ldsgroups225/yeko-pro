import { fireEvent, screen, waitFor } from '@testing-library/dom'
import { render } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GoogleSignInButton, SocialAuthDivider } from '../GoogleSignInButton'
import '@testing-library/jest-dom'

// Mock the hook
const mockGoogleSignIn = vi.fn()
const mockGoogleSignUp = vi.fn()
const mockClearError = vi.fn()

vi.mock('@/hooks/useGoogleAuth', () => ({
  useGoogleAuthSimple: vi.fn(() => ({
    googleSignIn: mockGoogleSignIn,
    googleSignUp: mockGoogleSignUp,
    isLoading: false,
    error: null,
    clearError: mockClearError,
  })),
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('googleSignInButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('basic Rendering', () => {
    it('should render sign-in button with correct text', () => {
      render(<GoogleSignInButton mode="signin" />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Continuer avec Google')
    })

    it('should render sign-up button with correct text', () => {
      render(<GoogleSignInButton mode="signup" />)

      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('S\'inscrire avec Google')
    })

    it('should render custom text when provided', () => {
      const customText = 'Mon texte personnalisé'
      render(<GoogleSignInButton customText={customText} />)

      const button = screen.getByRole('button')
      expect(button).toHaveTextContent(customText)
    })

    it('should render Google icon', () => {
      render(<GoogleSignInButton />)

      // Check for SVG element (Google icon)
      const svgElement = screen.getByRole('button').querySelector('svg')
      expect(svgElement).toBeInTheDocument()
    })
  })

  describe('button Interactions', () => {
    it('should call googleSignIn when clicked in signin mode', async () => {
      mockGoogleSignIn.mockResolvedValue(true)

      render(<GoogleSignInButton mode="signin" />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockGoogleSignIn).toHaveBeenCalledTimes(1)
      })
    })

    it('should call googleSignUp when clicked in signup mode', async () => {
      mockGoogleSignUp.mockResolvedValue(true)

      render(<GoogleSignInButton mode="signup" />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockGoogleSignUp).toHaveBeenCalledTimes(1)
      })
    })

    it('should be disabled when disabled prop is true', () => {
      render(<GoogleSignInButton disabled />)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })
})

describe('socialAuthDivider', () => {
  it('should render with default text', () => {
    render(<SocialAuthDivider />)

    expect(screen.getByText('OU')).toBeInTheDocument()
  })

  it('should render with custom text', () => {
    const customText = 'AUTRE OPTION'
    render(<SocialAuthDivider text={customText} />)

    expect(screen.getByText(customText)).toBeInTheDocument()
  })
})

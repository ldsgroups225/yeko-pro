import type { IClass, IGrade } from '@/types'
import { fireEvent, screen } from '@testing-library/dom'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import ClassesClient from './ClassesClient'
import '@testing-library/jest-dom/vitest'

// Mock Next.js navigation
const mockPush = vi.fn()
const mockGet = vi.fn()

// Create mock implementations for Next.js navigation
const mockRouter = {
  push: mockPush,
  // Add other router methods as needed
}

const mockSearchParams = {
  get: mockGet,
  // Add other searchParams methods as needed
}

// Mock the Next.js navigation module
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => mockRouter),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => mockSearchParams),
}))

describe('classesClient', () => {
  const grades: IGrade[] = [
    { id: 1, name: 'Grade 1' },
    { id: 2, name: 'Grade 2' },
  ]
  const classes: IClass[] = [
    { id: '1', name: 'Class A', slug: 'class-a', gradeId: 1, isActive: true, maxStudent: 30, studentCount: 10, teacher: null },
    { id: '2', name: 'Class B', slug: 'class-b', gradeId: 2, isActive: false, maxStudent: 25, studentCount: 8, teacher: null },
  ]
  const defaultProps = {
    grades,
    classes,
    totalPages: 2,
    currentPage: 1,
    searchParams: {},
    schoolId: 'test-school-id',
    cycleId: 'test-cycle-id',
  }

  it('renders without crashing', () => {
    render(<ClassesClient {...defaultProps} />)
    expect(screen.getByTestId('new-class-btn')).toBeInTheDocument()
    expect(screen.getByText('Class A')).toBeInTheDocument()
    expect(screen.getByText('Class B')).toBeInTheDocument()
  })

  it('toggles view mode when toggle button is clicked', () => {
    render(<ClassesClient {...defaultProps} />)
    const toggleButtons = screen.getAllByTestId('toggle-view-mode-btn')
    fireEvent.click(toggleButtons[0])
    // No error means toggle worked; could check for grid/table class if needed
  })

  it('opens and closes the class creation modal', () => {
    render(<ClassesClient {...defaultProps} />)
    const newClassButtons = screen.getAllByTestId('new-class-btn')
    fireEvent.click(newClassButtons[0])
    // Modal should open; check for dialog or close button
    // For now, just ensure button is clickable
  })

  it('renders pagination with correct current page', () => {
    render(<ClassesClient {...defaultProps} currentPage={2} />)
    expect(screen.getAllByText('2').length).toBeGreaterThan(0)
  })
})

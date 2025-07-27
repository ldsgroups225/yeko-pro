/* eslint-disable react-hooks-extra/no-unnecessary-use-prefix */

// Testing libraries
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Internal dependencies
import { useStudentStore } from '@/store'

// Component to test
import { EditStudentForm } from '../EditStudentForm'

// Mock date-fns to avoid timezone issues in tests
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    format: vi.fn().mockImplementation((date, formatStr) => {
      if (!date)
        return ''
      if (formatStr === 'dd/MM/yyyy') {
        const d = new Date(date)
        const day = d.getDate().toString().padStart(2, '0')
        const month = (d.getMonth() + 1).toString().padStart(2, '0')
        const year = d.getFullYear()
        return `${day}/${month}/${year}`
      }
      return new Date(date).toLocaleDateString('fr-FR')
    }),
    parseISO: vi.fn().mockImplementation(date => new Date(date)),
  }
})

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: vi.fn(),
}))

// Mock ImageUpload component to avoid React import issues
vi.mock('@/components/ImageUpload', () => ({
  ImageUpload: ({ value, onChange }: { value?: string | null, onChange: (url: string | null) => void }) => (
    <div data-testid="image-upload">
      <input
        type="file"
        onChange={e => onChange(e.target.value)}
        value={value || ''}
      />
    </div>
  ),
}))

// Mock the getStudentByIdNumberForEdit function
vi.mock('@/services/studentService', () => ({
  getStudentByIdNumberForEdit: vi.fn(),
}))

// Mock the store
vi.mock('@/store', () => ({
  useStudentStore: vi.fn(),
}))

// Test setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

// Simple wrapper for components that need query client
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Use the real component for testing
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

describe('editStudentForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()
  const mockGetStudentByIdNumberForEdit = vi.fn()

  const mockStudent = {
    id: '1',
    idNumber: 'STU123',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'M' as const,
    dateOfBirth: new Date('2008-01-01'), // Make student older to satisfy minimum age requirement
    avatarUrl: null,
    address: '123 Test St',
    classId: 'class-1',
    gradeName: 'Grade 1',
    classes: [
      { id: 'class-1', name: 'Grade 1' },
      { id: 'class-2', name: 'Grade 2' },
    ],
    secondParent: null,
  }

  const mockStudentWithSecondParent = {
    ...mockStudent,
    secondParent: {
      fullName: 'Jane Smith',
      gender: 'F' as const,
      phone: '1234567890',
      type: 'mother' as const,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()

    // Mock the store to return the mocked function
    vi.mocked(useStudentStore).mockReturnValue({
      getStudentByIdNumberForEdit: mockGetStudentByIdNumberForEdit,
      updateStudent: vi.fn().mockResolvedValue({}),
    } as any)

    // Set up default mock return value
    mockGetStudentByIdNumberForEdit.mockResolvedValue(mockStudent)
  })

  it('renders skeleton when student data is loading', async () => {
    // Mock the store function to simulate loading state
    mockGetStudentByIdNumberForEdit.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(
      <TestWrapper>
        <EditStudentForm
          studentIdNumber="STU123"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      </TestWrapper>,
    )

    // Should show skeleton loading state - check for skeleton elements by class
    const skeletonElements = document.querySelectorAll('.bg-muted.rounded')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('loads and displays student data', async () => {
    render(
      <TestWrapper>
        <EditStudentForm
          studentIdNumber="STU123"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      </TestWrapper>,
    )

    // Wait for the form to be populated with student data
    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    }, { timeout: 3000 })

    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('123 Test St')).toBeInTheDocument()
  })

  it('toggles second parent section', async () => {
    render(
      <TestWrapper>
        <EditStudentForm
          studentIdNumber="STU123"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      </TestWrapper>,
    )

    // Wait for student data to load
    await waitFor(() => {
      expect(screen.getByText('Deuxième parent (optionnel)')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Click the toggle button
    const toggleButton = screen.getByRole('button', { name: /afficher/i })

    await act(async () => {
      fireEvent.click(toggleButton)
    })

    // Check if second parent fields are visible
    await waitFor(() => {
      expect(screen.getByLabelText('Nom complet')).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Téléphone')).toBeInTheDocument()
  })

  it('pre-fills second parent data when available', async () => {
    mockGetStudentByIdNumberForEdit.mockResolvedValueOnce(mockStudentWithSecondParent)

    render(
      <TestWrapper>
        <EditStudentForm
          studentIdNumber="STU123"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      </TestWrapper>,
    )

    // Wait for student data to load
    await waitFor(() => {
      expect(screen.getByText('Deuxième parent (optionnel)')).toBeInTheDocument()
    }, { timeout: 3000 })

    const toggleButton = screen.getByRole('button', { name: /afficher/i })

    await act(async () => {
      fireEvent.click(toggleButton)
    })

    // Check if second parent data is pre-filled
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument()
    })
    expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument()
  })

  it('allows filling second parent data correctly', async () => {
    render(
      <TestWrapper>
        <EditStudentForm
          studentIdNumber="STU123"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      </TestWrapper>,
    )

    // Wait for student data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Expand second parent section
    const toggleButton = screen.getByRole('button', { name: /afficher/i })

    await act(async () => {
      fireEvent.click(toggleButton)
    })

    // Wait for second parent fields to appear
    await waitFor(() => {
      expect(screen.getByLabelText('Nom complet')).toBeInTheDocument()
    })

    // Fill in second parent fields
    fireEvent.change(screen.getByLabelText('Nom complet'), { target: { value: 'Jane Smith' } })
    fireEvent.change(screen.getByLabelText('Téléphone'), { target: { value: '1234567890' } })

    // Click on the female radio button for second parent (there are multiple "Féminin" labels)
    const femaleRadios = screen.getAllByLabelText('Féminin')
    // The second one should be for the second parent section
    fireEvent.click(femaleRadios[1])

    // Select parent type - find the select trigger and click it (there are multiple comboboxes)
    const selectTriggers = screen.getAllByRole('combobox')
    // The second one should be for the parent type selection
    fireEvent.mouseDown(selectTriggers[1])

    // Wait for options to appear and click "Mère"
    await waitFor(() => {
      expect(screen.getByText('Mère')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Mère'))

    // Verify that all second parent fields are filled correctly
    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument()

    // Verify that the female radio button is selected for second parent
    const secondParentFemaleRadio = femaleRadios[1]
    expect(secondParentFemaleRadio).toHaveAttribute('data-state', 'checked')

    // Verify that "Mère" is selected in the dropdown
    expect(screen.getByText('Mère')).toBeInTheDocument()
  })
})

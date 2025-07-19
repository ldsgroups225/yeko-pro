// Add global test setup here
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.scrollTo
globalThis.scrollTo = vi.fn()

// Automatically cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

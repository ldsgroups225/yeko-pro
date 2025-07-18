// Add global test setup here
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Automatically cleanup after each test
// This removes the mock calls and other test state between tests
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

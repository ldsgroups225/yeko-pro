// app/payments/__tests__/secondParentValidation.test.ts

import { describe, expect, it } from 'vitest'
import { studentCreationSchema } from '../schemas'

// Helper function to create test data with defaults
function createTestData(overrides: Record<string, unknown> = {}) {
  return {
    firstName: 'John',
    lastName: 'Doe',
    gender: 'M' as const,
    birthDate: new Date('2010-01-01'),
    address: '123 Test St',
    medicalCondition: [],
    parentId: 'parent-123',
    ...overrides,
  }
}

describe('second parent validation', () => {
  it('should accept valid second parent data', async () => {
    const data = createTestData({
      secondParent: {
        fullName: 'Jane Smith',
        gender: 'F' as const,
        phone: '0123456789',
        type: 'mother' as const,
      },
    })

    const result = await studentCreationSchema.safeParseAsync(data)
    expect(result.success).toBe(true)
  })

  it('should accept when second parent is not provided', async () => {
    const data = createTestData({
      secondParent: undefined,
    })

    const result = await studentCreationSchema.safeParseAsync(data)
    expect(result.success).toBe(true)
  })

  it('should reject when second parent is missing required fields', async () => {
    const data = createTestData({
      secondParent: {
        // Missing required fields
      } as any,
    })

    const result = await studentCreationSchema.safeParseAsync(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      // Check for the presence of validation errors for required fields
      const errorPaths = result.error.errors.map(e => e.path)
      expect(errorPaths).toContainEqual(['secondParent', 'fullName'])
      expect(errorPaths).toContainEqual(['secondParent', 'phone'])
      expect(errorPaths).toContainEqual(['secondParent', 'gender'])
      expect(errorPaths).toContainEqual(['secondParent', 'type'])
    }
  })

  it('should reject invalid parent type', async () => {
    const data = createTestData({
      secondParent: {
        fullName: 'Invalid Parent',
        gender: 'M' as const,
        phone: '0123456789',
        type: 'invalid-type' as any, // Invalid type
      },
    })

    const result = await studentCreationSchema.safeParseAsync(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      // Check for invalid enum value error
      expect(result.error.errors).toContainEqual(
        expect.objectContaining({
          code: 'invalid_enum_value',
          path: ['secondParent', 'type'],
        }),
      )
    }
  })

  it('should reject invalid gender', async () => {
    const data = createTestData({
      secondParent: {
        fullName: 'Test Parent',
        gender: 'X' as any, // Invalid gender
        phone: '0123456789',
        type: 'father' as const,
      },
    })

    const result = await studentCreationSchema.safeParseAsync(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors).toContainEqual(
        expect.objectContaining({
          path: ['secondParent', 'gender'],
        }),
      )
    }
  })
})

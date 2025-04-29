import type { MedicalCondition } from '@/types'

export function parseMedicalCondition(value: any): MedicalCondition[] {
  // If it's already an array of objects, return it
  if (Array.isArray(value)) {
    return value as MedicalCondition[]
  }

  // If it's a string, try to parse it
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed as MedicalCondition[]
      }
    }
    catch (error) {
      // If parsing fails, return an empty array
      console.error('Failed to parse medical_condition:', error)
    }
  }

  // For any other case or if parsing fails, return an empty array
  return []
}

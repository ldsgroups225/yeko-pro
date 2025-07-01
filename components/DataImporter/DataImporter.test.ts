import { describe, expect, it } from 'vitest'
import { z } from 'zod'
// Import the helper directly from the module
import { getSchemaShape } from './getSchemaShape'

// Re-export getSchemaShape for testing if not exported
// (If not exported, add: export { getSchemaShape } at the bottom of DataImporter.tsx)

describe('getSchemaShape', () => {
  it('extracts shape from plain ZodObject', () => {
    const schema = z.object({ foo: z.string(), bar: z.number() })
    const shape = getSchemaShape(schema)
    expect(shape).toBeTruthy()
    expect(Object.keys(shape!)).toEqual(['foo', 'bar'])
  })

  it('extracts shape from ZodObject wrapped in ZodEffects', () => {
    const base = z.object({ foo: z.string(), bar: z.number() })
    const schema = base.superRefine(() => {})
    const shape = getSchemaShape(schema)
    expect(shape).toBeTruthy()
    expect(Object.keys(shape!)).toEqual(['foo', 'bar'])
  })

  it('extracts shape from ZodObject wrapped in ZodOptional', () => {
    const base = z.object({ foo: z.string(), bar: z.number() })
    const schema = base.optional()
    const shape = getSchemaShape(schema)
    expect(shape).toBeTruthy()
    expect(Object.keys(shape!)).toEqual(['foo', 'bar'])
  })

  it('extracts shape from ZodObject wrapped in ZodNullable', () => {
    const base = z.object({ foo: z.string(), bar: z.number() })
    const schema = base.nullable()
    const shape = getSchemaShape(schema)
    expect(shape).toBeTruthy()
    expect(Object.keys(shape!)).toEqual(['foo', 'bar'])
  })

  it('returns null for non-object schemas', () => {
    const schema = z.string()
    const shape = getSchemaShape(schema)
    expect(shape).toBeNull()
  })
})

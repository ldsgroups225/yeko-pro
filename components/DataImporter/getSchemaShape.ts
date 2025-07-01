import type { ZodTypeAny } from 'zod'
import { ZodObject } from 'zod'

// Helper to extract the shape from a Zod schema, even if wrapped
export function getSchemaShape(schema: ZodTypeAny): Record<string, ZodTypeAny> | null {
  if (schema instanceof ZodObject) {
    return schema.shape
  }
  // Unwrap ZodEffects, ZodOptional, ZodNullable
  if ('innerType' in schema && typeof schema.innerType === 'function') {
    return getSchemaShape(schema.innerType())
  }
  if ('schema' in schema && typeof schema.schema === 'object' && schema.schema && 'safeParse' in schema.schema) {
    return getSchemaShape(schema.schema as ZodTypeAny)
  }
  if ('unwrap' in schema && typeof (schema as any).unwrap === 'function') {
    return getSchemaShape((schema as any).unwrap())
  }
  return null
}

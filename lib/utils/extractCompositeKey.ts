type CompositeKey = Record<string, string | number | null>

export function extractCompositeKey(
  errorMessage: string,
  keyFields: string[],
): CompositeKey | null {
  const keysPattern = keyFields.join(', ')
  const regex = new RegExp(
    `Key \\(${keysPattern}\\)=\\(([^)]+)\\)`,
    'i',
  )

  const match = errorMessage.match(regex)
  if (!match)
    return null

  const rawValues = match[1]
    .split(',')
    .map(v => v.trim())

  if (rawValues.length !== keyFields.length)
    return null

  const result: CompositeKey = {}

  for (let i = 0; i < keyFields.length; i++) {
    const value = rawValues[i]
    // Convert to number if it's numeric, else keep string/null
    const parsed
      = value === 'null'
        ? null
        : /^\d+$/.test(value)
          ? Number.parseInt(value, 10)
          : value
    result[keyFields[i]] = parsed
  }

  return result
}

/**
 * Converts a string to camelCase.
 *
 * @param input - The input string to convert.
 * @returns The camelCase version of the input string.
 */
function toCamelCase(input: string): string {
  return input.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Converts a string to snake_case.
 *
 * @param input - The input string to convert.
 * @returns The snake_case version of the input string.
 */
function toSnakeCase(input: string): string {
  return input.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * Recursively converts all keys of an object to camelCase.
 *
 * @param obj - The object whose keys should be converted.
 * @returns A new object with all keys converted to camelCase.
 */
export function convertKeysToCamelCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamelCase(item)) as any
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelCaseKey = toCamelCase(key)
    acc[camelCaseKey] = convertKeysToCamelCase(obj[key])
    return acc
  }, {} as Record<string, any>)
}

/**
 * Recursively converts all keys of an object to snake_case.
 *
 * @param obj - The object whose keys should be converted.
 * @returns A new object with all keys converted to snake_case.
 */
export function convertKeysToSnakeCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToSnakeCase(item)) as any
  }

  return Object.keys(obj).reduce((acc, key) => {
    const snakeCaseKey = toSnakeCase(key)
    acc[snakeCaseKey] = convertKeysToSnakeCase(obj[key])
    return acc
  }, {} as Record<string, any>)
}

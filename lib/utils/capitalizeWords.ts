export function capitalize(value: string | null | undefined): string | undefined {
  // Handle null or undefined input
  if (value == null)
    return undefined

  // Trim and check for empty string
  const trimmedName = value.trim()
  if (trimmedName === '')
    return undefined

  // Split words, capitalize first letter of each, and join back
  return trimmedName
    .split(' ')
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(' ')
}

export function areEqual(a: any, b: any): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return JSON.stringify(a) === JSON.stringify(b)
  }
  return a === b
}

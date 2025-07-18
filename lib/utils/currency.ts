/**
 * Format a number as a Central African CFA franc (XOF)
 *
 * @param amount      The numeric value to format
 * @param withSymbol  Whether to include the currency symbol (e.g. "F CFA") or not
 * @returns           A locale-formatted string, e.g. "Fr 1 000" or "1 000"
 */
export function formatCurrency(amount: number, withSymbol = true): string {
  const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  if (withSymbol) {
    return `${formatted}F CFA`
  }

  return formatted
}

/**
 * Format a number as a Central African CFA franc (XOF)
 *
 * @param amount      The numeric value to format
 * @param withSymbol  Whether to include the currency symbol (e.g. "F CFA") or not
 * @returns           A locale-formatted string, e.g. "Fr 1 000" or "1 000"
 */
export function formatCurrency(amount: number, withSymbol = true): string {
  // Module-level formatters (cached for performance)
  //   - Currency formatter: fr-FR locale, XOF, no decimals
  //   - Number formatter: fr-FR locale, no decimals
  const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  const numberFormatter = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  // Select the appropriate formatter
  return (withSymbol ? currencyFormatter : numberFormatter).format(amount)
}

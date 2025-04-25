/**
 * Remove all diacritical marks (accents) from the given string.
 *
 * <p>This function first decomposes accented characters into their base
 * characters plus combining diacritical marks using Unicode Normalization Form
 * D (NFD), then strips out those combining marks via a regular expression.</p>
 *
 * @param {string} str - The input string which may contain accented characters.
 * @returns {string} A new string with all accents/diacritics removed.
 *
 * @example
 * ```ts
 * removeAccents('café');      // returns 'cafe'
 * removeAccents('Ångström');  // returns 'Angstrom'
 * removeAccents('São Paulo'); // returns 'Sao Paulo'
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize|String.prototype.normalize on MDN}
 */
export function removeAccents(str: string): string {
  return str
    .normalize('NFD') // decompose combined letters into base + diacritics
    .replace(/[\u0300-\u036F]/g, '') // strip all combining diacritical marks
}

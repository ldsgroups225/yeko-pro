/**
 * Formats a French rank string with the appropriate gendered suffix.
 *
 * Handles cases like:
 * - "1"  => "1er" or "1ère"
 * - "2"  => "2ème"
 * - "1x" => "1er ex" or "1ère ex" (for tied ranks)
 *
 * @param rank - An object containing the rank string and gender
 * @param rank.rank - A string representing the rank (e.g., "1", "2x", "3", etc.)
 * @param rank.gender - Gender of the subject ('M' for masculine, 'F' for feminine)
 * @returns A formatted rank string with the correct suffix, or '-' if invalid
 */
export function formatRank({
  rank,
  gender,
}: {
  rank?: string
  gender?: 'M' | 'F'
}): string {
  if (!rank || !gender)
    return '-'

  const isTie = rank.endsWith('x')
  const baseRank = isTie ? rank.slice(0, -1) : rank

  const rankNumber = Number(baseRank)
  if (Number.isNaN(rankNumber) || rankNumber <= 0)
    return '-'

  let suffix: string
  if (rankNumber === 1) {
    suffix = gender === 'F' ? 'ère' : 'er'
  }
  else {
    suffix = 'ème'
  }

  return isTie ? `${rankNumber}${suffix} ex` : `${rankNumber}${suffix}`
}

export type Rank = string | ''

/**
 * Parses a rank string like "1", "2x", "3", "3x" into a number and tie flag.
 * @returns Parsed rank or null if invalid
 */
export function parseRank(rank: Rank): { value: number, isTie: boolean } | null {
  if (!rank)
    return null
  const match = rank.match(/^(\d+)(x)?$/)
  if (!match)
    return null
  const value = Number.parseInt(match[1], 10)
  if (Number.isNaN(value))
    return null
  return { value, isTie: !!match[2] }
}

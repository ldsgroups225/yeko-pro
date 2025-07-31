/**
 * Enum representing all the different note/assignment types.
 */
export enum NOTE_TYPE {
  /** A written quiz or short test taken in class */
  WRITING_QUESTION = 'WRITING_QUESTION',
  /** A formal in-class test */
  CLASS_TEST = 'CLASS_TEST',
  /** A level/proficiency test */
  LEVEL_TEST = 'LEVEL_TEST',
  /** Homework assigned for outside class work */
  HOMEWORK = 'HOMEWORK',
  /** Classroom participation or oral contribution */
  PARTICIPATION = 'PARTICIPATION',
}

/**
 * Array of UI options for selecting a note type, with French labels.
 */
export const NOTE_OPTIONS: Array<{ label: string, value: NOTE_TYPE }> = [
  { label: 'Interrogation écrite', value: NOTE_TYPE.WRITING_QUESTION },
  { label: 'Devoir de classe', value: NOTE_TYPE.CLASS_TEST },
  { label: 'Devoir de niveau', value: NOTE_TYPE.LEVEL_TEST },
  { label: 'Exercice de maison', value: NOTE_TYPE.HOMEWORK },
  { label: 'Participation', value: NOTE_TYPE.PARTICIPATION },
]

/**
 * Record for quick lookup of the French label by NOTE_TYPE.
 */
export const NOTE_LABELS: Record<NOTE_TYPE, string> = {
  [NOTE_TYPE.WRITING_QUESTION]: 'Interrogation écrite',
  [NOTE_TYPE.CLASS_TEST]: 'Devoir de classe',
  [NOTE_TYPE.LEVEL_TEST]: 'Devoir de niveau',
  [NOTE_TYPE.HOMEWORK]: 'Exercice de maison',
  [NOTE_TYPE.PARTICIPATION]: 'Participation',
}

/**
 * Map raw string values from the database into the NOTE_TYPE enum.
 */
export const FROM_STRING_OPTIONS_MAP: Record<string, NOTE_TYPE> = {
  WRITING_QUESTION: NOTE_TYPE.WRITING_QUESTION,
  CLASS_TEST: NOTE_TYPE.CLASS_TEST,
  LEVEL_TEST: NOTE_TYPE.LEVEL_TEST,
  HOMEWORK: NOTE_TYPE.HOMEWORK,
  PARTICIPATION: NOTE_TYPE.PARTICIPATION,
}

/**
 * Convert a raw string (e.g. from the database) into a NOTE_TYPE enum.
 *
 * @param key - The raw string key, e.g. "HOMEWORK".
 * @returns The corresponding NOTE_TYPE.
 * @throws {Error} If the key does not match any NOTE_TYPE.
 */
export function fromString(key: string): NOTE_TYPE {
  const noteType = FROM_STRING_OPTIONS_MAP[key]
  if (!noteType) {
    throw new Error(`Invalid note type key: "${key}"`)
  }
  return noteType
}

/**
 * Get the French label for a note type.
 *
 * Can accept either a NOTE_TYPE enum value or a raw string key.
 * If given a raw string, it will first be converted via fromString().
 *
 * @param noteTypeOrKey - Either a NOTE_TYPE or its raw string equivalent.
 * @returns The human-readable French label.
 * @example
 *   getNoteLabel(NOTE_TYPE.HOMEWORK)       // => "Exercice de maison"
 *   getNoteLabel('PARTICIPATION')           // => "Participation"
 * @throws {Error} If an invalid raw string is provided.
 */
export function getNoteLabel(
  noteTypeOrKey: NOTE_TYPE | string,
): string {
  const noteType
    = typeof noteTypeOrKey === 'string'
      ? fromString(noteTypeOrKey)
      : noteTypeOrKey

  return NOTE_LABELS[noteType]
}

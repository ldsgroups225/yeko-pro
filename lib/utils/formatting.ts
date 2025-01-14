/**
 * Default placeholder text for when no valid name or email is provided.
 */
const DEFAULT_PLACEHOLDER = 'Non renseigné'

/**
 * Formats a person's full name with robust handling of edge cases and input validation.
 *
 * @param {string | null} firstName - The first name of the person
 * @param {string | null} lastName - The last name of the person
 * @param {string | null} [email] - Optional email address used as fallback
 * @returns {string} Formatted full name, email username, or default placeholder
 * @throws {Error} If invalid input types are provided
 *
 * @example
 * formatFullName('John', 'Doe', 'john.doe@example.com') // Returns: "John Doe"
 * formatFullName(null, null, 'john.doe@example.com') // Returns: "John.doe"
 * formatFullName('', '', '') // Returns: "Non renseigné"
 */
export function formatFullName(
  firstName: string | null,
  lastName: string | null,
  email?: string | null,
): string {
  // Input validation
  if (
    (firstName !== null && typeof firstName !== 'string')
    || (lastName !== null && typeof lastName !== 'string')
    || (email !== undefined && email !== null && typeof email !== 'string')
  ) {
    throw new Error('Invalid input types. Expected string or null values.')
  }

  // Sanitize inputs
  const sanitizedFirstName = sanitizeString(firstName)
  const sanitizedLastName = sanitizeString(lastName)
  const sanitizedEmail = sanitizeString(email)

  // Handle case when both names are empty/null
  if (!sanitizedFirstName && !sanitizedLastName) {
    if (sanitizedEmail) {
      const username = extractUsername(sanitizedEmail)
      // Remove numeric characters from username
      const alphaUsername = username.replace(/\d/g, '')
      return alphaUsername ? capitalizeFirstLetter(alphaUsername) : DEFAULT_PLACEHOLDER
    }
    return DEFAULT_PLACEHOLDER
  }

  // Combine available name parts
  return [sanitizedFirstName, sanitizedLastName]
    .filter(Boolean)
    .map(capitalizeFirstLetter)
    .join(' ')
}

/**
 * Sanitizes a string by trimming whitespace and handling null/undefined values.
 *
 * @param {string | null | undefined} str - Input string to sanitize
 * @returns {string} Sanitized string or empty string
 */
function sanitizeString(str: string | null | undefined): string {
  return str?.trim() || ''
}

/**
 * Extracts username from email address.
 *
 * @param {string} email - Email address
 * @returns {string} Username portion of email or empty string
 */
function extractUsername(email: string): string {
  const match = email.match(/^([^@]+)@/)
  return match ? match[1] : ''
}

/**
 * Formats a phone number into the standard (XXX) XXX-XXXX format.
 *
 * @param {string} phoneNumber - The phone number to format.
 * @returns {string} The formatted phone number. If the input cannot be formatted, returns the original phone number.
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = (`${phoneNumber}`).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{4})$/)
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`
  }
  return phoneNumber
}

/**
 * Capitalize the first letter of a string.
 * @param {string} text - The text to capitalize.
 * @returns {string} The capitalized text.
 */
export function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Generates an avatar initial based on the full name.
 *
 * @param {string} fullName - The full name of the person.
 * @returns {string} The avatar initial, which is the uppercase first letter of the first name or 'U' if no letter is found.
 *
 * @example
 * getAvatarFromFullName('Jane Doe');    // Returns 'J'
 * getAvatarFromFullName('John');        // Returns 'U'
 * getAvatarFromFullName('  Jane  Doe  '); // Returns 'J'
 * getAvatarFromFullName('Dr. John Smith'); // Returns 'J'
 */
export function getAvatarFromFullName(fullName: string): string {
  // Trim the input and split into parts
  const nameParts = fullName.trim().split(/\s+/)
  if (nameParts.length === 0) {
    return 'U'
  }
  // Take the first part (considered as the first name)
  const firstName = nameParts[0]
  // Find the first alphabetic character
  const firstLetter = firstName.match(/[A-Z]/i)?.[0].toUpperCase()
  return firstLetter || 'U'
}

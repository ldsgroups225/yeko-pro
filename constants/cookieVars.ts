/**
 * Enum for cookie names to maintain consistency and enhance security.
 * Centralizing cookie names helps prevent typos and eases maintenance.
 */
export enum CookieNames {
  GRADES = 'grades',
  SCHOOL_YEARS = 'schoolYears',
  SUBJECTS = 'subjects',
  USER = 'user',
}

/**
 * Interface for cookie options.
 * These options map to common cookie attributes and can be used to secure and control cookie behavior.
 */
export interface CookieOptions {
  /** Maximum age in seconds before the cookie expires */
  maxAge?: number
  /** A specific expiration date for the cookie */
  expires?: Date
  /** The path where the cookie is accessible; defaults to '/' */
  path?: string
  /** Domain that the cookie is valid for */
  domain?: string
  /** Marks the cookie to be used only over HTTPS */
  secure?: boolean
  /** Makes the cookie inaccessible to JavaScript (helps mitigate XSS) */
  httpOnly?: boolean
  /** Controls cookie sending on cross-site requests */
  sameSite?: 'lax' | 'strict' | 'none'
  /** Optional priority hint for the cookie */
  priority?: 'low' | 'medium' | 'high'
  /** Custom encoder function for the cookie value */
  encode?: (value: string) => string
  /** Experimental flag to indicate partitioned cookies */
  partitioned?: boolean
}

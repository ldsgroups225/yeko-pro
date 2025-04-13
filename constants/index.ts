export * from './cookieVars'
export * from './noteTypes'
export * from './paymentMethod'
// Date formats
export const DATE_FORMAT_SHORT = 'P'
export const TIME_FORMAT_24H = 'HH:mm'

export const MIN_STUDENT_AGE = 11
export const MAX_STUDENT_AGE = 23

export const STORAGE_PATH = 'storage/'
export * from './route'

const today = new Date()
// Calculate the latest possible birth date (must be at least MIN_AGE years ago)
export const maxBirthDate = new Date(today.getFullYear() - MIN_STUDENT_AGE, today.getMonth(), today.getDate())
// Calculate the earliest possible birth date (cannot be more than MAX_AGE years ago)
export const minBirthDate = new Date(today.getFullYear() - MAX_STUDENT_AGE, today.getMonth(), today.getDate())

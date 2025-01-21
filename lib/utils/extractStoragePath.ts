'use client'

import { STORAGE_PATH } from '@/constants'
import { getEnvOrThrowClientSide } from './EnvClient'

/**
 * Extracts the relative storage path from a full URL by removing the domain
 * and isolating the path segment following the predefined storage path.
 *
 * @param {string} url - The full URL containing the storage path
 * @returns {string} Relative path after the storage directory
 * @example
 * // Returns 'user/uploads/image.jpg' if STORAGE_PATH is 'storage/'
 * extractStoragePath('https://cdn.example.com/storage/user/uploads/image.jpg')
 */
export function extractStoragePath(url: string): string {
  // Remove the domain part regardless of what it is
  const fullStoragePath = url.replace(/^https?:\/\/[^/]+\//, '')

  // Split by storage path to get the relative path
  const relativePath = fullStoragePath.split(STORAGE_PATH)[1]

  return relativePath
}

/**
 * Constructs a complete absolute URL for an image resource by combining
 * the site's base URL from environment variables with the relative path.
 *
 * @param {string} url - Relative image path from storage directory
 * @returns {string} Complete absolute URL to the image resource
 * @throws {Error} If NEXT_PUBLIC_SITE_URL environment variable is not defined
 * @example
 * // Returns 'https://example.com/uploads/avatar.png'
 * getFullImageUrl('uploads/avatar.png')
 */
export function getFullImageUrl(url: string): string {
  const { NEXT_PUBLIC_SUPABASE_URL } = getEnvOrThrowClientSide()

  return `${NEXT_PUBLIC_SUPABASE_URL}/${url}`
}

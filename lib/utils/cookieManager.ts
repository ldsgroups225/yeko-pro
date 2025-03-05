// // lib/utils/cookieManager.ts

// 'use server'

// import type { CookieOptions } from '@/constants'
// import { CookieNames } from '@/constants'
// import { cookies } from 'next/headers'

// /**
//  * Asynchronously sets a cookie with the provided name, value, and optional configuration.
//  *
//  * Must be used within a Server Action or Route Handler to properly set the cookie.
//  *
//  * **Advanced Usage Examples:**
//  * - *Setting a session cookie with security attributes:*
//  *   ```ts
//  *   await setCookie(CookieNames.USER, { id: 123, name: 'Alice' }, {
//  *     maxAge: 3600,
//  *     secure: true,
//  *     httpOnly: true,
//  *     sameSite: 'strict'
//  *   });
//  *   ```
//  * - *Setting multiple cookies:*
//  *   ```ts
//  *   await Promise.all([
//  *     setCookie(CookieNames.GRADES, [90, 85, 92], { maxAge: 86400 }),
//  *     setCookie(CookieNames.SUBJECTS, ['Math', 'Science'], { maxAge: 86400 })
//  *   ]);
//  *   ```
//  *
//  * @param name - The name of the cookie (from CookieNames)
//  * @param value - The value to be stored (will be JSON-stringified)
//  * @param options - Additional cookie options to enhance security and control behavior
//  */
// export async function setCookie(
//   name: CookieNames,
//   value: any,
//   options?: CookieOptions,
// ): Promise<void> {
//   try {
//     // Retrieve the cookie store (this is asynchronous in Next.js 15+)
//     const cookieStore = await cookies()
//     // Set the cookie; Next.js handles serialization of options internally.
//     cookieStore.set(name, JSON.stringify(value), options)
//   }
//   catch (error) {
//     console.error(`Error setting cookie ${name}:`, error)
//     throw error
//   }
// }

// /**
//  * Asynchronously retrieves a cookie by its name.
//  *
//  * **Example:**
//  *   ```ts
//  *   const user = await getCookie<{ id: number; name: string }>(CookieNames.USER);
//  *   if (user) {
//  *     // Process the user data
//  *   }
//  *   ```
//  *
//  * @param name - The cookie name to retrieve.
//  * @returns The parsed cookie value or null if the cookie does not exist.
//  */
// export async function getCookie<T>(name: CookieNames): Promise<T | null> {
//   try {
//     const cookieStore = await cookies()
//     const cookie = cookieStore.get(name)
//     if (cookie) {
//       return JSON.parse(cookie.value) as T
//     }
//     return null
//   }
//   catch (error) {
//     console.error(`Error retrieving cookie ${name}:`, error)
//     return null
//   }
// }

// /**
//  * Asynchronously checks if a cookie exists.
//  *
//  * **Example:**
//  *   ```ts
//  *   const hasUserCookie = await hasCookie(CookieNames.USER);
//  *   ```
//  *
//  * @param name - The name of the cookie to check.
//  * @returns A boolean indicating if the cookie exists.
//  */
// export async function hasCookie(name: CookieNames): Promise<boolean> {
//   try {
//     const cookieStore = await cookies()
//     return cookieStore.has(name)
//   }
//   catch (error) {
//     console.error(`Error checking if cookie ${name} exists:`, error)
//     return false
//   }
// }

// /**
//  * Asynchronously deletes a cookie identified by its name.
//  * Must be used within a Server Action or Route Handler to properly delete the cookie.
//  *
//  * **Example:**
//  *   ```ts
//  *   await deleteCookie(CookieNames.USER);
//  *   ```
//  *
//  * @param name - The name of the cookie to delete.
//  */
// export async function deleteCookie(name: CookieNames): Promise<void> {
//   try {
//     const cookieStore = await cookies()
//     cookieStore.delete(name)
//   }
//   catch (error) {
//     console.error(`Error deleting cookie ${name}:`, error)
//     throw error
//   }
// }

// /**
//  * Asynchronously deletes all cookies in the CookieNames enum.
//  * Must be used within a Server Action or Route Handler.
//  *
//  * Note: This does not clear all browser cookies, only those defined in the CookieNames enum.
//  *
//  * **Example:**
//  *   ```ts
//  *   await deleteAllCookies();
//  *   ```
//  */
// export async function deleteAllCookies(): Promise<void> {
//   try {
//     const cookieStore = await cookies()
//     // Delete each cookie defined in the CookieNames enum
//     for (const name of Object.values(CookieNames)) {
//       if (cookieStore.has(name)) {
//         cookieStore.delete(name)
//       }
//     }
//   }
//   catch (error) {
//     console.error('Error deleting all cookies:', error)
//     throw error
//   }
// }

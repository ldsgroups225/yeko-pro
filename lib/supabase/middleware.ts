import type { NextRequest } from 'next/server'
import type { Database } from './types'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { checkMiddlewareAuth } from '@/lib/auth/middlewareAuth'
import { getEnvOrThrowServerSide } from '@/lib/utils/EnvServer'

export async function updateSession(request: NextRequest) {
  const env = getEnvOrThrowServerSide()

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  if (
    request.nextUrl.pathname === '/health' || request.nextUrl.pathname === '/api/health' || request.nextUrl.pathname === '/inscriptions'
  ) {
    // continue
    return supabaseResponse
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Enhanced role-based authentication logic
  try {
    const authResult = await checkMiddlewareAuth(request, user)

    if (authResult.shouldRedirect && authResult.redirectTo) {
      const url = request.nextUrl.clone()
      url.pathname = authResult.redirectTo

      // Create new response with redirect
      const redirectResponse = NextResponse.redirect(url)

      // Copy over cookies from supabase response to maintain session
      for (const cookie of supabaseResponse.cookies.getAll()) {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      }

      return redirectResponse
    }
  }
  catch (error) {
    console.error('Middleware authentication error:', error)

    // On error, fall back to safe behavior
    const protectedRoutes = ['/t/', '/educator', '/accountant', '/cashier']
    const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))

    if (user && isProtectedRoute) {
      // If trying to access protected routes but role check failed, redirect to unauthorized
      // console.error('Middleware error on protected route:', request.nextUrl.pathname, error)
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'

      const redirectResponse = NextResponse.redirect(url)
      for (const cookie of supabaseResponse.cookies.getAll()) {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      }

      return redirectResponse
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

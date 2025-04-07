import { useCallback, useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  const handleMediaQueryChange = useCallback((event: MediaQueryListEvent) => {
    setMatches(event.matches)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(query)

    // Add listener for future changes
    mediaQuery.addEventListener('change', handleMediaQueryChange)

    // Update initial state if needed
    if (matches !== mediaQuery.matches) {
      // Use requestAnimationFrame to avoid state updates in useEffect
      requestAnimationFrame(() => {
        setMatches(mediaQuery.matches)
      })
    }

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange)
    }
  }, [query, matches, handleMediaQueryChange])

  return matches
}

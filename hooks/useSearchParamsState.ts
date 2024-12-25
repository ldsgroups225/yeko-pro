import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

interface SearchParamsState {
  grade?: string
  search?: string
  active?: boolean
  teacher?: boolean
}

export function useSearchParamsState(defaultValues: SearchParamsState) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Local state to manage search params
  const [state, setState] = useState<SearchParamsState>(() => ({
    grade: searchParams.get('grade') || defaultValues.grade,
    search: searchParams.get('search') || defaultValues.search,
    active: searchParams.has('active')
      ? searchParams.get('active') === 'true'
      : defaultValues.active,
    teacher: searchParams.has('teacher')
      ? searchParams.get('teacher') === 'true'
      : defaultValues.teacher,
  }))

  // Create URL query string
  const createQueryString = useCallback((params: Record<string, any>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 'all') {
        newSearchParams.delete(key)
      }
      else {
        newSearchParams.set(key, String(value))
      }
    })

    return newSearchParams.toString()
  }, [searchParams])

  // Debounced URL update
  const updateURL = useDebouncedCallback((newState: SearchParamsState) => {
    const queryString = createQueryString({
      grade: newState.grade,
      search: newState.search,
      active: newState.active?.toString(),
      teacher: newState.teacher?.toString(),
    })
    router.push(`${pathname}?${queryString}`, { scroll: false })
  }, 300)

  // Update state and URL when state changes
  const updateState = useCallback((newState: Partial<SearchParamsState>) => {
    setState((prev) => {
      const updated = { ...prev, ...newState }
      updateURL(updated)
      return updated
    })
  }, [updateURL])

  return {
    state,
    updateState,
  }
}

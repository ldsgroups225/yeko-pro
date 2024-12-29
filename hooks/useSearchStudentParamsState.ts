import type { IStudentsQueryParams } from '@/types'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export function useSearchStudentParamsState(defaultValues: IStudentsQueryParams) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [state, setState] = useState<IStudentsQueryParams>(() => {
    const initialState = { ...defaultValues }

    searchParams.forEach((value, key) => {
      if (isValidStudentQueryKey(key)) {
        // Handle array values (selectedClassesId)
        if (key === 'selectedClassesId') {
          initialState.selectedClassesId = searchParams.getAll(key)
          return
        }

        // Handle sort parameter
        if (key === 'sort') {
          try {
            const sortValue = JSON.parse(value)
            if (isSortValue(sortValue)) {
              initialState.sort = sortValue
            }
          }
          catch {
            // Invalid JSON, skip setting sort
          }
          return
        }

        // Handle boolean values with type checking
        if (['isStudent', 'isTeacher', 'isAdmin', 'hasNotParentFilter', 'hasNotClassFilter'].includes(key)) {
          // Only set the value if it's a valid boolean string
          if (value === 'true' || value === 'false') {
            (initialState[key] as boolean | undefined) = value === 'true'
          }
          return
        }

        // Handle number values
        if (['page', 'itemsPerPage'].includes(key)) {
          const numValue = Number.parseInt(value, 10)
          if (!Number.isNaN(numValue)) {
            (initialState[key] as number | undefined) = numValue
          }
          return
        }

        // Handle string values
        if (value && typeof initialState[key] === 'string') {
          (initialState[key] as string | undefined) = value
        }
      }
    })

    return initialState
  })

  const updateState = useCallback(
    (newState: Partial<IStudentsQueryParams>) => {
      setState((prevState: IStudentsQueryParams) => ({ ...prevState, ...newState }))
    },
    [],
  )

  const debouncedUpdateURL = useDebouncedCallback(
    (currentState: IStudentsQueryParams) => {
      const params = new URLSearchParams()

      Object.entries(currentState).forEach(([key, value]) => {
        if (value !== undefined && isValidStudentQueryKey(key)) {
          if (key === 'sort' && value) {
            params.set(key, JSON.stringify(value))
          }
          else if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)))
          }
          else if (typeof value === 'boolean') {
            params.set(key, value.toString())
          }
          else {
            params.set(key, String(value))
          }
        }
      })

      router.push(`${pathname}?${params.toString()}`)
    },
    500,
  )

  useEffect(() => {
    debouncedUpdateURL(state)
  }, [state, debouncedUpdateURL])

  return {
    state,
    updateState,
  }
}

// Type guard functions
function isValidStudentQueryKey(key: PropertyKey): key is keyof IStudentsQueryParams {
  return typeof key === 'string' && [
    'schoolId',
    'page',
    'itemsPerPage',
    'searchTerm',
    'isStudent',
    'isTeacher',
    'isAdmin',
    'selectedClassesId',
    'sort',
    'hasNotParentFilter',
    'hasNotClassFilter',
  ].includes(key)
}

function isSortValue(value: unknown): value is { column: string, direction: 'asc' | 'desc' } {
  return (
    typeof value === 'object'
    && value !== null
    && 'column' in value
    && 'direction' in value
    && typeof (value as any).column === 'string'
    && ['asc', 'desc'].includes((value as any).direction)
  )
}

import type { IStudentsQueryParams } from '@/types'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { areEqual } from '@/lib/utils'

export function useSearchStudentParamsState(defaultValues: IStudentsQueryParams) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [state, setState] = useState<IStudentsQueryParams>(() => {
    const initialState = { ...defaultValues }

    searchParams.forEach((value, key) => {
      if (isValidStudentQueryKey(key)) {
        // Handle array values (selectedClasses)
        if (key === 'selectedClasses') {
          initialState.selectedClasses = searchParams.getAll(key)
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

        if (['hasNotParentFilter', 'hasNotClassFilter'].includes(key)) {
          // Only set the value if it's a true boolean string
          if (value === 'true') {
            (initialState[key] as boolean | undefined) = true
          }
          else {
            delete initialState[key]
          }
          return
        }

        // Handle boolean values with type checking
        if (['isStudent', 'isTeacher', 'isAdmin'].includes(key)) {
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
      setState((prevState: IStudentsQueryParams) => {
        const updatedState = { ...prevState, ...newState }
        return updatedState
      })
    },
    [],
  )

  const debouncedUpdateURL = useDebouncedCallback(
    (currentState: IStudentsQueryParams) => {
      const params = new URLSearchParams()

      Object.entries(currentState).forEach(([key, value]) => {
        if (value !== undefined && isValidStudentQueryKey(key)) {
          const defaultValue = defaultValues[key]
          if (!areEqual(value, defaultValue)) {
            if (key === 'sort' && value) {
              params.set(key, JSON.stringify(value))
            }
            else if (Array.isArray(value)) {
              (value as string[]).forEach(v => params.append(key, v))
            }
            else if (typeof value === 'boolean' && ['hasNotParentFilter', 'hasNotClassFilter'].includes(key)) {
              // params.set(key, value.toString())
              if (value === true) {
                params.set(key, 'true')
              }
              else {
                params.delete(key)
              }
            }
            else if (typeof value === 'boolean') {
              params.set(key, value.toString())
            }
            else {
              params.set(key, String(value))
            }
          }
        }
      })

      const search = params.toString()
      if (search) {
        router.push(`${pathname}?${search}`)
      }
      else {
        router.push(pathname)
      }
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
    'selectedClasses',
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

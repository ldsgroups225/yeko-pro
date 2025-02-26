'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LayoutGridIcon, TableIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export function TeachersFilters() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const isGridViewMode = searchParams.get('mode') === 'grid-view'

  const handleSearchTermChange = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)

    if (term) {
      params.set('searchTerm', term)
    }
    else {
      params.delete('searchTerm')
    }

    replace(`${pathname}?${params.toString()}`)
  }, 300)

  const onToggleViewMode = () => {
    const params = new URLSearchParams(searchParams)

    params.set('mode', isGridViewMode ? 'table-view' : 'grid-view')

    replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
      <div className="flex-1">
        <Input
          defaultValue={searchParams.get('query')?.toString()}
          placeholder="Rechercher un enseignant..."
          onChange={e => handleSearchTermChange(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleViewMode}
          title={!isGridViewMode ? 'Vue grille' : 'Vue tableau'}
        >
          {!isGridViewMode
            ? (
                <LayoutGridIcon className="h-4 w-4" />
              )
            : (
                <TableIcon className="h-4 w-4" />
              )}
        </Button>
      </div>
    </div>
  )
}

// app/educator/_components/EducatorConductFilters.tsx

'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

interface EducatorConductFiltersProps {
  searchTerm: string
  onSearchTermChange: (value: string) => void
  totalCount: number
  isLoading: boolean
}

export function EducatorConductFilters({
  searchTerm,
  onSearchTermChange,
  totalCount,
  isLoading,
}: EducatorConductFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un élève (nom, prénom, matricule)..."
          value={searchTerm}
          onChange={e => onSearchTermChange(e.target.value)}
          className="pl-10 h-11 bg-background/50 backdrop-blur-sm border-border/50"
        />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-center sm:justify-end">
        {isLoading
          ? (
              <Skeleton className="h-5 w-32" />
            )
          : (
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                {totalCount}
                {' '}
                élève
                {totalCount !== 1 ? 's' : ''}
                {' '}
                trouvé
                {totalCount !== 1 ? 's' : ''}
              </p>
            )}
      </div>
    </div>
  )
}

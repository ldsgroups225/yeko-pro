import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LayoutGridIcon, TableIcon } from 'lucide-react'

interface TeachersFiltersProps {
  searchTerm: string
  onSearchTermChange: (value: string) => void
  isTableViewMode: boolean
  onToggleViewMode: () => void
}

export function TeachersFilters({
  searchTerm,
  onSearchTermChange,
  isTableViewMode,
  onToggleViewMode,
}: TeachersFiltersProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
      <div className="flex-1">
        <Input
          placeholder="Rechercher un enseignant..."
          value={searchTerm}
          onChange={e => onSearchTermChange(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleViewMode}
          title={isTableViewMode ? 'Vue grille' : 'Vue tableau'}
        >
          {isTableViewMode
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

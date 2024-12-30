import type { IClassesGrouped } from '@/types'
import { FilterCheckbox } from '@/components/FilterCheckbox'
import { Separator } from '@/components/ui/separator'
import { StudentClassFilters } from './StudentClassFilters'

interface StudentFilterSectionProps {
  groupedClasses: IClassesGrouped[]
  selectedClassesId?: string[]
  hasNotParentFilter?: boolean
  hasNotClassFilter?: boolean
  onClassChange: (classId: string, checked: boolean) => void
  onHasNotParentFilterChange: (checked: boolean) => void
  onHasNotClassFilterChange: (checked: boolean) => void
}

export function StudentFilterSection({
  groupedClasses,
  selectedClassesId,
  hasNotParentFilter,
  hasNotClassFilter,
  onClassChange,
  onHasNotParentFilterChange,
  onHasNotClassFilterChange,
}: StudentFilterSectionProps) {
  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Espace filtre</h4>
        <p className="text-sm text-muted-foreground">
          Vous pouvez appliquer plusieurs filtres en simultané.
        </p>
      </div>
      <div className="grid gap-2">
        <FilterCheckbox
          id="has-not-parent"
          label="Sans parent"
          checked={!!hasNotParentFilter}
          onChange={onHasNotParentFilterChange}
        />
        <FilterCheckbox
          id="has-not-class"
          label="Sans classe"
          checked={!!hasNotClassFilter}
          onChange={onHasNotClassFilterChange}
        />

        <Separator />

        <h4 className="mt-2 font-medium leading-none">Voir élèves par classe</h4>

        <StudentClassFilters
          groupedClasses={groupedClasses}
          selectedClassesId={selectedClassesId}
          onClassChange={onClassChange}
        />
      </div>
    </div>
  )
}

import type { IClassesGrouped } from '@/types'
import { FilterCheckbox } from '@/components/FilterCheckbox'
import { Separator } from '@/components/ui/separator'
import { StudentClassFilters } from './StudentClassFilters'

interface StudentFilterSectionProps {
  groupedClasses: IClassesGrouped[]
  selectedClasses?: string[]
  hasNotClassFilter?: boolean
  hasNotParentFilter?: boolean
  refusedStudentsFilter?: boolean
  onHasNotClassFilterChange: (checked: boolean) => void
  onHasNotParentFilterChange: (checked: boolean) => void
  onRefusedStudentsFilterChange: (checked: boolean) => void
  onClassChange: (classId: string, checked: boolean) => void
}

export function StudentFilterSection({
  onClassChange,
  groupedClasses,
  selectedClasses,
  hasNotClassFilter,
  hasNotParentFilter,
  refusedStudentsFilter,
  onHasNotClassFilterChange,
  onHasNotParentFilterChange,
  onRefusedStudentsFilterChange,
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
        <FilterCheckbox
          id="refused-student"
          label="Élèves refusés"
          checked={!!refusedStudentsFilter}
          onChange={onRefusedStudentsFilterChange}
        />

        <Separator />

        <h4 className="mt-2 font-medium leading-none">Voir élèves par classe</h4>

        <StudentClassFilters
          groupedClasses={groupedClasses}
          selectedClasses={selectedClasses}
          onClassChange={onClassChange}
        />
      </div>
    </div>
  )
}

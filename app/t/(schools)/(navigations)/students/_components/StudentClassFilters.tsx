import type { IClassesGrouped } from '@/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDownIcon } from '@radix-ui/react-icons'

interface StudentClassFiltersProps {
  groupedClasses: IClassesGrouped[]
  selectedClassesId?: string[]
  onClassChange: (classId: string, checked: boolean) => void
}

export function StudentClassFilters({ groupedClasses, selectedClassesId = [], onClassChange }: StudentClassFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {groupedClasses.map(cls => (
        <DropdownMenu key={cls.name}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-1">
              <span>{cls.name}</span>
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>
              {cls.name}
              {' '}
              Subclasses
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {cls.subclasses.map(subclass => (
              <DropdownMenuCheckboxItem
                key={subclass.id}
                checked={selectedClassesId.includes(subclass.id)}
                onCheckedChange={checked => onClassChange(subclass.id, checked)}
              >
                {subclass.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  )
}

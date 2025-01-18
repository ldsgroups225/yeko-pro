'use client'

import type { FilterStudentWhereNotInTheClass } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CommandItem } from '@/components/ui/command'

interface StudentCommandItemProps {
  student: FilterStudentWhereNotInTheClass
  onSelect: (student: FilterStudentWhereNotInTheClass) => void
  disabled?: boolean
}

export function StudentCommandItem({ student, onSelect, disabled }: StudentCommandItemProps) {
  return (
    <CommandItem
      value={student.idNumber}
      onSelect={() => onSelect(student)}
      className="flex items-center gap-3 p-2"
      disabled={disabled}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={student.imageUrl || ''} />
        <AvatarFallback>{student.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium">{student.fullName}</span>
        {student.currentClass
          ? (
              <Badge variant="secondary" className="w-fit">
                {student.currentClass.name}
              </Badge>
            )
          : (
              <span className="text-sm text-yellow-600 dark:text-yellow-400">
                Pas de classe
              </span>
            )}
      </div>
    </CommandItem>
  )
}

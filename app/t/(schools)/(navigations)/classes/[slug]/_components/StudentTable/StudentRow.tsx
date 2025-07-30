import type { ClassDetailsStudent } from '@/types'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatDate, formatRank } from '@/lib/utils'
import { AbsenceBadge, GradeBadge, LateBadge } from './Badges'
import { StudentActions } from './StudentActions'

interface StudentRowProps {
  classId: string
  isSelected: boolean
  student: ClassDetailsStudent
  onSelect: (id: string) => void
}

export function StudentRow({ student, isSelected, onSelect, classId }: StudentRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(student.id)}
        />
      </TableCell>
      <TableCell className="font-medium">{student.lastName}</TableCell>
      <TableCell>{student.firstName}</TableCell>
      <TableCell>
        <GradeBadge grade={student.gradeAverage} />
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {student.lastEvaluation.length < 5
            ? '-'
            : formatRank({ rank: student.rank, gender: student.gender })}
        </Badge>
      </TableCell>
      <TableCell>
        <AbsenceBadge count={student.absentCount} />
      </TableCell>
      <TableCell>
        <LateBadge count={student.lateCount} />
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {student.lastEvaluation.length < 5
            ? student.lastEvaluation
            : formatDate(student.lastEvaluation)}
        </div>
        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
          {student.teacherNotes}
        </div>
      </TableCell>
      <TableCell>
        <StudentActions student={{ ...student, classId }} />
      </TableCell>
    </TableRow>
  )
}

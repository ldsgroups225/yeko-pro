import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { TableCell, TableRow } from '@/components/ui/table'
import { AbsenceBadge, GradeBadge, LateBadge } from './Badges'
import { StudentActions } from './StudentActions'

interface StudentRowProps {
  student: any
  isSelected: boolean
  onSelect: (id: string) => void
}

export function StudentRow({ student, isSelected, onSelect }: StudentRowProps) {
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
          {student.rank}
          /
          {student.totalStudents}
        </Badge>
      </TableCell>
      <TableCell>
        <AbsenceBadge count={student.absentCount} />
      </TableCell>
      <TableCell>
        <LateBadge count={student.lateCount} />
      </TableCell>
      <TableCell>
        <div className="text-sm">{student.lastEvaluation}</div>
        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
          {student.teacherNotes}
        </div>
      </TableCell>
      <TableCell>
        <StudentActions />
      </TableCell>
    </TableRow>
  )
}

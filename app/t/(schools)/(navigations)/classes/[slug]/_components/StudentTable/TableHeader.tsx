import type { IClass } from '@/types'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { ClassActions } from './ClassActions'

interface StudentTableHeaderProps {
  classData: IClass | null
}

export function StudentTableHeader({ classData }: StudentTableHeaderProps) {
  return (
    <div className="flex justify-between">
      <div>
        <CardTitle>
          Classe de
          {' '}
          <span className="text-primary">{classData?.name}</span>
        </CardTitle>
        <CardDescription>
          Prof. Principal:
          {' '}
          <span className="text-primary">{classData?.teacher?.fullName}</span>
        </CardDescription>
      </div>

      <ClassActions />
    </div>
  )
}

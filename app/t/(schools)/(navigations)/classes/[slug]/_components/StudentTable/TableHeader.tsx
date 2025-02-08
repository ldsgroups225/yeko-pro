import type { IClass } from '@/types'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { ClassActions } from './ClassActions'

interface StudentTableHeaderProps {
  classData: IClass | null
  onOpenClassEditionModal: () => void
}

export function StudentTableHeader({ classData, onOpenClassEditionModal }: StudentTableHeaderProps) {
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

      <ClassActions
        classId={classData!.id}
        classStatus={classData!.isActive}
        onOpenClassEditionModal={onOpenClassEditionModal}
        studentCount={classData?.studentCount ?? 0}
      />
    </div>
  )
}

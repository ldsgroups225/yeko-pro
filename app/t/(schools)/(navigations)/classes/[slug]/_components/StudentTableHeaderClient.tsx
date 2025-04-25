'use client'

import type { IClass, IGrade } from '@/types'
import { useState } from 'react'
import { ClassCreationOrUpdateDialog } from '../../_components/ClassCreationOrUpdateDialog'
import { StudentTableHeader } from './StudentTable/TableHeader'

interface StudentTableHeaderClientProps {
  classData: IClass
  grades: IGrade[]
}

export function StudentTableHeaderClient({ classData, grades }: StudentTableHeaderClientProps) {
  const [showClassModal, setShowClassModal] = useState(false)

  return (
    <>
      <StudentTableHeader
        classData={classData}
        onOpenClassEditionModal={() => setShowClassModal(true)}
      />
      {showClassModal && (
        <ClassCreationOrUpdateDialog
          open={showClassModal}
          oldClass={{
            id: classData.id,
            name: classData.name,
            gradeId: classData.gradeId,
            maxStudent: classData.maxStudent,
          }}
          onOpenChange={setShowClassModal}
          gradeOptions={grades}
        />
      )}
    </>
  )
}

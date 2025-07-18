// app/t/(schools)/(navigations)/teachers/_components/AssignClassesButton.tsx

'use client'

import type { ITeacherDTO } from '@/types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { AssignClassesDialog } from './AssignClassesDialog'

interface AssignClassesButtonProps {
  teacherId: string
  currentAssignments: NonNullable<ITeacherDTO['assignments']>
  teacherName: string
}

export function AssignClassesButton({ teacherId, currentAssignments, teacherName }: AssignClassesButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Assigner des classes
        </Button>
      </DialogTrigger>
      <AssignClassesDialog
        teacherId={teacherId}
        currentAssignments={currentAssignments}
        teacherName={teacherName}
        onClose={() => setOpen(false)}
      />
    </Dialog>
  )
}

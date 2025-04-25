'use client'

import type { Student } from '../../types'
import { Badge } from '@/components/ui/badge'
import { School } from 'lucide-react'

interface StudentInfoProps {
  student: Student
  className?: string
}

export function StudentInfo({ student, className = '' }: StudentInfoProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <h1 className="text-xl md:text-2xl font-bold">
        {student.firstName}
        {' '}
        {student.lastName}
      </h1>
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <School className="h-4 w-4" />
        <p className="font-medium">
          Classe
          <span className="text-primary ml-1">
            {student.classroom?.name ?? 'Non assigné'}
          </span>
        </p>
        <span>•</span>
        <span>
          Matricule:
          <span className="text-primary ml-1">{student.idNumber}</span>
        </span>
      </div>

      <Badge variant={student.isGouvernentAffected ? 'success' : 'default'}>
        {student.isGouvernentAffected ? 'Affecté d\'état' : 'Non affecté'}
      </Badge>
    </div>
  )
}

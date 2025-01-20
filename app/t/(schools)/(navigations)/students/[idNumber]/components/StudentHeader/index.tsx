'use client'

import type { Student } from '../../types'
import { Card, CardContent } from '@/components/ui/card'
import { StudentAvatar } from './StudentAvatar'
import { StudentHeaderSkeleton } from './StudentHeaderSkeleton'
import { StudentInfo } from './StudentInfo'

interface StudentHeaderProps {
  student?: Student
  isLoading?: boolean
  className?: string
}

export function StudentHeader({ student, isLoading, className = '' }: StudentHeaderProps) {
  if (isLoading) {
    return (
      <Card className={`border-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 ${className}`}>
        <CardContent className="p-4 md:p-6">
          <StudentHeaderSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (!student) {
    return null
  }

  return (
    <Card className={`border-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 ${className}`}>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <StudentAvatar student={student} />
            <StudentInfo student={student} />
          </div>
          {/* Action buttons can be added here later */}
        </div>
      </CardContent>
    </Card>
  )
}

// Re-export sub-components
export { StudentAvatar } from './StudentAvatar'
export { StudentHeaderSkeleton } from './StudentHeaderSkeleton'
export { StudentInfo } from './StudentInfo'

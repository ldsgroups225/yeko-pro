'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

export interface Subject {
  id: string
  name: string
  grade: number
  maxGrade: number
  coefficient: number
}

interface MainSubjectsProps {
  subjects: Subject[]
  isLoading?: boolean
}

function SubjectRow({ subject }: { subject: Subject }) {
  const progress = (subject.grade / subject.maxGrade) * 100

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span>{subject.name}</span>
        <span className="text-sm text-muted-foreground">
          (Coef.
          {' '}
          {subject.coefficient}
          )
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {subject.grade}
          /
          {subject.maxGrade}
        </Badge>
        <Progress
          value={progress}
          className="w-20"
          aria-label={`${subject.name} progress`}
        />
      </div>
    </div>
  )
}

function SubjectRowSkeleton() {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-2 w-20" />
      </div>
    </div>
  )
}

export function MainSubjects({ subjects, isLoading }: MainSubjectsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matières Principales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading
          ? (
              <>
                <SubjectRowSkeleton />
                <SubjectRowSkeleton />
                <SubjectRowSkeleton />
              </>
            )
          : (
              subjects.map(subject => (
                <SubjectRow key={subject.id} subject={subject} />
              ))
            )}
      </CardContent>
    </Card>
  )
}

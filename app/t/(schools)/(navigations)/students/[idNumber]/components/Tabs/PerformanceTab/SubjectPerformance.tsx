'use client'

import { AlertTriangle, ArrowDown, ArrowUp, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

export interface SubjectPerformanceData {
  id: string
  name: string
  currentGrade: number
  maxGrade: number
  trend: 'up' | 'down' | 'stable'
  previousGrade?: number
  classAverage: number
  coefficient: number
  isStrength: boolean
  needsImprovement: boolean
  teacherComment?: string
}

interface SubjectPerformanceProps {
  subjects: SubjectPerformanceData[]
  isLoading?: boolean
}

function formatTrend(current: number, previous?: number): string {
  if (!previous)
    return ''
  const diff = current - previous
  return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)
}

function SubjectCard({ subject }: { subject: SubjectPerformanceData }) {
  const progress = (subject.currentGrade / subject.maxGrade) * 100
  const relativeToClass = subject.currentGrade - subject.classAverage

  return (
    <Card className={subject.isStrength ? 'border-green-500/50' : subject.needsImprovement ? 'border-yellow-500/50' : ''}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{subject.name}</span>
              <span className="text-sm text-muted-foreground">
                (Coef.
                {' '}
                {subject.coefficient}
                )
              </span>
              {subject.isStrength && (
                <Sparkles className="h-4 w-4 text-green-500" />
              )}
              {subject.needsImprovement && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold">
                {subject.currentGrade.toFixed(2).endsWith('.00') ? subject.currentGrade : subject.currentGrade.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">
                /
                {subject.maxGrade}
              </span>
              {subject.trend !== 'stable' && (
                <Badge
                  variant="outline"
                  className={
                    subject.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }
                >
                  {subject.trend === 'up'
                    ? (
                        <ArrowUp className="h-3 w-3 mr-1" />
                      )
                    : (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      )}
                  {formatTrend(subject.currentGrade, subject.previousGrade)}
                </Badge>
              )}
            </div>
          </div>
          <Badge variant={relativeToClass >= 0 ? 'default' : 'secondary'}>
            {relativeToClass >= 0 ? '+' : ''}
            {relativeToClass.toFixed(1)}
            {' '}
            vs classe
          </Badge>
        </div>
        <Progress
          value={progress}
          className="mt-2"
          aria-label={`${subject.name} progress`}
        />
        {subject.teacherComment && (
          <p className="mt-2 text-sm text-muted-foreground">
            {subject.teacherComment}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function SubjectCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-2 w-full mt-4" />
        <Skeleton className="h-4 w-3/4 mt-4" />
      </CardContent>
    </Card>
  )
}

export function SubjectPerformance({ subjects, isLoading }: SubjectPerformanceProps) {
  const strengthSubjects = subjects.filter(s => s.isStrength)
  const improvementSubjects = subjects.filter(s => s.needsImprovement)
  const otherSubjects = subjects.filter(s => !s.isStrength && !s.needsImprovement)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance par Matière</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <SubjectCardSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance par Matière</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {strengthSubjects.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-green-500">Points Forts</h3>
            <div className="space-y-4">
              {strengthSubjects.map(subject => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          </div>
        )}

        {improvementSubjects.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-yellow-500">À Améliorer</h3>
            <div className="space-y-4">
              {improvementSubjects.map(subject => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          </div>
        )}

        {otherSubjects.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Autres Matières</h3>
            <div className="space-y-4">
              {otherSubjects.map(subject => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

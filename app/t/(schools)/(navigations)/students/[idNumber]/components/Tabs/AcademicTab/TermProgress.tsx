'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

export interface Term {
  id: string
  name: string
  average: number
  maxScore: number
  progress: number
  rank?: {
    position: number
    total: number
  }
}

interface TermProgressProps {
  terms: Term[]
  isLoading?: boolean
}

function TermCard({ term }: { term: Term }) {
  const progressPercentage = (term.average / term.maxScore) * 100

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground">
          {term.name}
        </div>
        <div className="text-2xl font-bold mt-2">
          {term.average.toFixed(1)}
          /
          {term.maxScore}
        </div>
        <Progress
          value={progressPercentage}
          className="mt-2"
          aria-label={`${term.name} progress`}
        />
        <div className="text-sm text-muted-foreground mt-2">
          {term.rank ? `Rang: ${term.rank.position}/${term.rank.total}` : '-'}
        </div>
      </CardContent>
    </Card>
  )
}

function TermProgressSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-2 w-full mb-2" />
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  )
}

export function TermProgress({ terms, isLoading }: TermProgressProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(index => (
          <TermProgressSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {terms.map(term => (
        <TermCard key={term.id} term={term} />
      ))}
    </div>
  )
}

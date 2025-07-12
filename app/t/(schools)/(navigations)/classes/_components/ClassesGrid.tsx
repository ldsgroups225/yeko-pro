import type { IClass } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import React from 'react'
import { ClassTableRowActions } from './ClassTableRowActions'

interface ClassesGridProps {
  classes?: IClass[]
  isLoading: boolean
  onClassEdit: (classroom: string) => void
}

/**
 * Component for displaying classes in a grid view.
 *
 * @param {ClassesGridProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export const ClassesGrid: React.FC<ClassesGridProps> = ({
  classes,
  isLoading,
  onClassEdit,
}) => {
  const router = useRouter()

  function navigateToClass(slug: string) {
    router.push(`/t/classes/${slug}`)
  }

  const fakeClasses = Array.from({ length: 10 }).map((_, i) => ({
    id: i.toString(),
  }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {isLoading
        ? (
            // Show skeleton loading state when isLoading is true
            fakeClasses.map(el => (
              <Card key={el.id} className="p-4">
                <CardHeader className="p-0 pb-2">
                  <CardTitle>
                    <Skeleton className="h-6 w-[150px]" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Skeleton className="h-7 w-[80px] rounded-md mb-2" />
                  <Skeleton className="h-4 w-[100px] mb-2" />
                  <div className="mt-2 flex space-x-2">
                    <Skeleton className="h-8 w-[100px] rounded-md" />
                    <Skeleton className="h-8 w-[100px] rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ),
            )
          )
        : (
            // Show actual data when isLoading is false
            classes?.map(cls => (
              <Card key={cls.id} className="p-4">
                <CardHeader className="p-0 pb-2">
                  <CardTitle>{cls.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Badge variant={cls.isActive ? 'outline' : 'destructive'}>
                    {cls.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <p className="text-sm mt-2">{cls.teacher?.fullName ?? '-'}</p>
                  <div className="mt-2 flex space-x-2">
                    <ClassTableRowActions
                      editButtonClicked={() => onClassEdit(JSON.stringify(cls))}
                      navigateToClass={() => navigateToClass(cls.slug)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
    </div>
  )
}

'use client'

import type { IClassesGrouped, IScheduleCalendarDTO } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useScheduleOptimistic, useSchedules, useStudents, useUser } from '@/hooks'
import { calculatePosition } from '@/lib/utils'
import { ChevronDownIcon, EyeOpenIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AddCourseDialog, CurrentTimeLine, EventCell, TimelineIndicator } from './_components'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

export default function SchedulePage() {
  const { user } = useUser()
  const { loadSchedules } = useSchedules()
  const { schedules, updateSchedule } = useScheduleOptimistic()
  const { groupedClasses, fetchClassesBySchool } = useStudents()

  const [headerHeight] = useState(64)
  const [calendarHeight, setCalendarHeight] = useState(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedClassId, setSelectedClassId] = useState<string>('')

  const groupedEvents = useMemo(() => {
    const groups: Record<number, IScheduleCalendarDTO[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] }
    schedules?.forEach((event) => {
      const dayIndex = event.dayOfWeek - 1
      if (dayIndex >= 0 && dayIndex < 5) {
        groups[dayIndex].push(event)
      }
    })
    return groups
  }, [schedules])

  function gradeHasSelectedSubclass(cls: IClassesGrouped) {
    return cls.subclasses.some(subclass => selectedClassId === subclass.id)
  }

  function getDropdownItems(subclasses: { id: string, name: string }[]) {
    return subclasses.map(subclass => ({
      label: selectedClassId === subclass.id ? `${subclass.name} ✔️` : `${subclass.name}`,
      click: () => setSelectedClassId(subclass.id),
      selected: selectedClassId === subclass.id,
    }))
  }

  useEffect(() => {
    if (user) {
      fetchClassesBySchool(user.school.id)
    }
  }, [])

  useEffect(() => {
    setCalendarHeight(window.innerHeight - headerHeight)
  }, [headerHeight])

  useEffect(() => {
    async function fetchSchedules() {
      if (user && selectedClassId !== '') {
        const subclasses = groupedClasses.flatMap(cls => cls.subclasses)
        const selectedSubclass = subclasses.find(subclass => subclass.id === selectedClassId)

        if (selectedSubclass?.slug) {
          setIsLoading(true)
          try {
            await loadSchedules(selectedSubclass.slug, subclasses)
          }
          finally {
            setIsLoading(false)
          }
        }
      }
    }

    fetchSchedules()
  }, [selectedClassId])

  const renderContent = () => {
    if (!selectedClassId) {
      return (
        <div className="flex flex-col items-center justify-center h-[600px] text-muted-foreground">
          <p className="text-lg">Sélectionner une classe pour voir son emploi du temps</p>
        </div>
      )
    }

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[600px] text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
          <p>Chargement de l'emploi du temps...</p>
        </div>
      )
    }

    if (schedules.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
          <p className="text-lg text-muted-foreground">Cette classe n'a aucun emploi du temps</p>
          <AddCourseDialog
            classId={selectedClassId}
            mergedClasses={groupedClasses.flatMap(cls => cls.subclasses)}
            onAddSuccess={() => {
              toast('Le cours a bien été ajouté à votre emploi du temps')
            }}
            onError={(error) => {
              console.error('Failed to add schedule:', error)
              toast('Nous n\'avons pas pu ajouter le cours à votre emploi du temps')
            }}
          />
        </div>
      )
    }

    return (
      <div className="flex flex-col overflow-hidden bg-blacks" style={{ height: calendarHeight }}>
        <div className="flex-1 overflow-x-auto relative">
          <div className="grid grid-cols-[auto_repeat(5,1fr)] gap-x-4 min-w-[1200px] p-4">
            <TimelineIndicator />

            {DAYS.map((day, index) => (
              <div
                key={day}
                className="relative h-[660px] bg-background/50 border rounded-lg p-2"
              >
                <div className="sticky top-0 z-30 h-[40px] bg-background/80 backdrop-blur-sm pb-2 mb-2 border-b">
                  <h3 className="text-sm font-medium text-foreground">{day}</h3>
                </div>

                <div className="relative h-[calc(100%-40px)]">
                  {groupedEvents[index].map((event) => {
                    const top = calculatePosition(event.startTime)
                    const height = calculatePosition(event.endTime) - top

                    return (
                      <EventCell
                        key={event.id}
                        event={event}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          width: 'calc(100% - 0.5rem)',
                        }}
                        onEventUpdate={async (updatedEvent: IScheduleCalendarDTO) => {
                          try {
                            await updateSchedule(updatedEvent)
                          }
                          catch (error) {
                            console.error('Failed to update schedule:', error)
                          }
                        }}
                      />
                    )
                  })}
                  <CurrentTimeLine />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="p-4 space-y-6 overflow-hidden">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Emploi du temps</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" asChild>
            <Link href="/t/schedules/import">
              Import d'emploi du temps
            </Link>
          </Button>

          {selectedClassId && schedules.length > 0 && (
            <AddCourseDialog
              classId={selectedClassId}
              mergedClasses={groupedClasses.flatMap(cls => cls.subclasses)}
              onAddSuccess={() => {
                toast('Le cours a bien été ajouté à votre emploi du temps')
              }}
              onError={(error) => {
                console.error('Failed to add schedule:', error)
                toast('Nous n\'avons pas pu ajouter le cours à votre emploi du temps')
              }}
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {groupedClasses.map(cls => (
          <DropdownMenu key={cls.name}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center"
                onClick={() => setSelectedClassId(cls.id)}
              >
                {cls.name}
                <ChevronDownIcon className="ml-2 h-4 w-4" />
                {gradeHasSelectedSubclass(cls) && (
                  <EyeOpenIcon className="ml-1 h-4 w-4 text-green-700 dark:text-green-400" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {getDropdownItems(cls.subclasses).map(item => (
                <DropdownMenuCheckboxItem
                  key={item.label}
                  checked={item.selected}
                  onCheckedChange={item.click}
                >
                  {item.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>

      {renderContent()}
    </Card>
  )
}

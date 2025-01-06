'use client'

import type { IClassesGrouped } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useSchedules, useStudents, useUser } from '@/hooks'
import { getDayName } from '@/lib/utils'
import { ChevronDownIcon, EyeOpenIcon } from '@radix-ui/react-icons'
import { Fragment, useEffect, useState } from 'react'
import { AddCourseDialog, EventCell, TimelineIndicator } from './_components'

const DAYS = [1, 2, 3, 4, 5] // Monday to Friday

export const Calendar: React.FC = () => {
  const { user } = useUser()
  const { groupedClasses, fetchClassesBySchool } = useStudents()
  const { loadSchedules, schedules } = useSchedules()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedClassId, setSelectedClassId] = useState<string>('')

  // const handleAddEvent = (newEvent: IScheduleCalendarDTO) => {
  //   // setEvents([...events, newEvent])
  // }

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
        <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
          <p className="text-lg">Sélectionner une classe pour voir son emploi du temps</p>
        </div>
      )
    }

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
          <p>Chargement de l'emploi du temps...</p>
        </div>
      )
    }

    if (schedules.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
          <p className="text-lg text-muted-foreground">Cette classe n'a aucun emploi du temps</p>
          <AddCourseDialog onAddEvent={() => {}} />
          {/* <AddCourseDialog onAddEvent={handleAddEvent} /> */}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-6">
        <div className="h-12" />
        {DAYS.map(day => (
          <Button
            key={day}
            variant="ghost"
            className="h-12 font-medium"
          >
            {getDayName(day)}
          </Button>
        ))}

        {Array.from({ length: 12 }, (_, i) => i + 7).map(hour => (
          <Fragment key={hour}>
            <div className="h-16 flex items-start justify-end pr-2 font-medium text-muted-foreground">
              {hour.toString().padStart(2, '0')}
              :00
            </div>
            {DAYS.map(day => (
              <div
                key={`${day}-${hour}`}
                className="h-16 border-x border-border/50 relative hover:bg-muted/50 transition-colors duration-200"
              >
                {schedules
                  .filter(event =>
                    event.dayOfWeek === day
                    && Number.parseInt(event.startTime.split(':')[0]) === hour,
                  )
                  .map(event => (
                    <EventCell key={event.id} event={event} />
                  ))}
              </div>
            ))}
          </Fragment>
        ))}
        <TimelineIndicator />
      </div>
    )
  }

  return (
    <Card className="relative">
      <div className="p-2 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Emploi du temps</h2>
          {selectedClassId && schedules.length > 0 && (
            <AddCourseDialog onAddEvent={() => {}} />
            // <AddCourseDialog onAddEvent={handleAddEvent} />
          )}
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
      </div>
    </Card>
  )
}

export default Calendar

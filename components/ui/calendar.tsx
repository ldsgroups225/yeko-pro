'use client'

import type { CaptionProps,
} from 'react-day-picker'
import { cn } from '@/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'

import * as React from 'react'
import {
  DayPicker,
  useDayPicker,
  useNavigation,
} from 'react-day-picker'
import { Button, buttonVariants } from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { ScrollArea } from './scroll-area'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const months = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

function CustomCaption(props: CaptionProps) {
  const { fromDate, toDate } = useDayPicker()
  const { goToMonth, nextMonth, previousMonth, currentMonth } = useNavigation()

  if (!currentMonth) {
    return null
  }

  const currentYear = currentMonth.getFullYear()
  const currentMonthIndex = currentMonth.getMonth()

  const displayYear = props.displayMonth.getFullYear()
  const startYear = fromDate ? fromDate.getFullYear() : displayYear - 100
  const endYear = toDate ? toDate.getFullYear() : displayYear + 10
  const years: number[] = []
  for (let i = startYear; i <= endYear; i++) {
    years.push(i)
  }

  const handleMonthChange = (monthIndex: number) => {
    goToMonth(new Date(currentYear, monthIndex))
  }

  const handleYearChange = (year: number) => {
    const newDate = new Date(year, currentMonthIndex)
    let targetDate = newDate
    if (fromDate && newDate < new Date(fromDate.getFullYear(), fromDate.getMonth(), 1)) {
      targetDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1)
    }
    else if (toDate && newDate > new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0)) {
      targetDate = new Date(toDate.getFullYear(), toDate.getMonth(), 1)
    }
    goToMonth(targetDate)
  }

  return (
    <div className="flex justify-between items-center px-1 pt-1 relative mb-4">
      <div className="flex items-center gap-1">
        {/* Month Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="w-fit font-medium focus-visible:ring-0">
              {months[currentMonthIndex]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-60 overflow-y-auto">
            <ScrollArea className="h-full">
              {months.map((month, index) => {
                const monthDateStart = new Date(currentYear, index, 1)
                const monthDateEnd = new Date(currentYear, index + 1, 0)
                const isBeforeFromDate = fromDate && monthDateEnd < fromDate
                const isAfterToDate = toDate && monthDateStart > toDate
                const isDisabled = isBeforeFromDate || isAfterToDate

                return (
                  <DropdownMenuItem
                    key={month}
                    onSelect={() => handleMonthChange(index)}
                    disabled={isDisabled}
                  >
                    {month}
                  </DropdownMenuItem>
                )
              })}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Year Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="w-fit font-medium focus-visible:ring-0">
              {currentYear}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-60 overflow-y-auto">
            <ScrollArea className="h-full">
              {years.map((year) => {
                const isBeforeFromYear = fromDate && year < fromDate.getFullYear()
                const isAfterToYear = toDate && year > toDate.getFullYear()
                const isDisabled = isBeforeFromYear || isAfterToYear

                return (
                  <DropdownMenuItem
                    key={year}
                    onSelect={() => handleYearChange(year)}
                    disabled={isDisabled}
                  >
                    {year}
                  </DropdownMenuItem>
                )
              })}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Standard Navigation Buttons */}
      <div className="space-x-1 flex items-center">
        <Button
          variant="outline"
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 disabled:opacity-30"
          onClick={() => previousMonth && goToMonth(previousMonth)}
          disabled={!previousMonth}
          aria-label="Go to previous month"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 disabled:opacity-30"
          onClick={() => nextMonth && goToMonth(nextMonth)}
          disabled={!nextMonth}
          aria-label="Go to next month"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md',
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-8 w-8 p-0 font-normal aria-selected:opacity-100',
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside:
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Caption: CustomCaption,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }

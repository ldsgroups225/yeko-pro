// components/DatePicker.tsx
'use client'

import type { Locale } from 'date-fns'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import fr from 'date-fns/locale/fr'

import { CalendarIcon } from 'lucide-react'
import * as React from 'react'
import { Button } from './ui/button'
import { Calendar } from './ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover'

interface DatePickerProps {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
  className?: string
  dateFormat?: string
  dateLocale?: Locale
  placeholder?: string
}

export function DatePicker({ date, onSelect, className, dateFormat = 'PPP', dateLocale = fr, placeholder = 'Choisissez une date' }: DatePickerProps) {
  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {
            date
              ? format(date, dateFormat, { locale: dateLocale })
              : <span>{placeholder}</span>
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          locale={dateLocale}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

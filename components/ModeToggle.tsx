'use client'

import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { useTheme } from 'next-themes'
import React from 'react'
import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ModeToggleProps {
  textColor?: string
}

export function ModeToggle({ textColor }: ModeToggleProps) {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <SunIcon className={cn(
            'h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 md:text-secondary',
            textColor && textColor,
          )}
          />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 md:text-secondary" />
          <span className="sr-only">Changer de thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Clair
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Sombre
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          Système
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

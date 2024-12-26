import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Component1Icon } from '@radix-ui/react-icons'
import React from 'react'

export function ClassDetailsActions() {
  return (

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label="Actions"
        >
          <Component1Icon className="mr-2 h-4 w-4" />
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Que veux-tu faire</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Ajouter un nouvel élève</DropdownMenuItem>
        <DropdownMenuItem>Voir l'emploi du temps</DropdownMenuItem>
        <DropdownMenuItem>Assigner un PP</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Désactiver la classe</DropdownMenuItem>
        <DropdownMenuItem className="bg-destructive text-destructive-foreground hover:bg-destructive/90 mt-0.5">Supprimer la classe</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

  )
}

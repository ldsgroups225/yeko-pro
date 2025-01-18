'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Download, Edit, MoreHorizontal, Trash, Upload, UserPlus2 } from 'lucide-react'
import { useState } from 'react'
import { SearchStudentToAdd } from '../SearchStudentToAdd'

interface ClassActionsProps {
  classId: string
}

export function ClassActions({ classId }: ClassActionsProps) {
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Que voulez-vous faire ?</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsAddStudentOpen(true)}>
            <UserPlus2 className="h-4 w-4 mr-2" />
            Ajouter des élèves
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Edit className="h-4 w-4 mr-2" />
            Modifier la classe
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Upload className="h-4 w-4 mr-2" />
            Importer des élèves
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Download className="h-4 w-4 mr-2" />
            Exporter les données
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            <Trash className="h-4 w-4 mr-2" />
            Supprimer la classe
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Ajouter des élèves
            </DialogTitle>
            <DialogDescription>
              Recherchez et sélectionnez un élève à ajouter à la classe.
            </DialogDescription>
          </DialogHeader>

          <SearchStudentToAdd classId={classId} onClose={() => setIsAddStudentOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

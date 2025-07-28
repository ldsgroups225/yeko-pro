'use client'
import {
  Edit,
  Loader2,
  MoreHorizontal,
  ToggleLeftIcon,
  Trash,
  UserPlus2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useClasses, useUser } from '@/hooks'
import { SearchStudentToAdd } from '../SearchStudentToAdd'

interface ClassActionsProps {
  classId: string
  studentCount: number
  classStatus: boolean
  onOpenClassEditionModal: () => void
}

export function ClassActions({
  classId,
  classStatus,
  studentCount,
  onOpenClassEditionModal,
}: ClassActionsProps) {
  const router = useRouter()
  const { user } = useUser()
  const { deleteClass, activateDeactivateClass } = useClasses()

  const [isPending, startTransition] = useTransition()

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleActivateDeactivateClass() {
    startTransition(async () => {
      try {
        await activateDeactivateClass(classId, !classStatus)
        toast.success(`La classe a été ${!classStatus ? 'activée' : 'desactivée'} avec succès.`)
      }
      catch (error) {
        console.error('Error activating/deactivating class:', error)
        toast.error(`Une erreur est survenue lors de ${!classStatus ? 'l\'activation' : 'la desactivation'} de la classe.`)
      }
    })
  }

  async function handleDeleteClass() {
    if (deleteConfirmationText !== 'supprimer cette classe') {
      toast.error('Veuillez saisir exactement "supprimer cette classe" pour confirmer.')
      return
    }

    if (studentCount) {
      toast.warning('Vous ne pouvez pas supprimer une classe avec des élèves.')
      return
    }

    try {
      setIsDeleting(true)
      await deleteClass(user!.school.id!, classId)

      router.push('/t/classes')
      setIsDeleteDialogOpen(false)
      setDeleteConfirmationText('')

      toast.success('La classe a été supprimée avec succès.')
    }
    catch (error) {
      console.error('Error deleting class:', error)
      toast.error('Une erreur est survenue lors de la suppression de la classe.')
    }
    finally {
      setIsDeleting(false)
    }
  }

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
          <DropdownMenuItem onClick={onOpenClassEditionModal}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier la classe
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleActivateDeactivateClass}>
            <>
              {
                isPending
                  ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>En cours...</span>
                      </div>
                    )
                  : (
                      <div className="flex items-center">
                        <ToggleLeftIcon className="h-4 w-4 mr-2" />
                        <span>
                          {classStatus ? 'Desactiver ' : 'Activer '}
                          {' '}
                          la classe
                        </span>
                      </div>
                    )
              }
            </>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
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

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(open)
            if (!open)
              setDeleteConfirmationText('')
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Supprimer la classe
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Pour confirmer, veuillez saisir "
              <span className="select-none font-medium">supprimer cette classe</span>
              " ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirmationText}
            onChange={e => setDeleteConfirmationText(e.target.value)}
            className="my-4"
            disabled={isDeleting}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeleteConfirmationText('')
              }}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteClass}
              disabled={deleteConfirmationText !== 'supprimer cette classe' || isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

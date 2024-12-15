import type { Id } from '@/convex/_generated/dataModel'
import type { Grade } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/convex/_generated/api'
import { useSchool } from '@/hooks'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  gradeOptions: Grade[]
}

export function ClassCreationDialog({
  open,
  onOpenChange,
  gradeOptions,
}: Props) {
  const { school } = useSchool()
  const createClass = useMutation(api.classes.createClass)
  const [className, setClassName] = useState('')
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateClass = async () => {
    if (className.trim() === '' || !selectedGradeId) {
      toast.error('Veuillez remplir tous les champs.')
      return
    }
    if (!school) {
      toast.error('École non trouvée.')
      return
    }

    setIsLoading(true)
    try {
      await createClass({
        name: className,
        schoolId: school._id,
        gradeId: selectedGradeId as Id<'grades'>,
      })
      toast.success('Classe créée avec succès!')
      setClassName('')
      setSelectedGradeId(null)
      onOpenChange(false)
    }
    catch (error) {
      console.error('Error creating class:', error)
      toast.error(
        'Une erreur est survenue lors de la création de la classe.',
      )
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une nouvelle classe</DialogTitle>
          <DialogDescription>
            Veuillez saisir le nom de la classe et sélectionner le niveau
            scolaire correspondant.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="grade-select">Niveau Scolaire</Label>
            <Select
              value={selectedGradeId ?? undefined}
              onValueChange={value => setSelectedGradeId(value)}
            >
              <SelectTrigger id="grade-select" aria-label="Select Grade">
                <SelectValue placeholder="Choisir un niveau" />
              </SelectTrigger>
              <SelectContent>
                {gradeOptions.map(grade => (
                  <SelectItem key={grade._id} value={grade._id}>
                    {grade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-name">Nom de la classe</Label>
            <Input
              id="class-name"
              placeholder="Ex: 6ème 1, 2nde C4"
              value={className}
              onChange={e => setClassName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setClassName('')
              setSelectedGradeId(null)
            }}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button onClick={handleCreateClass} disabled={isLoading}>
            {isLoading ? 'Création...' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

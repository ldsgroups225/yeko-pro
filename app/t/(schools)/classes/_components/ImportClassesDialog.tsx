import { DataImporter } from '@/components/DataImporter'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { capitalize } from '@/lib/utils'
import { createColumnHelper } from '@tanstack/react-table'
import { z } from 'zod'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const classSchema = z.object({
  name: z.string({
    required_error: 'Veuillez entrer un nom de la classe.',
  })
    .min(2, {
      message: 'Le nom de la classe doit contenir au moins 2 caractères.',
    })
    .transform(capitalize),
  gradeName: z.string({
    required_error: 'Veuillez entrer spécifier le niveau scolaire.',
  })
    .transform(capitalize),
})

type ClassSchema = z.infer<typeof classSchema>

export function ImportClassesDialog({ open, onOpenChange }: Props) {
  const columnHelper = createColumnHelper<ClassSchema>()

  const schemaOptions = {
    label: 'Classes',
    value: 'classes',
    schema: classSchema,
    columns: [
      columnHelper.accessor('name', { header: 'Nom' }),
      columnHelper.accessor('gradeName', { header: 'Niveau Scolaire' }),
    ],
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Importation des classes</DialogTitle>
          <DialogDescription>
            Vous pouvez importer des classes depuis un fichier CSV, XLSX ou JSON.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4">
          <DataImporter schemaOptions={schemaOptions as any} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { z } from 'zod'
import { DataImporter } from '@/components/DataImporter/DataImporter'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { capitalize } from '@/lib/utils'

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

export function ImportClassesDialog({ open, onOpenChange }: Props) {
  async function handleClassesImport() {}

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
          <DataImporter
            schema={classSchema}
            onDataImported={handleClassesImport}
            allowedFileTypes={['.csv', '.xlsx']}
            maxFileSize={10 * 1024 * 1024}
            previewRowCount={5}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

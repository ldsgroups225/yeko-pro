import type { ValidationError } from '@/components/DataImporter'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
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
import { bulkImportClasses } from '@/services/classService'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  gradeOptions: { label: string, value: number }[]
  schoolId: string
}

// Define the schema for the import file with user-friendly field names
const classSchema = z.object({
  name: z.string({
    required_error: 'Nom de la classe requis.',
  })
    .min(2, {
      message: 'Le nom de la classe doit contenir au moins 2 caractères.',
    })
    .transform(capitalize),
  gradeName: z.string({
    required_error: 'Nom du niveau scolaire requis.',
  })
    .min(1, {
      message: 'Le niveau scolaire ne peut pas être vide.',
    })
    .transform(capitalize),
  maxStudent: z.coerce.number({
    required_error: 'Capacité maximale requise.',
  })
    .int('La capacité maximale doit être un nombre entier')
    .min(1, {
      message: 'La capacité maximale doit être au moins 1.',
    })
    .max(200, {
      message: 'La capacité maximale ne peut pas dépasser 200.',
    }),
  series: z.string()
    .optional()
    .transform(val => val && val.trim() !== '' ? capitalize(val.trim()) : null),
})

export function ImportClassesDialog({ open, onOpenChange, schoolId, gradeOptions }: Props) {
  const [importErrors, setImportErrors] = useState<ValidationError[]>([])
  const router = useRouter()

  const getOrThrowGradeIdByGradeName = (gradeName: string) => {
    const gradeId = gradeOptions.find(grade => grade.label === gradeName)?.value
    if (!gradeId) {
      throw new Error(`Le niveau scolaire ${gradeName} n'a pas été trouvé.`)
    }
    return gradeId
  }

  const handleDataImported = async (data: z.infer<typeof classSchema>[]) => {
    if (!data || data.length === 0) {
      toast.error('Aucune donnée à importer')
      return
    }

    setImportErrors([]) // Clear previous errors

    try {
      // Transform the data to match ImportClassData interface
      const importData = data.map(item => ({
        name: item.name!,
        // gradeName: item.gradeName!,
        gradeId: getOrThrowGradeIdByGradeName(item.gradeName!),
        maxStudent: item.maxStudent,
        series: item.series,
      }))

      if (importData.some(item => !item.gradeId)) {
        throw new Error('Le niveau scolaire n\'a pas été trouvé.')
      }

      const result = await bulkImportClasses(importData, schoolId)

      // Handle mapping errors from the service
      if (result.errors.length > 0) {
        const mappingErrors = result.errors.map(error => ({
          row: error.row,
          field: 'mapping',
          message: error.error,
        }))
        setImportErrors(mappingErrors)
      }

      // Show success message
      if (result.success.length > 0) {
        toast.success(`${result.success.length} classe(s) importée(s) avec succès`)
      }

      // Show appropriate error/warning messages
      if (result.errors.length > 0) {
        if (result.success.length === 0) {
          toast.error(`Aucune classe n'a pu être importée. Vérifiez les erreurs ci-dessous.`)
        }
        else {
          toast.warning(`${result.errors.length} classe(s) ont échoué lors de l'importation`)
        }
      }

      // Close dialog and refresh page if some imports were successful
      if (result.success.length > 0) {
        // Small delay to let user see the success message
        setTimeout(() => {
          onOpenChange(false)
          router.refresh()
        }, 1500)
      }
    }
    catch (error) {
      console.error('Import error:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Une erreur inconnue est survenue lors de l\'importation.',
      )
    }
  }

  const handleError = (errorMessage: string) => {
    toast.error(errorMessage)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[800px] lg:max-w-[1000px] mx-auto">
        <DialogHeader>
          <DialogTitle>Importer des Classes</DialogTitle>
          <DialogDescription>
            Importez des classes depuis un fichier CSV ou XLSX. Téléchargez le modèle pour voir le format requis.
          </DialogDescription>
        </DialogHeader>

        <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
          <div className="font-medium mb-1">Format attendu:</div>
          <ul className="space-y-1 text-xs">
            <li>
              •
              <strong>name</strong>
              : Nom de la classe (ex: 6ème A, 2nde C1)
            </li>
            <li>
              •
              <strong>gradeName</strong>
              : Niveau scolaire (ex: 6e, 5e, 4e, 3e, 2nde, 1ère, Tle)
            </li>
            <li>
              •
              <strong>maxStudent</strong>
              : Capacité maximale (nombre entre 1 et 200)
            </li>
            <li>
              •
              <strong>series</strong>
              : Série optionnelle (ex: A, C, D - requis pour 2nde/1ère/Tle)
            </li>
          </ul>
        </div>

        <DataImporter
          schema={classSchema}
          onDataImported={handleDataImported}
          allowedFileTypes={['.csv', '.xlsx']}
          maxFileSize={5 * 1024 * 1024} // 5MB
          previewRowCount={5}
          title="Importer les Classes"
          description="Glissez/déposez ou sélectionnez un fichier CSV ou Excel."
          downloadTemplate={{
            buttonText: 'Télécharger le Modèle',
            exportName: 'template_import_classes',
          }}
          onError={handleError}
          templateHeaders={['name', 'gradeName', 'maxStudent', 'series']}
        />

        {/* Display import errors specifically */}
        {importErrors.length > 0 && (
          <div className="mt-4 max-h-40 overflow-y-auto border border-destructive/50 bg-destructive/10 p-3 rounded-md text-destructive text-sm space-y-1">
            <div className="font-medium">Erreurs d'importation:</div>
            {importErrors.map(err => (
              <div key={`${err.row}-${err.field}-${err.message}`}>
                Ligne
                {' '}
                {err.row}
                :
                {' '}
                {err.message}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

'use client'

import type { ValidationError } from '@/components/DataImporter'
import type { IGrade, ISubject } from '@/types'
import { DataImporter } from '@/components/DataImporter'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { capitalize } from '@/lib/utils'
import { importLessonsProgressReportsConfig } from '@/services/progressReportService'
import { nanoid } from 'nanoid'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

interface ImportProgressReportsDialogProps {
  isOpen: boolean
  onClose: () => void
  schoolYearId: number
  grades: IGrade[] // Pass grades for mapping
  subjects: ISubject[] // Pass subjects for mapping
}

// Define allowed series values
const seriesEnum = z.enum(['A', 'C', 'D']).nullable()

// Define the schema for the import file
const importSchema = z.object({
  // Use names for user-friendliness in the import file
  gradeName: z.string().min(1, 'Nom du niveau requis').transform(capitalize),
  subjectName: z.string().min(1, 'Nom de la matière requis').transform(capitalize),
  lessonOrder: z.coerce.number().int().positive('Ordre invalide'),
  lesson: z.string().min(3, 'Titre de leçon trop court'),
  sessionsCount: z.coerce.number().int().positive('Nombre de séances invalide'),
  startedAt: z.string().refine(val => !Number.isNaN(Date.parse(val)), { message: 'Date de début invalide (AAAA-MM-JJ)' }),
  // Optional fields from the table, if needed in import
  series: seriesEnum,
})
  .superRefine((vals, ctx) => {
    if (['2nde', '1ere', 'Tle'].includes(vals.gradeName ?? '') && !vals.series) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['series'],
        message: 'Série requise pour ce niveau',
      })
    }
  })

type ImportData = z.infer<typeof importSchema>

export function ImportProgressReportsDialog({
  isOpen,
  onClose,
  grades,
  subjects,
  schoolYearId,
}: ImportProgressReportsDialogProps) {
  const [importErrors, setImportErrors] = useState<ValidationError[]>([])
  const [_isImporting, setIsImporting] = useState(false)

  const handleDataImported = async (importedData: ImportData[]) => {
    setIsImporting(true)
    setImportErrors([]) // Clear previous errors

    // --- Data Mapping Logic ---
    const mappedData = importedData.map((row, index): { data: any | null, error?: string, originalRow: number } => {
      const grade = grades.find(g => g.name.toLowerCase() === row.gradeName?.toLowerCase())
      const subject = subjects.find(s => s.name.toLowerCase() === row.subjectName?.toLowerCase())
      // Find current school year (or allow selection if needed)

      if (!grade)
        return { data: null, error: `Niveau '${row.gradeName}' non trouvé.`, originalRow: index + 1 }
      if (!subject)
        return { data: null, error: `Matière '${row.subjectName}' non trouvée.`, originalRow: index + 1 }
      if (!schoolYearId)
        return { data: null, error: `Année scolaire active non trouvée.`, originalRow: index + 1 }

      try {
        const startDate = new Date(row.startedAt)
        if (Number.isNaN(startDate.getTime()))
          throw new Error('Invalid Date')

        return {
          data: {
            grade_id: grade.id,
            subject_id: subject.id,
            school_year_id: schoolYearId,
            lesson_order: row.lessonOrder,
            lesson: row.lesson,
            sessions_count: row.sessionsCount,
            series: row.series,
          },
          originalRow: index + 1,
        }
      }
      catch {
        return { data: null, error: `Format de date invalide pour '${row.startedAt}'. Utilisez AAAA-MM-JJ.`, originalRow: index + 1 }
      }
    })

    const validReports = mappedData.filter(item => item.data !== null).map(item => item.data!)
    const mappingErrors = mappedData
      .filter(item => item.error !== undefined)
      .map(item => ({ row: item.originalRow, field: 'mapping', message: item.error! }))

    if (mappingErrors.length > 0) {
      setImportErrors(mappingErrors)
      setIsImporting(false)
      toast.error(`Erreurs de correspondance trouvées dans ${mappingErrors.length} ligne(s).`)
      return
    }

    if (validReports.length === 0) {
      toast.info('Aucune donnée valide à importer après la correspondance.')
      setIsImporting(false)
      return
    }

    // --- Call Server Action for Import ---
    try {
      const result = await importLessonsProgressReportsConfig(validReports)

      if (result.errors.length > 0) {
        // Handle potential bulk insert errors (might be less specific)
        toast.error(`Erreur lors de l'importation: ${result.errors[0].error}`)
        // Potentially map bulk errors back to rows if possible/needed
      }
      else {
        toast.success(`${result.successCount} rapport(s) importé(s) avec succès.`)
        onClose() // Close dialog on success
      }
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur inconnue est survenue lors de l\'importation.')
    }
    finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Importer Suivis Pédagogiques</DialogTitle>
          <DialogDescription>
            Importez depuis un fichier CSV ou XLSX. Assurez-vous que les colonnes correspondent.
          </DialogDescription>
        </DialogHeader>
        <DataImporter
          schema={importSchema} // Use the import-specific schema
          onDataImported={handleDataImported}
          allowedFileTypes={['.csv', '.xlsx']}
          maxFileSize={5 * 1024 * 1024} // 5MB
          previewRowCount={5}
          title="Importer les Suivis"
          description="Glissez/déposez ou sélectionnez un fichier."
          downloadTemplate={{
            buttonText: 'Télécharger Template',
            exportName: 'suivis_pedagogiques',
          }}
          onError={errorMessage => toast.error(errorMessage)}
        />
        {/* Display mapping errors specifically */}
        {importErrors.length > 0 && (
          <div className="mt-4 max-h-40 overflow-y-auto border border-destructive/50 bg-destructive/10 p-3 rounded-md text-destructive text-sm space-y-1">
            <p className="font-medium">Erreurs de correspondance ou d'importation:</p>
            {importErrors.map(err => (
              <p key={nanoid()}>
                Ligne
                {err.row}
                :
                {err.message}
              </p>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

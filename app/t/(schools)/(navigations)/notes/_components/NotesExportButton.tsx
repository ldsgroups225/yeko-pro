'use client'

import { DownloadCloudIcon, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { getNoteLabel } from '@/constants'

export function NotesExportButton() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportAllNotes = async () => {
    setIsExporting(true)
    try {
      // Get complete notes data with all details
      const client = await import('@/lib/supabase/client').then(m => m.createClient())

      const { data: notesData, error } = await client
        .from('notes')
        .select(`
          id,
          title,
          weight,
          note_type,
          created_at,
          is_graded,
          class:classes(name),
          subject:subjects(name),
          semester:semesters(semester_name),
          note_details(
            note,
            student:students(
              id,
              first_name,
              last_name,
              id_number
            )
          )
        `)
        .order('created_at', { ascending: true })

      if (error) {
        throw new Error('Erreur lors de la récupération des données des notes')
      }

      if (!notesData || notesData.length === 0) {
        toast.info('Aucune donnée de notes à exporter')
        return
      }

      // Flatten the data structure and transform for Excel
      const flattenedData = notesData.flatMap(note =>
        note.note_details.map(detail => ({
          noteId: note.id,
          title: note.title,
          weight: note.weight,
          noteType: note.note_type,
          createdAt: note.created_at,
          isGraded: note.is_graded,
          className: note.class?.name,
          subjectName: note.subject?.name,
          semesterName: note.semester?.semester_name,
          noteValue: detail.note,
          studentId: detail.student.id,
          firstName: detail.student.first_name,
          lastName: detail.student.last_name,
          idNumber: detail.student.id_number,
        })),
      )

      // Transform data for Excel with proper French column headers
      const excelData = flattenedData.map(item => ({
        'Élève': `${item.firstName || ''} ${item.lastName || ''}`.trim(),
        'Matricule': item.idNumber || '',
        'Classe': item.className || '',
        'Matière': item.subjectName || '',
        'Semestre': item.semesterName || '',
        'Type de note': item.noteType ? getNoteLabel(item.noteType) : '',
        'Titre de la note': item.title || '',
        'Valeur': item.noteValue || '',
        'Coefficient': item.weight || '',
        'Date de création': item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : '',
        'Notée': item.isGraded ? 'Oui' : 'Non',
      }))

      // Create Excel file
      const XLSX = await import('xlsx')
      const worksheet = XLSX.utils.json_to_sheet(excelData)

      // Set column widths for better readability
      const colWidths = [
        { wch: 25 }, // Élève
        { wch: 15 }, // Matricule
        { wch: 20 }, // Classe
        { wch: 20 }, // Matière
        { wch: 15 }, // Semestre
        { wch: 20 }, // Type de note
        { wch: 30 }, // Titre de la note
        { wch: 10 }, // Valeur
        { wch: 12 }, // Coefficient
        { wch: 15 }, // Date de création
        { wch: 10 }, // Notée
      ]
      worksheet['!cols'] = colWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Notes complètes')

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0]
      const filename = `notes_completes_${currentDate}.xlsx`

      XLSX.writeFile(workbook, filename)
      toast.success('Téléchargement des notes réussi.')
    }
    catch (error) {
      console.error('Export error:', error)
      toast.error('Échec du téléchargement des notes.')
    }
    finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isExporting}
      onClick={handleExportAllNotes}
    >
      {isExporting
        ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )
        : (
            <DownloadCloudIcon className="mr-2 h-4 w-4" />
          )}
      Exporter toutes les notes
    </Button>
  )
}

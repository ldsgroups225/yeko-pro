'use client'

import { DownloadCloudIcon, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function ClassesExportButton() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportAllClasses = async () => {
    setIsExporting(true)
    try {
      // Get complete classes data with all details
      const client = await import('@/lib/supabase/client').then(m => m.createClient())

      const { data: classesData, error } = await client
        .from('classes')
        .select(`
          id,
          name,
          slug,
          max_student,
          is_active,
          created_at,
          updated_at,
          grade:grades(
            id,
            name
          ),
          school:schools(
            name,
            code
          ),
          teacher_assignments:teacher_class_assignments(
            is_main_teacher,
            teacher:users(
              first_name,
              last_name,
              email
            )
          ),
          student_school_class!inner(
            enrollment_status,
            is_active
          )
        `)
        .eq('student_school_class.enrollment_status', 'accepted')
        .eq('student_school_class.is_active', true)
        .order('grade.name', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        throw new Error('Erreur lors de la récupération des données des classes')
      }

      if (!classesData || classesData.length === 0) {
        toast.info('Aucune donnée de classes à exporter')
        return
      }

      // Transform data for Excel with proper French column headers
      const excelData = classesData.map((classItem) => {
        // Find the main teacher
        const mainTeacher = classItem.teacher_assignments?.find(ta => ta.is_main_teacher)?.teacher
        const teacherName = mainTeacher
          ? `${mainTeacher.first_name || ''} ${mainTeacher.last_name || ''}`.trim()
          : 'Non assigné'

        // Count enrolled students
        const studentCount = classItem.student_school_class?.length || 0

        return {
          'Nom de la classe': classItem.name || '',
          'Code': classItem.slug || '',
          'Niveau': classItem.grade?.name || '',
          'École': classItem.school?.name || '',
          'Code école': classItem.school?.code || '',
          'Professeur principal': teacherName,
          'Capacité maximale': classItem.max_student || 0,
          'Nombre d\'élèves': studentCount,
          'Taux de remplissage': classItem.max_student > 0
            ? `${Math.round((studentCount / classItem.max_student) * 100)}%`
            : '0%',
          'Statut': classItem.is_active ? 'Actif' : 'Inactif',
          'Date de création': classItem.created_at ? new Date(classItem.created_at).toLocaleDateString('fr-FR') : '',
          'Date de modification': classItem.updated_at ? new Date(classItem.updated_at).toLocaleDateString('fr-FR') : '',
        }
      })

      // Create Excel file
      const XLSX = await import('xlsx')
      const worksheet = XLSX.utils.json_to_sheet(excelData)

      // Set column widths for better readability
      const colWidths = [
        { wch: 20 }, // Nom de la classe
        { wch: 15 }, // Code
        { wch: 15 }, // Niveau
        { wch: 25 }, // École
        { wch: 15 }, // Code école
        { wch: 25 }, // Professeur principal
        { wch: 18 }, // Capacité maximale
        { wch: 15 }, // Nombre d'élèves
        { wch: 18 }, // Taux de remplissage
        { wch: 12 }, // Statut
        { wch: 18 }, // Date de création
        { wch: 20 }, // Date de modification
      ]
      worksheet['!cols'] = colWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Liste des classes')

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0]
      const filename = `liste_des_classes_${currentDate}.xlsx`

      XLSX.writeFile(workbook, filename)
      toast.success('Téléchargement de la liste des classes réussi.')
    }
    catch (error) {
      console.error('Export error:', error)
      toast.error('Échec du téléchargement de la liste des classes.')
    }
    finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      size="icon"
      variant="outline"
      disabled={isExporting}
      onClick={handleExportAllClasses}
      aria-label="Exporter"
    >
      {isExporting
        ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          )
        : (
            <DownloadCloudIcon className="h-4 w-4" />
          )}
    </Button>
  )
}

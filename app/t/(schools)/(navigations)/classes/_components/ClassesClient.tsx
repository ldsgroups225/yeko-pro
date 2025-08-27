'use client'

import type { IClass, IGrade } from '@/types'

import { PlusIcon } from '@radix-ui/react-icons'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { useDebouncedCallback } from 'use-debounce'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import {
  ClassCreationOrUpdateDialog,
  ClassesFilters,
  ClassesGrid,
  ClassesTable,
  ImportClassesDialog,
} from './index'

interface ClassesClientProps {
  grades: IGrade[]
  classes: IClass[]
  totalPages: number
  currentPage: number
  searchParams: {
    grade?: string
    search?: string
    active?: string
    teacher?: string
    page?: string
  }
  schoolId: string
}

export default function ClassesClient({
  grades,
  classes,
  totalPages,
  currentPage,
  searchParams,
  schoolId,
}: ClassesClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentSearchParams = useSearchParams()

  const [isTableViewMode, setIsTableViewMode] = useState(true)
  const [showClassModal, setShowClassModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [classToEdit, setClassToEdit] = useState<IClass | null>(null)
  // eslint-disable-next-line unused-imports/no-unused-vars
  const [isExporting, setIsExporting] = useState(false)

  const updateUrlParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(currentSearchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 'all') {
        params.delete(key)
      }
      else {
        params.set(key, value)
      }
    })

    // Reset to page 1 when filters change
    params.delete('page')

    const search = params.toString()
    router.push(`${pathname}${search ? `?${search}` : ''}`)
  }

  const handleGradeChange = (grade?: string) => {
    updateUrlParams({ grade })
  }

  const debouncedSearchUpdate = useDebouncedCallback((search: string) => {
    updateUrlParams({ search })
  }, 300)

  const handleSearchChange = (search: string) => {
    debouncedSearchUpdate(search)
  }

  const handleActiveChange = (active?: boolean) => {
    updateUrlParams({ active: active?.toString() })
  }

  const handleTeacherChange = (teacher?: boolean) => {
    updateUrlParams({ teacher: teacher?.toString() })
  }

  const handleClassEdit = (classData: string) => {
    const parsedClass = JSON.parse(classData)
    setClassToEdit(parsedClass)
    setShowClassModal(true)
  }

  const handleExportClasses = async () => {
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
          student_school_class!left(
            enrollment_status,
            is_active
          )
        `)
        .eq('school_id', schoolId)
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

        // Count enrolled students (only active and accepted)
        const studentCount = classItem.student_school_class?.filter(
          s => s.enrollment_status === 'accepted' && s.is_active === true,
        ).length || 0

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
    <>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Button
          variant="outline"
          aria-label="New Class"
          data-testid="new-class-btn"
          onClick={() => setShowClassModal(true)}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Nouvelle classe
        </Button>
      </div>
      <ClassesFilters
        grades={grades}
        selectedGrade={searchParams.grade}
        onGradeChange={handleGradeChange}
        searchTerm={searchParams.search || ''}
        onSearchTermChange={handleSearchChange}
        classesActiveState={searchParams.active === 'true' ? true : searchParams.active === 'false' ? false : undefined}
        onClassesActiveStateChange={handleActiveChange}
        hasMainTeacher={searchParams.teacher === 'true' ? true : searchParams.teacher === 'false' ? false : undefined}
        onHasMainTeacherChange={handleTeacherChange}
        isTableViewMode={isTableViewMode}
        onToggleViewMode={() => setIsTableViewMode(!isTableViewMode)}
        toggleViewModeTestId="toggle-view-mode-btn"
        onImportClick={() => setShowImportModal(true)}
        onExportClick={handleExportClasses}
        onArchiveClick={() => {}}
      />
      {isTableViewMode
        ? (
            <ClassesTable
              classes={classes}
              isLoading={false}
              onClassEdit={handleClassEdit}
            />
          )
        : (
            <ClassesGrid
              classes={classes}
              isLoading={false}
              onClassEdit={handleClassEdit}
            />
          )}
      <Pagination currentPage={currentPage} totalPages={totalPages} />
      {showClassModal && (
        <ClassCreationOrUpdateDialog
          open={showClassModal}
          oldClass={
            classToEdit
              ? {
                  id: classToEdit.id,
                  name: classToEdit.name,
                  gradeId: classToEdit.gradeId,
                  maxStudent: classToEdit.maxStudent,
                }
              : undefined
          }
          onOpenChange={setShowClassModal}
          gradeOptions={grades ?? []}
        />
      )}
      {showImportModal && (
        <ImportClassesDialog open={showImportModal} onOpenChange={setShowImportModal} />
      )}
    </>
  )
}

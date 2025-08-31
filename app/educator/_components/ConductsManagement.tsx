// app/educator/_components/ConductsManagement.tsx

import React from 'react'
import {
  ConductSearchAndFilter,
  EducatorConductFilterSection,
  EducatorConductStatsCards,
  EducatorIncidentModal,
  ExportConductButton,
  GenerateConductReport,
} from '.'
import { getEducatorClassesForFilter, getEducatorConductStats, getEducatorConductStudents } from '../actions'

const ITEMS_PER_PAGE = 12

interface Props {
  params?: Promise<{
    page?: number
    limit?: number
    sort?: { column: string, direction: 'asc' | 'desc' }
    searchTerm?: string
    classId?: string
    gradeFilter?: 'BLAME' | 'MAUVAISE' | 'PASSABLE' | 'BONNE' | 'TRES_BONNE'
    scoreRange?: { min: number, max: number }
  }>
}

export async function ConductsManagement({ params }: Props) {
  const resolvedParams = await (params || Promise.resolve({
    page: undefined,
    limit: undefined,
    sort: undefined,
    searchTerm: undefined,
    classId: undefined,
    gradeFilter: undefined,
    scoreRange: undefined,
  }))
  const { page, limit, sort, searchTerm, classId, gradeFilter, scoreRange } = resolvedParams

  const [st, stats, classes] = await Promise.all([
    getEducatorConductStudents({
      page: page || 1,
      limit: limit || ITEMS_PER_PAGE,
      sort: { column: sort?.column || 'lastName', direction: sort?.direction || 'asc' },
      searchTerm,
      classId,
      gradeFilter,
      scoreRange,
    }),
    getEducatorConductStats(),
    getEducatorClassesForFilter(),
  ])

  // Action handlers

  // if (error) {
  //   return (
  //     <div className="space-y-2 px-6 py-2">
  //       <Card className="bg-destructive/10">
  //         <CardContent className="p-6">
  //           <p className="text-destructive">
  //             Erreur lors du chargement des données de conduite:
  //             {' '}
  //             {error}
  //           </p>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Gestion de la Conduite
              </h1>
              <p className="text-muted-foreground mt-1">
                Suivi et évaluation du comportement des élèves
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <GenerateConductReport />

              <ExportConductButton students={st.students} />

              <EducatorConductFilterSection classes={classes} />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && <EducatorConductStatsCards stats={stats} />}

        {/* Main Content Section */}
        <ConductSearchAndFilter
          students={st.students}
          initialSearchTerm={searchTerm || ''}
          initialFilters={{
            page: page || 1,
            limit: limit || ITEMS_PER_PAGE,
            sort: { column: sort?.column || 'lastName', direction: sort?.direction || 'asc' },
            searchTerm,
            classId,
            gradeFilter,
            scoreRange,
          }}
        />
      </div>

      {/* Incident Modal */}
      <EducatorIncidentModal />
    </div>
  )
}

// app/conduct-report-template/ConductReportDisplay.tsx

import type { IConductQueryParams, IConductScore } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import { fetchConductStats, fetchConductStudents, fetchSchoolInfo } from '@/services'
import { getConductGradeColor, getConductGradeLabel } from '@/types/conduct'

interface ConductReportDisplayProps {
  classId?: string
  gradeFilter?: IConductScore['grade']
  schoolYearId?: string
  semesterId?: string
}

export default async function ConductReportDisplay({
  classId,
  gradeFilter,
  schoolYearId,
  semesterId: _semesterId,
}: ConductReportDisplayProps) {
  // Prepare query parameters
  const queryParams: IConductQueryParams = {
    limit: 1000, // Get all students for the report
    page: 1,
    classId,
    gradeFilter,
    sort: { column: 'lastName', direction: 'asc' },
  }

  try {
    // Fetch conduct data, statistics, and school information
    const { students } = await fetchConductStudents(queryParams)
    const globalStats = await fetchConductStats()
    const schoolInfo = await fetchSchoolInfo()

    const currentDate = new Date()
    const formattedDate = format(currentDate, 'dd MMMM yyyy', { locale: fr })

    // Filter description for the report
    const getFilterDescription = () => {
      const filters = []
      if (classId)
        filters.push(`Classe: ${classId}`)
      if (gradeFilter)
        filters.push(`Appréciation: ${getConductGradeLabel(gradeFilter)}`)
      return filters.length > 0 ? filters.join(', ') : 'Tous les élèves'
    }

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
        {/* Professional Header with School Branding */}
        <div className="mb-6">
          {/* Official Header */}
          <div className="text-center mb-4">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              RÉPUBLIQUE DE CÔTE D'IVOIRE
            </p>
            <p className="text-xs text-gray-600 mb-2">
              Union - Travail - Progrès
            </p>
            <hr className="border-t-2 border-orange-500 w-24 mx-auto mb-3" />
          </div>

          {/* School Information Header */}
          <div className="flex items-start justify-between mb-4">
            {/* School Logo and Name */}
            <div className="flex items-center space-x-4">
              {schoolInfo.imageUrl && (
                <div className="flex-shrink-0">
                  <Image
                    src={schoolInfo.imageUrl}
                    alt={`Logo ${schoolInfo.name}`}
                    width={80}
                    height={80}
                    className="object-contain border border-gray-200 rounded-lg p-2"
                    style={{ maxHeight: '80px', width: 'auto' }}
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800 leading-tight">
                  {schoolInfo.name.toUpperCase()}
                </h2>
                {schoolInfo.address && (
                  <p className="text-sm text-gray-600 mt-1">
                    {schoolInfo.address}
                  </p>
                )}
                <div className="flex space-x-4 mt-2 text-xs text-gray-600">
                  {schoolInfo.phone && (
                    <span>
                      Tél:
                      {schoolInfo.phone}
                    </span>
                  )}
                  {schoolInfo.email && (
                    <span>
                      Email:
                      {schoolInfo.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* School Code and Academic Year */}
            <div className="text-right flex-shrink-0 ml-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs font-medium text-orange-800">Code École</p>
                <p className="text-lg font-bold text-orange-900">{schoolInfo.code}</p>
              </div>
              <div className="mt-3 text-right">
                <p className="text-xs text-gray-600">Année Scolaire</p>
                <p className="text-sm font-semibold text-gray-800">
                  {schoolYearId || '2024-2025'}
                </p>
              </div>
            </div>
          </div>

          {/* Report Title */}
          <div className="text-center border-t border-b border-gray-300 py-3">
            <h1 className="text-lg font-bold text-gray-800 mb-1">
              RAPPORT DE CONDUITE SCOLAIRE
            </h1>
            <p className="text-xs text-gray-500">
              Généré le
              {' '}
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Report Summary */}
        <div className="mb-6">
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <h2 className="text-base font-semibold mb-3 text-gray-800">Résumé du Rapport</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>
                  <span className="font-medium">Critères de filtrage:</span>
                  {' '}
                  {getFilterDescription()}
                </p>
                <p>
                  <span className="font-medium">Nombre d'élèves:</span>
                  {' '}
                  {students.length}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-medium">Note moyenne:</span>
                  {' '}
                  {globalStats.averageScore.toFixed(2)}
                  /20
                </p>
                <p>
                  <span className="font-medium">Incidents récents:</span>
                  {' '}
                  {globalStats.recentIncidents}
                </p>
              </div>
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-sm font-semibold mb-2 text-gray-800">Répartition par Appréciation</h3>
            <div className="grid grid-cols-5 gap-1 text-xs">
              <div className="text-center">
                <div className="bg-red-100 text-red-800 p-1 rounded">
                  <div className="font-semibold">{globalStats.gradeDistribution.BLAME}</div>
                  <div>Blâme</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 text-orange-800 p-1 rounded">
                  <div className="font-semibold">{globalStats.gradeDistribution.MAUVAISE}</div>
                  <div>Mauvaise</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 text-yellow-800 p-1 rounded">
                  <div className="font-semibold">{globalStats.gradeDistribution.PASSABLE}</div>
                  <div>Passable</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 text-blue-800 p-1 rounded">
                  <div className="font-semibold">{globalStats.gradeDistribution.BONNE}</div>
                  <div>Bonne</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-green-100 text-green-800 p-1 rounded">
                  <div className="font-semibold">{globalStats.gradeDistribution.TRES_BONNE}</div>
                  <div>Très Bonne</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="mb-6">
          <h2 className="text-base font-semibold mb-3 text-gray-800">Liste des Élèves</h2>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-1 text-left">Élève</th>
                <th className="border border-gray-300 p-1 text-left">Matricule</th>
                <th className="border border-gray-300 p-1 text-left">Classe</th>
                <th className="border border-gray-300 p-1 text-center">Note</th>
                <th className="border border-gray-300 p-1 text-center">Appréciation</th>
                <th className="border border-gray-300 p-1 text-center">Assiduité</th>
                <th className="border border-gray-300 p-1 text-center">Tenue</th>
                <th className="border border-gray-300 p-1 text-center">Moralité</th>
                <th className="border border-gray-300 p-1 text-center">Discipline</th>
                <th className="border border-gray-300 p-1 text-center">Abs.</th>
                <th className="border border-gray-300 p-1 text-center">Ret.</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 p-1">
                    {student.firstName}
                    {' '}
                    {student.lastName}
                  </td>
                  <td className="border border-gray-300 p-1">{student.idNumber}</td>
                  <td className="border border-gray-300 p-1">{student.className}</td>
                  <td className="border border-gray-300 p-1 text-center font-medium">
                    {student.currentScore.totalScore.toFixed(1)}
                    /20
                  </td>
                  <td className={`border border-gray-300 p-1 text-center text-xs ${getConductGradeColor(student.currentScore.grade)}`}>
                    {getConductGradeLabel(student.currentScore.grade)}
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    {student.currentScore.attendanceScore.toFixed(1)}
                    /6
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    {student.currentScore.dresscodeScore.toFixed(1)}
                    /3
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    {student.currentScore.moralityScore.toFixed(1)}
                    /4
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    {student.currentScore.disciplineScore.toFixed(1)}
                    /7
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    {student.attendanceStats.absences}
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    {student.attendanceStats.lates}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-gray-300">
          <h3 className="text-sm font-semibold mb-2 text-gray-800">Légende</h3>
          <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
            <div>
              <p>
                <strong>Abs.</strong>
                {' '}
                = Absences injustifiées
              </p>
              <p>
                <strong>Ret.</strong>
                {' '}
                = Retards
              </p>
              <p>
                <strong>Assiduité:</strong>
                {' '}
                Ponctualité et présence (6 pts max)
              </p>
              <p>
                <strong>Tenue:</strong>
                {' '}
                Respect du règlement vestimentaire (3 pts max)
              </p>
            </div>
            <div>
              <p>
                <strong>Moralité:</strong>
                {' '}
                Intégrité et honnêteté (4 pts max)
              </p>
              <p>
                <strong>Discipline:</strong>
                {' '}
                Respect des règles et du personnel (7 pts max)
              </p>
              <p>
                <strong>Note totale:</strong>
                {' '}
                Sur 20 points selon les normes du Ministère
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-4 pt-3 border-t border-gray-300">
          <p>
            Rapport généré automatiquement par le système Yeko Pro
            <br />
            Conforme aux directives du Ministère de l'Éducation Nationale de Côte d'Ivoire
          </p>
        </div>
      </div>
    )
  }
  catch (error) {
    console.error('Error generating conduct report:', error)
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Erreur de Génération du Rapport
        </h1>
        <p className="text-gray-600">
          Impossible de charger les données du rapport de conduite.
          <br />
          Veuillez réessayer ultérieurement.
        </p>
      </div>
    )
  }
}

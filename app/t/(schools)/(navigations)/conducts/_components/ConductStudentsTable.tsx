'use client'

import type { IConductStudent } from '@/types'
import { AlertTriangle, ArrowUpDown, ChevronDown, ChevronUp, Plus, User } from 'lucide-react'
import { nanoid } from 'nanoid'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getConductGradeColor, getConductGradeLabel } from '@/types/conduct'

interface ConductStudentsTableProps {
  students: IConductStudent[]
  isLoading: boolean
  onSort: (field: string) => void
  onAddIncident: (studentId: string) => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
}

export function ConductStudentsTable({
  students,
  isLoading,
  onSort,
  onAddIncident,
  sortColumn,
  sortDirection,
}: ConductStudentsTableProps) {
  const getSortIcon = (field: string) => {
    if (sortColumn !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortDirection === 'asc'
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 16)
      return 'text-green-600'
    if (score >= 13)
      return 'text-blue-600'
    if (score >= 10)
      return 'text-yellow-600'
    if (score >= 6)
      return 'text-orange-600'
    return 'text-red-600'
  }

  const _getAttendanceColor = (rate: number) => {
    if (rate >= 95)
      return 'text-green-600'
    if (rate >= 85)
      return 'text-blue-600'
    if (rate >= 75)
      return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array.from({ length: 6 })].map(() => (
          <div key={`skeleton-${nanoid()}`} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <User className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Aucun élève trouvé
        </h3>
        <p className="text-muted-foreground">
          Aucun élève ne correspond aux critères de recherche actuels.
        </p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Mobile/Tablet Sort Controls */}
        <div className="flex flex-wrap gap-2 lg:hidden">
          <Button
            variant={sortColumn === 'lastName' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSort('lastName')}
            className="text-xs"
          >
            Nom
            {' '}
            {getSortIcon('lastName')}
          </Button>
          <Button
            variant={sortColumn === 'totalScore' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSort('totalScore')}
            className="text-xs"
          >
            Note
            {' '}
            {getSortIcon('totalScore')}
          </Button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 border-b border-slate-200/60 hover:bg-slate-50/80">
                  <TableHead className="w-12 text-xs font-medium text-slate-600">#</TableHead>
                  <TableHead className="text-xs font-medium text-slate-600">
                    <Button
                      variant="ghost"
                      onClick={() => onSort('lastName')}
                      className="h-auto p-0 font-medium hover:bg-transparent hover:text-slate-900 text-xs"
                    >
                      Élève
                      {' '}
                      {getSortIcon('lastName')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-600">Classe</TableHead>
                  <TableHead className="text-center text-xs font-medium text-slate-600">
                    <Button
                      variant="ghost"
                      onClick={() => onSort('totalScore')}
                      className="h-auto p-0 font-medium hover:bg-transparent hover:text-slate-900 text-xs"
                    >
                      Note /20
                      {' '}
                      {getSortIcon('totalScore')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center text-xs font-medium text-slate-600">Appréciation</TableHead>
                  <TableHead className="text-center text-xs font-medium text-slate-600">Détails</TableHead>
                  <TableHead className="text-center text-xs font-medium text-slate-600">Assiduité</TableHead>
                  <TableHead className="text-center text-xs font-medium text-slate-600">Incidents</TableHead>
                  <TableHead className="text-center text-xs font-medium text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => {
                  const { currentScore, attendanceStats, recentIncidents } = student
                  const gradeColor = getConductGradeColor(currentScore.grade)
                  const gradeLabel = getConductGradeLabel(currentScore.grade)

                  return (
                    <TableRow key={student.id} className="hover:bg-slate-50/60 border-b border-slate-100 group transition-colors">
                      <TableCell className="font-medium text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold group-hover:bg-slate-200 transition-colors">
                          {index + 1}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-11 w-11 ring-2 ring-white shadow-sm">
                            <AvatarImage src={student.avatarUrl} alt={`${student.firstName} ${student.lastName}`} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm">
                              {student.firstName[0]}
                              {student.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">
                              {student.firstName}
                              {' '}
                              {student.lastName}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                              {student.idNumber}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="font-medium text-xs px-3 py-1.5 bg-slate-50 border-slate-200 text-slate-700">
                          {student.className}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <span className={`text-lg font-bold ${getScoreColor(currentScore.totalScore)}`}>
                            {currentScore.totalScore.toFixed(1)}
                          </span>
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                currentScore.totalScore >= 16
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                                  : currentScore.totalScore >= 13
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                    : currentScore.totalScore >= 10
                                      ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                                      : currentScore.totalScore >= 6
                                        ? 'bg-gradient-to-r from-orange-500 to-red-600'
                                        : 'bg-gradient-to-r from-red-500 to-pink-600'
                              }`}
                              style={{ width: `${(currentScore.totalScore / 20) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge className={`${gradeColor} border-0 shadow-sm`}>
                          {gradeLabel}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="grid grid-cols-2 gap-1.5 text-xs">
                              <div className="bg-blue-100 text-blue-700 rounded-md px-2 py-1 font-medium">
                                A:
                                {' '}
                                {currentScore.attendanceScore}
                                /6
                              </div>
                              <div className="bg-emerald-100 text-emerald-700 rounded-md px-2 py-1 font-medium">
                                T:
                                {' '}
                                {currentScore.dresscodeScore}
                                /3
                              </div>
                              <div className="bg-purple-100 text-purple-700 rounded-md px-2 py-1 font-medium">
                                M:
                                {' '}
                                {currentScore.moralityScore}
                                /4
                              </div>
                              <div className="bg-red-100 text-red-700 rounded-md px-2 py-1 font-medium">
                                D:
                                {' '}
                                {currentScore.disciplineScore}
                                /7
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1 text-sm">
                              <p>
                                <strong>Assiduité:</strong>
                                {' '}
                                {currentScore.attendanceScore}
                                /6
                              </p>
                              <p>
                                <strong>Tenue:</strong>
                                {' '}
                                {currentScore.dresscodeScore}
                                /3
                              </p>
                              <p>
                                <strong>Moralité:</strong>
                                {' '}
                                {currentScore.moralityScore}
                                /4
                              </p>
                              <p>
                                <strong>Discipline:</strong>
                                {' '}
                                {currentScore.disciplineScore}
                                /7
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex flex-col items-center space-y-1">
                          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            attendanceStats.attendanceRate >= 95
                              ? 'bg-green-100 text-green-700'
                              : attendanceStats.attendanceRate >= 85
                                ? 'bg-blue-100 text-blue-700'
                                : attendanceStats.attendanceRate >= 75
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                          }`}
                          >
                            {attendanceStats.attendanceRate.toFixed(1)}
                            %
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium">
                              {attendanceStats.absences}
                              A
                            </span>
                            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded font-medium">
                              {attendanceStats.lates}
                              R
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          {recentIncidents.length > 0
                            ? (
                                <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span className="text-xs font-semibold">{recentIncidents.length}</span>
                                </div>
                              )
                            : (
                                <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                  0
                                </div>
                              )}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onAddIncident(student.id)}
                              className="h-8 w-8 p-0 rounded-full border-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Ajouter un incident
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-4">
          {students.map((student, index) => {
            const { currentScore, attendanceStats, recentIncidents } = student
            const gradeLabel = getConductGradeLabel(currentScore.grade)

            return (
              <Card key={student.id} className="border-0 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  {/* Student Info Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-14 w-14 ring-2 ring-white shadow-sm">
                          <AvatarImage src={student.avatarUrl} alt={`${student.firstName} ${student.lastName}`} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {student.firstName}
                          {' '}
                          {student.lastName}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium">{student.idNumber}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {student.className}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-1 ${getScoreColor(currentScore.totalScore)}`}>
                        {currentScore.totalScore.toFixed(1)}
                      </div>
                      <Badge className={getConductGradeColor(currentScore.grade)}>
                        {gradeLabel}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-600">Note de conduite</span>
                      <span className="text-sm text-slate-500">/20</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          currentScore.totalScore >= 16
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                            : currentScore.totalScore >= 13
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                              : currentScore.totalScore >= 10
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                                : currentScore.totalScore >= 6
                                  ? 'bg-gradient-to-r from-orange-500 to-red-600'
                                  : 'bg-gradient-to-r from-red-500 to-pink-600'
                        }`}
                        style={{ width: `${(currentScore.totalScore / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Score Details */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-bold text-blue-700">{currentScore.attendanceScore}</div>
                      <div className="text-xs text-blue-600">Assiduité</div>
                      <div className="text-xs text-slate-500">/6</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="text-sm font-bold text-emerald-700">{currentScore.dresscodeScore}</div>
                      <div className="text-xs text-emerald-600">Tenue</div>
                      <div className="text-xs text-slate-500">/3</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm font-bold text-purple-700">{currentScore.moralityScore}</div>
                      <div className="text-xs text-purple-600">Moralité</div>
                      <div className="text-xs text-slate-500">/4</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-sm font-bold text-red-700">{currentScore.disciplineScore}</div>
                      <div className="text-xs text-red-600">Discipline</div>
                      <div className="text-xs text-slate-500">/7</div>
                    </div>
                  </div>

                  {/* Bottom Stats & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className={`px-2 py-1 rounded-full font-medium ${
                        attendanceStats.attendanceRate >= 95
                          ? 'bg-green-100 text-green-700'
                          : attendanceStats.attendanceRate >= 85
                            ? 'bg-blue-100 text-blue-700'
                            : attendanceStats.attendanceRate >= 75
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                      }`}
                      >
                        {attendanceStats.attendanceRate.toFixed(1)}
                        % présence
                      </div>

                      {recentIncidents.length > 0
                        ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="font-medium">
                                {recentIncidents.length}
                                {' '}
                                incident
                                {recentIncidents.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )
                        : (
                            <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                              Aucun incident
                            </div>
                          )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddIncident(student.id)}
                      className="rounded-full px-4 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Incident
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}

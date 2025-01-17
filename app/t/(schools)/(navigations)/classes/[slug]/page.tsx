'use client'

import type { IClass, IClassDetailsStats } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useClasses, useUser } from '@/hooks'
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  MoreHorizontal,
  Trash,
  TrendingUp,
  Upload,
  UserMinus,
  Users,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Line, LineChart } from 'recharts'
import { ClassTableSkeleton, MetricsCardsSkeleton } from './_components'

export default function ClassDetailsPage() {
  const pathname = usePathname()
  const slug = useMemo(() => pathname.split('/').pop(), [pathname])

  const { user } = useUser()

  const [isLoading, setIsLoading] = useState(true)
  const [classData, setClassData] = useState<IClass | null>(null)
  const [stats, setStats] = useState<IClassDetailsStats | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const {
    students,
    getClassBySlug,
    setStudentPage,
    loadMoreStudents,
    loadClassStudents,
    studentPagination,
    currentStudentPage,
    getClassDetailsStats,
  } = useClasses()

  const getClassData = useCallback(async (slugParam: string) => {
    const classroom = await getClassBySlug(slugParam)
    if (classroom) {
      setClassData(classroom)

      if (!user)
        return

      const [classroomStats] = await Promise.all([
        getClassDetailsStats({
          classId: classroom.id,
          schoolId: user.school.id,
        }),

        loadClassStudents(user.school.id, classroom.id),
      ])

      setStats(classroomStats)
    }
  }, [])

  useEffect(() => {
    if (slug) {
      getClassData(slug)
        .catch((error) => {
          console.error('Failed to fetch class data:', error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedStudents(prev =>
      prev.length === students.length ? [] : students.map(s => s.id),
    )
  }, [students])

  const handleSelectStudent = useCallback((studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId],
    )
  }, [])

  const handlePageChange = (newPage: number) => {
    if (newPage > currentStudentPage) {
      loadMoreStudents()
    }
    setStudentPage(newPage)
  }

  const StatsCards = useMemo(() => {
    if (!stats)
      return null

    return (
      <>
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Élèves</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Garçons</span>
                <span>{stats.boyCount}</span>
              </div>
              <Progress value={(stats.boyCount / stats.totalStudents) * 100} className="bg-blue-100" />
              <div className="flex justify-between text-sm">
                <span>Filles</span>
                <span>{stats.girlCount}</span>
              </div>
              <Progress value={(stats.girlCount / stats.totalStudents) * 100} className="bg-pink-100" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Moyenne Générale</p>
                <p className="text-2xl font-bold">
                  {stats.averageGrade.toFixed(1)}
                  /20
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <Progress value={stats.averageGrade * 5} className="mb-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Plus haute:
                  {' '}
                  {Math.max(0, ...stats.performanceData.map(data => data.average))}
                </span>
                <span>
                  Plus basse:
                  {' '}
                  {
                    stats.performanceData.length > 0
                      ? Math.min(...stats.performanceData.map(data => data.average))
                      : 0
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Assiduité</p>
                <p className="text-2xl font-bold">
                  {(100 - stats.absentRate).toFixed(1)}
                  %
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Absences</span>
                <Badge variant="outline" className="bg-red-500/10">
                  {stats.absentRate}
                  %
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Retards</span>
                <Badge variant="outline" className="bg-yellow-500/10">
                  {stats.lateRate}
                  %
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Performance</p>
                <p className="text-2xl font-bold">
                  <TrendingUp className="h-6 w-6 text-green-500 inline-block mr-2" />
                  +5.2%
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-4">
              <div className="text-sm text-muted-foreground mb-2">Progression sur 3 mois</div>
              <LineChart width={200} height={60} data={stats.performanceData}>
                <Line type="monotone" dataKey="average" stroke="#8884d8" strokeWidth={2} dot={false} />
              </LineChart>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }, [stats])

  const ClassHeader = useMemo(() => (
    <div className="flex justify-between">
      <div>
        <CardTitle>
          Classe de
          {' '}
          {classData?.name}
        </CardTitle>
        <CardDescription>
          Prof. Principal:
          {' '}
          {classData?.teacher?.fullName}
        </CardDescription>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Edit className="h-4 w-4 mr-2" />
            Modifier la classe
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Upload className="h-4 w-4 mr-2" />
            Importer des élèves
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Download className="h-4 w-4 mr-2" />
            Exporter les données
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            <Trash className="h-4 w-4 mr-2" />
            Supprimer la classe
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ), [classData?.name, classData?.teacher?.fullName])

  return (
    <div className="space-y-3 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && <MetricsCardsSkeleton />}
        {!isLoading && stats && StatsCards}
      </div>

      <Card>
        <CardHeader>
          {ClassHeader}
        </CardHeader>
        <CardContent>
          {isLoading && <ClassTableSkeleton />}

          {(!isLoading && students.length === 0) && <p>Empty</p>}

          {(!isLoading && students.length !== 0) && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedStudents.length === students.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prénom</TableHead>
                  <TableHead>Moyenne</TableHead>
                  <TableHead>Rang</TableHead>
                  <TableHead>Absences</TableHead>
                  <TableHead>Retards</TableHead>
                  <TableHead>Dernière Éval.</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {
                  students.map(student => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => handleSelectStudent(student.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{student.lastName}</TableCell>
                      <TableCell>{student.firstName}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            student.gradeAverage >= 16
                              ? 'bg-green-500/10'
                              : student.gradeAverage >= 14
                                ? 'bg-blue-500/10'
                                : student.gradeAverage >= 12
                                  ? 'bg-yellow-500/10'
                                  : 'bg-red-500/10'
                          }
                        >
                          {student.gradeAverage.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {student.rank}
                          /
                          {students.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            student.absentCount > 3
                              ? 'bg-red-500/10'
                              : student.absentCount > 1
                                ? 'bg-yellow-500/10'
                                : 'bg-green-500/10'
                          }
                        >
                          {student.absentCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            student.lateCount > 2
                              ? 'bg-red-500/10'
                              : student.lateCount > 0
                                ? 'bg-yellow-500/10'
                                : 'bg-green-500/10'
                          }
                        >
                          {student.lateCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{student.lastEvaluation}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {student.teacherNotes}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir le profil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Bulletin
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Contacter parents
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <UserMinus className="h-4 w-4 mr-2" />
                              Retirer de la classe
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Affichage de
            {' '}
            {students.length}
            {' '}
            élèves sur
            {' '}
            {students.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!studentPagination.hasPreviousPage}
              onClick={() => handlePageChange(currentStudentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!studentPagination.hasNextPage}
              onClick={() => handlePageChange(currentStudentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

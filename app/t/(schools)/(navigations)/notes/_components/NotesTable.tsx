'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { NOTE_TYPE } from '@/constants/noteTypes'
import { getAverageGradesForClass, getNotesForTableView } from '@/services/noteService'
import { useNotesLoadingStore } from '@/store/notesLoadingStore'

interface StructuredNoteInfo {
  noteId: string
  title: string | null
  createdAt: string
  noteValue: number | null
  weight: number | null
}

interface StudentNotesRow {
  studentId: string
  firstName: string
  lastName: string
  participationSum: number
  notes: {
    [key: string]: StructuredNoteInfo
  }
}

interface NotesTableProps {
  searchParams: {
    classId?: string
    subjectId?: string
    semesterId?: string
    noteType?: string
    searchTerm?: string
  }
}

function getNoteTypePrefix(noteType: NOTE_TYPE): string {
  switch (noteType) {
    case NOTE_TYPE.WRITING_QUESTION:
      return 'I'
    case NOTE_TYPE.CLASS_TEST:
      return 'D'
    case NOTE_TYPE.LEVEL_TEST:
      return 'DN'
    case NOTE_TYPE.HOMEWORK:
      return 'E'
    default:
      return ''
  }
}

function sortColumnHeaders(headers: string[]): string[] {
  const prefixOrder = ['P', 'I', 'D', 'DN', 'E']
  return headers.sort((a, b) => {
    const aPrefix = a.match(/^[A-Z]+/)?.[0] || ''
    const bPrefix = b.match(/^[A-Z]+/)?.[0] || ''
    const aNum = Number.parseInt(a.replace(/^[A-Z]+/, ''), 10) || 0
    const bNum = Number.parseInt(b.replace(/^[A-Z]+/, ''), 10) || 0

    if (prefixOrder.indexOf(aPrefix) !== prefixOrder.indexOf(bPrefix)) {
      return prefixOrder.indexOf(aPrefix) - prefixOrder.indexOf(bPrefix)
    }
    return aNum - bNum
  })
}

export function NotesTable({ searchParams }: NotesTableProps) {
  const { classId, subjectId, semesterId } = searchParams
  const { isLoading: extLoading, setLoading } = useNotesLoadingStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [tableData, setTableData] = useState<StudentNotesRow[]>([])
  const [columnHeaders, setColumnHeaders] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch average grades data
  const { data: averages, isLoading: isLoadingAverages, error: averagesError } = useQuery({
    queryKey: ['averageGrades', classId, subjectId, semesterId],
    queryFn: () => getAverageGradesForClass({
      classId: classId || '',
      subjectId: subjectId || '',
      semesterId: Number.parseInt(semesterId || '0'),
    }),
    enabled: !!classId && !!subjectId && !!semesterId,
  })

  // Create a map of studentId to average grade for quick lookup
  const averagesMap = useMemo(() => {
    const map = new Map<string, { average: number | null, rank: string }>()
    if (!averages)
      return map

    averages.forEach((item) => {
      map.set(item.student_id, {
        average: item.average_grade,
        rank: item.rank ?? '-',
      })
    })
    return map
  }, [averages])

  // Determine the color based on the average
  const getAverageColor = (avg: number | null) => {
    if (avg === null)
      return 'text-muted-foreground'
    if (avg < 10)
      return 'text-destructive font-medium'
    if (avg < 12)
      return 'text-amber-500 font-medium'
    return 'text-green-600 font-medium'
  }

  useEffect(() => {
    async function fetchData() {
      if (!classId || !subjectId || !semesterId) {
        setTableData([])
        setColumnHeaders([])
        return
      }

      setIsLoading(true)
      setError(null)
      setLoading(true)

      try {
        const rawNotes = await getNotesForTableView({
          classId,
          subjectId,
          semesterId,
        })

        // Initialize data structures
        const studentNotesMap = new Map<string, StudentNotesRow>()
        const uniqueColumnHeaders = new Set<string>()

        // Group notes by type for sequencing
        const notesByType = rawNotes.reduce((acc, note) => {
          if (!acc[note.noteType]) {
            acc[note.noteType] = []
          }
          acc[note.noteType].push(note)
          return acc
        }, {} as Record<NOTE_TYPE, typeof rawNotes>)

        // Sort each group by createdAt
        Object.values(notesByType).forEach((notes) => {
          notes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        })

        // Process notes
        rawNotes.forEach((note) => {
          // Initialize student data if not exists
          if (!studentNotesMap.has(note.studentId)) {
            studentNotesMap.set(note.studentId, {
              studentId: note.studentId,
              firstName: note.firstName,
              lastName: note.lastName,
              participationSum: 0,
              notes: {},
            })
          }

          const studentData = studentNotesMap.get(note.studentId)!

          if (note.noteType === NOTE_TYPE.PARTICIPATION) {
            studentData.participationSum += note.noteValue || 0
          }
          else {
            const prefix = getNoteTypePrefix(note.noteType)
            if (prefix && (note.noteType !== NOTE_TYPE.HOMEWORK || note.isGraded)) {
              // Find the sequence number for this note type
              const typeNotes = notesByType[note.noteType]
              const index = typeNotes.findIndex(n => n.noteId === note.noteId)
              const columnKey = `${prefix}${index + 1}`

              uniqueColumnHeaders.add(columnKey)
              studentData.notes[columnKey] = {
                noteId: note.noteId,
                title: note.title,
                createdAt: note.createdAt,
                noteValue: note.noteValue,
                weight: note.weight,
              }
            }
          }
        })

        // Convert to array and sort by lastName, firstName
        const processedData = Array.from(studentNotesMap.values())
          .sort((a, b) => {
            const lastNameComp = a.lastName.localeCompare(b.lastName)
            return lastNameComp !== 0 ? lastNameComp : a.firstName.localeCompare(b.firstName)
          })

        setTableData(processedData)
        setColumnHeaders(sortColumnHeaders(Array.from(uniqueColumnHeaders)))
      }
      catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data')
      }
      finally {
        setIsLoading(false)
        setLoading(false)
      }
    }

    fetchData()
  }, [classId, subjectId, semesterId])

  useEffect(() => {
    if (!isLoadingAverages)
      setLoading(false)
  }, [isLoadingAverages])

  const filteredTableData = useMemo(() => {
    if (!searchTerm)
      return tableData

    const searchLower = searchTerm.toLowerCase()
    return tableData.filter(
      student =>
        student.firstName.toLowerCase().includes(searchLower)
        || student.lastName.toLowerCase().includes(searchLower)
        || student.studentId.toLowerCase().includes(searchLower),
    )
  }, [tableData, searchTerm])

  // Whether averages should be fetched/displayed
  const hasAverages = !!(classId && subjectId && semesterId)

  if (!classId || !subjectId || !semesterId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Veuillez sélectionner une classe, une matière et un semestre
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        {error}
      </div>
    )
  }

  // Show global skeleton while fetching table data or averages
  if (extLoading || isLoading || (hasAverages && isLoadingAverages)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Rechercher un élève..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <div className="rounded-md border relative overflow-x-auto">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Rechercher un élève..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="rounded-md border relative overflow-x-auto">
        <Table className="border-r-0">
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="w-[200px] sticky left-0 bg-background z-10">Élève</TableHead>
              <TableHead className="text-center">P</TableHead>
              {columnHeaders.map(header => (
                <TableHead key={header} className="text-center">
                  {header}
                </TableHead>
              ))}
              {hasAverages && (
                <TableHead className="sticky right-0 bg-background z-10 text-center">
                  Moyenne
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTableData.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={columnHeaders.length + 2} className="h-24 text-center">
                      Aucun résultat
                    </TableCell>
                  </TableRow>
                )
              : (
                  filteredTableData.map(student => (
                    <TableRow key={student.studentId}>
                      <TableCell className="sticky left-0 bg-background z-10">
                        {student.lastName}
                        {' '}
                        {student.firstName}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.participationSum || '-'}
                      </TableCell>
                      {columnHeaders.map((header) => {
                        const note = student.notes[header]
                        return (
                          <TableCell
                            key={`${student.studentId}-${header}`}
                            className="relative group border border-transparent hover:border-primary transition-colors duration-200 text-center"
                          >
                            {note?.noteValue?.toFixed(2) ?? '-'}
                            {note?.weight && (
                              <div className="absolute bottom-0 right-0 w-4 h-4 bg-muted text-muted-foreground rounded-full text-[10px] flex items-center justify-center font-thin opacity-0 group-hover:opacity-100 transition-opacity">
                                ×
                                {note.weight}
                              </div>
                            )}
                          </TableCell>
                        )
                      })}
                      {hasAverages && (
                        <TableCell
                          className="sticky right-0 bg-background border-l border-border text-center"
                          title={
                            averagesMap.get(student.studentId)?.average === null
                              ? 'Aucune moyenne disponible'
                              : `Moyenne: ${averagesMap.get(student.studentId)?.average?.toFixed(2) || '-'}\nRang: ${averagesMap.get(student.studentId)?.rank || 'N/A'}`
                          }
                        >
                          {isLoadingAverages
                            ? (
                                <Skeleton className="h-4 w-12 mx-auto" />
                              )
                            : averagesError
                              ? (
                                  <span className="text-xs text-destructive">Erreur</span>
                                )
                              : (
                                  <div className="flex flex-col items-center">
                                    <span className={getAverageColor(averagesMap.get(student.studentId)?.average || null)}>
                                      {averagesMap.get(student.studentId)?.average?.toFixed(2) || '-'}

                                      {averagesMap.get(student.studentId)?.rank && (
                                        <span className="text-[10px] text-muted-foreground ml-2">
                                          (
                                          {averagesMap.get(student.studentId)?.rank}
                                          )
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

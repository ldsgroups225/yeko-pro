'use client'

import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { NOTE_TYPE } from '@/constants/noteTypes'
import { getNotesForTableView } from '@/services/noteService'
import { useEffect, useMemo, useState } from 'react'

interface StructuredNoteInfo {
  noteId: string
  title: string | null
  createdAt: string
  noteValue: number | null
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
  const [searchTerm, setSearchTerm] = useState('')
  const [tableData, setTableData] = useState<StudentNotesRow[]>([])
  const [columnHeaders, setColumnHeaders] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { classId, subjectId, semesterId } = searchParams

  useEffect(() => {
    async function fetchData() {
      if (!classId || !subjectId || !semesterId) {
        setTableData([])
        setColumnHeaders([])
        return
      }

      setIsLoading(true)
      setError(null)

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
      }
    }

    fetchData()
  }, [classId, subjectId, semesterId])

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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        Chargement...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Rechercher un élève..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background">Élève</TableHead>
                <TableHead>P</TableHead>
                {columnHeaders.map(header => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTableData.length === 0
                ? (
                    <TableRow>
                      <TableCell
                        colSpan={columnHeaders.length + 2}
                        className="h-24 text-center"
                      >
                        Aucun élève trouvé
                      </TableCell>
                    </TableRow>
                  )
                : (
                    filteredTableData.map(student => (
                      <TableRow key={student.studentId}>
                        <TableCell className="sticky left-0 bg-background font-medium">
                          {student.lastName}
                          {' '}
                          {student.firstName}
                        </TableCell>
                        <TableCell>{student.participationSum || ''}</TableCell>
                        {columnHeaders.map(header => (
                          <TableCell key={header}>
                            {student.notes[header]?.noteValue ?? ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

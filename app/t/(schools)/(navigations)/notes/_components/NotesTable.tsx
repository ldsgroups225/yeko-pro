import type { NotesTableProps } from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { NOTE_OPTIONS } from '@/constants/noteTypes'
import { getNotes } from '@/services/noteService'
import { format } from 'date-fns'
import { Eye, Pencil } from 'lucide-react'

export async function NotesTable({ searchParams }: NotesTableProps) {
  const notes = await getNotes(searchParams)
  const noteTypeMap = Object.fromEntries(NOTE_OPTIONS.map(opt => [opt.value, opt.label]))

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Matière</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.map(note => (
            <TableRow key={note.id}>
              <TableCell className="font-medium">{note.title || 'Sans titre'}</TableCell>
              <TableCell>{noteTypeMap[note.note_type] || note.note_type}</TableCell>
              <TableCell>{(note.subject as any)?.name}</TableCell>
              <TableCell>{format(new Date(note.created_at || ''), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{note.total_points}</TableCell>
              <TableCell>
                <Badge
                  variant={note.is_published ? 'success' : 'secondary'}
                >
                  {note.is_published ? 'Publié' : 'Brouillon'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Voir les détails"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {notes.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Aucune note trouvée
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

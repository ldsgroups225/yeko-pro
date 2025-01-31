import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { DashboardService } from '@/services/dashboardService'
import { PublishNotesButton } from './PublishNotesButton'

export async function GradesTable() {
  const notes = await DashboardService.getNotes()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Notes à Publier</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Classe</TableHead>
              <TableHead>Nb Élèves</TableHead>
              <TableHead>Note Min</TableHead>
              <TableHead>Note Max</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Professeur</TableHead>
              <TableHead>Matière</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map(note => (
              <TableRow key={note.id}>
                <TableCell>{note.classroom}</TableCell>
                <TableCell>{note.studentCount}</TableCell>
                <TableCell>
                  {note.minNote}
                  /20
                </TableCell>
                <TableCell>
                  {note.maxNote}
                  /20
                </TableCell>
                <TableCell>{formatDate(note.createdAt)}</TableCell>
                <TableCell>{note.teacher}</TableCell>
                <TableCell>{note.subject}</TableCell>
                <TableCell className="text-right">
                  <PublishNotesButton noteId={note.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

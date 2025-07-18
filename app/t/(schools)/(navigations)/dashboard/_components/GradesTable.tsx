import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
import { getNotes } from '@/services/dashboardService'

export async function GradesTable() {
  const notes = await getNotes()

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
                  <Link href={`/t/dashboard/${note.classroom.replace(/\s+/g, '_')}/${note.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      Voir le contenu
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

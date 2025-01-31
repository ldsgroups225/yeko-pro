'use client'

import type { IGradesTableProps } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function GradesTable({ notes, onPublish }: IGradesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Notes à Publier</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Classe</TableHead>
              <TableHead>Nb Élèves</TableHead>
              <TableHead>Note Min</TableHead>
              <TableHead>Note Max</TableHead>
              <TableHead>Date Création</TableHead>
              <TableHead>Professeur</TableHead>
              <TableHead>Matière</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map(note => (
              <TableRow key={note.id}>
                <TableCell>{note.id}</TableCell>
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
                <TableCell>{note.createdAt}</TableCell>
                <TableCell>{note.teacher}</TableCell>
                <TableCell>{note.subject}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-primary/10 text-primary hover:bg-primary/20"
                    onClick={() => onPublish?.(note.id)}
                  >
                    Publier
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Affichage de 1 à
        {' '}
        {notes.length}
        {' '}
        sur 30 entrées
      </CardFooter>
    </Card>
  )
}

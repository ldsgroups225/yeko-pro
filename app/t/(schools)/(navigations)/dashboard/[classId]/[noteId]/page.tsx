import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PublishNotesButton } from '@/app/t/(schools)/(navigations)/dashboard/_components/PublishNotesButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { NOTE_OPTIONS } from '@/constants'
import { formatDate } from '@/lib/utils'
import { getNoteDetails } from '@/services/dashboardService'

interface PageProps {
  params: Promise<{
    classId: string
    noteId: string
  }>
}

export default async function NoteDetailsPage({ params }: PageProps) {
  const { noteId } = await params
  const note = await getNoteDetails(noteId)

  if (!note) {
    redirect('/dashboard')
  }

  const noteTypeLabel = NOTE_OPTIONS.find(opt => opt.value === note.noteType)?.label || note.noteType

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-secondary">Détails des Notes</h1>
          <p className="text-sm text-muted-foreground">
            {note.classroom}
            {' '}
            •
            {note.subject}
            {' '}
            •
            {noteTypeLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/t/dashboard">
            <Button variant="outline" size="sm" className="dark:text-secondary">Annuler</Button>
          </Link>
          <PublishNotesButton noteId={noteId} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              <div className="flex items-center justify-between">
                <span>Informations</span>
                <Badge variant={note.status === 'Publié' ? 'default' : 'secondary'}>
                  {note.status}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Professeur:</span>
              <p>{note.teacher}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span>
              <p>{formatDate(note.createdAt)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Noté sur:</span>
              <p>{note.totalPoints}</p>
            </div>
            {note.weight && (
              <div>
                <span className="text-muted-foreground">Coefficient:</span>
                <p>{note.weight}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Élèves</span>
                <p className="text-xl font-semibold">{note.studentCount}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Min</span>
                <p className="text-xl font-semibold">
                  {note.minNote}
                  /20
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Max</span>
                <p className="text-xl font-semibold">
                  {note.maxNote}
                  /20
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Moy</span>
                <p className="text-xl font-semibold text-primary">
                  {note.studentCount > 0 ? (note.details.reduce((acc, detail) => acc + (detail.note || 0), 0) / note.studentCount).toFixed(2) : '0.00'}
                  /20
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Liste des Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea
            className="h-[43vh] relative rounded-md border"
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead className="bg-background">Nom & Prénom</TableHead>
                  <TableHead className="bg-background text-right">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {note.details.map(detail => (
                  <TableRow key={detail.studentId}>
                    <TableCell>
                      {detail.studentLastName}
                      {' '}
                      {detail.studentFirstName}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {detail.note !== null ? `${detail.note}/20` : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

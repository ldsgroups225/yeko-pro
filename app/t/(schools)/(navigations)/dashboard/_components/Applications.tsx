// app/t/(schools)/(navigations)/dashboard/_components/Applications.tsx
'use client'

import type { IApplicationsProps, ICandidature } from '@/types'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatTimePassed } from '@/lib/utils'
import { getClassesByGrade, handleCandidature } from '@/services/dashboardService'

type TAction = 'accept' | 'reject'

interface ApplicationActionPayload {
  application: ICandidature
  action: TAction
  classId?: string
}

interface StudentClassSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  student: ICandidature
  onConfirm: (classId: string) => Promise<void>
}

function StudentClassSelectionDialog({
  isOpen,
  onClose,
  student,
  onConfirm,
}: StudentClassSelectionDialogProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [classes, setClasses] = useState<Array<{ id: string, name: string, remainingSeats: number }>>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && student.grade) {
      const loadClasses = async () => {
        try {
          const availableClasses = await getClassesByGrade(student.grade!)
          setClasses(availableClasses)
        }
        catch (error) {
          console.error('Error loading classes:', error)
          toast.error('Erreur lors du chargement des classes')
        }
      }
      loadClasses()
    }
  }, [isOpen, student.grade])

  const handleConfirm = async () => {
    if (!selectedClassId)
      return
    setIsLoading(true)
    try {
      await onConfirm(selectedClassId)
      onClose()
    }
    catch (error) {
      console.error('Error assigning class:', error)
      toast.error('Erreur lors de l\'attribution de la classe')
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Choisir une classe pour
            {' '}
            {student.name}
          </DialogTitle>
          <DialogDescription>
            Veuillez choisir une classe pour l&apos;élève.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une classe" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id} className="flex justify-between w-full">
                  <span>{c.name}</span>
                  <span className="ml-4 text-xs text-muted-foreground">
                    {c.remainingSeats > 1 ? `(${c.remainingSeats} places restantes)` : '(Dernière place)'}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedClassId || isLoading}
            >
              Confirmer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function Applications({ applications }: IApplicationsProps) {
  const [pendingRemovals, setPendingRemovals] = useState<string[]>([])
  const [isUpdating, startTransition] = useTransition()
  const [selectedStudent, setSelectedStudent] = useState<ICandidature | null>(null)

  const optimisticSubmitAction = async (payload: ApplicationActionPayload) => {
    startTransition(async () => {
      try {
        await handleCandidature(
          payload.application.candidateId,
          payload.application.type,
          payload.action,
          payload.classId,
        )
        toast.success('Candidature mise à jour')
      }
      catch (error) {
        toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'action sur la candidature.')
        setPendingRemovals(prev => prev.filter(id => id !== payload.application.candidateId))
      }
    })
  }

  const submitAction = async (payload: ApplicationActionPayload) => {
    setPendingRemovals(prev => [...prev, payload.application.candidateId])
    await optimisticSubmitAction(payload).catch(() => {
      setPendingRemovals(prev => prev.filter(id => id !== payload.application.candidateId))
    })
  }

  const handleClassSelection = async (classId: string) => {
    if (!selectedStudent)
      return
    await submitAction({
      application: selectedStudent,
      action: 'accept',
      classId,
    })
    setSelectedStudent(null)
  }

  const accept = async (application: ICandidature) => {
    if (application.type === 'student') {
      setSelectedStudent(application)
    }
    else {
      await submitAction({ application, action: 'accept' })
    }
  }

  const reject = async (application: ICandidature) => {
    await submitAction({ application, action: 'reject' })
  }

  const displayedApplications = applications.filter(
    app => !pendingRemovals.includes(app.candidateId),
  )

  return (
    <>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Récentes Candidatures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayedApplications.map(application => (
              <div
                key={application.candidateId}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                    {formatTimePassed(new Date(application.time))}
                  </div>
                  <div>
                    <div className="font-medium">{application.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {application.type === 'student' ? 'Élève' : 'Professeur'}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUpdating || pendingRemovals.includes(application.candidateId)}
                    onClick={() => accept(application)}
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  >
                    Accepter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUpdating || pendingRemovals.includes(application.candidateId)}
                    onClick={() => reject(application)}
                    className="bg-destructive/10 text-destructive hover:bg-destructive/20"
                  >
                    Rejeter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {selectedStudent && (
        <StudentClassSelectionDialog
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
          onConfirm={handleClassSelection}
        />
      )}
    </>
  )
}

export default Applications

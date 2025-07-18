'use client'

import type { ClassDetailsStudent } from '@/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSchoolYear } from '@/hooks'

interface ReportCardSemesterDialogProps {
  student: ClassDetailsStudent
  isOpen: boolean
  onClose: () => void
}

export function ReportCardSemesterDialog({ student, isOpen, onClose }: ReportCardSemesterDialogProps) {
  const { semesters, activeSemester } = useSchoolYear()
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(activeSemester?.id.toString() ?? '')

  const handleGenerateReportCard = () => {
    if (!student.idNumber) {
      toast.error('Matricule de l\'élève non disponible.')
      return
    }
    if (!selectedSemesterId) {
      toast.error('Veuillez sélectionner un semestre.')
      return
    }

    const reportUrl = `/api/generate-report-pdf/${student.idNumber}?semesterId=${selectedSemesterId}`

    window.open(reportUrl, '_blank')
    toast.info('Génération du bulletin en cours dans un nouvel onglet...')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Générer le bulletin de
            {' '}
            {student.firstName}
            {' '}
            {student.lastName}
          </DialogTitle>
          <DialogDescription>
            Veuillez sélectionner le semestre pour lequel vous souhaitez générer le bulletin.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un semestre" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map(semester => (
                <SelectItem key={semester.id} value={semester.id.toString()}>
                  {semester.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={handleGenerateReportCard} disabled={!selectedSemesterId}>Générer</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

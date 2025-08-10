'use client'

import type { ClassDetailsStudent } from '@/types'
import type { StudentFormValues } from '@/validations'
import { Edit, Eye, FileText, Mail, MoreHorizontal, UserMinus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { StudentAvatar } from '@/app/t/(schools)/(navigations)/students/[idNumber]/components/StudentHeader/StudentAvatar'
import { PersonalInfo } from '@/app/t/(schools)/(navigations)/students/[idNumber]/components/Tabs/ProfileTab/PersonalInfo'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useStudentStore } from '@/store'
import { EditStudentForm } from './EditStudentForm'
import { ParentContactDialog } from './ParentContactDialog'

interface StudentActionsProps {
  student: ClassDetailsStudent & { classId: string }
}

export function StudentActions({ student }: StudentActionsProps) {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showParentContactModal, setShowParentContactModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { updateStudent, error } = useStudentStore()

  // Convert ClassDetailsStudent to Student type expected by PersonalInfo
  const studentData = {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    idNumber: student.idNumber,
    isGouvernentAffected: student.isGouvernentAffected,
    isOrphan: student.isOrphan,
    hasSubscribedTransportationService: student.hasSubscribedTransportationService,
    hasSubscribedCanteenService: student.hasSubscribedCanteenService,
    gender: student.gender,
    medicalCondition: [],
    dateOfBirth: student.birthDate ?? undefined,
    avatarUrl: student.avatarUrl ?? '/user_placeholder.png',
    address: student.address ?? undefined,
    classroom: { id: student.classId ?? '', name: student.className ?? 'Non defini' },
    parent: undefined,
    classId: undefined,
    parentId: undefined,
    dateJoined: student.dateJoined ?? undefined,
    createdBy: undefined,
    updatedAt: undefined,
    updatedBy: undefined,
  }

  const handleEditSubmit = async (val: StudentFormValues) => {
    setIsSubmitting(true)

    try {
      const secondParent = val.secondParent?.fullName
        ? {
            id: '',
            fullName: val.secondParent.fullName!,
            phone: val.secondParent.phone!,
            gender: val.secondParent.gender!,
            type: val.secondParent.type!,
          }
        : undefined

      await updateStudent({
        id: val.id,
        idNumber: val.idNumber,
        gender: val.gender,
        address: val.address,
        lastName: val.lastName,
        firstName: val.firstName,
        avatarUrl: val.avatarUrl,
        dateOfBirth: val.dateOfBirth?.toISOString(),
        secondParent,
      },
      )

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Profil mis à jour avec succès')
      setShowEditModal(false)
    }
    catch (error) {
      console.error('Failed to update student:', error)
      toast.error('Erreur lors de la mise à jour du profil')
    }
    finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCancel = () => {
    setShowEditModal(false)
  }

  const handleGenerateReportCard = () => {
    if (!student.idNumber) {
      toast.error('Matricule de l\'élève non disponible.')
      return
    }

    // const semesterId = "current"; // Or get this from a selector
    const reportUrl = `/api/generate-report-pdf/${student.idNumber}` // ?semesterId=${semesterId}

    // Open the URL in a new blank page/tab
    window.open(reportUrl, '_blank')

    // Optional: provide user feedback that the action was initiated.
    toast.info('Ouverture du bulletin dans un nouvel onglet...')
  }

  return (
    <>
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="gap-6">
            <div className="flex items-center gap-6">
              <StudentAvatar student={studentData} size="lg" />
              <DialogTitle className="text-2xl">
                {student.firstName}
                {' '}
                {student.lastName}
              </DialogTitle>
            </div>
          </DialogHeader>
          <PersonalInfo student={studentData} />
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
            <DialogDescription>
              Modifier les informations de l&apos;élève. Cliquez sur enregistrer une fois terminé.
            </DialogDescription>
          </DialogHeader>
          <EditStudentForm
            studentIdNumber={student.idNumber}
            onSubmit={handleEditSubmit}
            onCancel={handleEditCancel}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <ParentContactDialog
        isOpen={showParentContactModal}
        onClose={() => setShowParentContactModal(false)}
        parent={student.parent}
        studentName={`${student.firstName} ${student.lastName}`}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Voir le profil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditModal(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleGenerateReportCard}>
            <FileText className="h-4 w-4 mr-2" />
            Bulletin
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowParentContactModal(true)}
            disabled={!student.parent}
          >
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
    </>
  )
}

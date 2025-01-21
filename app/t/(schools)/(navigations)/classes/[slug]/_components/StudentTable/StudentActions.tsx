'use client'

import type { ClassDetailsStudent } from '@/types'
import type { StudentFormValues } from '@/validations'
import { StudentAvatar } from '@/app/t/(schools)/(navigations)/students/[idNumber]/components/StudentHeader/StudentAvatar'
import { PersonalInfo } from '@/app/t/(schools)/(navigations)/students/[idNumber]/components/Tabs/ProfileTab/PersonalInfo'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useStudentStore } from '@/store'
import { Edit, Eye, FileText, Mail, MoreHorizontal, UserMinus } from 'lucide-react'

import { useState } from 'react'
import { toast } from 'sonner'
import { EditStudentForm } from './EditStudentForm'

interface StudentActionsProps {
  student: ClassDetailsStudent & { classId: string }
}

export function StudentActions({ student }: StudentActionsProps) {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { updateStudent, error } = useStudentStore()

  // Convert ClassDetailsStudent to Student type expected by PersonalInfo
  const studentData = {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    idNumber: student.idNumber,
    gender: 'M' as const, // Default to 'M' since it's required
    dateOfBirth: undefined,
    avatarUrl: undefined, // Changed to undefined to match Student type
    address: undefined,
    classroom: undefined,
    parent: undefined,
    classId: undefined,
    parentId: undefined,
    createdAt: undefined,
    createdBy: undefined,
    updatedAt: undefined,
    updatedBy: undefined,
  }

  const handleEditSubmit = async (_values: StudentFormValues) => {
    setIsSubmitting(true)

    try {
      await updateStudent({
        id: _values.id,
        gender: _values.gender,
        address: _values.address,
        lastName: _values.lastName,
        firstName: _values.firstName,
        avatarUrl: _values.avatarUrl,
        dateOfBirth: _values.dateOfBirth?.toISOString(),
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
          <DropdownMenuItem>
            <FileText className="h-4 w-4 mr-2" />
            Bulletin
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
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

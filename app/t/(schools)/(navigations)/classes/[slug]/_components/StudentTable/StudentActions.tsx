'use client'

import type { ClassDetailsStudent } from '@/types'
import { StudentAvatar } from '@/app/t/(schools)/(navigations)/students/[idNumber]/components/StudentHeader/StudentAvatar'

import { PersonalInfo } from '@/app/t/(schools)/(navigations)/students/[idNumber]/components/Tabs/ProfileTab/PersonalInfo'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Edit, Eye, FileText, Mail, MoreHorizontal, UserMinus } from 'lucide-react'
import { useState } from 'react'

interface StudentActionsProps {
  student: ClassDetailsStudent
}

export function StudentActions({ student }: StudentActionsProps) {
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Convert ClassDetailsStudent to Student type expected by PersonalInfo
  const studentData = {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    idNumber: student.idNumber,
    gender: 'M' as const, // Default to 'M' since it's required
    dateOfBirth: undefined,
    avatarUrl: undefined,
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
          <DropdownMenuItem>
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

// pages/teachers/page.tsx
'use client'

import type { ITeacherDTO, ITeacherQueryParams } from '@/types'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUser } from '@/hooks'
import { useTeachersData } from '@/hooks/useTeachersData'
import { Link1Icon, MixerVerticalIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { toast } from 'sonner'
import { InviteTeacherModal, TeacherFilterSection, TeachersFilters, TeachersTable } from './_components'

const ITEMS_PER_PAGE = 12

const defaultQueryParams: ITeacherQueryParams = {
  searchTerm: undefined,
  selectedClasses: undefined,
  selectedSubjects: undefined,
  status: undefined,
  schoolId: undefined,
  page: 1,
  sort: undefined,
}

export default function TeachersPage() {
  const [isTableViewMode, setIsTableViewMode] = useState(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false)
  const { user } = useUser()

  const {
    error,
    status,
    loadMore,
    teachers,
    pagination,
    currentPage,
    setCurrentPage,
    updateTeacherStatus,
  } = useTeachersData({
    initialItemsPerPage: ITEMS_PER_PAGE,
    filters: {
      ...defaultQueryParams,
      searchTerm: searchTerm || undefined,
    },
  })

  const handlePageChange = (newPage: number) => {
    if (newPage > currentPage) {
      loadMore()
    }
    setCurrentPage(newPage)
  }

  const handleSort = (field: string) => {
    console.log(field)
    // Implement sorting logic
  }

  const handleStatusChange = async (teacherId: string, status: 'pending' | 'accepted' | 'rejected') => {
    try {
      await updateTeacherStatus(teacherId, status)
      toast.success('Statut mis à jour avec succès')
    }
    catch {
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const handleOpenInviteModal = () => {
    setIsInviteModalOpen(true)
  }

  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false)
  }

  if (status === 'error') {
    return (
      <div className="p-6">
        <Card className="bg-destructive/10">
          <CardContent className="p-6">
            <p className="text-destructive">
              Error loading teachers:
              {' '}
              {error}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-2 px-6 py-2">
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Liste des enseignants</CardTitle>

          <div className="flex items-center space-x-2">
            <Button variant="outline" aria-label="Invite Teacher" onClick={handleOpenInviteModal}>
              <Link1Icon className="mr-2 h-4 w-4" />
              Inviter un enseignant
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" aria-label="Filter">
                  <MixerVerticalIcon className="mr-2 h-4 w-4" />
                  Filtrer
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto">
                <TeacherFilterSection
                  onStatusChange={(status) => {
                    // Implement status filter
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-3">
          <TeachersFilters
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            isTableViewMode={isTableViewMode}
            onToggleViewMode={() => setIsTableViewMode(!isTableViewMode)}
          />

          {isTableViewMode
            ? (
                <TeachersTable
                  teachers={teachers}
                  isLoading={status === 'idle' || status === 'loading'}
                  onSort={handleSort}
                  onStatusChange={handleStatusChange}
                />
              )
            : (
                <pre className="mt-4 bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(teachers, null, 2)}
                </pre>
              )}

          {pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <InviteTeacherModal
        schoolId={user!.school!.id}
        isOpen={isInviteModalOpen}
        onClose={handleCloseInviteModal}
      />
    </div>
  )
}

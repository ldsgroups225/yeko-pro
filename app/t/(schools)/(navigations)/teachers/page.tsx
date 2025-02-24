'use client'

import type { ITeacherQueryParams } from '@/types'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUser } from '@/hooks'
import { useTeachersData } from '@/hooks/useTeachersData'
import { Link1Icon, MixerVerticalIcon } from '@radix-ui/react-icons'
import consola from 'consola'
import { useState } from 'react'
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
    consola.log(field)
    // Implement sorting logic
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
                    consola.log(status)
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

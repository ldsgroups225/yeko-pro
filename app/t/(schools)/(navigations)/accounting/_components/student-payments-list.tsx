'use client'

import React from 'react'
import { useAccountingData } from '@/hooks/useAccountingData'
import { StudentPaymentsTable } from './student-payments-table'

interface StudentPaymentsListProps {
  status?: 'paid' | 'overdue'
  searchTerm?: string
}

export function StudentPaymentsList({ status, searchTerm }: StudentPaymentsListProps) {
  const {
    students,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    setFilters,
  } = useAccountingData({
    filters: {
      status,
      searchTerm,
    },
  })

  // Update filters when props change
  React.useEffect(() => {
    setFilters({
      status,
      searchTerm,
    })
  }, [status, searchTerm, setFilters])

  if (error) {
    return (
      <div className="flex items-center justify-center h-32 text-center text-red-500">
        Erreur:
        {' '}
        {error}
      </div>
    )
  }

  return (
    <StudentPaymentsTable
      students={students}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={loadMore}
    />
  )
}

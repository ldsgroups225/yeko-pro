import type { Metadata } from 'next'
import { Suspense } from 'react'
import {
  ActionButtons,
  CollectionRateChart,
  FinancialStatistics,
  NewPaymentDialog,
  // RevenueVsCostChart,
  StudentPaymentsFilters,
  StudentPaymentsList,
  StudentPaymentsListSkeleton,
  TransactionsHistory,
} from './_components'

export const metadata: Metadata = {
  title: 'Yeko | Comptabilité',
  description: 'Gestion des paiements et des statistiques financières de votre école',
}

interface AccountingPageProps {
  searchParams?: Promise<{
    status?: 'paid' | 'overdue'
    search?: string
  }>
}

export default async function AccountingPage({ searchParams }: AccountingPageProps) {
  const params = await searchParams
  const status = params?.status
  const searchTerm = params?.search

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight dark:text-black/80">Comptabilité</h1>
        <ActionButtons />
      </div>
      <Suspense fallback={<div>Chargement des statistiques...</div>}>
        <FinancialStatistics />
      </Suspense>
      <div className="grid grid-cols-5 gap-6">
        <section className="col-span-2 grid gap-6">
          {/* <RevenueVsCostChart /> */}
          <CollectionRateChart />
          <NewPaymentDialog />
          <TransactionsHistory />
        </section>
        <section className="col-span-3">
          <StudentPaymentsFilters />
          <div className="mt-4">
            <Suspense fallback={<StudentPaymentsListSkeleton />}>
              <StudentPaymentsList status={status} searchTerm={searchTerm} />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  )
}

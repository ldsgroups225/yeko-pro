import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ActionButtons, CollectionRateChart, FinancialStatistics, NewPaymentDialog, RevenueVsCostChart, TransactionsHistory } from './_components'

export const metadata: Metadata = {
  title: 'Yeko | Comptabilité',
  description: 'Gestion des paiements et des statistiques financières de votre école',
}

export default function AccountingPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight dark:text-black/80">Comptabilité</h1>
        <ActionButtons />
      </div>
      <Suspense fallback={<div>Chargement des statistiques...</div>}>
        <FinancialStatistics />
      </Suspense>
      <div className="grid grid-cols-2 gap-6">
        <RevenueVsCostChart />
        <CollectionRateChart />
        <NewPaymentDialog />
        <TransactionsHistory />
      </div>
    </div>
  )
}

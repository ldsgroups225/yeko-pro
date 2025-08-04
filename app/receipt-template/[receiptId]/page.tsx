// app/receipt-template/[receiptId]/page.tsx

import { notFound } from 'next/navigation'
import { getReceiptDataForPayment } from '@/app/payments/actions'
import ReceiptDisplay from '@/app/receipt/ReceiptDisplay'

interface ReceiptTemplatePageProps {
  params: Promise<{
    receiptId: string
  }>
}

export default async function ReceiptTemplatePage({ params }: ReceiptTemplatePageProps) {
  const { receiptId } = await params

  if (!receiptId) {
    notFound()
  }

  const receiptData = await getReceiptDataForPayment(receiptId)

  if (!receiptData) {
    console.error(`ReceiptTemplatePage: No receipt data found for ID ${receiptId}`)
    return (
      <div>
        Impossible de charger les données du reçu pour l'ID
        {' '}
        {receiptId}
        .
      </div>
    )
  }

  return (
    <main>
      <ReceiptDisplay data={receiptData} />
    </main>
  )
}

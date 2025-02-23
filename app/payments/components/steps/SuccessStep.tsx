'use client'

import type { ISchool, IStudent } from '../../page'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface SuccessStepProps {
  student: IStudent
  school: ISchool
  paymentId: string
  amount: number
  onComplete: () => void
}

export function SuccessStep({
  student,
  school,
  paymentId,
  amount,
  onComplete,
}: SuccessStepProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)

  useEffect(() => {
    const generateReceipt = async () => {
      try {
        const supabase = createClient()

        // First, wait for the receipt to be generated
        const { data: receipt, error: receiptError } = await supabase
          .from('receipts')
          .select('pdf_url')
          .eq('payment_id', paymentId)
          .single()

        if (receiptError)
          throw receiptError

        if (receipt?.pdf_url) {
          setReceiptUrl(receipt.pdf_url)
          toast.success('Reçu généré avec succès')
        }

        // Get parent email if available
        const { data: parent, error: parentError } = await supabase
          .from('users')
          .select('email')
          .eq('id', student.parentId)
          .single()

        if (!parentError && parent?.email) {
          // Send email with receipt
          await fetch('/api/send-receipt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: parent.email,
              receiptUrl: receipt?.pdf_url,
              studentName: `${student.firstName} ${student.lastName}`,
              amount,
              schoolName: school.name,
            }),
          })
          toast.success('Reçu envoyé par email')
        }
      }
      catch (error) {
        console.error('Error generating receipt:', error)
        toast.error('Erreur lors de la génération du reçu')
      }
      finally {
        setIsLoading(false)
      }
    }

    generateReceipt()
  }, [paymentId, student, school, amount])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement réussi!
          </h3>
          <p className="text-gray-600">
            Le paiement a été traité avec succès et votre reçu est en cours de génération.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-700">Montant payé:</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                }).format(amount)}
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-700">Référence du paiement:</p>
              <p className="text-gray-600">{paymentId}</p>
            </div>
          </div>
        </div>

        {isLoading
          ? (
              <div className="mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Génération du reçu en cours...</p>
              </div>
            )
          : receiptUrl
            ? (
                <div className="mt-6 space-y-4">
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Télécharger le reçu
                  </a>
                </div>
              )
            : null}

        <motion.button
          onClick={onComplete}
          className="mt-8 px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Retour à l'accueil
        </motion.button>
      </div>
    </motion.div>
  )
}

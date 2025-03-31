'use client'

import type { IStudent } from '../../types'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const paymentSchema = z.object({
  phoneNumber: z.string()
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 chiffres')
    .max(15, 'Le numéro de téléphone ne doit pas dépasser 15 chiffres')
    .regex(/^\d+$/, 'Le numéro de téléphone doit contenir uniquement des chiffres'),
  agreeToTerms: z.boolean()
    .refine(val => val === true, {
      message: 'Vous devez accepter les conditions de paiement',
    }),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface PaymentDetailsStepProps {
  student: IStudent
  tuitionAmount: number
  onComplete: (paymentDetails: { phoneNumber: string }) => void
  onBack: () => void
}

export function PaymentDetailsStep({
  student: _student, // Renamed to _student since it's not used yet
  tuitionAmount,
  onComplete,
  onBack,
}: PaymentDetailsStepProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  })

  const onSubmit = (data: PaymentFormData) => {
    setIsLoading(true)
    try {
      // Proceed with payment details
      onComplete({
        phoneNumber: data.phoneNumber,
      })
    }
    catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Détails du paiement</h3>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Montant à payer:</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
            }).format(tuitionAmount)}
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-medium mb-2">Méthode de paiement</h4>
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="font-medium text-orange-700">Mobile Money</p>
            <p className="text-sm text-orange-600">
              Le paiement sera traité via votre compte Mobile Money
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Numéro de téléphone Mobile Money
            </label>
            <input
              type="tel"
              id="phoneNumber"
              {...register('phoneNumber')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: 0123456789"
              disabled={isLoading}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="pt-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                {...register('agreeToTerms')}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-600">
                Je confirme que les informations fournies sont correctes et j'autorise
                le prélèvement du montant indiqué sur mon compte Mobile Money
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
            )}
          </div>

          <div className="flex justify-between pt-6">
            <motion.button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Retour
            </motion.button>
            <motion.button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? 'Traitement...' : 'Procéder au paiement'}
            </motion.button>
          </div>
        </form>
      </div>

      <div className="text-sm text-gray-500">
        <p>Note:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Assurez-vous que le numéro fourni est bien celui de votre compte Mobile Money</li>
          <li>Vous recevrez un SMS pour confirmer la transaction</li>
          <li>Le montant sera débité uniquement après votre confirmation</li>
        </ul>
      </div>
    </motion.div>
  )
}

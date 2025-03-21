'use client'

import type { ISchool, IStudent } from '../types'
import { Button } from '@/components/ui/button'
import { INSCRIPTION_AMOUNT } from '@/constants'
import { cn } from '@/lib/utils'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { ConfirmationStep } from './steps/ConfirmationStep'
import { GradeSelectionStep } from './steps/GradeSelectionStep'
import { PaymentStep } from './steps/PaymentStep'
import { SearchStep } from './steps/SearchStep'
import { VerificationStep } from './steps/VerificationStep'

interface Step {
  title: string
  description: string
}

interface PaymentStepperProps {
  steps: Step[]
}

interface GradeDTO {
  id: number
  name: string
}

export function PaymentStepper({ steps }: PaymentStepperProps) {
  const buttonSubmitRef = useRef<HTMLButtonElement | null>(null)
  const buttonCancelRef = useRef<HTMLButtonElement | null>(null)

  const [currentStep, setCurrentStep] = useState(0)
  const [student, setStudent] = useState<IStudent | null>(null)
  const [school, setSchool] = useState<ISchool | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<{ id: number, name: string } | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<{
    method: string
    phoneNumber: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmation, setConfirmation] = useState<{
    amount: number
    reference: string
    gradeName: string
    timestamp: string
    schoolName: string
    studentName: string
    phoneNumber: string
    paymentMethod: string
    isGovernmentAffected?: boolean
  } | null>(null)

  const mockPaymentMethods = [
    { id: 'orange', name: 'Orange Money', operatorName: 'Orange CI' },
    { id: 'mtn', name: 'MTN Mobile Money', operatorName: 'MTN CI' },
    { id: 'moov', name: 'Moov Money', operatorName: 'Moov Africa' },
    { id: 'wave', name: 'Wave', operatorName: 'Wave Mobile Money' },
  ]

  const handleSearch = (foundStudent: IStudent | null, foundSchool: ISchool) => {
    setStudent(foundStudent)
    setSchool(foundSchool)
    if (foundSchool) {
      setCurrentStep(1) // Passer à l'étape de vérification
    }
  }

  const handleVerify = (verified: boolean) => {
    if (verified) {
      setCurrentStep(2)
    }
    else {
      setCurrentStep(0)
      setStudent(null)
      setSchool(null)
    }
  }

  const handleGradeSelect = (grade: GradeDTO) => {
    setSelectedGrade(grade)
    setCurrentStep(3)
  }

  const handlePayment = async (data: { method: string, phoneNumber: string }) => {
    setIsLoading(true)
    setPaymentDetails(data)
    // Simulate payment processing
    setTimeout(() => {
      const paymentMethod = mockPaymentMethods.find(pm => pm.id === data.method)

      setConfirmation({
        reference: `PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        amount: INSCRIPTION_AMOUNT,
        studentName: `${student?.firstName} ${student?.lastName}`,
        gradeName: selectedGrade?.name || '',
        schoolName: school?.name || '',
        paymentMethod: paymentMethod?.name || '',
        phoneNumber: data.phoneNumber,
        timestamp: new Date().toISOString(),
      })
      setIsLoading(false)
      setCurrentStep(4)
    }, 2000)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <SearchStep onSearch={handleSearch} />
      case 1:
        return (
          <VerificationStep
            student={student}
            school={school}
            onVerify={handleVerify}
            isLoading={isLoading}
            buttonCancelRef={buttonCancelRef}
            buttonContinueRef={buttonSubmitRef}
          />
        )
      case 2:
        return (
          <GradeSelectionStep
            student={student!}
            school={school!}
            onComplete={handleGradeSelect}
            onBack={() => {}}
            onError={error => toast.error(error)}
            buttonCancelRef={buttonCancelRef}
            buttonContinueRef={buttonSubmitRef}
          />
        )
      case 3:
        return (
          <PaymentStep
            amount={INSCRIPTION_AMOUNT}
            paymentMethods={mockPaymentMethods}
            onSubmit={handlePayment}
            isLoading={isLoading}
          />
        )
      case 4:
        return confirmation
          ? (
              <ConfirmationStep
                payment={confirmation}
                onDownloadReceipt={() => {
                  toast.warning('Téléchargement du reçu non implémenté')
                }}
                onPrintReceipt={() => {
                  toast.warning('Impression du reçu non implémentée')
                }}
                isLoading={isLoading}
              />
            )
          : null
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Steps Indicator */}
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((step, index) => (
            <li key={step.title} className="md:flex-1">
              <div
                className={cn(
                  'group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4',
                  index <= currentStep
                    ? 'border-primary'
                    : 'border-muted-foreground/20',
                )}
              >
                <span
                  className={cn(
                    'text-sm font-medium',
                    index <= currentStep
                      ? 'text-primary'
                      : 'text-muted-foreground',
                  )}
                >
                  {`Étape ${index + 1}`}
                </span>
                <span className="text-sm">
                  {step.title}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="mt-4">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if ((currentStep === 1 && !student) || currentStep === 2)
                buttonCancelRef?.current?.click()

              else
                setCurrentStep(current => Math.max(current - 1, 0))
            }}
            disabled={currentStep === 0 || isLoading}
          >
            Précédent
          </Button>
          <Button
            onClick={() => {
              if ((currentStep === 1 && !student) || currentStep === 2) {
                buttonSubmitRef?.current?.click()
              }

              else {
                setCurrentStep(current => Math.min(current + 1, steps.length - 1),
                )
              }
            }}
            disabled={
              currentStep === steps.length - 1
              || isLoading
              || !student
              || !school
              // || (currentStep === 2 && !selectedGrade)
              || (currentStep === 3 && !paymentDetails)
            }
          >
            {currentStep === steps.length - 2 ? 'Terminer' : 'Suivant'}
          </Button>
        </div>
      )}
    </div>
  )
}

'use client'

import type { ISchool, IStudent } from '../page'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'
import { ClassSelectionStep } from './steps/ClassSelectionStep'
import { ConfirmationStep } from './steps/ConfirmationStep'
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

export function PaymentStepper({ steps }: PaymentStepperProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [student, setStudent] = useState<IStudent | null>(null)
  const [school, setSchool] = useState<ISchool | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [paymentDetails, setPaymentDetails] = useState<{
    method: string
    phoneNumber: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmation, setConfirmation] = useState<{
    reference: string
    amount: number
    studentName: string
    className: string
    schoolName: string
    paymentMethod: string
    phoneNumber: string
    timestamp: string
  } | null>(null)

  const mockClasses = [
    { id: '1', name: '6ème A', tuitionFee: 150000 },
    { id: '2', name: '5ème A', tuitionFee: 175000 },
    { id: '3', name: '4ème A', tuitionFee: 200000 },
  ]

  const mockPaymentMethods = [
    { id: 'orange', name: 'Orange Money', operatorName: 'Orange CI' },
    { id: 'mtn', name: 'MTN Mobile Money', operatorName: 'MTN CI' },
    { id: 'moov', name: 'Moov Money', operatorName: 'Moov Africa' },
    { id: 'wave', name: 'Wave', operatorName: 'Wave Mobile Money' },
  ]

  const handleSearch = async (studentId: string, schoolCode: string) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setStudent({
        id: '1',
        idNumber: studentId,
        firstName: 'John',
        lastName: 'Doe',
        address: null,
        gender: 'M',
        birthDate: '2010-01-01',
        avatarUrl: null,
        parentId: '1',
        classId: null,
        gradeId: null,
        schoolId: null,
        createdAt: null,
        updatedAt: null,
        createdBy: null,
        updatedBy: null,
      })
      setSchool({
        id: '1',
        code: schoolCode,
        name: 'École Primaire Example',
        address: '123 Rue Example',
        imageUrl: null,
        city: 'Abidjan',
        email: 'contact@example.com',
        cycleId: '1',
        isTechnicalEducation: false,
        phone: '0123456789',
        stateId: null,
        createdAt: null,
        updatedAt: null,
        createdBy: null,
        updatedBy: null,
      })
      setIsLoading(false)
      setCurrentStep(1)
    }, 1500)
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

  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId)
    setCurrentStep(3)
  }

  const handlePayment = async (data: { method: string, phoneNumber: string }) => {
    setIsLoading(true)
    setPaymentDetails(data)
    // Simulate payment processing
    setTimeout(() => {
      const selectedClass = mockClasses.find(c => c.id === selectedClassId)
      const paymentMethod = mockPaymentMethods.find(pm => pm.id === data.method)

      setConfirmation({
        reference: `PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        amount: selectedClass?.tuitionFee || 0,
        studentName: `${student?.firstName} ${student?.lastName}`,
        className: selectedClass?.name || '',
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
          />
        )
      case 2:
        return (
          <ClassSelectionStep
            classes={mockClasses}
            onSelect={handleClassSelect}
            isLoading={isLoading}
          />
        )
      case 3:
        return (
          <PaymentStep
            amount={mockClasses.find(c => c.id === selectedClassId)?.tuitionFee || 0}
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
                // Implement download logic
                  toast.warning('Downloading receipt is not implemented yet')
                }}
                onPrintReceipt={() => {
                // Implement print logic
                  toast.warning('Printing receipt is not implemented yet')
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
      <div className="mt-8">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(current => Math.max(current - 1, 0))}
            disabled={currentStep === 0 || isLoading}
          >
            Précédent
          </Button>
          <Button
            onClick={() => setCurrentStep(current =>
              Math.min(current + 1, steps.length - 1),
            )}
            disabled={
              currentStep === steps.length - 1
              || isLoading
              || !student
              || !school
              || (currentStep === 2 && !selectedClassId)
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

// app/inscriptions/components/RegistrationStepper.tsx

'use client'

import type { ISchool, IStudent } from '../types'
import { useState } from 'react'
import { Stepper } from '@/components/ui/stepper'
import { Step1Identification, Step2Confirmation, Step3GradeSelection, Step4TuitionDisplay, Step5Payment, Step6Success } from './steps'

interface Step {
  title: string
  description: string
}

interface RegistrationStepperProps {
  steps: Step[]
}

export function RegistrationStepper({ steps }: RegistrationStepperProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [school, setSchool] = useState<ISchool | null>(null)
  const [student, setStudent] = useState<IStudent | null>(null)
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null)
  const [isStateAssigned, setIsStateAssigned] = useState(false)
  const [isOrphan, setIsOrphan] = useState(false)
  const [hasCanteenSubscription, setHasCanteenSubscription] = useState(false)
  const [hasTransportSubscription, setHasTransportSubscription] = useState(false)
  const [searchAttempts, setSearchAttempts] = useState(0)
  const [termFee, setTermFee] = useState<number>(0)

  const handleStepComplete = (step: number) => {
    if (step === 5) {
      setCurrentStep(0)
      return
    }

    if (step < steps.length - 1) {
      setCurrentStep(step + 1)
    }
  }

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleTermFeeSet = (fee: number) => {
    setTermFee(fee)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1Identification
            onComplete={() => handleStepComplete(0)}
            onSchoolFound={setSchool}
            onStudentFound={setStudent}
            searchAttempts={searchAttempts}
            setSearchAttempts={setSearchAttempts}
          />
        )
      case 1:
        return (
          <Step2Confirmation
            onComplete={() => handleStepComplete(1)}
            onBack={handleStepBack}
            school={school}
            student={student}
          />
        )
      case 2:
        return (
          <Step3GradeSelection
            onComplete={() => handleStepComplete(2)}
            onBack={handleStepBack}
            onGradeSelect={setSelectedGradeId}
            onStateAssignedChange={setIsStateAssigned}
            onOrphanChange={setIsOrphan}
            onCanteenSubscriptionChange={setHasCanteenSubscription}
            onTransportSubscriptionChange={setHasTransportSubscription}
            selectedGradeId={selectedGradeId}
            isStateAssigned={isStateAssigned}
            isOrphan={isOrphan}
            hasCanteenSubscription={hasCanteenSubscription}
            hasTransportSubscription={hasTransportSubscription}
            schoolId={school?.id ?? ''}
          />
        )
      case 3:
        return (
          <Step4TuitionDisplay
            onBack={handleStepBack}
            onComplete={() => handleStepComplete(3)}
            onTermFeeSet={handleTermFeeSet}
            gradeId={selectedGradeId}
            isStateAssigned={isStateAssigned}
            isOrphan={isOrphan}
            hasCanteenSubscription={hasCanteenSubscription}
            hasTransportSubscription={hasTransportSubscription}
          />
        )
      case 4:
        return student && school
          ? (
              <Step5Payment
                onBack={handleStepBack}
                onComplete={() => handleStepComplete(4)}
                amount={termFee}
                studentId={student.id}
                schoolId={school.id}
                gradeId={selectedGradeId!}
                isStateAssigned={isStateAssigned}
                isOrphan={isOrphan}
                hasCanteenSubscription={hasCanteenSubscription}
                hasTransportSubscription={hasTransportSubscription}
                studentName={`${student.firstName} ${student.lastName}`}
                schoolName={school.name}
              />
            )
          : null
      case 5:
        return student && school
          ? (
              <Step6Success
                student={student}
                school={school}
                amount={termFee}
                isStateAssigned={isStateAssigned}
                onComplete={() => handleStepComplete(5)}
              />
            )
          : null
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      <div className="sticky top-0 bg-card/60 backdrop-blur-sm z-10 pt-4">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step < currentStep) {
              setCurrentStep(step)
            }
          }}
        />
      </div>
      <div className="mt-8 max-h-[calc(100vh-20rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
        {renderStep()}
      </div>
    </div>
  )
}

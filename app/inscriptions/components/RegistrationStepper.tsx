// app/inscriptions/components/RegistrationStepper.tsx

'use client'

import type { ISchool, IStudent } from '../types'
import { useRef, useState } from 'react'
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
  const [school, setSchool] = useState<ISchool | null>(null)
  const [student, setStudent] = useState<IStudent | null>(null)

  const [isOrphan, setIsOrphan] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [termFee, setTermFee] = useState<number>(0)
  const [searchAttempts, setSearchAttempts] = useState(0)
  const [isStateAssigned, setIsStateAssigned] = useState(false)
  const [hasCanteenSubscription, setHasCanteenSubscription] = useState(false)
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null)
  const [hasTransportSubscription, setHasTransportSubscription] = useState(false)

  const enrollmentIdRef = useRef<string>('')

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
            searchAttempts={searchAttempts}

            onComplete={() => handleStepComplete(0)}
            setSearchAttempts={setSearchAttempts}
            onStudentFound={setStudent}
            onSchoolFound={setSchool}
          />
        )
      case 1:
        return (
          <Step2Confirmation
            school={school}
            student={student}

            onComplete={() => handleStepComplete(1)}
            onBack={handleStepBack}
          />
        )
      case 2:
        return (
          <Step3GradeSelection
            isOrphan={isOrphan}
            schoolId={school!.id}
            selectedGradeId={selectedGradeId}
            isStateAssigned={isStateAssigned}
            hasCanteenSubscription={hasCanteenSubscription}
            hasTransportSubscription={hasTransportSubscription}

            onTransportSubscriptionChange={setHasTransportSubscription}
            onCanteenSubscriptionChange={setHasCanteenSubscription}
            onStateAssignedChange={setIsStateAssigned}
            onComplete={() => handleStepComplete(2)}
            onGradeSelect={setSelectedGradeId}
            onOrphanChange={setIsOrphan}
            onBack={handleStepBack}
          />
        )
      case 3:
        return (
          <Step4TuitionDisplay
            isOrphan={isOrphan}
            schoolId={school!.id}
            gradeId={selectedGradeId}
            isStateAssigned={isStateAssigned}
            hasCanteenSubscription={hasCanteenSubscription}
            hasTransportSubscription={hasTransportSubscription}

            onComplete={() => handleStepComplete(3)}
            onTermFeeSet={handleTermFeeSet}
            onBack={handleStepBack}
          />
        )
      case 4:
        return student && school
          ? (
              <Step5Payment
                amount={termFee}
                isOrphan={isOrphan}
                schoolId={school.id}
                studentId={student.id}
                schoolName={school.name}
                gradeId={selectedGradeId!}
                isStateAssigned={isStateAssigned}
                hasCanteenSubscription={hasCanteenSubscription}
                hasTransportSubscription={hasTransportSubscription}
                studentName={`${student.firstName} ${student.lastName}`}

                onBack={handleStepBack}
                onComplete={(enrolledId) => {
                  enrollmentIdRef.current = enrolledId
                  handleStepComplete(4)
                }}
              />
            )
          : null
      case 5:
        return student && school
          ? (
              <Step6Success
                school={school}
                amount={termFee}
                student={student}
                enrollmentId={enrollmentIdRef.current}
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

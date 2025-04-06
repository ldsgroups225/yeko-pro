'use client'

import type { ISchool, IStudent } from '../types'
import { Stepper } from '@/components/ui/stepper'
import { useState } from 'react'
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
  const [searchAttempts, setSearchAttempts] = useState(0)
  const [termFee, setTermFee] = useState<number>(0)

  const handleStepComplete = (step: number) => {
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
            selectedGradeId={selectedGradeId}
            isStateAssigned={isStateAssigned}
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
          />
        )
      case 4:
        return student && school
          ? (
              <Step5Payment
                onBack={handleStepBack}
                onComplete={() => handleStepComplete(4)}
                amount={termFee}
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
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step < currentStep) {
            setCurrentStep(step)
          }
        }}
      />
      <div className="mt-8">
        {renderStep()}
      </div>
    </div>
  )
}

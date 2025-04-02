import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Step {
  title: string
  description: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick: (step: number) => void
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
        {steps.map((step, index) => (
          <li key={step.title} className="md:flex-1">
            <button
              onClick={() => onStepClick(index)}
              className={cn(
                'group flex w-full flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0',
                index <= currentStep
                  ? 'border-primary hover:border-primary/70'
                  : 'border-border hover:border-border/70',
                'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
            >
              <span className="flex items-center text-sm font-medium">
                <span
                  className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                    index < currentStep
                      ? 'bg-primary text-primary-foreground group-hover:bg-primary/90'
                      : index === currentStep
                        ? 'border-2 border-primary text-primary'
                        : 'border-2 border-border text-muted-foreground',
                  )}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </span>
                <span className="ml-4 text-sm font-medium">{step.title}</span>
              </span>
              <span className="ml-12 mt-0.5 text-sm text-muted-foreground md:ml-0">
                {step.description}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
} 

'use client'

import type { ISchool, IStudent } from '../../page'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Check, X } from 'lucide-react'
import Image from 'next/image'

interface VerificationStepProps {
  student: IStudent | null
  school: ISchool | null
  onVerify: (verified: boolean) => void
  isLoading?: boolean
}

export function VerificationStep({ student, school, onVerify, isLoading = false }: VerificationStepProps) {
  if (isLoading) {
    return (
      <Card className="border-none bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!student || !school) {
    return (
      <Card className="border-none bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            Aucune information trouvée
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardHeader>
        <h3 className="text-lg font-semibold text-center">Vérification des informations</h3>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* School Information */}
        <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50">
          <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted">
            {school.imageUrl
              ? (
                  <Image
                    src={school.imageUrl}
                    alt={school.name}
                    fill
                    className="object-cover"
                  />
                )
              : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <span className="text-2xl font-bold text-primary">{school.name[0]}</span>
                  </div>
                )}
          </div>
          <div className="flex-1">
            <h4 className="text-base font-medium">{school.name}</h4>
            <p className="text-sm text-muted-foreground">
              Code:
              {school.code}
            </p>
            <p className="text-sm text-muted-foreground">{school.address}</p>
            <p className="text-sm text-muted-foreground">{school.city}</p>
          </div>
        </div>

        {/* Student Information */}
        <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50">
          <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted">
            {student.avatarUrl
              ? (
                  <Image
                    src={student.avatarUrl}
                    alt={`${student.firstName} ${student.lastName}`}
                    fill
                    className="object-cover"
                  />
                )
              : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <span className="text-2xl font-bold text-primary">
                      {student.firstName[0]}
                    </span>
                  </div>
                )}
          </div>
          <div className="flex-1">
            <h4 className="text-base font-medium">
              {student.firstName}
              {' '}
              {student.lastName}
            </h4>
            <p className="text-sm text-muted-foreground">
              ID:
              {student.idNumber}
            </p>
            {student.birthDate && (
              <p className="text-sm text-muted-foreground">
                Date de naissance:
                {' '}
                {new Date(student.birthDate).toLocaleDateString()}
              </p>
            )}
            {student.gender && (
              <p className="text-sm text-muted-foreground">
                Genre:
                {' '}
                {student.gender === 'M' ? 'Masculin' : 'Féminin'}
              </p>
            )}
          </div>
        </div>

        {/* Verification Buttons */}
        <div className="flex gap-4 justify-center mt-6">
          <Button
            variant="outline"
            onClick={() => onVerify(false)}
            className="w-full max-w-[200px]"
          >
            <X className="w-4 h-4 mr-2" />
            Incorrect
          </Button>
          <Button
            onClick={() => onVerify(true)}
            className="w-full max-w-[200px]"
          >
            <Check className="w-4 h-4 mr-2" />
            Confirmer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

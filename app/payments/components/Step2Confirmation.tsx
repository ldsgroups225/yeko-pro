import type { ISchool, IStudent } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Step2ConfirmationProps {
  onComplete: () => void
  onBack: () => void
  school: ISchool | null
  student: IStudent | null
}

export function Step2Confirmation({
  onComplete,
  onBack,
  school,
  student,
}: Step2ConfirmationProps) {
  if (!school || !student) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'école</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              {school.imageUrl && (
                <img
                  src={school.imageUrl}
                  alt={school.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
            </div>
            <div className="space-y-2">
              <p>
                <strong>Nom:</strong>
                {' '}
                {school.name}
              </p>
              <p>
                <strong>Code:</strong>
                {' '}
                {school.code}
              </p>
              <p>
                <strong>Ville:</strong>
                {' '}
                {school.city}
              </p>
              <p>
                <strong>Adresse:</strong>
                {' '}
                {school.address || 'Non spécifiée'}
              </p>
              <p>
                <strong>Email:</strong>
                {' '}
                {school.email}
              </p>
              <p>
                <strong>Téléphone:</strong>
                {' '}
                {school.phone}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations de l'élève</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              {student.avatarUrl && (
                <img
                  src={student.avatarUrl}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="w-32 h-32 object-cover rounded-full"
                />
              )}
            </div>
            <div className="space-y-2">
              <p>
                <strong>Matricule:</strong>
                {' '}
                {student.idNumber}
              </p>
              <p>
                <strong>Nom:</strong>
                {' '}
                {student.lastName}
              </p>
              <p>
                <strong>Prénom:</strong>
                {' '}
                {student.firstName}
              </p>
              <p>
                <strong>Genre:</strong>
                {' '}
                {student.gender || 'Non spécifié'}
              </p>
              <p>
                <strong>Date de naissance:</strong>
                {' '}
                {student.birthDate || 'Non spécifiée'}
              </p>
              <p>
                <strong>Adresse:</strong>
                {' '}
                {student.address || 'Non spécifiée'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={onComplete}>
          Continuer
        </Button>
      </div>
    </div>
  )
}

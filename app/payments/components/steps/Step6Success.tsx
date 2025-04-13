// app/payments/components/steps/Step6Success.tsx

'use client'

import type { ISchool, IStudent } from '../../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

interface Step6SuccessProps {
  student: IStudent
  school: ISchool
  amount: number
  gradeId: number
  isStateAssigned: boolean
  onComplete: () => void
}

export function Step6Success({
  student,
  school,
  amount,
  isStateAssigned,
  onComplete,
}: Omit<Step6SuccessProps, 'gradeId'>) {
  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download
    console.warn('Receipt download not yet implemented')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Inscription réussie !</CardTitle>
          <p className="text-muted-foreground">
            L'inscription de l'élève a été effectuée avec succès.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Registration Details */}
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold mb-2">Détails de l'inscription</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">École:</span>
                  {' '}
                  {school.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Élève:</span>
                  {' '}
                  {student.firstName}
                  {' '}
                  {student.lastName}
                </p>
                <p>
                  <span className="text-muted-foreground">Matricule:</span>
                  {' '}
                  {student.idNumber}
                </p>
                <p>
                  <span className="text-muted-foreground">Montant payé:</span>
                  {' '}
                  <span className="font-semibold">
                    {amount.toLocaleString('fr-FR')}
                    {' '}
                    FCFA
                  </span>
                </p>
                {isStateAssigned && (
                  <p>
                    <span className="text-muted-foreground">Statut:</span>
                    {' '}
                    <span className="text-green-600">Affecté par l'État</span>
                  </p>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Prochaines étapes</h3>
              <ul className="space-y-2 text-sm list-disc list-inside text-muted-foreground">
                <li>Téléchargez votre reçu de paiement</li>
                <li>Présentez-vous à l'école avec les documents suivants :</li>
                <ul className="pl-6 space-y-1 list-disc list-inside">
                  <li>Reçu de paiement</li>
                  <li>Pièce d'identité</li>
                  <li>Photos d'identité</li>
                  <li>Dossier scolaire</li>
                </ul>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-4">
            <Button onClick={handleDownloadReceipt} className="w-full">
              Télécharger le reçu
            </Button>
            <Button
              variant="outline"
              onClick={onComplete}
              className="w-full"
            >
              Terminer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

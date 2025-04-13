// app/payments/components/steps/Step4TuitionDisplay.tsx

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useEffect, useState } from 'react'
import { fetchTuitionFees } from '../../actions'

interface Step4TuitionDisplayProps {
  onBack: () => void
  onComplete: () => void
  onTermFeeSet: (fee: number) => void
  gradeId: number | null
  isStateAssigned: boolean
}

interface TuitionFee {
  id: string
  annualFee: number
  governmentDiscountPercentage: number
}

export function Step4TuitionDisplay({
  onBack,
  onComplete,
  onTermFeeSet,
  gradeId,
  isStateAssigned,
}: Step4TuitionDisplayProps) {
  const [tuitionFees, setTuitionFees] = useState<TuitionFee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadTuitionFees() {
      if (!gradeId) {
        if (mounted) {
          setIsLoading(false)
        }
        return
      }

      try {
        const data = await fetchTuitionFees(gradeId)
        if (mounted) {
          setTuitionFees(data)
          setIsLoading(false)
        }
      }
      catch {
        if (mounted) {
          setError('Impossible de charger les frais de scolarité')
          setIsLoading(false)
        }
      }
    }

    loadTuitionFees()
    return () => {
      mounted = false
    }
  }, [gradeId])

  const tuitionFee = tuitionFees[0] // We expect only one fee configuration per grade
  const annualFee = tuitionFee?.annualFee ?? 0
  const discountedAnnualFee = isStateAssigned && tuitionFee
    ? Math.round(annualFee * (1 - tuitionFee.governmentDiscountPercentage / 100))
    : annualFee
  const discountedTermFee = Math.round(discountedAnnualFee / 3)

  useEffect(() => {
    onTermFeeSet(discountedTermFee)
  }, [discountedTermFee, onTermFeeSet])

  if (isLoading) {
    return <div>Chargement des frais de scolarité...</div>
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  if (tuitionFees.length === 0) {
    return <div>Aucun frais de scolarité n'a été configuré pour ce niveau.</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Frais de scolarité</CardTitle>
          {isStateAssigned && (
            <p className="text-sm text-muted-foreground">
              Une réduction de
              {' '}
              {tuitionFee.governmentDiscountPercentage}
              % est appliquée sur les frais de scolarité.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Annual Fee */}
          <div>
            <h3 className="font-semibold mb-4">Frais annuels</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Frais de scolarité annuels</p>
                  <p className="text-sm text-muted-foreground">Montant total pour l'année scolaire</p>
                </div>
                <p className="font-semibold">
                  {annualFee.toLocaleString('fr-FR')}
                  {' '}
                  FCFA
                </p>
              </div>
              {isStateAssigned && (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Réduction de l'État</p>
                    <p className="text-sm text-muted-foreground">
                      {tuitionFee.governmentDiscountPercentage}
                      % du montant total
                    </p>
                  </div>
                  <p className="font-semibold text-green-600">
                    -
                    {(annualFee - discountedAnnualFee).toLocaleString('fr-FR')}
                    {' '}
                    FCFA
                  </p>
                </div>
              )}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center font-bold">
              <p>
                Total annuel
                {isStateAssigned ? 'après réduction' : ''}
              </p>
              <p>
                {discountedAnnualFee.toLocaleString('fr-FR')}
                {' '}
                FCFA
              </p>
            </div>
          </div>

          {/* Term Fee */}
          <div>
            <h3 className="font-semibold mb-4">Frais par trimestre</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Frais de scolarité trimestriels</p>
                <p className="text-sm text-muted-foreground">Montant à payer par trimestre</p>
              </div>
              <p className="font-semibold">
                {discountedTermFee.toLocaleString('fr-FR')}
                {' '}
                FCFA
              </p>
            </div>
          </div>

          {/* Payment Schedule */}
          <div>
            <h3 className="font-semibold mb-4">Échéancier de paiement</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">1er trimestre</p>
                  <p className="text-sm text-muted-foreground">À l'inscription</p>
                </div>
                <p className="font-semibold">
                  {discountedTermFee.toLocaleString('fr-FR')}
                  {' '}
                  FCFA
                </p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">2ème trimestre</p>
                  <p className="text-sm text-muted-foreground">Janvier</p>
                </div>
                <p className="font-semibold">
                  {discountedTermFee.toLocaleString('fr-FR')}
                  {' '}
                  FCFA
                </p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">3ème trimestre</p>
                  <p className="text-sm text-muted-foreground">Avril</p>
                </div>
                <p className="font-semibold">
                  {discountedTermFee.toLocaleString('fr-FR')}
                  {' '}
                  FCFA
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

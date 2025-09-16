// app/inscriptions/components/steps/Step4TuitionDisplay.tsx

'use client'

import type { TuitionFee } from '../../actions'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { fetchTuitionFees } from '../../actions'

interface Step4TuitionDisplayProps {
  onBack: () => void
  onComplete: () => void
  onTermFeeSet: (fee: number) => void
  schoolId: string
  gradeId: number | null
  isStateAssigned: boolean
  isOrphan: boolean
  hasCanteenSubscription: boolean
  hasTransportSubscription: boolean
}

interface TuitionFeeState {
  data: TuitionFee | null
  isLoading: boolean
  error: string | null
}

export function Step4TuitionDisplay({
  onBack,
  onComplete,
  onTermFeeSet,
  schoolId,
  gradeId,
  isStateAssigned,
  isOrphan,
  hasCanteenSubscription,
  hasTransportSubscription,
}: Step4TuitionDisplayProps) {
  const [tuitionFeeState, setTuitionFeeState] = useState<TuitionFeeState>({
    data: null,
    isLoading: true,
    error: null,
  })

  // Use this ref to track if we need to reset state on grade change
  const prevGradeIdRef = useRef<number | null>(gradeId)

  useEffect(() => {
    let mounted = true

    // If gradeId changed, we'll handle it in the next render
    if (prevGradeIdRef.current !== gradeId) {
      prevGradeIdRef.current = gradeId
      return
    }

    async function loadTuitionFees() {
      if (!gradeId) {
        if (mounted) {
          setTuitionFeeState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Veuillez sélectionner un niveau scolaire.',
          }))
        }
        return
      }

      try {
        const data = await fetchTuitionFees({ gradeId, schoolId })
        if (mounted) {
          if (data && data.length > 0) {
            setTuitionFeeState(prev => ({
              ...prev,
              data: data[0],
              isLoading: false,
              error: null,
            }))
          }
          else {
            setTuitionFeeState(prev => ({
              ...prev,
              isLoading: false,
              error: 'Aucun frais de scolarité trouvé pour ce niveau.',
            }))
          }
        }
      }
      catch (err) {
        console.error('Failed to fetch tuition fees:', err)
        if (mounted) {
          setTuitionFeeState(prev => ({
            ...prev,
            isLoading: false,
            error: err instanceof Error ? err.message : 'Impossible de charger les frais de scolarité. Veuillez réessayer.',
          }))
        }
      }
    }

    loadTuitionFees()

    return () => {
      mounted = false
    }
  }, [gradeId])

  // Handle state update when gradeId changes
  if (prevGradeIdRef.current !== gradeId) {
    // Update the ref to current gradeId
    prevGradeIdRef.current = gradeId

    // Update state - this happens during render, not in useEffect
    setTuitionFeeState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }))
  }

  const { data: tuitionFeeConfig, isLoading, error } = tuitionFeeState

  // --- Fee Calculation Logic ---
  const calculatedFees = useMemo(() => {
    if (!tuitionFeeConfig) {
      return {
        baseAnnualTuition: 0,
        orphanDiscountApplied: 0,
        canteenFeeApplied: 0,
        transportFeeApplied: 0,
        finalAnnualFee: 0,
        finalTermFee: 0, // Still calculate for the prop
      }
    }

    // 1. Determine Base Tuition Fee
    const baseAnnualTuition = isStateAssigned
      ? tuitionFeeConfig.governmentAnnualFee
      : tuitionFeeConfig.annualFee

    let currentTotal = baseAnnualTuition

    // 2. Apply Orphan Discount
    let orphanDiscountApplied = 0
    if (isOrphan && tuitionFeeConfig.orphanDiscountAmount > 0) {
      orphanDiscountApplied = Math.min(currentTotal, tuitionFeeConfig.orphanDiscountAmount)
      currentTotal -= orphanDiscountApplied
    }

    // 3. Add Canteen Fee
    let canteenFeeApplied = 0
    if (hasCanteenSubscription && tuitionFeeConfig.canteenFee > 0) {
      canteenFeeApplied = tuitionFeeConfig.canteenFee
      currentTotal += canteenFeeApplied
    }

    // 4. Add Transport Fee
    let transportFeeApplied = 0
    if (hasTransportSubscription && tuitionFeeConfig.transportationFee > 0) {
      transportFeeApplied = tuitionFeeConfig.transportationFee
      currentTotal += transportFeeApplied
    }

    // 5. Calculate Final Annual and Term Fees
    const finalAnnualFee = Math.max(0, currentTotal) // Ensure fee is not negative

    return {
      baseAnnualTuition,
      orphanDiscountApplied,
      canteenFeeApplied,
      transportFeeApplied,
      finalAnnualFee,
      finalTermFee: tuitionFeeConfig.firstInstallmentAmount,
    }
  }, [tuitionFeeConfig, isStateAssigned, isOrphan, hasCanteenSubscription, hasTransportSubscription])

  // Update parent component with the calculated term fee (even if not displayed)
  useEffect(() => {
    onTermFeeSet(calculatedFees.finalTermFee)
  }, [calculatedFees.finalTermFee, onTermFeeSet])

  if (isLoading) {
    return <div>Chargement du récapitulatif des frais...</div>
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  if (!tuitionFeeConfig) {
    return <div>Configuration des frais de scolarité non disponible.</div>
  }

  const {
    baseAnnualTuition,
    orphanDiscountApplied,
    canteenFeeApplied,
    transportFeeApplied,
    finalAnnualFee,
    // finalTermFee is calculated but not used in the UI below
  } = calculatedFees

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif des Frais Annuels</CardTitle>
          <p className="text-sm text-muted-foreground">
            Voici le détail des frais calculés pour l'année scolaire.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fee Breakdown Section */}
          <div>
            {/* Base Tuition */}
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium">
                  Frais de scolarité annuels de base
                </p>
                <p className="text-sm text-muted-foreground">
                  {isStateAssigned ? 'Tarif subventionné par l\'État' : 'Tarif standard'}
                </p>
              </div>
              <p className="font-semibold">
                {formatCurrency(baseAnnualTuition)}
              </p>
            </div>

            <Separator className="my-1" />

            {/* Orphan Discount */}
            <div className={`flex justify-between items-center py-2 ${orphanDiscountApplied > 0 ? '' : 'text-muted-foreground'}`}>
              <div>
                <p className="font-medium">Réduction Orphelin</p>
                <p className="text-sm">
                  {isOrphan ? `Montant appliqué: ${formatCurrency(orphanDiscountApplied)}` : 'Non applicable'}
                </p>
              </div>
              {isOrphan && orphanDiscountApplied > 0 && (
                <p className="font-semibold text-green-600">
                  -
                  {' '}
                  {formatCurrency(orphanDiscountApplied)}
                </p>
              )}
              {!isOrphan && (
                <p className="font-semibold">{formatCurrency(0)}</p>
              )}
            </div>

            <Separator className="my-1" />

            {/* Canteen Fee */}
            <div className={`flex justify-between items-center py-2 ${hasCanteenSubscription ? '' : 'text-muted-foreground'}`}>
              <div>
                <p className="font-medium">Frais de cantine annuels</p>
                <p className="text-sm">
                  {hasCanteenSubscription ? `Montant appliqué: ${formatCurrency(canteenFeeApplied)}` : 'Non souscrit'}
                </p>
              </div>
              {hasCanteenSubscription && canteenFeeApplied >= 0 && ( // Show even if 0 but subscribed
                <p className="font-semibold">
                  +
                  {' '}
                  {formatCurrency(canteenFeeApplied)}
                </p>
              )}
              {!hasCanteenSubscription && (
                <p className="font-semibold">{formatCurrency(0)}</p>
              )}
            </div>

            <Separator className="my-1" />

            {/* Transport Fee */}
            <div className={`flex justify-between items-center py-2 ${hasTransportSubscription ? '' : 'text-muted-foreground'}`}>
              <div>
                <p className="font-medium">Frais de transport annuels</p>
                <p className="text-sm">
                  {hasTransportSubscription ? `Montant appliqué: ${formatCurrency(transportFeeApplied)}` : 'Non souscrit'}
                </p>
              </div>
              {hasTransportSubscription && transportFeeApplied >= 0 && ( // Show even if 0 but subscribed
                <p className="font-semibold">
                  +
                  {' '}
                  {formatCurrency(transportFeeApplied)}
                </p>
              )}
              {!hasTransportSubscription && (
                <p className="font-semibold">{formatCurrency(0)}</p>
              )}
            </div>

            <Separator className="my-3 border-t-2" />

            {/* Final Annual Total */}
            <div className="flex justify-between items-center font-bold text-lg py-2">
              <p>Total Annuel à Payer</p>
              <p>
                {formatCurrency(finalAnnualFee)}
              </p>
            </div>
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={onComplete} disabled={isLoading || !!error || !tuitionFeeConfig}>
          Confirmer et Continuer
        </Button>
      </div>
    </div>
  )
}

'use client'

import type { Database } from '@/lib/supabase/types'
import type { RefObject } from 'react'
import type { ISchool, IStudent } from '../../types'
import { GenericSelect } from '@/components/GenericSelect'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type Grade = Database['public']['Tables']['grades']['Row']

interface GradeWithTuition extends Grade {
  tuition?: {
    annualFee: number
    governmentDiscountPercentage: number
  }
}

interface GradeSelectionStepProps {
  student: IStudent
  school: ISchool
  onComplete: (grade: { id: number, name: string }) => void
  onBack: () => void
  onError: (error: string) => void
  buttonContinueRef?: RefObject<HTMLButtonElement | null>
  buttonCancelRef?: RefObject<HTMLButtonElement | null>
}

export function GradeSelectionStep({
  student,
  school,
  onComplete,
  onBack,
  onError,
  buttonCancelRef,
  buttonContinueRef,
}: GradeSelectionStepProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [grades, setGrades] = useState<GradeWithTuition[]>([])
  const [selectedGradeId, setSelectedGradeId] = useState<string>('')
  const [applyDiscount, setApplyDiscount] = useState(false)

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const supabase = createClient()

        // Fetch grades and tuition settings in parallel
        const [gradesResult, tuitionResult] = await Promise.all([
          supabase
            .from('grades')
            .select('*')
            .eq('cycle_id', school.cycleId)
            .order('id'),
          supabase
            .from('tuition_settings')
            .select('*')
            .eq('school_id', school.id),
        ])

        if (gradesResult.error)
          throw gradesResult.error
        if (tuitionResult.error)
          throw tuitionResult.error

        // Combine grades with their tuition settings
        const gradesWithTuition = gradesResult.data.map(grade => ({
          ...grade,
          tuition: tuitionResult.data
            .find(t => t.grade_id === grade.id)
            ? {
                annualFee: tuitionResult.data.find(t => t.grade_id === grade.id)!.annual_fee,
                governmentDiscountPercentage: tuitionResult.data.find(t => t.grade_id === grade.id)!.government_discount_percentage,
              }
            : undefined,
        }))

        setGrades(gradesWithTuition)
      }
      catch (error) {
        console.error('Error fetching grades:', error)
        onError('Une erreur est survenue lors du chargement des classes')
        toast.error('Erreur de chargement des classes')
      }
      finally {
        setIsLoading(false)
      }
    }

    fetchGrades()
  }, [school.id, school.cycleId, onError])

  const selectedGrade = grades.find(grade => grade.id.toString() === selectedGradeId)

  const handleGradeChange = (gradeId: string) => {
    setSelectedGradeId(gradeId)
    setApplyDiscount(false)
  }

  const handleDiscountChange = (checked: boolean) => {
    setApplyDiscount(checked)
  }

  const calculateTuitionAmount = () => {
    if (!selectedGrade?.tuition)
      return 0

    const baseAmount = selectedGrade.tuition.annualFee
    const discountPercentage = selectedGrade.tuition.governmentDiscountPercentage

    if (student.schoolId === school.id && student.gradeId === selectedGrade.id)
      return 0 // Student already enrolled in this grade

    return applyDiscount && [7, 11].includes(selectedGrade.id)
      ? baseAmount * (1 - (discountPercentage / 100))
      : baseAmount
  }

  const handleContinue = () => {
    if (!selectedGrade?.tuition) {
      toast.error('Frais de scolarité non configurés pour cette classe')
      return
    }

    onComplete(selectedGrade)
  }

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

  const gradeOptions = grades.map(grade => ({
    id: grade.id.toString(),
    name: grade.name,
    tuitionFee: grade.tuition?.annualFee || 0,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="border-none bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardHeader>
          <h3 className="text-lg font-semibold text-center">Sélection du niveau scolaire</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <GenericSelect
              label="Niveau"
              value={selectedGradeId}
              options={gradeOptions}
              onValueChange={handleGradeChange}
              placeholder="Sélectionnez un niveau"
              required
            />

            {selectedGrade && [7, 11].includes(selectedGrade.id) && (
              <div className="flex items-center justify-between space-x-4 p-4 rounded-lg bg-background/50">
                <p className="text-sm font-medium">Êtes-vous orienté d'état ?</p>
                <Switch
                  checked={applyDiscount}
                  onCheckedChange={handleDiscountChange}
                />
              </div>
            )}

            {selectedGrade?.tuition && (
              <div className="p-4 rounded-lg bg-background/50">
                <h4 className="text-sm font-medium mb-2">Frais de scolarité</h4>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                    }).format(calculateTuitionAmount())}
                  </span>
                  <Button
                    ref={buttonContinueRef}
                    onClick={handleContinue}
                    disabled={!selectedGrade}
                    className="hidden"
                  >
                    Continuer
                  </Button>
                </div>
              </div>
            )}
          </div>

          {grades.length === 0 && (
            <p className="text-center text-muted-foreground my-8">
              Aucune classe disponible pour cette école
            </p>
          )}
        </CardContent>
      </Card>

      <button
        ref={buttonCancelRef}
        type="button"
        onClick={onBack}
        className="hidden"
      >
        Retour
      </button>
    </motion.div>
  )
}

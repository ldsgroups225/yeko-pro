'use client'

import type { Database } from '@/lib/supabase/types'
import type { ISchool, IStudent } from '../../page'
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
  onComplete: (gradeId: number, tuitionAmount: number) => void
  onBack: () => void
  onError: (error: string) => void
}

export function GradeSelectionStep({
  student,
  school,
  onComplete,
  onBack,
  onError,
}: GradeSelectionStepProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [grades, setGrades] = useState<GradeWithTuition[]>([])
  const [selectedGrade, setSelectedGrade] = useState<GradeWithTuition | null>(null)

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

  const handleGradeSelection = (grade: GradeWithTuition) => {
    setSelectedGrade(grade)
    if (grade.tuition) {
      const tuitionAmount = student.schoolId === school.id && student.gradeId === grade.id
        ? 0 // Student already enrolled in this grade
        : grade.tuition.annualFee * (1 - (grade.tuition.governmentDiscountPercentage / 100))
      onComplete(grade.id, tuitionAmount)
    }
    else {
      toast.error('Frais de scolarité non configurés pour cette classe')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Sélection de la classe</h3>
        <div className="grid gap-4">
          {grades.map(grade => (
            <div
              key={grade.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors
                ${selectedGrade?.id === grade.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
            }
              `}
              onClick={() => handleGradeSelection(grade)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{grade.name}</h4>
                  <p className="text-sm text-gray-600">{grade.description}</p>
                </div>
                {grade.tuition && (
                  <div className="text-right">
                    <p className="font-medium">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                      }).format(grade.tuition.annualFee)}
                    </p>
                    {grade.tuition.governmentDiscountPercentage > 0 && (
                      <p className="text-sm text-green-600">
                        -
                        {grade.tuition.governmentDiscountPercentage}
                        % remise gouvernementale
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {grades.length === 0 && (
          <p className="text-center text-gray-500 my-8">
            Aucune classe disponible pour cette école
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <motion.button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Retour
        </motion.button>
      </div>
    </motion.div>
  )
}

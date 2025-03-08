'use client'

import type { ISchool, IStudent } from '../../page'
import { createClient } from '@/lib/supabase/client'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button, Card, CardContent, CardFooter, Input } from '../ui'

interface StudentInfoFormData {
  studentId: string
  schoolCode: string
}

interface StudentInfoStepProps {
  onComplete: (data: { student: IStudent | null, school: ISchool }) => void
  onError: (error: string) => void
}

export function StudentInfoStep({ onComplete, onError }: StudentInfoStepProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentInfoFormData>()

  const onSubmit = async (data: StudentInfoFormData) => {
    try {
      const supabase = createClient()

      // Fetch student and school data in parallel
      const [studentResult, schoolResult] = await Promise.all([
        supabase
          .from('students')
          .select('*')
          .eq('id_number', data.studentId)
          .single(),
        supabase
          .from('schools')
          .select('*')
          .eq('code', data.schoolCode)
          .single(),
      ])

      if (schoolResult.error) {
        throw new Error('École non trouvée')
      }

      const school = {
        id: schoolResult.data.id,
        code: schoolResult.data.code,
        name: schoolResult.data.name,
        address: schoolResult.data.address,
        imageUrl: schoolResult.data.image_url,
        city: schoolResult.data.city,
        email: schoolResult.data.email,
        cycleId: schoolResult.data.cycle_id,
        isTechnicalEducation: schoolResult.data.is_technical_education,
        phone: schoolResult.data.phone,
        stateId: schoolResult.data.state_id,
        createdAt: schoolResult.data.created_at,
        updatedAt: schoolResult.data.updated_at,
        createdBy: schoolResult.data.created_by,
        updatedBy: schoolResult.data.updated_by,
      }

      // If student exists, deserialize the data
      const student = studentResult.data
        ? {
            id: studentResult.data.id,
            idNumber: studentResult.data.id_number,
            firstName: studentResult.data.first_name,
            lastName: studentResult.data.last_name,
            address: studentResult.data.address,
            gender: studentResult.data.gender,
            birthDate: studentResult.data.date_of_birth,
            avatarUrl: studentResult.data.avatar_url,
            parentId: studentResult.data.parent_id,
            classId: null,
            gradeId: null,
            schoolId: null,
            createdAt: studentResult.data.created_at,
            updatedAt: studentResult.data.updated_at,
            createdBy: studentResult.data.created_by,
            updatedBy: studentResult.data.updated_by,
          }
        : null

      onComplete({ student, school })
    }
    catch (error) {
      console.error('Error:', error)
      onError(error instanceof Error ? error.message : 'Une erreur est survenue')
      toast.error('Une erreur est survenue lors de la recherche')
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <div className="space-y-4">
            <Controller
              name="studentId"
              control={control}
              rules={{ required: 'La matricule de l\'élève est requis' }}
              defaultValue=""
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Matricule de l'élève"
                  id="studentId"
                  placeholder="Entrez la matricule de l'élève"
                  disabled={isSubmitting}
                  error={errors.studentId}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                />
              )}
            />

            <Controller
              name="schoolCode"
              control={control}
              rules={{ required: 'Le code de l\'école est requis' }}
              defaultValue=""
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Code de l'école"
                  id="schoolCode"
                  placeholder="Entrez le code de l'école"
                  disabled={isSubmitting}
                  error={errors.schoolCode}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </div>
        </CardContent>

        <CardFooter>
          <div className="w-full flex justify-end">
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Rechercher
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

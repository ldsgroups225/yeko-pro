import type { SearchFormData } from '../schemas'
import type { ISchool, IStudent } from '../types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { searchStudentAndSchool } from '../actions'
import { searchSchema } from '../schemas'
import { StudentCreationForm } from './StudentCreationForm'

interface Step1IdentificationProps {
  onComplete: () => void
  onSchoolFound: (school: ISchool) => void
  onStudentFound: (student: IStudent) => void
  searchAttempts: number
  setSearchAttempts: (attempts: number) => void
}

export function Step1Identification({
  onComplete,
  onSchoolFound,
  onStudentFound,
  searchAttempts,
  setSearchAttempts,
}: Step1IdentificationProps) {
  const [error, setError] = useState<string | null>(null)
  const [isCreatingStudent, setIsCreatingStudent] = useState(false)
  const [foundSchool, setFoundSchool] = useState<ISchool | null>(null)

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      schoolCode: '',
      studentId: '',
    },
  })

  const handleSearch = async (data: SearchFormData) => {
    try {
      const formData = new FormData()
      formData.append('schoolCode', data.schoolCode)
      formData.append('studentId', data.studentId)

      const result = await searchStudentAndSchool(null, formData)

      if (result.error) {
        setError(result.error)
        return
      }

      if (!result.school) {
        setError('École non trouvée')
        return
      }

      setFoundSchool(result.school)
      onSchoolFound(result.school)

      if (!result.student) {
        setSearchAttempts(searchAttempts + 1)
        if (searchAttempts >= 2) {
          setIsCreatingStudent(true)
        }
        else {
          setError('Élève non trouvé. Veuillez réessayer.')
        }
        return
      }

      onStudentFound(result.student)
      onComplete()
    }
    catch {
      setError('Une erreur est survenue lors de la recherche')
    }
  }

  const handleStudentCreated = (student: IStudent) => {
    setIsCreatingStudent(false)
    onStudentFound(student)
    onComplete()
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-4">
          <FormField
            control={form.control}
            name="schoolCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code de l'école</FormLabel>
                <FormControl>
                  <Input placeholder="Entrez le code de l'école" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matricule de l'élève</FormLabel>
                <FormControl>
                  <Input placeholder="Entrez la matricule de l'élève" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full">
            Rechercher
          </Button>
        </form>
      </Form>

      <Dialog open={isCreatingStudent} onOpenChange={setIsCreatingStudent}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Créer un nouvel élève</DialogTitle>
          </DialogHeader>
          {foundSchool && (
            <StudentCreationForm
              schoolId={foundSchool.id}
              onSuccess={handleStudentCreated}
              onCancel={() => setIsCreatingStudent(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

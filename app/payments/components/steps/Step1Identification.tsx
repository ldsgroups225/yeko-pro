// app/payments/components/steps/Step1Identification.tsx

import type { SearchFormData } from '../../schemas'
import type { ISchool, IStudent } from '../../types'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus2Icon } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { searchStudentAndSchool } from '../../actions'
import { searchSchema } from '../../schemas'
import { StudentCreationForm } from '../StudentCreationForm'

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
  const [searching, startTransition] = useTransition()

  const [error, setError] = useState<string | null>(null)
  const [isCreatingStudent, setIsCreatingStudent] = useState(false)

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

      // validate the form data
      const validationResult = searchSchema.safeParse(data)
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(issue => issue.message).join(', ')
        setError(errorMessages)
        return
      }

      const result = await searchStudentAndSchool(null, formData)

      if (result.error) {
        setError(result.error)
        return
      }

      if (!result.school) {
        setError('École non trouvée')
        return
      }

      onSchoolFound(result.school)

      if (!result.student) {
        setSearchAttempts(searchAttempts + 1)
        if (searchAttempts >= 0) {
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
    form.setValue('studentId', student.idNumber)
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            startTransition(() => {
              handleSearch(form.getValues())
            })
          }}
          className="space-y-4"
        >
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

          <div className="flex flex-col items-center gap-2">
            <Button type="submit" className="w-full" disabled={searching}>
              {searching ? 'Recherche en cours...' : 'Rechercher'}
            </Button>

            <div className="flex items-center gap-2 w-full">
              <Separator className="w-1/2" />
              <p className="text-center">ou</p>
              <Separator className="w-1/2" />
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="w-1/2"
              onClick={() => setIsCreatingStudent(true)}
            >
              <UserPlus2Icon className="h-4 w-4 mr-2" />
              Créer un nouvel élève
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={isCreatingStudent} onOpenChange={setIsCreatingStudent}>
        <DialogContent className="sm:max-w-[425px] max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouvel élève</DialogTitle>
            <DialogDescription>
              Veuillez entrer les informations de l&apos;élève pour créer un nouveau compte.
            </DialogDescription>
          </DialogHeader>

          <StudentCreationForm
            onSuccess={handleStudentCreated}
            onCancel={() => setIsCreatingStudent(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { startTransition, useActionState, useEffect } from 'react'
import { Search } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { ISchool, IStudent } from '../../types'
import { searchStudentAndSchool } from '../../actions'

interface SearchStepProps {
  onSearch: (student: IStudent | null, school: ISchool) => void
}

export function SearchStep({ onSearch }: SearchStepProps) {
  const [result, formAction, isPending] = useActionState(searchStudentAndSchool, null)

  // Enveloppe formAction dans startTransition
  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      formAction(formData)
    })
  }

  // Effet pour gérer la navigation après une recherche réussie
  useEffect(() => {
    if (result && !result.error) {
      onSearch(result.student, result.school!)
    }
  }, [result, onSearch])

  return (
    <Card className="border-none bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="studentId">Le numéro de matricule de l&apos;élève</Label>
            <Input
              id="studentId"
              name="studentId"
              placeholder="Entrez la matricule de l'élève"
              required
              className="bg-background/50"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schoolCode">Code de l&apos;école</Label>
            <Input
              id="schoolCode"
              name="schoolCode"
              placeholder="Entrez le code de l'école"
              required
              className="bg-background/50"
              disabled={isPending}
            />
          </div>

          {result?.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            <Search className="w-4 h-4 mr-2" />
            {isPending ? 'Recherche en cours...' : 'Rechercher'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

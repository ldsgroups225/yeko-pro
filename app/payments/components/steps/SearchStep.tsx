'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'
import { useState } from 'react'

interface SearchStepProps {
  onSearch: (studentId: string, schoolCode: string) => void
}

export function SearchStep({ onSearch }: SearchStepProps) {
  const [studentId, setStudentId] = useState('')
  const [schoolCode, setSchoolCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(studentId, schoolCode)
  }

  return (
    <Card className="border-none bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="studentId">Le numéro de matricule de l'élève</Label>
            <Input
              id="studentId"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              placeholder="Entrez la matricule de l'élève"
              required
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schoolCode">Code de l'école</Label>
            <Input
              id="schoolCode"
              value={schoolCode}
              onChange={e => setSchoolCode(e.target.value)}
              placeholder="Entrez le code de l'école"
              required
              className="bg-background/50"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!studentId || !schoolCode}
          >
            <Search className="w-4 h-4 mr-2" />
            Rechercher
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

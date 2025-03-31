'use client'

import type { RefObject } from 'react'
import type { ISchool, IStudent } from '../../types'
import { ImageUpload } from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface VerificationStepProps {
  student: IStudent | null
  school: ISchool | null
  onVerify: (verified: boolean, updatedStudent?: Partial<IStudent>) => void
  isLoading?: boolean
  buttonContinueRef?: RefObject<HTMLButtonElement | null>
  buttonCancelRef?: RefObject<HTMLButtonElement | null>
}

export function VerificationStep({
  student,
  school,
  onVerify,
  buttonCancelRef,
  buttonContinueRef,
  isLoading = false,
}: VerificationStepProps) {
  const [isEditing] = useState(!student)
  const [formData, setFormData] = useState<Partial<IStudent>>({})
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        gender: student.gender || '',
        birthDate: student.birthDate || '',
        address: student.address || '',
      })
      setAvatarUrl(student.avatarUrl)
    }
  }, [student])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleVerify = (verified: boolean) => {
    if (verified && isEditing) {
      onVerify(true, { ...formData, avatarUrl })
    }
    else {
      onVerify(verified)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-none bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60 flex flex-row gap-x-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Information de l'école</CardTitle>
            <CardDescription>Veuillez vérifier les informations ci-dessous</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Image
                src={school?.imageUrl || '/school-placeholder.webp'}
                alt="School Logo"
                width={100}
                height={100}
                className="rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label>Nom de l'école</Label>
              <Input value={school?.name || ''} disabled className="bg-background/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={school?.code || ''} disabled className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input value={school?.city || ''} disabled className="bg-background/50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={school?.email || ''} disabled className="bg-background/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Information de l'élève</CardTitle>
            <CardDescription>
              {isEditing
                ? 'Veuillez remplir les informations de l\'élève'
                : 'Veuillez vérifier les informations ci-dessous'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {isEditing
                ? (
                    <ImageUpload
                      value={avatarUrl}
                      onChange={url => setAvatarUrl(url)}
                      disabled={isLoading}
                    />
                  )
                : (
                    <Image
                      src={avatarUrl ?? '/user_placeholder.png'}
                      alt="Student Photo"
                      width={100}
                      height={100}
                      className="rounded-md"
                    />
                  )}

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={isEditing ? handleChange : undefined}
                    disabled={!isEditing || isLoading}
                    className="bg-background/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom de famille</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={isEditing ? handleChange : undefined}
                    disabled={!isEditing || isLoading}
                    className="bg-background/50"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idNumber">Matricule</Label>
                <Input
                  id="idNumber"
                  name="idNumber"
                  value={student?.idNumber || ''}
                  disabled
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradeId">Niveau scolaire</Label>
                <Input
                  id="gradeId"
                  name="gradeId"
                  value={student?.gradeId || ''}
                  onChange={isEditing ? handleChange : undefined}
                  disabled={!isEditing || isLoading}
                  className="bg-background/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Genre</Label>
                <Input
                  id="gender"
                  name="gender"
                  value={formData.gender || ''}
                  onChange={isEditing ? handleChange : undefined}
                  disabled={!isEditing || isLoading}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date de naissance</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate || ''}
                  onChange={isEditing ? handleChange : undefined}
                  disabled={!isEditing || isLoading}
                  className="bg-background/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Card>

      <div className="hidden">
        <Button
          ref={buttonCancelRef}
          variant="outline"
          onClick={() => handleVerify(false)}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          onClick={() => handleVerify(true)}
          ref={buttonContinueRef}
          disabled={isLoading || (isEditing && (!formData.firstName || !formData.lastName))}
        >
          {isEditing ? 'Créer et continuer' : 'Confirmer et continuer'}
        </Button>
      </div>
    </div>
  )
}

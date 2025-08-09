'use client'

import type { ChangeEvent, FocusEvent } from 'react'
import type { StudentFormValues } from '@/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, isValid, parse, parseISO, subYears } from 'date-fns'
import fr from 'date-fns/locale/fr'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarIcon, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ImageUpload } from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MIN_STUDENT_AGE } from '@/constants'
import { cn } from '@/lib/utils'
import { useStudentStore } from '@/store'
import { studentFormSchema } from '@/validations'

const minAgeDate = subYears(new Date(), MIN_STUDENT_AGE)

const dateFormats = [
  'dd/MM/yyyy',
  'dd-MM-yyyy',
  'd/M/yyyy',
  'd-M-yyyy',
  'yyyy-MM-dd',
  'dd.MM.yyyy',
] as const

export interface EditStudentFormProps {
  isLoading?: boolean
  studentIdNumber: string
  onCancel: () => void
  onSubmit: (values: StudentFormValues) => Promise<void>
}

interface DateFieldType {
  onChange: (date: Date | null) => void
  value: Date | null
}

export function EditStudentForm({ studentIdNumber, onSubmit, onCancel, isLoading }: EditStudentFormProps) {
  const { getStudentByIdNumberForEdit } = useStudentStore()

  const [student, setStudent] = useState<StudentFormValues>()
  const [dateInputValue, setDateInputValue] = useState<string | null>('')
  const [showSecondParent, setShowSecondParent] = useState(false)
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: student,
  })

  useEffect(() => {
    let mounted = true

    async function loadStudent() {
      const student = await getStudentByIdNumberForEdit(studentIdNumber)
      if (mounted) {
        setStudent(student)
        form.reset(student)
        setDateInputValue(student.dateOfBirth ? format(student.dateOfBirth, 'dd/MM/yyyy') : '')
      }
    }

    loadStudent()
    return () => {
      mounted = false
    }
  }, [studentIdNumber, form])

  if (!student) {
    return (
      <div className="space-y-6 min-w-[600px] max-w-2xl mx-auto">
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {/* Avatar skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-24 w-24 rounded-full bg-muted" />
          </div>

          {/* ID Number skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-10 w-full bg-muted rounded" />
          </div>

          {/* Name fields skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded" />
            </div>
          </div>

          {/* Gender skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="flex gap-4">
              <div className="h-6 w-24 bg-muted rounded" />
              <div className="h-6 w-24 bg-muted rounded" />
            </div>
          </div>

          {/* Class selection skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-10 w-full bg-muted rounded" />
          </div>

          {/* Date of birth skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-36 bg-muted rounded" />
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="h-10 w-full bg-muted rounded" />
              <div className="h-10 w-[280px] bg-muted rounded" />
            </div>
          </div>

          {/* Address skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-24 w-full bg-muted rounded" />
          </div>
        </div>

        {/* Buttons skeleton */}
        <div className="flex justify-end gap-4">
          <div className="h-10 w-24 bg-muted rounded" />
          <div className="h-10 w-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  const tryParseDateFormats = (dateStr: string): Date | null => {
    try {
      const isoDate = parseISO(dateStr)
      if (isValid(isoDate))
        return isoDate
    }
    catch {}

    for (const format of dateFormats) {
      try {
        const parsedDate = parse(dateStr, format, new Date())
        if (isValid(parsedDate))
          return parsedDate
      }
      catch {}
    }
    return null
  }

  const handleDateInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDateInputValue(value)
  }

  const handleDateBlur = (e: FocusEvent<HTMLInputElement>, field: DateFieldType | null) => {
    const value = e.target.value.trim()

    if (!value) {
      setDateInputValue('')
      form.setError('dateOfBirth', { message: 'La date de naissance est requise' })
      return
    }

    const parsedDate = tryParseDateFormats(value)

    if (!parsedDate) {
      form.setError('dateOfBirth', { message: 'Format de date invalide. Utilisez JJ/MM/AAAA' })
      return
    }

    if (parsedDate > minAgeDate) {
      form.setError('dateOfBirth', { message: 'L\'élève doit avoir au moins 11 ans' })
      return
    }

    if (parsedDate < new Date(1900, 0, 1)) {
      form.setError('dateOfBirth', { message: 'La date doit être postérieure à 01/01/1900' })
      return
    }

    if (field) {
      field.onChange(parsedDate)
      setDateInputValue(format(parsedDate, 'dd/MM/yyyy'))
      form.clearErrors('dateOfBirth')
    }
  }

  const handleCalendarSelect = (date: Date | undefined, field: DateFieldType | null) => {
    if (date && field) {
      field.onChange(date)
      setDateInputValue(format(date, 'dd/MM/yyyy'))
      form.clearErrors('dateOfBirth')
    }
  }

  const getMinBirthDate = (maxAge: number): Date => {
    const year = new Date().getFullYear() - maxAge - 1
    return new Date(year, 11, 31)
  }

  const getMaxBirthDate = (minAge: number): Date => {
    const year = new Date().getFullYear() - minAge
    return new Date(year, 0, 1)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photo de profil</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="idNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matricule</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isLoading}
                    placeholder="Saisir le matricule de l'étudiant"
                    className={cn(!student.idNumber.startsWith('ST') && 'bg-muted')}
                  />
                </FormControl>
                <FormDescription>
                  Identifiant unique de l&apos;étudiant
                </FormDescription>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genre</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value ? field.value : undefined}
                    className="flex gap-4"
                    disabled={isLoading}
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="M" />
                      </FormControl>
                      <FormLabel className="font-normal">Masculin</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="F" />
                      </FormControl>
                      <FormLabel className="font-normal">Féminin</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="classId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Classe actuelle</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {student.classes?.map(option => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Niveau actuel</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de naissance</FormLabel>
                <div className="flex flex-col sm:flex-row gap-2">
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="JJ/MM/AAAA"
                      value={dateInputValue ?? undefined}
                      onChange={e => handleDateInput(e)}
                      onBlur={e => handleDateBlur(e, field)}
                      disabled={isLoading}
                      className={cn(form.formState.errors.dateOfBirth && 'border-destructive')}
                    />
                  </FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn('w-[280px]', {
                          'text-muted-foreground': !field.value,
                        })}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'PPP', { locale: fr }) : 'Choisir une date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={date => handleCalendarSelect(date, field)}
                        disabled={(date: Date) => {
                          if (!date)
                            return false
                          const tooYoung = date > getMinBirthDate(10)
                          const tooOld = date < getMaxBirthDate(23)
                          return tooYoung || tooOld
                        }}
                        initialFocus
                        fromYear={getMaxBirthDate(23).getFullYear()}
                        toYear={getMinBirthDate(10).getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <FormDescription>Minimum 11 ans requis</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lieu d'habitation</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ''}
                    disabled={isLoading}
                    placeholder="Votre lieu d'habitation"
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Second Parent Collapsible Section */}
          <div className="space-y-4">
            <Collapsible
              open={showSecondParent}
              onOpenChange={setShowSecondParent}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Deuxième parent (optionnel)</h4>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-9 p-0"
                  >
                    {showSecondParent
                      ? (
                          <>
                            <span className="sr-only">Masquer</span>
                            <ChevronUp className="h-4 w-4" />
                          </>
                        )
                      : (
                          <>
                            <span className="sr-only">Afficher</span>
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <AnimatePresence initial={false}>
                {showSecondParent && (
                  <CollapsibleContent forceMount>
                    <motion.div
                      key="second-parent-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="secondParent.fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom complet</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nom complet" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="secondParent.phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Téléphone</FormLabel>
                                <FormControl>
                                  <Input placeholder="Téléphone" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="secondParent.type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type de parent</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner un type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="father">Père</SelectItem>
                                    <SelectItem value="mother">Mère</SelectItem>
                                    <SelectItem value="guardian">Tuteur</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="secondParent.gender"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Genre</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value || ''}
                                    className="flex flex-row space-x-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="M" />
                                      </FormControl>
                                      <FormLabel className="font-normal">Masculin</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="F" />
                                      </FormControl>
                                      <FormLabel className="font-normal">Féminin</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </motion.div>
                  </CollapsibleContent>
                )}
              </AnimatePresence>
            </Collapsible>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </div>
      </form>
    </Form>
  )
}

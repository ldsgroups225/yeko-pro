// app/educator/_components/EducatorStudentSearchModal.tsx

'use client'

import type { StudentSearchFormData } from '../schemas/inscription'
import type { IStudentSearchResult } from '../types/inscription'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Search, User, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { searchExistingStudent } from '../actions/inscriptionService'
import { studentSearchSchema } from '../schemas/inscription'

interface EducatorStudentSearchModalProps {
  onClose: () => void
  onStudentFound: (student: IStudentSearchResult) => void
  onCreateNew: () => void
}

export function EducatorStudentSearchModal({
  onClose,
  onStudentFound,
  onCreateNew,
}: EducatorStudentSearchModalProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<IStudentSearchResult | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  const form = useForm<StudentSearchFormData>({
    resolver: zodResolver(studentSearchSchema),
    defaultValues: {
      searchType: 'idNumber',
      idNumber: '',
      firstName: '',
      lastName: '',
    },
  })

  const searchType = form.watch('searchType')

  const handleSearch = async (data: StudentSearchFormData) => {
    try {
      setIsSearching(true)
      setSearchError(null)
      setSearchResult(null)

      const result = await searchExistingStudent(data)

      if (result.error) {
        setSearchError(result.error)
        return
      }

      if (!result.student) {
        setSearchError('Aucun élève trouvé avec ces critères')
        return
      }

      setSearchResult(result.student)
    }
    catch (error) {
      console.error('Search error:', error)
      setSearchError('Une erreur est survenue lors de la recherche')
    }
    finally {
      setIsSearching(false)
    }
  }

  const handleUseStudent = () => {
    if (searchResult) {
      onStudentFound(searchResult)
    }
  }

  const handleCreateNewStudent = () => {
    onCreateNew()
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background/95 via-card/90 to-accent/20 backdrop-blur-sm">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-primary flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Rechercher un élève existant
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-4">
            {/* Search Type Selection */}
            <FormField
              control={form.control}
              name="searchType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Type de recherche</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="idNumber" id="idNumber" />
                        <FormLabel htmlFor="idNumber" className="font-normal cursor-pointer">
                          Par matricule
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="name" id="name" />
                        <FormLabel htmlFor="name" className="font-normal cursor-pointer">
                          Par nom et prénom
                        </FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Search Fields */}
            <motion.div
              key={searchType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {searchType === 'idNumber'
                ? (
                    <FormField
                      control={form.control}
                      name="idNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Matricule de l'élève</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Entrez le matricule de l'élève"
                              className="bg-background/50 backdrop-blur-sm border-border/50"
                              disabled={isSearching}
                              autoFocus={true}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium">Prénom</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Prénom de l'élève"
                                className="bg-background/50 backdrop-blur-sm border-border/50"
                                disabled={isSearching}
                                {...field}
                              />
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
                            <FormLabel className="text-foreground font-medium">Nom</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nom de l'élève"
                                className="bg-background/50 backdrop-blur-sm border-border/50"
                                disabled={isSearching}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
            </motion.div>

            {/* Search Button */}
            <Button
              type="submit"
              disabled={isSearching}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isSearching ? 'Recherche en cours...' : 'Rechercher l\'élève'}
            </Button>
          </form>
        </Form>

        {/* Search Results */}
        {searchError && (
          <Alert variant="destructive">
            <AlertDescription>{searchError}</AlertDescription>
          </Alert>
        )}

        {searchResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Élève trouvé
                </CardTitle>
                <CardDescription>
                  Voulez-vous utiliser cet élève pour l'inscription ?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Matricule</p>
                    <p className="text-base">{searchResult.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Nom complet</p>
                    <p className="text-base">
                      {searchResult.firstName}
                      {' '}
                      {searchResult.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Genre</p>
                    <p className="text-base">
                      {searchResult.gender === 'M' ? 'Masculin' : searchResult.gender === 'F' ? 'Féminin' : 'Non spécifié'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Date de naissance</p>
                    <p className="text-base">
                      {searchResult.birthDate
                        ? new Date(searchResult.birthDate).toLocaleDateString('fr-FR')
                        : 'Non spécifiée'}
                    </p>
                  </div>
                </div>

                {searchResult.address && (
                  <div>
                    <p className="text-sm font-medium text-slate-700">Adresse</p>
                    <p className="text-base">{searchResult.address}</p>
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  <Button onClick={handleUseStudent} className="flex-1">
                    Utiliser cet élève
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchResult(null)
                      setSearchError(null)
                    }}
                  >
                    Rechercher un autre
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Create New Student Option */}
        <div className="space-y-4">
          <Separator />
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              L'élève n'existe pas encore dans le système ?
            </p>
            <Button
              variant="outline"
              onClick={handleCreateNewStudent}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Créer un nouvel élève
            </Button>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-border/20">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}
